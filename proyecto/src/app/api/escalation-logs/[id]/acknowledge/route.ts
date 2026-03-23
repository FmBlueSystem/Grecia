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
  const logId = Number(id);
  if (!logId || logId <= 0) {
    return NextResponse.json({ error: "ID invalido" }, { status: 400 });
  }

  const result = await queryOne<{ id: number; acknowledged_at: string }>(
    `UPDATE casos.escalation_logs
     SET acknowledged_at = NOW()
     WHERE id = $1 AND acknowledged_at IS NULL
     RETURNING id, acknowledged_at`,
    [logId]
  );

  if (!result) {
    return NextResponse.json(
      { error: "Registro no encontrado o ya reconocido" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, id: result.id, acknowledged_at: result.acknowledged_at });
}
