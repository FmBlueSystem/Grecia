import { NextRequest, NextResponse } from "next/server";
import { getSession, hashPassword, isAdmin } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { logChanges } from "@/lib/audit";
import { validatePassword } from "@/lib/security";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const userId = parseInt(id, 10);
  if (isNaN(userId)) {
    return NextResponse.json({ error: "ID invalido" }, { status: 400 });
  }

  const body = await request.json();
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (body.active !== undefined) {
    updates.push(`active = $${paramIndex++}`);
    values.push(body.active);
  }
  if (body.role !== undefined) {
    if (!["agente", "colaborador", "supervisor", "admin", "coordinador", "super_admin"].includes(body.role)) {
      return NextResponse.json({ error: "Rol invalido" }, { status: 400 });
    }
    updates.push(`role = $${paramIndex++}`);
    values.push(body.role);
  }
  if (body.countries !== undefined) {
    updates.push(`countries = $${paramIndex++}`);
    values.push(body.countries);
  }
  if (body.name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(body.name);
  }
  if (body.password !== undefined) {
    const pwResult = validatePassword(body.password);
    if (!pwResult.valid) {
      return NextResponse.json({ error: pwResult.error }, { status: 400 });
    }
    const hashed = await hashPassword(body.password);
    updates.push(`password_hash = $${paramIndex++}`);
    values.push(hashed);
  }
  if (body.sap_employee_id !== undefined) {
    updates.push(`sap_employee_id = $${paramIndex++}`);
    values.push(body.sap_employee_id);
  }
  if (body.department_id !== undefined) {
    updates.push(`department_id = $${paramIndex++}`);
    values.push(body.department_id);
  }
  if (body.default_country !== undefined) {
    updates.push(`default_country = $${paramIndex++}`);
    values.push(body.default_country);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: "Sin cambios" }, { status: 400 });
  }

  // Fetch current user before update
  const currentUser = await queryOne<{ name: string; role: string; countries: string[]; active: boolean; sap_employee_id: number | null }>(
    "SELECT name, role, countries, active, sap_employee_id FROM casos.users WHERE id = $1",
    [userId]
  );

  values.push(userId);
  await query(
    `UPDATE casos.users SET ${updates.join(", ")} WHERE id = $${paramIndex}`,
    values
  );

  // Log field-level changes
  if (currentUser) {
    const changes: { field: string; oldValue: string | null; newValue: string | null }[] = [];
    if (body.name !== undefined && body.name !== currentUser.name) {
      changes.push({ field: "Nombre", oldValue: currentUser.name, newValue: body.name });
    }
    if (body.role !== undefined && body.role !== currentUser.role) {
      changes.push({ field: "Rol", oldValue: currentUser.role, newValue: body.role });
    }
    if (body.countries !== undefined && JSON.stringify(body.countries) !== JSON.stringify(currentUser.countries)) {
      changes.push({ field: "Paises", oldValue: currentUser.countries.join(", "), newValue: body.countries.join(", ") });
    }
    if (body.active !== undefined && body.active !== currentUser.active) {
      changes.push({ field: "Activo", oldValue: String(currentUser.active), newValue: String(body.active) });
    }
    if (body.password !== undefined) {
      changes.push({ field: "Contrasena", oldValue: "***", newValue: "***" });
    }
    if (body.sap_employee_id !== undefined && body.sap_employee_id !== currentUser.sap_employee_id) {
      changes.push({ field: "SAP Employee ID", oldValue: String(currentUser.sap_employee_id ?? ""), newValue: String(body.sap_employee_id ?? "") });
    }

    logChanges(session.userId, session.name, "user", String(userId), changes).catch((err) =>
      console.error("Error logging user changes:", err)
    );
  }

  return NextResponse.json({ success: true });
}
