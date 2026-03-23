import { NextRequest, NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;

  // Increment views and fetch in a single query
  const article = await queryOne(
    "UPDATE casos.kb_articles SET views = views + 1 WHERE id = $1 RETURNING *",
    [parseInt(id, 10)]
  );

  if (!article) return NextResponse.json({ error: "Articulo no encontrado" }, { status: 404 });

  const res = NextResponse.json(article);
  res.headers.set("Cache-Control", "private, max-age=0");
  return res;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role === "agente") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const updates: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (body.title !== undefined) {
    updates.push(`title = $${idx++}`);
    values.push(body.title);
  }
  if (body.content !== undefined) {
    updates.push(`content = $${idx++}`);
    values.push(body.content);
  }
  if (body.category !== undefined) {
    updates.push(`category = $${idx++}`);
    values.push(body.category);
  }
  if (body.tags !== undefined) {
    updates.push(`tags = $${idx++}`);
    values.push(body.tags);
  }
  if (body.published !== undefined) {
    updates.push(`published = $${idx++}`);
    values.push(body.published);
  }
  if (body.tipo_caso !== undefined) {
    updates.push(`tipo_caso = $${idx++}`);
    values.push(body.tipo_caso || null);
  }

  if (updates.length === 0) return NextResponse.json({ error: "Sin cambios" }, { status: 400 });

  updates.push(`updated_at = NOW()`);
  values.push(parseInt(id, 10));

  await query(
    `UPDATE casos.kb_articles SET ${updates.join(", ")} WHERE id = $${idx}`,
    values
  );

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  await query("DELETE FROM casos.kb_articles WHERE id = $1", [parseInt(id, 10)]);

  return NextResponse.json({ success: true });
}
