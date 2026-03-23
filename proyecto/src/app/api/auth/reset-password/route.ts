import { NextRequest, NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { validatePassword } from "@/lib/security";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const { token, password } = await request.json();

  if (!token || !password) {
    return NextResponse.json({ error: "Token y contraseña requeridos" }, { status: 400 });
  }

  const pwCheck = validatePassword(password);
  if (!pwCheck.valid) {
    return NextResponse.json({ error: pwCheck.error }, { status: 400 });
  }

  // Hash the incoming token with SHA-256 to compare with stored hash
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const reset = await queryOne<{ id: number; user_id: number; expires_at: string; used: boolean }>(
    "SELECT id, user_id, expires_at, used FROM casos.password_resets WHERE token = $1",
    [tokenHash]
  );

  if (!reset) {
    return NextResponse.json({ error: "Token inválido" }, { status: 400 });
  }

  if (reset.used) {
    return NextResponse.json({ error: "Token ya utilizado" }, { status: 400 });
  }

  if (new Date(reset.expires_at) < new Date()) {
    return NextResponse.json({ error: "Token expirado. Solicite uno nuevo." }, { status: 400 });
  }

  const hashed = await hashPassword(password);

  await query("UPDATE casos.users SET password_hash = $1 WHERE id = $2", [hashed, reset.user_id]);

  // Invalidate ALL tokens for this user (not just the one used)
  await query("UPDATE casos.password_resets SET used = TRUE WHERE user_id = $1", [reset.user_id]);

  return NextResponse.json({ success: true });
}
