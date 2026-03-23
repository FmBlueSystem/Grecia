import { NextRequest, NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import { getAllPermissions, setPermission, ALL_MODULES, MODULE_LABELS } from "@/lib/permissions";
import { logChanges } from "@/lib/audit";

export async function GET() {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
  }

  const perms = await getAllPermissions();
  return NextResponse.json({
    modules: ALL_MODULES,
    labels: MODULE_LABELS,
    roles: ["admin", "supervisor", "agente"],
    permissions: perms,
  });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
  }

  const body = await request.json();
  const updates: { role: string; module: string; enabled: boolean }[] = body.updates;

  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ error: "updates requerido" }, { status: 400 });
  }

  const changes: { field: string; oldValue: string | null; newValue: string | null }[] = [];
  const current = await getAllPermissions();

  for (const { role, module, enabled } of updates) {
    const oldVal = current[role]?.[module];
    if (oldVal !== enabled) {
      await setPermission(role, module, enabled);
      changes.push({
        field: `Permiso: ${role}/${module}`,
        oldValue: String(oldVal ?? "no definido"),
        newValue: String(enabled),
      });
    }
  }

  if (changes.length > 0) {
    logChanges(session.userId, session.name, "caso", "permissions", changes, session.country).catch(() => {});
  }

  return NextResponse.json({ success: true, updated: changes.length });
}
