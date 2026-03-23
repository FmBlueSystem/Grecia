import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

interface NotificationRow {
  id: number;
  user_id: number;
  case_id: number | null;
  country: string | null;
  title: string;
  message: string | null;
  type: string;
  read: boolean;
  created_at: string;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const [items, countRow] = await Promise.all([
    query<NotificationRow>(
      `SELECT id, user_id, case_id, country, title, message, type, read, created_at
       FROM casos.notifications
       WHERE user_id = $1 AND read = false
       ORDER BY created_at DESC
       LIMIT 20`,
      [session.userId]
    ),
    queryOne<{ count: string }>(
      "SELECT COUNT(*) as count FROM casos.notifications WHERE user_id = $1 AND read = false",
      [session.userId]
    ),
  ]);

  return NextResponse.json(
    { items, unread_count: Number(countRow?.count || 0) },
    { headers: { "Cache-Control": "private, no-cache" } }
  );
}
