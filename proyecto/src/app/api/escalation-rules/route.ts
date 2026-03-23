import { NextRequest, NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

interface RuleRow {
  id: number;
  priority: string;
  level_1_pct: number;
  level_2_pct: number;
  level_3_minutes: number;
  notify_email: boolean;
  notify_in_app: boolean;
  notify_whatsapp: boolean;
  country: string | null;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const rules = await query<RuleRow>(
    "SELECT id, priority, level_1_pct, level_2_pct, level_3_minutes, notify_email, notify_in_app, notify_whatsapp, country FROM casos.escalation_rules ORDER BY priority, country"
  );

  return NextResponse.json({ rules });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const { rules } = body as {
    rules?: {
      id: number;
      level_1_pct?: number;
      level_2_pct?: number;
      level_3_minutes?: number;
      notify_email?: boolean;
      notify_in_app?: boolean;
      notify_whatsapp?: boolean;
    }[];
  };

  if (!rules || !Array.isArray(rules) || rules.length === 0) {
    return NextResponse.json({ error: "rules requerido" }, { status: 400 });
  }

  let updated = 0;
  for (const r of rules) {
    if (!r.id) continue;

    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (r.level_1_pct !== undefined) {
      if (r.level_1_pct < 1 || r.level_1_pct > 100) continue;
      sets.push(`level_1_pct = $${idx++}`);
      values.push(r.level_1_pct);
    }
    if (r.level_2_pct !== undefined) {
      if (r.level_2_pct < 1 || r.level_2_pct > 200) continue;
      sets.push(`level_2_pct = $${idx++}`);
      values.push(r.level_2_pct);
    }
    if (r.level_3_minutes !== undefined) {
      if (r.level_3_minutes < 0) continue;
      sets.push(`level_3_minutes = $${idx++}`);
      values.push(r.level_3_minutes);
    }
    if (r.notify_email !== undefined) {
      sets.push(`notify_email = $${idx++}`);
      values.push(r.notify_email);
    }
    if (r.notify_in_app !== undefined) {
      sets.push(`notify_in_app = $${idx++}`);
      values.push(r.notify_in_app);
    }
    if (r.notify_whatsapp !== undefined) {
      sets.push(`notify_whatsapp = $${idx++}`);
      values.push(r.notify_whatsapp);
    }

    if (sets.length === 0) continue;

    values.push(r.id);
    const result = await queryOne<{ id: number }>(
      `UPDATE casos.escalation_rules SET ${sets.join(", ")} WHERE id = $${idx} RETURNING id`,
      values
    );
    if (result) updated++;
  }

  return NextResponse.json({ updated });
}
