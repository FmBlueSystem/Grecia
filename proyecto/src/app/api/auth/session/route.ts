import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPermissionsForRole } from "@/lib/permissions";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const permissions = await getPermissionsForRole(session.role);

  return NextResponse.json({
    userId: session.userId,
    name: session.name,
    email: session.email,
    role: session.role,
    country: session.country,
    countries: session.countries,
    permissions,
  });
}
