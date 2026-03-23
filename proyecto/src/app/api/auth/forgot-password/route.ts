import { NextRequest, NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/security";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  if (!email) return NextResponse.json({ error: "Email requerido" }, { status: 400 });

  const emailLower = email.toLowerCase();

  // Rate limit: max 3 requests per email per hour
  const limit = checkRateLimit(`forgot:${emailLower}`, 3, 60 * 60 * 1000);
  if (!limit.allowed) {
    // Return same success message to prevent enumeration
    return NextResponse.json({ success: true });
  }

  const user = await queryOne<{ id: number; name: string; email: string; active: boolean }>(
    "SELECT id, name, email, active FROM casos.users WHERE email = $1",
    [emailLower]
  );

  // Always return success to prevent email enumeration
  if (!user || !user.active) {
    return NextResponse.json({ success: true });
  }

  // Generate token and store SHA-256 hash (not plaintext)
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await query(
    "INSERT INTO casos.password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)",
    [user.id, tokenHash, expiresAt]
  );

  // Send email with raw token (not the hash)
  sendPasswordResetEmail(user.email, user.name, token).catch((err) =>
    console.error("Error sending reset email:", err)
  );

  return NextResponse.json({ success: true });
}
