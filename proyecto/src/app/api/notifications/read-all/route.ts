import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const updated = await query<{ id: number }>(
    "UPDATE casos.notifications SET read = true WHERE user_id = $1 AND read = false RETURNING id",
    [session.userId]
  );

  return NextResponse.json({ success: true, updated: updated.length });
}
