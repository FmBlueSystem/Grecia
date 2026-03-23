import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

// GET - retrieve survey by token (public, no auth needed)
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Token requerido" }, { status: 400 });

  const survey = await queryOne<{
    id: number;
    case_id: number;
    rating: number | null;
    responded_at: string | null;
  }>(
    "SELECT id, case_id, rating, responded_at FROM casos.csat_surveys WHERE token = $1 AND created_at > NOW() - INTERVAL '30 days'",
    [token]
  );

  if (!survey) return NextResponse.json({ error: "Encuesta no encontrada o expirada" }, { status: 404 });

  return NextResponse.json(survey);
}

// PATCH - submit rating (public, token-based)
export async function PATCH(request: NextRequest) {
  const { token, rating, comment } = await request.json();

  if (!token || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Token y rating (1-5) requeridos" }, { status: 400 });
  }

  const survey = await queryOne<{ id: number; responded_at: string | null }>(
    "SELECT id, responded_at FROM casos.csat_surveys WHERE token = $1 AND created_at > NOW() - INTERVAL '30 days'",
    [token]
  );

  if (!survey) return NextResponse.json({ error: "Encuesta no encontrada o expirada" }, { status: 404 });
  if (survey.responded_at) return NextResponse.json({ error: "Encuesta ya respondida" }, { status: 400 });

  await query(
    "UPDATE casos.csat_surveys SET rating = $1, comment = $2, responded_at = NOW() WHERE id = $3",
    [rating, comment || null, survey.id]
  );

  return NextResponse.json({ success: true });
}
