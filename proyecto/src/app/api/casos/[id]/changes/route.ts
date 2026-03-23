import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getChangeLogs } from "@/lib/audit";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;

  try {
    const logs = await getChangeLogs("caso", id);
    return NextResponse.json({ items: logs });
  } catch (e) {
    console.error("Error fetching change logs:", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
