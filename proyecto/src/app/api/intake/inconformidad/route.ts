import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { createCaso, upsertCaseExtraFields } from "@/lib/casos";
import { sendCaseAssignedEmail } from "@/lib/email";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import type { CountryCode } from "@/lib/constants";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

async function validateIntakeKey(key: string): Promise<boolean> {
  const row = await queryOne<{ value: string }>(
    "SELECT value FROM casos.settings WHERE key = 'intake_api_key'",
    []
  );
  return row?.value === key;
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("X-Intake-Key");
  if (!apiKey || !(await validateIntakeKey(apiKey))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const {
    country = "CR",
    clienteNombre,
    contacto,
    telefono,
    email,
    fecha,
    producto,
    codigoStia,
    lote,
    factura,
    cantidadInicial,
    cantidadReclamo,
    reportadoPor,
    descripcion,
    customerCode,
    evidencia,
  } = body as {
    country?: string;
    clienteNombre?: string;
    contacto?: string;
    telefono?: string;
    email?: string;
    fecha?: string;
    producto?: string;
    codigoStia?: string;
    lote?: string;
    factura?: string;
    cantidadInicial?: number;
    cantidadReclamo?: number;
    reportadoPor?: string;
    descripcion?: string;
    customerCode?: string;
    evidencia?: { name: string; type: string; data: string };
  };

  if (!customerCode || !producto || !descripcion) {
    return NextResponse.json(
      { error: "Campos requeridos: customerCode, producto, descripcion" },
      { status: 400 }
    );
  }

  // Obtener jefe de SGI
  const sgiChief = await queryOne<{
    id: number;
    name: string;
    email: string;
    sap_employee_id: number | null;
  }>(
    `SELECT u.id, u.name, u.email, u.sap_employee_id
     FROM casos.users u
     JOIN casos.departments d ON d.chief_user_id = u.id
     WHERE d.name = 'SGI' AND d.active = true AND u.active = true
     LIMIT 1`,
    []
  );

  if (!sgiChief) {
    return NextResponse.json({ error: "Departamento SGI no disponible" }, { status: 503 });
  }

  const subject = `Inconformidad de material de empaque - ${producto}`;
  const fullDescription = [
    `Cliente: ${clienteNombre || ""}`,
    `Contacto: ${contacto || ""}`,
    `Teléfono: ${telefono || ""}`,
    `Email: ${email || ""}`,
    `Fecha: ${fecha || ""}`,
    `Producto: ${producto}`,
    `Código Stia: ${codigoStia || ""}`,
    `Lote/Orden de producción: ${lote || ""}`,
    `Factura: ${factura || ""}`,
    `Cantidad inicial: ${cantidadInicial ?? ""}`,
    `Cantidad en reclamo: ${cantidadReclamo ?? ""}`,
    `Reportado por: ${reportadoPor || ""}`,
    "",
    "Descripción del reclamo:",
    descripcion,
  ].join("\n");

  // Crear caso en SAP
  let caseResult: { id: number };
  try {
    caseResult = await createCaso(country as CountryCode, {
      subject,
      customerCode,
      description: fullDescription,
      priority: "Normal",
      tipoCaso: "Inconformidad de material de empaque",
      canal: "Portal",
      area: "SGI",
      tiempoEstimado: "",
      contactName: contacto as string | undefined,
      contactEmail: email as string | undefined,
      contactPhone: telefono as string | undefined,
      technicianCode: sgiChief.sap_employee_id ?? undefined,
    });
  } catch (e) {
    const msg = (e as Error).message || "";
    if (sgiChief.sap_employee_id && msg.includes("OSCL.technician")) {
      caseResult = await createCaso(country as CountryCode, {
        subject,
        customerCode,
        description: fullDescription,
        priority: "Normal",
        tipoCaso: "Inconformidad de material de empaque",
        canal: "Portal",
        area: "SGI",
        tiempoEstimado: "",
        contactName: contacto as string | undefined,
        contactEmail: email as string | undefined,
        contactPhone: telefono as string | undefined,
      });
    } else {
      throw e;
    }
  }

  const caseId = caseResult.id;

  // Registrar asignación en PostgreSQL
  query(
    "INSERT INTO casos.case_assignments (service_call_id, country, user_id, assigned_by_id) VALUES ($1, $2, $3, $4)",
    [caseId, country, sgiChief.id, sgiChief.id]
  ).catch((err) => console.error("Error saving assignment:", err));

  // Guardar campos IME en case_extra_fields
  upsertCaseExtraFields(country as CountryCode, caseId, {
    portalUser: clienteNombre,
    imeProducto: producto,
    imeCodMaterial: codigoStia,
    imeLote: lote,
    imeFactura: factura,
    imeCantInicial: cantidadInicial,
    imeCantReclamo: cantidadReclamo,
    imeReportadoPor: reportadoPor,
  }).catch((err) => console.error("Error saving extra fields:", err));

  // Guardar foto de evidencia si fue enviada
  if (evidencia?.data) {
    try {
      const base64Data = evidencia.data.replace(/^data:[^;]+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const safeName = `${Date.now()}-${evidencia.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const dir = path.join(UPLOAD_DIR, String(caseId));
      await mkdir(dir, { recursive: true });
      const filePath = path.join(dir, safeName);
      await writeFile(filePath, buffer);
      await query(
        `INSERT INTO casos.case_attachments
           (case_id, country, user_id, user_name, file_name, file_path, file_size, mime_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          caseId,
          country,
          sgiChief.id,
          "Portal Cliente",
          evidencia.name,
          filePath,
          buffer.length,
          evidencia.type || "image/jpeg",
        ]
      );
    } catch (err) {
      console.error("Error saving attachment:", err);
    }
  }

  // Notificar al jefe de SGI
  sendCaseAssignedEmail(sgiChief.email, {
    collaboratorName: sgiChief.name,
    caseId,
    subject,
    customerName: (clienteNombre as string) || customerCode,
    priority: "Normal",
    area: "SGI",
    canal: "Portal",
    creationDate: new Date().toLocaleDateString("es-CR"),
    description: fullDescription,
  }).catch(() => {});

  return NextResponse.json({ success: true, caseId }, { status: 201 });
}
