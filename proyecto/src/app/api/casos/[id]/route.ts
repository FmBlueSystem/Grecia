import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCaso, updateCaso, upsertCaseExtraFields, getEmployeeInfo } from "@/lib/casos";
import { logChanges } from "@/lib/audit";
import { query } from "@/lib/db";
import { randomBytes } from "crypto";
import { sendCaseAssignedEmail, sendCaseResolvedEmail, sendStatusChangeEmail } from "@/lib/email";
import { isEnabled } from "@/lib/settings";
import { onCaseUpdate, pauseEscalation, resumeEscalation } from "@/lib/escalation-v2";
import { STATUS_LABELS, type CountryCode } from "@/lib/constants";

const SAP_ERROR_ES: [string, string][] = [
  ["Cannot close service call without solution or resolution", "No se puede cerrar el caso sin ingresar una Solución o Resolución"],
  ["No matching records found", "No se encontró el registro en SAP"],
  ["Permission denied", "No tiene permisos para realizar esta acción"],
  ["The operation failed", "La operación falló en SAP. Intente nuevamente"],
  ["Invalid value", "Valor inválido. Verifique los campos ingresados"],
  ["already exists", "El registro ya existe en SAP"],
  ["Connection refused", "No se pudo conectar con SAP. Intente más tarde"],
];

function traducirErrorSAP(msg: string): string {
  for (const [en, es] of SAP_ERROR_ES) {
    if (msg.includes(en)) return es;
  }
  return msg;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const country = (request.nextUrl.searchParams.get("country") || session.country) as CountryCode;

  try {
    const caso = await getCaso(country, parseInt(id, 10));
    if (!caso) return NextResponse.json({ error: "Caso no encontrado" }, { status: 404 });
    return NextResponse.json(caso);
  } catch (e) {
    console.error("Error getting caso:", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const country = (body.country || session.country) as CountryCode;
  const casoId = parseInt(id, 10);

  try {
    // Fetch current values before update
    const before = await getCaso(country, casoId);

    await updateCaso(country, casoId, body);

    // Campos extra en PostgreSQL (subEstado, IME_*)
    upsertCaseExtraFields(country, casoId, body).catch((err) =>
      console.error("Error saving extra fields:", err)
    );

    // Log field-level changes
    if (before) {
      const fieldMap: Record<string, { key: keyof typeof before; label: string }> = {
        subject: { key: "subject", label: "Asunto" },
        description: { key: "description", label: "Descripción" },
        resolution: { key: "resolution", label: "Resolución" },
        status: { key: "status", label: "Estado" },
        priority: { key: "priorityLabel", label: "Prioridad" },
        canal: { key: "canal", label: "Canal" },
        tipoCaso: { key: "tipoCaso", label: "Tipo Caso" },
        area: { key: "area", label: "Área" },
        tiempoEstimado: { key: "tiempoEstimado", label: "Tiempo Estimado" },
        contactPhone: { key: "contactPhone", label: "Teléfono" },
        contactEmail: { key: "contactEmail", label: "Email Contacto" },
        technicianCode: { key: "technicianCode", label: "Colaborador Asignado" },
        subEstado: { key: "subEstado", label: "Sub-Estado" },
      };

      const changes: { field: string; oldValue: string | null; newValue: string | null }[] = [];
      for (const [bodyKey, { key, label }] of Object.entries(fieldMap)) {
        if (body[bodyKey] !== undefined) {
          const oldVal = String(before[key] ?? "");
          const newVal = String(body[bodyKey] ?? "");
          if (oldVal !== newVal) {
            changes.push({ field: label, oldValue: oldVal || null, newValue: newVal || null });
          }
        }
      }

      logChanges(session.userId, session.name, "caso", String(casoId), changes, country).catch((err) =>
        console.error("Error logging changes:", err)
      );

      const clientEmail = before.contactEmail;

      // Auto: email al técnico cuando se asigna
      if (body.technicianCode !== undefined && body.technicianCode !== before.technicianCode) {
        isEnabled("auto_email_on_assign").then((on) => {
          if (!on) return;
          getEmployeeInfo(country, body.technicianCode).then((emp) => {
            if (!emp) return;
            sendCaseAssignedEmail(emp.email, {
              collaboratorName: emp.name,
              caseId: casoId,
              subject: before.subject,
              customerName: before.customerName,
              priority: before.priorityLabel,
              area: before.area,
              canal: before.canal,
              creationDate: before.creationDate,
              description: before.description,
            }).catch(() => {});
          }).catch(() => {});
        });
      }

      // Auto: email al cliente cuando cambia estado
      if (body.status !== undefined && body.status !== before.status) {
        const newStatusLabel = STATUS_LABELS[body.status as number] || "Actualizado";
        // Escalamiento: pause/resume y reset_policy según nuevo status
        const statusStr = body.status === -3 ? "open" : body.status === -2 ? "in_progress" : "closed";
        onCaseUpdate(casoId, country, "status_change", statusStr).catch(() => {});

        // Si se resuelve: crear encuesta CSAT + email con link
        if (body.status === -1) {
          isEnabled("auto_email_on_resolve").then((on) => {
            if (!on) return;
            const csatToken = randomBytes(32).toString("hex");
            query(
              "INSERT INTO casos.csat_surveys (case_id, token, country) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
              [casoId, csatToken, country]
            ).then(() => {
              if (clientEmail) sendCaseResolvedEmail(clientEmail, casoId, before.subject, csatToken).catch(() => {});
            }).catch((err) => console.error("Error creating CSAT:", err));
          });
        } else if (clientEmail) {
          // Otros cambios de estado (ej. Abierto → En Proceso)
          isEnabled("auto_email_on_status_change").then((on) => {
            if (on) sendStatusChangeEmail(clientEmail, casoId, before.subject, newStatusLabel).catch(() => {});
          });
        }
      }

      // S3: Pause/resume escalamiento por sub-estado
      if (body.subEstado !== undefined) {
        const PAUSE_SUBSTADOS = ["Pendiente de proveedor", "Pendiente de otra área"];
        if (PAUSE_SUBSTADOS.includes(body.subEstado)) {
          pauseEscalation(casoId, country).catch(() => {});
        } else {
          resumeEscalation(casoId, country).catch(() => {});
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Error updating caso:", e);
    return NextResponse.json({ error: traducirErrorSAP((e as Error).message) }, { status: 500 });
  }
}
