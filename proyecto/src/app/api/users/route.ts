import { NextRequest, NextResponse } from "next/server";
import { getSession, hashPassword, isAdmin, isSuperAdmin } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { logChanges } from "@/lib/audit";
import { validatePassword } from "@/lib/security";

export async function GET() {
  const session = await getSession();
  if (!session || (!isAdmin(session.role) && session.role !== "coordinador")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const users = isSuperAdmin(session.role)
    ? await query("SELECT id, email, name, role, countries, default_country, active, created_at, sap_employee_id, use_ad, department_id FROM casos.users ORDER BY name")
    : await query("SELECT id, email, name, role, countries, default_country, active, created_at, sap_employee_id, use_ad, department_id FROM casos.users WHERE $1 = ANY(countries) ORDER BY name", [session.country]);

  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  const isCoord = session?.role === "coordinador";
  if (!session || (!isAdmin(session.role) && !isCoord)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { email, password, name, role, countries, default_country } = await request.json();

  if (!email || !password || !name || !role) {
    return NextResponse.json({ error: "Campos requeridos: email, password, name, role" }, { status: 400 });
  }

  // Coordinador solo puede crear colaboradores
  if (isCoord && role !== "colaborador") {
    return NextResponse.json({ error: "Coordinador solo puede crear usuarios con rol colaborador" }, { status: 403 });
  }

  const pwCheck = validatePassword(password);
  if (!pwCheck.valid) {
    return NextResponse.json({ error: pwCheck.error }, { status: 400 });
  }

  if (!["agente", "colaborador", "supervisor", "admin", "coordinador", "super_admin"].includes(role)) {
    return NextResponse.json({ error: "Rol invalido" }, { status: 400 });
  }

  const existing = await queryOne("SELECT id FROM casos.users WHERE email = $1", [email.toLowerCase()]);
  if (existing) {
    return NextResponse.json({ error: "El email ya esta registrado" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const userCountries = countries || ["CR"];
  const defaultCountry = default_country || userCountries[0];

  const result = await queryOne<{ id: number }>(
    `INSERT INTO casos.users (email, password_hash, name, role, countries, default_country)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [email.toLowerCase(), passwordHash, name, role, userCountries, defaultCountry]
  );

  logChanges(session.userId, session.name, "user", String(result?.id), [
    { field: "Creacion", oldValue: null, newValue: `Usuario ${email} creado` },
    { field: "Nombre", oldValue: null, newValue: name },
    { field: "Rol", oldValue: null, newValue: role },
    { field: "Paises", oldValue: null, newValue: userCountries.join(", ") },
  ]).catch((err) => console.error("Error logging user creation:", err));

  return NextResponse.json({ success: true, id: result?.id }, { status: 201 });
}
