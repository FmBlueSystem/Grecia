import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sapFetch } from "@/lib/sap-client";
import { STATUS_LABELS } from "@/lib/constants";
import type { CountryCode } from "@/lib/constants";

interface SapServiceCallSummary {
  ServiceCallID: number;
  Subject: string;
  CustomerName: string;
  Status: number;
  Priority: string;
  CreationDate: string;
  U_TipoCaso: string | null;
  U_Area: string | null;
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const country = session.country as CountryCode;

  try {
    // Single query: get all cases with inline count
    const data = await sapFetch<{ value: SapServiceCallSummary[]; "odata.count": string }>(
      country,
      "/ServiceCalls",
      {
        params: {
          $select: "ServiceCallID,Subject,CustomerName,Status,Priority,CreationDate,U_TipoCaso,U_Area",
          $orderby: "ServiceCallID desc",
          $top: "500",
          $inlinecount: "allpages",
        },
      }
    );

    const all = data.value;
    const total = parseInt(data["odata.count"] || "0", 10);

    // Compute KPIs from the fetched data (avoids N+1 queries)
    const open = all.filter((c) => c.Status === -3).length;
    const pending = all.filter((c) => c.Status === -2).length;
    const closed = all.filter((c) => c.Status === -1).length;

    // Priority breakdown
    const highPriority = all.filter((c) => c.Priority === "scp_High").length;

    // Cases by type (for chart)
    const byType: Record<string, number> = {};
    for (const c of all) {
      const tipo = c.U_TipoCaso || "Sin tipo";
      byType[tipo] = (byType[tipo] || 0) + 1;
    }

    // Cases by area (for chart)
    const byArea: Record<string, number> = {};
    for (const c of all) {
      const area = c.U_Area || "Sin area";
      byArea[area] = (byArea[area] || 0) + 1;
    }

    // Cases by month (last 6 months)
    const byMonth: Record<string, { open: number; closed: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString("es", { month: "short", year: "2-digit" });
      byMonth[key] = { open: 0, closed: 0 };
    }
    for (const c of all) {
      const d = new Date(c.CreationDate);
      const key = d.toLocaleDateString("es", { month: "short", year: "2-digit" });
      if (byMonth[key]) {
        if (c.Status === -1) byMonth[key].closed++;
        else byMonth[key].open++;
      }
    }

    // This month vs prev month delta for open cases
    const thisMonthKey = now.toLocaleDateString("es", { month: "short", year: "2-digit" });
    const prevMonthKey = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      .toLocaleDateString("es", { month: "short", year: "2-digit" });
    const thisMonthOpen = byMonth[thisMonthKey]?.open || 0;
    const prevMonthOpen = byMonth[prevMonthKey]?.open || 0;

    // Open cases with age (for antigüedad section)
    const openCases = all
      .filter((c) => c.Status !== -1)
      .slice(0, 5)
      .map((c) => ({
        id: c.ServiceCallID,
        subject: c.Subject,
        daysOpen: daysSince(c.CreationDate),
        priority: c.Priority,
      }));

    // Recent cases (top 5) with priority
    const recent = all.slice(0, 5).map((c) => ({
      id: c.ServiceCallID,
      subject: c.Subject,
      customerName: c.CustomerName,
      status: c.Status,
      statusLabel: STATUS_LABELS[c.Status] || `Estado ${c.Status}`,
      creationDate: c.CreationDate,
      priority: c.Priority,
    }));

    const res = NextResponse.json({
      kpis: { total, open, pending, closed, highPriority, thisMonthOpen, prevMonthOpen },
      byType: Object.entries(byType).map(([name, value]) => ({ name, value })),
      byArea: Object.entries(byArea).map(([name, value]) => ({ name, value })),
      byMonth: Object.entries(byMonth).map(([month, counts]) => ({ month, ...counts })),
      openCases,
      recent,
    });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (e) {
    console.error("Dashboard error:", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
