import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

interface LogRow {
  id: number;
  case_id: number;
  country: string;
  level: string;
  action: string;
  notified_to: string | null;
  notified_user_id: number | null;
  acknowledged_at: string | null;
  created_at: string;
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const caseId = searchParams.get("case_id");
  const country = searchParams.get("country");
  const caseIds = searchParams.get("case_ids"); // comma-separated for batch

  // Single case mode
  if (caseId && country) {
    const logs = await query<LogRow>(
      `SELECT id, case_id, country, level, action, notified_to, notified_user_id, acknowledged_at, created_at
       FROM casos.escalation_logs
       WHERE case_id = $1 AND country = $2
       ORDER BY created_at DESC
       LIMIT 50`,
      [Number(caseId), country]
    );
    return NextResponse.json({ logs });
  }

  // Batch mode: latest escalation per case (for alertas page)
  if (caseIds) {
    const ids = caseIds.split(",").map(Number).filter((n) => n > 0);
    if (ids.length === 0) {
      return NextResponse.json({ latest: {} });
    }

    // Use DISTINCT ON for batch lookup - get highest level per case with full details
    const rows = await query<{
      log_id: number;
      case_id: number;
      max_level: string;
      last_escalated: string;
      notified_to: string | null;
      acknowledged: boolean;
    }>(
      `SELECT DISTINCT ON (el.case_id)
              el.id as log_id,
              el.case_id,
              el.level as max_level,
              el.created_at as last_escalated,
              COALESCE(u.name, el.notified_to) as notified_to,
              (el.acknowledged_at IS NOT NULL) as acknowledged
       FROM casos.escalation_logs el
       LEFT JOIN casos.users u ON u.id = el.notified_user_id
       WHERE el.case_id = ANY($1::int[])
       ORDER BY el.case_id, el.level::int DESC, el.created_at DESC`,
      [ids]
    );

    // Build map: "caseId" -> { level, lastEscalated, notifiedTo, acknowledged, logId }
    const latest: Record<string, {
      level: string;
      lastEscalated: string;
      notifiedTo: string | null;
      acknowledged: boolean;
      logId: number;
    }> = {};
    for (const r of rows) {
      latest[`${r.case_id}`] = {
        level: r.max_level,
        lastEscalated: r.last_escalated,
        notifiedTo: r.notified_to,
        acknowledged: r.acknowledged,
        logId: r.log_id,
      };
    }

    return NextResponse.json({ latest });
  }

  return NextResponse.json({ error: "case_id+country o case_ids requerido" }, { status: 400 });
}
