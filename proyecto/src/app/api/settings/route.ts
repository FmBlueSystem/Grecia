import { NextRequest, NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import { getAllSettings, getSetting, setSetting, SETTING_LABELS } from "@/lib/settings";
import { logChanges } from "@/lib/audit";

export async function GET() {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
  }

  const settings = await getAllSettings();

  // Build response with labels and categories (mask password fields)
  const items = Object.entries(SETTING_LABELS).map(([key, meta]) => ({
    key,
    value: meta.type === "password" ? (settings[key] ? "••••••••" : "") : (settings[key] ?? null),
    label: meta.label,
    category: meta.category,
    type: meta.type,
  }));

  return NextResponse.json({ items });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
  }

  const body = await request.json();
  const updates: { key: string; value: unknown }[] = body.updates;

  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ error: "updates requerido" }, { status: 400 });
  }

  const current = await getAllSettings();
  const changes: { field: string; oldValue: string | null; newValue: string | null }[] = [];

  for (const { key, value } of updates) {
    if (!(key in SETTING_LABELS)) continue;
    const meta = SETTING_LABELS[key];
    const oldVal = String(current[key] ?? "");
    const newVal = String(value ?? "");
    if (oldVal !== newVal) {
      // Don't log password values
      const logOld = meta.type === "password" ? "***" : oldVal;
      const logNew = meta.type === "password" ? "***" : newVal;
      changes.push({ field: `Config: ${meta.label}`, oldValue: logOld, newValue: logNew });
    }
    await setSetting(key, value, session.userId);
  }

  if (changes.length > 0) {
    logChanges(session.userId, session.name, "caso", "settings", changes, session.country).catch(() => {});
  }

  return NextResponse.json({ success: true, updated: changes.length });
}
