import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: string;
  sap_employee_id: number | null;
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const q = request.nextUrl.searchParams.get("q") || "";
  if (q.length < 2) return NextResponse.json({ items: [] });

  const users = await query<UserRow>(
    `SELECT id, name, email, role, sap_employee_id
     FROM casos.users
     WHERE active = TRUE
       AND (name ILIKE $1 OR email ILIKE $1)
     ORDER BY name
     LIMIT 20`,
    [`%${q}%`]
  );

  return NextResponse.json({
    items: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      sapEmployeeId: u.sap_employee_id,
    })),
  });
}
