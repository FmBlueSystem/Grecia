import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { COOKIE_NAME, DEFAULT_COUNTRY, type CountryCode } from "./constants";
import { queryOne } from "./db";

export interface UserRecord {
  id: number;
  email: string;
  name: string;
  role: "agente" | "colaborador" | "supervisor" | "admin" | "coordinador" | "super_admin";
  countries: string[];
  default_country: string;
  active: boolean;
  sap_employee_id: number | null;
}

/** Returns true for admin or super_admin */
export function isAdmin(role: string): boolean {
  return role === "admin" || role === "super_admin";
}

/** Returns true only for super_admin */
export function isSuperAdmin(role: string): boolean {
  return role === "super_admin";
}

export interface SessionPayload {
  userId: number;
  email: string;
  name: string;
  role: string;
  country: CountryCode;
  countries: string[];
  sapEmployeeId: number | null;
}

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET!);
}

export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

export async function authenticateUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: UserRecord; error?: string }> {
  const user = await queryOne<UserRecord & { password_hash: string }>(
    "SELECT id, email, password_hash, name, role, countries, default_country, active, sap_employee_id FROM casos.users WHERE email = $1",
    [email.toLowerCase()]
  );

  if (!user) {
    return { success: false, error: "Usuario no encontrado" };
  }

  if (!user.active) {
    return { success: false, error: "Usuario desactivado. Contacte al administrador." };
  }

  if (!user.password_hash) {
    return { success: false, error: "Este usuario utiliza inicio de sesión con Microsoft. Use el botón 'Continuar con Microsoft'." };
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return { success: false, error: "Contrasena incorrecta" };
  }

  const { password_hash: _, ...safeUser } = user;
  return { success: true, user: safeUser };
}

/**
 * Creates a signed JWT for the session and returns the token string.
 * Does NOT set any cookie — call setSessionCookie(response, token) to attach it.
 */
export async function createSession(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());

  return token;
}

/**
 * Sets the session cookie directly on a NextResponse.
 * Use this in Route Handlers to avoid ERR_HTTP_HEADERS_SENT.
 */
export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      userId: payload.userId as number,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
      country: (payload.country as CountryCode) || DEFAULT_COUNTRY,
      countries: (payload.countries as string[]) || [DEFAULT_COUNTRY],
      sapEmployeeId: (payload.sapEmployeeId as number) || null,
    };
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
