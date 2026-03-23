import { NextRequest, NextResponse } from "next/server";
import { getSession, isAdmin, isSuperAdmin } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { logChanges } from "@/lib/audit";

interface DeptRow {
  id: number;
  name: string;
  chief_user_id: number | null;
  country: string;
  active: boolean;
  created_at: string;
  chief_name: string | null;
}

interface MemberRow {
  department_id: number;
  user_id: number;
  role: string;
  user_name: string;
  user_email: string;
}

interface UserDeptRow {
  department_id: number;
  user_id: number;
  user_name: string;
  user_role: string;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // super_admin sees all countries; admin sees only their country
  const countryFilter = isSuperAdmin(session.role) ? null : session.country;

  // 3 queries — no N+1
  const [depts, members, userDepts] = await Promise.all([
    countryFilter
      ? query<DeptRow>(
          `SELECT d.id, d.name, d.chief_user_id, d.country, d.active, d.created_at,
                  u.name as chief_name
           FROM casos.departments d
           LEFT JOIN casos.users u ON d.chief_user_id = u.id
           WHERE d.active = true AND d.country = $1
           ORDER BY d.name`,
          [countryFilter]
        )
      : query<DeptRow>(
          `SELECT d.id, d.name, d.chief_user_id, d.country, d.active, d.created_at,
                  u.name as chief_name
           FROM casos.departments d
           LEFT JOIN casos.users u ON d.chief_user_id = u.id
           WHERE d.active = true
           ORDER BY d.country, d.name`
        ),
    countryFilter
      ? query<MemberRow>(
          `SELECT dm.department_id, dm.user_id, dm.role,
                  u.name as user_name, u.email as user_email
           FROM casos.department_members dm
           JOIN casos.users u ON dm.user_id = u.id
           JOIN casos.departments d ON dm.department_id = d.id
           WHERE d.active = true AND d.country = $1
           ORDER BY dm.role, u.name`,
          [countryFilter]
        )
      : query<MemberRow>(
          `SELECT dm.department_id, dm.user_id, dm.role,
                  u.name as user_name, u.email as user_email
           FROM casos.department_members dm
           JOIN casos.users u ON dm.user_id = u.id
           JOIN casos.departments d ON dm.department_id = d.id
           WHERE d.active = true
           ORDER BY dm.role, u.name`
        ),
    countryFilter
      ? query<UserDeptRow>(
          `SELECT u.department_id, u.id as user_id, u.name as user_name, u.role as user_role
           FROM casos.users u
           JOIN casos.departments d ON u.department_id = d.id
           WHERE u.active = true AND u.department_id IS NOT NULL AND d.active = true AND d.country = $1
           ORDER BY u.name`,
          [countryFilter]
        )
      : query<UserDeptRow>(
          `SELECT u.department_id, u.id as user_id, u.name as user_name, u.role as user_role
           FROM casos.users u
           JOIN casos.departments d ON u.department_id = d.id
           WHERE u.active = true AND u.department_id IS NOT NULL AND d.active = true
           ORDER BY u.name`
        ),
  ]);

  // Group department_members by department
  const memberMap = new Map<number, { supervisors: MemberRow[]; agents: MemberRow[] }>();
  for (const m of members) {
    const group = memberMap.get(m.department_id) || { supervisors: [], agents: [] };
    if (m.role === "supervisor") group.supervisors.push(m);
    else group.agents.push(m);
    memberMap.set(m.department_id, group);
  }

  // Group users by department_id
  const userDeptMap = new Map<number, UserDeptRow[]>();
  for (const u of userDepts) {
    const list = userDeptMap.get(u.department_id) || [];
    list.push(u);
    userDeptMap.set(u.department_id, list);
  }

  const items = depts.map((d) => {
    const group = memberMap.get(d.id) || { supervisors: [], agents: [] };
    const users = userDeptMap.get(d.id) || [];
    return {
      id: d.id,
      name: d.name,
      country: d.country,
      chief: d.chief_user_id ? { id: d.chief_user_id, name: d.chief_name } : null,
      supervisors: group.supervisors.map((m) => ({ id: m.user_id, name: m.user_name, email: m.user_email })),
      agents: group.agents.map((m) => ({ id: m.user_id, name: m.user_name, email: m.user_email })),
      users: users.map((u) => ({ id: u.user_id, name: u.user_name, role: u.user_role })),
    };
  });

  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const { name, country, chief_user_id } = body as {
    name?: string;
    country?: string;
    chief_user_id?: number | null;
  };

  if (!name?.trim()) {
    return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  }
  const validCountries = ["CR", "GT", "HN", "SV", "PA"];
  if (!country || !validCountries.includes(country)) {
    return NextResponse.json({ error: "Pais invalido" }, { status: 400 });
  }
  if (!chief_user_id) {
    return NextResponse.json({ error: "Jefe requerido" }, { status: 400 });
  }

  // Validate chief exists
  const chief = await queryOne<{ id: number }>(
    "SELECT id FROM casos.users WHERE id = $1 AND active = true",
    [chief_user_id]
  );
  if (!chief) {
    return NextResponse.json({ error: "Jefe no encontrado" }, { status: 400 });
  }

  // Insert with conflict check
  const existing = await queryOne<{ id: number }>(
    "SELECT id FROM casos.departments WHERE name = $1 AND country = $2 AND active = true",
    [name.trim(), country]
  );
  if (existing) {
    return NextResponse.json({ error: "Ya existe un departamento con ese nombre en ese pais" }, { status: 409 });
  }

  const created = await queryOne<{ id: number }>(
    `INSERT INTO casos.departments (name, country, chief_user_id)
     VALUES ($1, $2, $3) RETURNING id`,
    [name.trim(), country, chief_user_id || null]
  );

  await logChanges(session.userId, session.name, "department", String(created!.id), [
    { field: "creacion", oldValue: null, newValue: `${name} (${country})` },
  ]);

  return NextResponse.json({ id: created!.id }, { status: 201 });
}
