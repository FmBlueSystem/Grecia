import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(_request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const stats = await query<{ total: string; responded: string; avg_rating: string }>(
    "SELECT COUNT(*) as total, COUNT(rating) as responded, COALESCE(AVG(rating), 0) as avg_rating FROM casos.csat_surveys WHERE country = $1",
    [session.country]
  );

  const distribution = await query<{ rating: number; count: string }>(
    "SELECT rating, COUNT(*) as count FROM casos.csat_surveys WHERE country = $1 AND rating IS NOT NULL GROUP BY rating ORDER BY rating",
    [session.country]
  );

  return NextResponse.json({
    total: parseInt(stats[0]?.total || "0"),
    responded: parseInt(stats[0]?.responded || "0"),
    avgRating: parseFloat(stats[0]?.avg_rating || "0"),
    distribution: distribution.map((d) => ({ rating: d.rating, count: parseInt(d.count) })),
  });
}
