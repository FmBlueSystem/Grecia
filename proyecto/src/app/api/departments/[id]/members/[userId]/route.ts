import { NextRequest, NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { logChanges } from "@/lib/audit";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const session = await getSession();
  if (!session || (!isAdmin(session.role) && session.role !== "coordinador")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id, userId } = await params;
  const deptId = Number(id);
  const memberId = Number(userId);
  if (!deptId || !memberId) {
    return NextResponse.json({ error: "IDs invalidos" }, { status: 400 });
  }

  // Get member info for audit before deleting
  const member = await queryOne<{ user_id: number; role: string; user_name: string }>(
    `SELECT dm.user_id, dm.role, u.name as user_name
     FROM casos.department_members dm
     JOIN casos.users u ON dm.user_id = u.id
     WHERE dm.department_id = $1 AND dm.user_id = $2`,
    [deptId, memberId]
  );

  if (!member) {
    return NextResponse.json({ error: "Miembro no encontrado" }, { status: 404 });
  }

  await queryOne(
    "DELETE FROM casos.department_members WHERE department_id = $1 AND user_id = $2",
    [deptId, memberId]
  );

  await logChanges(session.userId, session.name, "department", String(deptId), [
    { field: "miembro_removido", oldValue: `${member.user_name} (${member.role})`, newValue: null },
  ]);

  return NextResponse.json({ success: true });
}
