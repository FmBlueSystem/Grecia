import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { logChanges } from "@/lib/audit";
import { getCaso } from "@/lib/casos";
import { sendExternalNoteEmail } from "@/lib/email";
import { isEnabled } from "@/lib/settings";
import { onCaseUpdate } from "@/lib/escalation-v2";
import type { CountryCode } from "@/lib/constants";

interface NoteRow {
  id: number;
  case_id: number;
  country: string;
  user_id: number;
  user_name: string;
  content: string;
  is_internal: boolean;
  created_at: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const caseId = parseInt(id, 10);
  if (isNaN(caseId)) {
    return NextResponse.json({ error: "ID invalido" }, { status: 400 });
  }

  const notes = await query<NoteRow>(
    "SELECT id, case_id, country, user_id, user_name, content, is_internal, created_at FROM casos.case_notes WHERE case_id = $1 AND country = $2 ORDER BY created_at DESC",
    [caseId, session.country]
  );

  return NextResponse.json(notes);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const caseId = parseInt(id, 10);
  if (isNaN(caseId)) {
    return NextResponse.json({ error: "ID invalido" }, { status: 400 });
  }

  const body = await request.json();
  const content = (body.content || "").trim();
  const isInternal = body.is_internal !== undefined ? Boolean(body.is_internal) : true;
  if (!content) {
    return NextResponse.json({ error: "Contenido requerido" }, { status: 400 });
  }

  const rows = await query<NoteRow>(
    "INSERT INTO casos.case_notes (case_id, country, user_id, user_name, content, is_internal) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [caseId, session.country, session.userId, session.name, content, isInternal]
  );

  logChanges(session.userId, session.name, "caso", String(caseId), [
    { field: "Nota", oldValue: null, newValue: content.substring(0, 200) },
  ], session.country).catch((err) => console.error("Error logging note:", err));

  // Escalamiento: registrar primera respuesta del agente + aplicar reset_policy
  onCaseUpdate(caseId, session.country, "agent_response").catch(() => {});

  // Auto: email al cliente si nota es externa
  if (!isInternal) {
    isEnabled("auto_email_on_external_note").then((on) => {
      if (on) getCaso(session.country as CountryCode, caseId).then((caso) => {
        if (caso?.contactEmail) {
          sendExternalNoteEmail(caso.contactEmail, caseId, caso.subject, content, session.name).catch(() => {});
        }
      }).catch(() => {});
    });
  }

  return NextResponse.json(rows[0], { status: 201 });
}
