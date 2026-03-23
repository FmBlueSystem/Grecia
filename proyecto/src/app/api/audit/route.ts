import { NextRequest, NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import { query } from "@/lib/db";

interface AuditEntry {
  id: number;
  source: string;
  user_name: string | null;
  action: string;
  entity: string;
  field: string | null;
  old_value: string | null;
  new_value: string | null;
  ip_address: string | null;
  created_at: string;
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const days = parseInt(request.nextUrl.searchParams.get("days") || "7", 10);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const logs = await query<AuditEntry>(
    `(
      SELECT id, 'audit' AS source,
             COALESCE(details->>'email', details->>'name')::text AS user_name,
             action, COALESCE(entity, details::text) AS entity,
             NULL::text AS field, NULL::text AS old_value, NULL::text AS new_value,
             ip_address::text, created_at
      FROM casos.audit_logs WHERE created_at >= $1
    )
    UNION ALL
    (
      SELECT id, 'change' AS source, user_name, entity_type AS action,
             entity_id AS entity, field, old_value, new_value,
             NULL::text AS ip_address, created_at
      FROM casos.change_logs WHERE created_at >= $1
    )
    ORDER BY created_at DESC LIMIT 100`,
    [since.toISOString()]
  );

  return NextResponse.json({ logs });
}
