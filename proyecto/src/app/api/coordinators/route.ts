import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const coordinators = await query<{ id: number; name: string; default_country: string }>(
    "SELECT id, name, default_country FROM casos.users WHERE role = 'coordinador' AND active = TRUE ORDER BY name"
  );

  return NextResponse.json({ coordinators });
}
