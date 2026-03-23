import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listCasos, createCaso, upsertCaseExtraFields } from "@/lib/casos";
import { logChanges } from "@/lib/audit";
import { sendCaseAssignedEmail, sendCaseCreatedEmail } from "@/lib/email";
import { isEnabled } from "@/lib/settings";
import { query, queryOne } from "@/lib/db";
import type { CountryCode } from "@/lib/constants";

interface PortalUserRow {
  id: number;
  name: string;
  email: string;
  sap_employee_id: number | null;
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const url = request.nextUrl;
  const country = (url.searchParams.get("country") || session.country) as CountryCode;
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("search") || undefined;
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const priority = url.searchParams.get("priority") || undefined;
  const canal = url.searchParams.get("canal") || undefined;
  const tipoCaso = url.searchParams.get("tipoCaso") || undefined;
  const area = url.searchParams.get("area") || undefined;
  const dateFrom = url.searchParams.get("dateFrom") || undefined;
  const dateTo = url.searchParams.get("dateTo") || undefined;
  const top = 20;

  try {
    // Agentes solo ven casos asignados a ellos (si tienen sap_employee_id)
    const technicianCode =
      session.role === "agente" && session.sapEmployeeId
        ? session.sapEmployeeId
        : undefined;

    const result = await listCasos(country, {
      status: status ? parseInt(status, 10) : undefined,
      search,
      skip: (page - 1) * top,
      top,
      technicianCode,
      priority,
      canal,
      tipoCaso,
      area,
      dateFrom,
      dateTo,
    });

    return NextResponse.json({
      items: result.items,
      total: result.count,
      page,
      pages: Math.ceil(result.count / top),
    });
  } catch (e) {
    console.error("Error listing casos:", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const payload = await request.json();
    const country = (payload.country || session.country) as CountryCode;
    const { assignedUserId, ...casoPayload } = payload;

    // Resolve portal user → SAP employee ID if available
    let portalUser: PortalUserRow | null = null;
    if (assignedUserId) {
      portalUser = await queryOne<PortalUserRow>(
        "SELECT id, name, email, sap_employee_id FROM casos.users WHERE id = $1 AND active = TRUE",
        [assignedUserId]
      ) || null;
    }

    // Attempt case creation; if SAP rejects TechnicianCode (not a technician), retry without it
    let result: { id: number };
    const technicianCode = portalUser?.sap_employee_id ?? undefined;

    try {
      result = await createCaso(country, { ...casoPayload, technicianCode });
    } catch (e) {
      const msg = (e as Error).message || "";
      if (technicianCode && msg.includes("OSCL.technician")) {
        // User exists in SAP but is not a technician — create without TechnicianCode
        result = await createCaso(country, { ...casoPayload });
      } else {
        throw e;
      }
    }

    // Campos extra en PostgreSQL (subEstado, IME_*)
    upsertCaseExtraFields(country, result.id, casoPayload).catch((err) =>
      console.error("Error saving extra fields on create:", err)
    );

    // Store portal user assignment in PG
    if (portalUser) {
      query(
        "INSERT INTO casos.case_assignments (service_call_id, country, user_id, assigned_by_id) VALUES ($1, $2, $3, $4)",
        [result.id, country, portalUser.id, session.userId]
      ).catch((err) => console.error("Error saving case assignment:", err));
    }

    logChanges(session.userId, session.name, "caso", String(result.id), [
      { field: "Creacion", oldValue: null, newValue: `Caso #${result.id} creado` },
      { field: "Asunto", oldValue: null, newValue: payload.subject },
      { field: "Cliente", oldValue: null, newValue: payload.customerCode },
      ...(portalUser ? [{ field: "Asignado", oldValue: null, newValue: portalUser.name }] : []),
    ], country).catch((err) => console.error("Error logging caso creation:", err));

    // Auto: email al cliente
    if (payload.contactEmail) {
      isEnabled("auto_email_on_create").then((on) => {
        if (on) sendCaseCreatedEmail(payload.contactEmail, result.id, payload.subject).catch(() => {});
      });
    }
    // Auto: email al colaborador asignado (usando email del portal, no SAP)
    if (portalUser?.email) {
      isEnabled("auto_email_on_assign").then((on) => {
        if (!on) return;
        sendCaseAssignedEmail(portalUser!.email, {
          collaboratorName: portalUser!.name,
          caseId: result.id,
          subject: payload.subject,
          customerName: payload.customerCode,
          priority: payload.priority || "Normal",
          area: payload.area || "",
          canal: payload.canal || "",
          creationDate: new Date().toLocaleDateString("es-CR"),
          description: payload.description,
        }).catch(() => {});
      });
    }

    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
  } catch (e) {
    console.error("Error creating caso:", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
