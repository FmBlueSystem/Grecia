import { NextRequest, NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { logChanges } from "@/lib/audit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || (!isAdmin(session.role) && session.role !== "coordinador")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const deptId = Number(id);
  if (!deptId) return NextResponse.json({ error: "ID invalido" }, { status: 400 });

  const dept = await queryOne<{ id: number; name: string; jefe_id: number | null }>(
    "SELECT id, name, jefe_id FROM casos.departments WHERE id = $1 AND active = true",
    [deptId]
  );
  if (!dept) {
    return NextResponse.json({ error: "Departamento no encontrado" }, { status: 404 });
  }

  const body = await request.json();
  const { user_id, role } = body as { user_id?: number; role?: string };

  if (!user_id) {
    return NextResponse.json({ error: "user_id requerido" }, { status: 400 });
  }
  if (!role || !["supervisor", "agente"].includes(role)) {
    return NextResponse.json({ error: "Rol debe ser 'supervisor' o 'agente'" }, { status: 400 });
  }

  const user = await queryOne<{ id: number; name: string; active: boolean }>(
    "SELECT id, name, active FROM casos.users WHERE id = $1",
    [user_id]
  );
  if (!user || !user.active) {
    return NextResponse.json({ error: "Usuario no encontrado o inactivo" }, { status: 400 });
  }

  // Prevent jefe from being added as member
  if (dept.jefe_id === user_id) {
    return NextResponse.json({ error: "Este usuario ya es jefe del departamento" }, { status: 409 });
  }

  // ON CONFLICT DO NOTHING prevents duplicates
  const inserted = await queryOne<{ user_id: number }>(
    `INSERT INTO casos.department_members (department_id, user_id, role)
     VALUES ($1, $2, $3)
     ON CONFLICT (department_id, user_id) DO NOTHING
     RETURNING user_id`,
    [deptId, user_id, role]
  );

  if (!inserted) {
    return NextResponse.json({ error: "El usuario ya es miembro de este departamento" }, { status: 409 });
  }

  await logChanges(session.userId, session.name, "department", String(deptId), [
    { field: "miembro_agregado", oldValue: null, newValue: `${user.name} (${role})` },
  ]);

  return NextResponse.json({ success: true }, { status: 201 });
}
