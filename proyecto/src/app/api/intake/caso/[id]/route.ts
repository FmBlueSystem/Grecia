import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getCaso } from "@/lib/casos";
import type { CountryCode } from "@/lib/constants";

const STATUS_LABELS: Record<number, string> = {
  [-3]: "Abierto",
  [-2]: "En Proceso",
  [-1]: "Resuelto",
};

const STATUS_COLOR: Record<number, string> = {
  [-3]: "yellow",
  [-2]: "blue",
  [-1]: "green",
};

async function validateIntakeKey(key: string): Promise<boolean> {
  const row = await queryOne<{ value: string }>(
    "SELECT value FROM casos.settings WHERE key = 'intake_api_key'",
    []
  );
  return row?.value === key;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const apiKey = request.headers.get("X-Intake-Key");
  if (!apiKey || !(await validateIntakeKey(apiKey))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const caseId = parseInt(id, 10);
  if (isNaN(caseId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  // Obtener country desde case_assignments
  const assignment = await queryOne<{ country: string }>(
    "SELECT country FROM casos.case_assignments WHERE service_call_id = $1 LIMIT 1",
    [caseId]
  );

  if (!assignment) {
    return NextResponse.json({ error: "Caso no encontrado" }, { status: 404 });
  }

  const country = assignment.country as CountryCode;
  const caso = await getCaso(country, caseId);

  if (!caso) {
    return NextResponse.json({ error: "Caso no encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    caso: {
      id: caso.id,
      subject: caso.subject,
      status: caso.status,
      statusLabel: STATUS_LABELS[caso.status as number] ?? `Estado ${caso.status}`,
      statusColor: STATUS_COLOR[caso.status as number] ?? "gray",
      creationDate: caso.creationDate,
      customerName: caso.customerName,
      // Campos IME visibles al cliente
      producto: caso.imeProducto,
      lote: caso.imeLote,
      factura: caso.imeFactura,
      reportadoPor: caso.imeReportadoPor,
    },
  });
}
