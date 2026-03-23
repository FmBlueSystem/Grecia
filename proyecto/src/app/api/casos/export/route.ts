import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listCasos } from "@/lib/casos";
import { canAccess } from "@/lib/permissions";
import type { CountryCode } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const allowed = await canAccess(session.role, "exportar");
  if (!allowed) {
    return NextResponse.json({ error: "No autorizado para exportar" }, { status: 403 });
  }

  const url = request.nextUrl;
  const country = (url.searchParams.get("country") || session.country) as CountryCode;
  const status = url.searchParams.get("status");

  const result = await listCasos(country, {
    status: status ? parseInt(status, 10) : undefined,
    top: 1000,
    skip: 0,
  });

  const headers = ["ID", "Asunto", "Cliente", "Codigo Cliente", "Estado", "Prioridad", "Canal", "Tipo", "Area", "SLA", "Fecha Creacion", "Fecha Cierre"];
  const rows = result.items.map((c) => [
    c.id,
    `"${(c.subject || "").replace(/"/g, '""')}"`,
    `"${(c.customerName || "").replace(/"/g, '""')}"`,
    c.customerCode,
    c.statusLabel,
    c.priorityLabel,
    c.canal || "",
    c.tipoCaso || "",
    c.area || "",
    c.tiempoEstimado || "",
    c.creationDate || "",
    c.closingDate || "",
  ].join(","));

  const csv = [headers.join(","), ...rows].join("\n");
  const BOM = "\uFEFF"; // UTF-8 BOM for Excel

  return new NextResponse(BOM + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="casos-${country}-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
