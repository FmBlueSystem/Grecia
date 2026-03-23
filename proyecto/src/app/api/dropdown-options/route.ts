import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDropdownOptions } from "@/lib/settings";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const options = await getDropdownOptions();

  return NextResponse.json(options, {
    headers: { "Cache-Control": "private, max-age=60" },
  });
}
