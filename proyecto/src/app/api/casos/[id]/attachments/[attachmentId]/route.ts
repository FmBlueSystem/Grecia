import { NextRequest, NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import { queryOne, query } from "@/lib/db";
import { logChanges } from "@/lib/audit";
import { readFile, unlink } from "fs/promises";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id, attachmentId } = await params;

  const attachment = await queryOne<{ file_name: string; file_path: string; mime_type: string }>(
    "SELECT file_name, file_path, mime_type FROM casos.case_attachments WHERE id = $1 AND case_id = $2 AND country = $3",
    [parseInt(attachmentId, 10), parseInt(id, 10), session.country]
  );

  if (!attachment) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }

  try {
    const buffer = await readFile(attachment.file_path);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": attachment.mime_type,
        "Content-Disposition": `attachment; filename="${attachment.file_name}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Archivo no encontrado en disco" }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "Solo administradores pueden eliminar adjuntos" }, { status: 403 });
  }

  const { id, attachmentId } = await params;

  const attachment = await queryOne<{ file_name: string; file_path: string }>(
    "SELECT file_name, file_path FROM casos.case_attachments WHERE id = $1 AND case_id = $2 AND country = $3",
    [parseInt(attachmentId, 10), parseInt(id, 10), session.country]
  );

  if (!attachment) {
    return NextResponse.json({ error: "Adjunto no encontrado" }, { status: 404 });
  }

  // Delete from disk
  try { await unlink(attachment.file_path); } catch { /* file may already be gone */ }

  // Delete from DB
  await query("DELETE FROM casos.case_attachments WHERE id = $1 AND case_id = $2 AND country = $3", [parseInt(attachmentId, 10), parseInt(id, 10), session.country]);

  logChanges(session.userId, session.name, "caso", id, [
    { field: "Adjunto eliminado", oldValue: attachment.file_name, newValue: null },
  ], session.country).catch((err) => console.error("Error logging attachment delete:", err));

  return NextResponse.json({ success: true });
}
