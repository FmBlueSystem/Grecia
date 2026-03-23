import { NextResponse } from "next/server";
import { query } from "@/lib/db";

const startedAt = new Date().toISOString();

export async function GET() {
  const checks: Record<string, string> = {};

  // Database check
  try {
    await query("SELECT 1");
    checks.database = "ok";
  } catch {
    checks.database = "error";
  }

  const allOk = Object.values(checks).every((v) => v === "ok");

  return NextResponse.json(
    {
      status: allOk ? "healthy" : "degraded",
      version: process.env.npm_package_version || "1.0.0",
      uptime: process.uptime(),
      startedAt,
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: allOk ? 200 : 503 }
  );
}
