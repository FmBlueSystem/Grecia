import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const url = request.nextUrl;
  const search = url.searchParams.get("search") || "";
  const category = url.searchParams.get("category") || "";
  const tipoCaso = url.searchParams.get("tipo_caso") || "";
  const published = url.searchParams.get("published");

  let sql =
    "SELECT id, title, category, tipo_caso, tags, author_name, published, views, created_at, updated_at FROM casos.kb_articles WHERE 1=1";
  const params: unknown[] = [];
  let idx = 1;

  if (search) {
    sql += ` AND (to_tsvector('spanish', title || ' ' || content) @@ plainto_tsquery('spanish', $${idx++}) OR title ILIKE $${idx++})`;
    params.push(search, `%${search}%`);
  }
  if (category) {
    sql += ` AND category = $${idx++}`;
    params.push(category);
  }
  if (tipoCaso) {
    sql += ` AND tipo_caso = $${idx++}`;
    params.push(tipoCaso);
  }
  if (published === "true") {
    sql += " AND published = true";
  } else if (published === "false") {
    sql += " AND published = false";
  }

  sql += " ORDER BY updated_at DESC LIMIT 50";

  const articles = await query(sql, params);
  return NextResponse.json({ items: articles });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role === "agente") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { title, content, category, tags, published, tipo_caso } = await request.json();

  if (!title || !content) {
    return NextResponse.json({ error: "Titulo y contenido requeridos" }, { status: 400 });
  }

  const result = await queryOne<{ id: number }>(
    "INSERT INTO casos.kb_articles (title, content, category, tags, author_id, author_name, published, tipo_caso) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",
    [title, content, category || null, tags || [], session.userId, session.name, published || false, tipo_caso || null]
  );

  return NextResponse.json({ success: true, id: result?.id }, { status: 201 });
}
