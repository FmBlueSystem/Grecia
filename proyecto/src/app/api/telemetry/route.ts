import { NextRequest, NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { event, page, metadata, duration_ms } = await request.json();
    if (!event) return NextResponse.json({ error: "event requerido" }, { status: 400 });

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ua = request.headers.get("user-agent") || "";

    await query(
      `INSERT INTO casos.telemetry (user_id, user_name, event, page, metadata, duration_ms, user_agent, ip_address, country)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [session.userId, session.name, event, page || null, metadata ? JSON.stringify(metadata) : "{}", duration_ms || null, ua, ip, session.country]
    );

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("Telemetry error:", e);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const days = parseInt(request.nextUrl.searchParams.get("days") || "7", 10);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [events, stats] = await Promise.all([
    query<{
      id: number; user_name: string; event: string; page: string;
      duration_ms: number | null; country: string; created_at: string;
    }>(
      `SELECT id, user_name, event, page, duration_ms, country, created_at
       FROM casos.telemetry WHERE created_at >= $1 ORDER BY created_at DESC LIMIT 50`,
      [since.toISOString()]
    ),
    query<{ events_today: string; users_today: string; views_today: string }>(
      `SELECT
         COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) AS events_today,
         COUNT(DISTINCT user_id) FILTER (WHERE created_at >= CURRENT_DATE) AS users_today,
         COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE AND event = 'page_view') AS views_today
       FROM casos.telemetry WHERE created_at >= $1`,
      [since.toISOString()]
    ),
  ]);

  const topPages = await query<{ page: string; count: string }>(
    `SELECT page, COUNT(*) as count FROM casos.telemetry
     WHERE created_at >= $1 AND page IS NOT NULL
     GROUP BY page ORDER BY count DESC LIMIT 10`,
    [since.toISOString()]
  );

  const s = stats[0] || { events_today: "0", users_today: "0", views_today: "0" };

  return NextResponse.json({
    events,
    stats: {
      eventsToday: parseInt(s.events_today, 10),
      usersToday: parseInt(s.users_today, 10),
      viewsToday: parseInt(s.views_today, 10),
    },
    topPages: topPages.map((p) => ({ page: p.page, count: parseInt(p.count, 10) })),
  });
}
