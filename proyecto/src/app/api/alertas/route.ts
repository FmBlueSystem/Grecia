import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sapFetch } from "@/lib/sap-client";
import { STATUS_LABELS } from "@/lib/constants";
import { TIEMPO_TO_HOURS, mapSapPriority } from "@/lib/sla";
import type { CountryCode } from "@/lib/constants";

interface SapServiceCall {
  ServiceCallID: number;
  Subject: string;
  CustomerCode: string;
  CustomerName: string;
  Status: number;
  Priority: string;
  CreationDate: string;
  U_TiempoEst: string | null;
  U_Area: string | null;
  U_TipoCaso: string | null;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const country = session.country as CountryCode;

  try {
    const data = await sapFetch<{ value: SapServiceCall[] }>(
      country,
      "/ServiceCalls",
      {
        params: {
          $select: "ServiceCallID,Subject,CustomerCode,CustomerName,Status,Priority,CreationDate,U_TiempoEst,U_Area,U_TipoCaso",
          $filter: "Status eq -3 or Status eq -2",
          $orderby: "CreationDate asc",
          $top: "200",
        },
      }
    );

    const now = Date.now();
    const alerts = data.value.map((sc) => {
      const created = new Date(sc.CreationDate).getTime();
      const hoursElapsed = (now - created) / (1000 * 60 * 60);
      const slaHours = TIEMPO_TO_HOURS[sc.U_TiempoEst || ""] || 48;
      const hoursRemaining = slaHours - hoursElapsed;
      const percentUsed = Math.min((hoursElapsed / slaHours) * 100, 100);

      let slaStatus: "ok" | "warning" | "exceeded";
      if (hoursRemaining <= 0) {
        slaStatus = "exceeded";
      } else if (percentUsed >= 75) {
        slaStatus = "warning";
      } else {
        slaStatus = "ok";
      }

      return {
        id: sc.ServiceCallID,
        subject: sc.Subject || "",
        customerCode: sc.CustomerCode || "",
        customerName: sc.CustomerName || "",
        status: sc.Status,
        statusLabel: STATUS_LABELS[sc.Status] || `Estado ${sc.Status}`,
        priority: sc.Priority,
        priorityLabel: mapSapPriority(sc.Priority),
        creationDate: sc.CreationDate,
        tiempoEstimado: sc.U_TiempoEst || "48 horas",
        area: sc.U_Area || "",
        tipoCaso: sc.U_TipoCaso || "",
        slaHours,
        hoursElapsed: Math.round(hoursElapsed),
        hoursRemaining: Math.round(hoursRemaining),
        percentUsed: Math.round(percentUsed),
        slaStatus,
      };
    });

    // Sort: exceeded first, then warning, then ok
    const order = { exceeded: 0, warning: 1, ok: 2 };
    alerts.sort((a, b) => order[a.slaStatus] - order[b.slaStatus]);

    const summary = {
      total: alerts.length,
      exceeded: alerts.filter((a) => a.slaStatus === "exceeded").length,
      warning: alerts.filter((a) => a.slaStatus === "warning").length,
      ok: alerts.filter((a) => a.slaStatus === "ok").length,
    };

    const res = NextResponse.json({ alerts, summary });
    res.headers.set("Cache-Control", "private, max-age=30");
    return res;
  } catch (err) {
    console.error("Error fetching alerts:", err);
    return NextResponse.json({ error: "Error al consultar SAP" }, { status: 500 });
  }
}
