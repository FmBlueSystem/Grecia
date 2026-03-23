import { NextRequest, NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import { sapFetch } from "@/lib/sap-client";
import { query } from "@/lib/db";
import { isEnabled } from "@/lib/settings";
import { SAP_DATABASES } from "@/lib/constants";
import type { CountryCode } from "@/lib/constants";
import {
  loadSharedData,
  evaluateCase,
  getOrCreateState,
  runPreAlerts,
} from "@/lib/escalation-v2";
import { logger } from "@/lib/logger";

interface SapServiceCall {
  ServiceCallID: number;
  Subject: string;
  Status: number;
  Priority: string;
  TechnicianCode: number | null;
  U_Area: string | null;
  CreationDate: string;
}

const DB_BATCH_SIZE = 100;

export async function POST(request: NextRequest) {
  // Auth: Bearer CRON_SECRET o sesión admin
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    // cron call OK
  } else {
    const session = await getSession();
    if (!session || !isAdmin(session.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
  }

  const enabled = await isEnabled("auto_escalation_enabled");
  if (!enabled) {
    return NextResponse.json({ message: "Escalamiento deshabilitado en configuracion" });
  }

  // Cargar datos compartidos una sola vez (evita N+1)
  const shared = await loadSharedData();

  const results: Record<string, { evaluated: number; escalated: number; pre_alerts: number; errors: number }> = {};
  let totalEscalated = 0;
  let totalErrors = 0;

  // Obtener pre_alert_minutes de la política de resolución activa
  const preAlertPolicy = await query<{ pre_alert_minutes: number | null }>(
    "SELECT pre_alert_minutes FROM casos.escalation_policies WHERE escalation_type='resolution' AND is_active=TRUE LIMIT 1"
  ).catch(() => []);
  const preAlertMin = preAlertPolicy[0]?.pre_alert_minutes ?? null;

  for (const country of Object.keys(SAP_DATABASES) as CountryCode[]) {
    const countryResult = { evaluated: 0, escalated: 0, pre_alerts: 0, errors: 0 };

    try {
      // Traer casos abiertos / en proceso de SAP
      const data = await sapFetch<{ value: SapServiceCall[] }>(country, "/ServiceCalls", {
        params: {
          $select: "ServiceCallID,Subject,Status,Priority,TechnicianCode,U_Area,CreationDate",
          $filter: "Status eq -3 or Status eq -2",
          $top: String(DB_BATCH_SIZE),
          $orderby: "CreationDate asc",
        },
      });

      for (const sc of data.value) {
        countryResult.evaluated++;
        try {
          // Obtener o crear estado de escalamiento
          const state = await getOrCreateState(sc.ServiceCallID, country, sc.Priority);
          if (!state || state.escalation_paused) continue;

          const sapCase = {
            ServiceCallID: sc.ServiceCallID,
            Subject:       sc.Subject || "",
            Status:        sc.Status,
            Priority:      sc.Priority,
            TechnicianCode: sc.TechnicianCode,
            U_Area:        sc.U_Area,
            CreationDate:  sc.CreationDate,
          };

          // Evaluar SLA de resolución
          if (state.resolution_policy_id && state.resolution_deadline) {
            const { actions } = await evaluateCase(sapCase, country, state, "resolution", shared);
            if (actions.length > 0) countryResult.escalated++;
          }

          // Evaluar SLA de respuesta (solo si no ha habido primera respuesta)
          if (!state.first_response_at && state.response_policy_id && state.response_deadline) {
            const { actions } = await evaluateCase(sapCase, country, state, "response", shared);
            if (actions.length > 0) countryResult.escalated++;
          }

        } catch (caseErr) {
          countryResult.errors++;
          logger.error("Error evaluating case", {
            case_id: sc.ServiceCallID, country,
            error: caseErr instanceof Error ? caseErr.message : String(caseErr),
          });
        }
      }
      // S5: Pre-alertas para casos próximos a vencer
      if (preAlertMin) {
        countryResult.pre_alerts = await runPreAlerts(country, preAlertMin, shared).catch(() => 0);
      }
    } catch (countryErr) {
      countryResult.errors++;
      logger.error("Error fetching cases for country", {
        country,
        error: countryErr instanceof Error ? countryErr.message : String(countryErr),
      });
    }

    results[country] = countryResult;
    totalEscalated += countryResult.escalated;
    totalErrors    += countryResult.errors;
  }

  return NextResponse.json({
    success: true,
    results,
    total_escalated: totalEscalated,
    total_errors:    totalErrors,
    ran_at:          new Date().toISOString(),
  });
}
