import { NextRequest, NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { logChanges } from "@/lib/audit";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const deptId = Number(id);
  if (!deptId) return NextResponse.json({ error: "ID invalido" }, { status: 400 });

  const existing = await queryOne<{ id: number; name: string; country: string; chief_user_id: number | null }>(
    "SELECT id, name, country, chief_user_id FROM casos.departments WHERE id = $1 AND active = true",
    [deptId]
  );
  if (!existing) {
    return NextResponse.json({ error: "Departamento no encontrado" }, { status: 404 });
  }

  const body = await request.json();
  const { name, country, chief_user_id } = body as {
    name?: string;
    country?: string;
    chief_user_id?: number | null;
  };

  const changes: { field: string; oldValue: string | null; newValue: string | null }[] = [];
  const sets: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (name !== undefined && name.trim() !== existing.name) {
    sets.push(`name = $${idx++}`);
    values.push(name.trim());
    changes.push({ field: "nombre", oldValue: existing.name, newValue: name.trim() });
  }
  if (country !== undefined && country !== existing.country) {
    const validCountries = ["CR", "GT", "HN", "SV", "PA"];
    if (!validCountries.includes(country)) {
      return NextResponse.json({ error: "Pais invalido" }, { status: 400 });
    }
    sets.push(`country = $${idx++}`);
    values.push(country);
    changes.push({ field: "pais", oldValue: existing.country, newValue: country });
  }
  if (chief_user_id !== undefined && chief_user_id !== existing.chief_user_id) {
    if (!chief_user_id) {
      return NextResponse.json({ error: "Jefe requerido" }, { status: 400 });
    }
    const chief = await queryOne<{ id: number }>(
      "SELECT id FROM casos.users WHERE id = $1 AND active = true",
      [chief_user_id]
    );
    if (!chief) {
      return NextResponse.json({ error: "Jefe no encontrado" }, { status: 400 });
    }
    sets.push(`chief_user_id = $${idx++}`);
    values.push(chief_user_id);
    changes.push({
      field: "jefe",
      oldValue: existing.chief_user_id ? String(existing.chief_user_id) : null,
      newValue: chief_user_id ? String(chief_user_id) : null,
    });
  }

  if (sets.length === 0) {
    return NextResponse.json({ message: "Sin cambios" });
  }

  values.push(deptId);
  await queryOne(
    `UPDATE casos.departments SET ${sets.join(", ")} WHERE id = $${idx}`,
    values
  );

  await logChanges(session.userId, session.name, "department", String(deptId), changes);

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const deptId = Number(id);
  if (!deptId) return NextResponse.json({ error: "ID invalido" }, { status: 400 });

  const dept = await queryOne<{ id: number; name: string; country: string }>(
    "UPDATE casos.departments SET active = false WHERE id = $1 AND active = true RETURNING id, name, country",
    [deptId]
  );

  if (!dept) {
    return NextResponse.json({ error: "Departamento no encontrado" }, { status: 404 });
  }

  await logChanges(session.userId, session.name, "department", String(deptId), [
    { field: "eliminacion", oldValue: `${dept.name} (${dept.country})`, newValue: "desactivado" },
  ]);

  return NextResponse.json({ success: true });
}
