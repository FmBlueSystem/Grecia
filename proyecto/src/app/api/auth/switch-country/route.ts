import { NextRequest, NextResponse } from "next/server";
import { getSession, createSession, setSessionCookie, isAdmin } from "@/lib/auth";
import { logChanges } from "@/lib/audit";
import type { CountryCode } from "@/lib/constants";
import { SAP_DATABASES } from "@/lib/constants";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { country } = await request.json();

  if (!country || !SAP_DATABASES[country as CountryCode]) {
    return NextResponse.json({ error: "Pais invalido" }, { status: 400 });
  }

  // Verify user has access to this country
  if (!session.countries.includes(country) && !isAdmin(session.role)) {
    return NextResponse.json({ error: "No tiene acceso a este pais" }, { status: 403 });
  }

  const token = await createSession({
    userId: session.userId,
    email: session.email,
    name: session.name,
    role: session.role,
    country: country as CountryCode,
    countries: session.countries,
    sapEmployeeId: session.sapEmployeeId,
  });

  logChanges(session.userId, session.name, "user", String(session.userId), [
    { field: "Pais activo", oldValue: session.country, newValue: country },
  ]).catch((err) => console.error("Error logging country switch:", err));

  const response = NextResponse.json({ success: true, country });
  setSessionCookie(response, token);
  return response;
}
