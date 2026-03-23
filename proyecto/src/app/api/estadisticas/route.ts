import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sapFetch } from "@/lib/sap-client";
import { sanitizeODataDate } from "@/lib/security";
import type { CountryCode } from "@/lib/constants";
import { PALETTES, DEFAULT_PALETTE } from "@/lib/palettes";

interface SapServiceCall {
  ServiceCallID: number;
  Subject: string;
  CustomerCode: string;
  CustomerName: string;
  Status: number;
  Priority: string;
  CreationDate: string;
  ClosingDate: string | null;
  U_TipoCaso: string | null;
  U_Area: string | null;
  U_Canal: string | null;
  U_TiempoEst: string | null;
}

const PRIORITY_LABELS: Record<string, string> = {
  scp_Low: "Baja",
  scp_Medium: "Normal",
  scp_High: "Alta",
};

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const country = session.country as CountryCode;
  const { searchParams } = new URL(request.url);
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  // Build OData filter for date range (sanitized)
  const filters: string[] = [];
  if (dateFrom) {
    const safe = sanitizeODataDate(dateFrom);
    if (safe) filters.push(`CreationDate ge '${safe}'`);
  }
  if (dateTo) {
    const safe = sanitizeODataDate(dateTo);
    if (safe) {
      const endDate = new Date(safe);
      endDate.setDate(endDate.getDate() + 1);
      const endStr = endDate.toISOString().split("T")[0];
      filters.push(`CreationDate lt '${endStr}'`);
    }
  }

  try {
    const params: Record<string, string> = {
      $select: "ServiceCallID,Subject,CustomerCode,CustomerName,Status,Priority,CreationDate,ClosingDate,U_TipoCaso,U_Area,U_Canal,U_TiempoEst",
      $orderby: "ServiceCallID desc",
      $top: "1000",
      $inlinecount: "allpages",
    };
    if (filters.length > 0) {
      params.$filter = filters.join(" and ");
    }

    const data = await sapFetch<{ value: SapServiceCall[]; "odata.count": string }>(
      country,
      "/ServiceCalls",
      { params }
    );

    const all = data.value;
    const total = parseInt(data["odata.count"] || "0", 10);

    // Prepare month buckets
    const byMonth: Record<string, { total: number; open: number; closed: number }> = {};
    const now = new Date();
    const rangeStart = dateFrom ? new Date(dateFrom) : new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const rangeEnd = dateTo ? new Date(dateTo) : now;
    const cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
    while (cursor <= rangeEnd) {
      const key = cursor.toLocaleDateString("es", { month: "short", year: "2-digit" });
      byMonth[key] = { total: 0, open: 0, closed: 0 };
      cursor.setMonth(cursor.getMonth() + 1);
    }

    // Single-pass aggregation over all cases
    let open = 0;
    let pending = 0;
    let closed = 0;
    const byPriority: Record<string, number> = {};
    const byType: Record<string, number> = {};
    const byArea: Record<string, number> = {};
    const byCanal: Record<string, number> = {};
    const customerCounts: Record<string, { name: string; count: number }> = {};
    let closedResolutionSum = 0;
    let closedCount = 0;

    for (const c of all) {
      // Status counts
      if (c.Status === -3) open++;
      else if (c.Status === -2) pending++;
      else if (c.Status === -1) closed++;

      // Priority
      const prioLabel = PRIORITY_LABELS[c.Priority] || "Normal";
      byPriority[prioLabel] = (byPriority[prioLabel] || 0) + 1;

      // Type
      const tipo = c.U_TipoCaso || "Sin tipo";
      byType[tipo] = (byType[tipo] || 0) + 1;

      // Area
      const area = c.U_Area || "Sin area";
      byArea[area] = (byArea[area] || 0) + 1;

      // Canal
      const canal = c.U_Canal || "Sin canal";
      byCanal[canal] = (byCanal[canal] || 0) + 1;

      // Month bucket
      const d = new Date(c.CreationDate);
      const monthKey = d.toLocaleDateString("es", { month: "short", year: "2-digit" });
      if (byMonth[monthKey]) {
        byMonth[monthKey].total++;
        if (c.Status === -1) byMonth[monthKey].closed++;
        else byMonth[monthKey].open++;
      }

      // Customer counts
      const code = c.CustomerCode;
      if (!customerCounts[code]) {
        customerCounts[code] = { name: c.CustomerName, count: 0 };
      }
      customerCounts[code].count++;

      // Resolution time accumulator (for closed cases)
      if (c.Status === -1 && c.ClosingDate) {
        const created = new Date(c.CreationDate).getTime();
        const closedAt = new Date(c.ClosingDate).getTime();
        closedResolutionSum += (closedAt - created) / (1000 * 60 * 60);
        closedCount++;
      }
    }

    // By status
    const defaultPrimary = PALETTES[DEFAULT_PALETTE].colors.primary;
    const byStatus = [
      { name: "Abierto", value: open, color: defaultPrimary },
      { name: "En Proceso", value: pending, color: "#F59E0B" },
      { name: "Resuelto", value: closed, color: "#10B981" },
    ];

    const priorityColors: Record<string, string> = { Alta: "#EF4444", Normal: defaultPrimary, Baja: "#94A3B8" };

    const topCustomers = Object.entries(customerCounts)
      .map(([code, { name, count }]) => ({ code, name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const avgResolutionHours = closedCount > 0 ? Math.round(closedResolutionSum / closedCount) : 0;

    const defaultChart = PALETTES[DEFAULT_PALETTE].colors.chart;
    const CHART_COLORS = [...defaultChart, "#06B6D4", "#84CC16", "#EF4444"];

    const res = NextResponse.json({
      kpis: { total, open, pending, closed, avgResolutionHours },
      byStatus,
      byPriority: Object.entries(byPriority).map(([name, value]) => ({
        name,
        value,
        color: priorityColors[name] || "#94A3B8",
      })),
      byType: Object.entries(byType).map(([name, value], i) => ({
        name,
        value,
        color: CHART_COLORS[i % CHART_COLORS.length],
      })),
      byArea: Object.entries(byArea).map(([name, value], i) => ({
        name,
        value,
        color: CHART_COLORS[i % CHART_COLORS.length],
      })),
      byCanal: Object.entries(byCanal).map(([name, value], i) => ({
        name,
        value,
        color: CHART_COLORS[i % CHART_COLORS.length],
      })),
      byMonth: Object.entries(byMonth).map(([month, counts]) => ({ month, ...counts })),
      topCustomers,
    });
    res.headers.set("Cache-Control", "private, max-age=120");
    return res;
  } catch (e) {
    console.error("Estadisticas error:", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
