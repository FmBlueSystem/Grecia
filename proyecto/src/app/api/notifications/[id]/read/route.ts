import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { queryOne } from "@/lib/db";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const notifId = Number(id);
  if (!notifId || notifId < 1) {
    return NextResponse.json({ error: "ID invalido" }, { status: 400 });
  }

  // IDOR prevention: UPDATE + RETURNING ensures ownership
  const updated = await queryOne<{ id: number }>(
    "UPDATE casos.notifications SET read = true WHERE id = $1 AND user_id = $2 AND read = false RETURNING id",
    [notifId, session.userId]
  );

  if (!updated) {
    return NextResponse.json({ error: "Notificacion no encontrada" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
