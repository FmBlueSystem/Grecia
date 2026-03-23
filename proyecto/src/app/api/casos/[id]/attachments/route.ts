import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { logChanges } from "@/lib/audit";
import { validateFileType } from "@/lib/security";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

interface AttachmentRow {
  id: number;
  case_id: number;
  country: string;
  user_id: number;
  user_name: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const caseId = parseInt(id, 10);

  const attachments = await query<AttachmentRow>(
    "SELECT id, case_id, country, user_id, user_name, file_name, file_size, mime_type, created_at FROM casos.case_attachments WHERE case_id = $1 AND country = $2 ORDER BY created_at DESC",
    [caseId, session.country]
  );

  return NextResponse.json(attachments);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const caseId = parseInt(id, 10);

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Archivo excede 10MB" }, { status: 400 });
  }

  const fileCheck = validateFileType(file.name, file.type || "application/octet-stream");
  if (!fileCheck.allowed) {
    return NextResponse.json({ error: fileCheck.error }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const dir = path.join(UPLOAD_DIR, String(caseId));

  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, safeName);
  await writeFile(filePath, buffer);

  const rows = await query<AttachmentRow>(
    "INSERT INTO casos.case_attachments (case_id, country, user_id, user_name, file_name, file_path, file_size, mime_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
    [caseId, session.country, session.userId, session.name, file.name, filePath, file.size, file.type || "application/octet-stream"]
  );

  logChanges(session.userId, session.name, "caso", String(caseId), [
    { field: "Adjunto", oldValue: null, newValue: file.name },
  ], session.country).catch((err) => console.error("Error logging attachment:", err));

  return NextResponse.json(rows[0], { status: 201 });
}
