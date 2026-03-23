import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, createSession, setSessionCookie, isAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
import { checkRateLimit } from "@/lib/security";
import { type CountryCode } from "@/lib/constants";

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getClientIp(request: NextRequest): string {
  return request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, country } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contrasena son requeridos" },
        { status: 400 }
      );
    }

    const ip = getClientIp(request);
    const emailLower = email.toLowerCase();

    // Rate limit by email: 5 attempts per 15 min
    const emailLimit = checkRateLimit(`login:email:${emailLower}`, 5, WINDOW_MS);
    if (!emailLimit.allowed) {
      const retryMin = Math.ceil(emailLimit.retryAfterMs / 60_000);
      return NextResponse.json(
        { error: `Demasiados intentos. Intente de nuevo en ${retryMin} minutos.` },
        { status: 429, headers: { "Retry-After": String(Math.ceil(emailLimit.retryAfterMs / 1000)) } }
      );
    }

    // Rate limit by IP: 20 attempts per 15 min
    const ipLimit = checkRateLimit(`login:ip:${ip}`, 20, WINDOW_MS);
    if (!ipLimit.allowed) {
      const retryMin = Math.ceil(ipLimit.retryAfterMs / 60_000);
      return NextResponse.json(
        { error: `Demasiados intentos desde esta direccion. Intente de nuevo en ${retryMin} minutos.` },
        { status: 429, headers: { "Retry-After": String(Math.ceil(ipLimit.retryAfterMs / 1000)) } }
      );
    }

    const result = await authenticateUser(emailLower, password);

    if (!result.success || !result.user) {
      await query(
        "INSERT INTO casos.audit_logs (action, details, ip_address) VALUES ($1, $2, $3)",
        ["login_failed", JSON.stringify({ email: emailLower }), ip]
      ).catch(() => {});

      return NextResponse.json(
        { error: result.error || "Credenciales invalidas" },
        { status: 401 }
      );
    }

    const user = result.user;
    const countryCode = (country || user.default_country) as CountryCode;

    if (!user.countries.includes(countryCode) && !isAdmin(user.role)) {
      return NextResponse.json(
        { error: "No tiene acceso al pais seleccionado" },
        { status: 403 }
      );
    }

    const token = await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      country: countryCode,
      countries: user.countries,
      sapEmployeeId: user.sap_employee_id,
    });

    await query(
      "INSERT INTO casos.audit_logs (user_id, action, details, ip_address) VALUES ($1, $2, $3, $4)",
      [user.id, "login", JSON.stringify({ name: user.name, email: user.email, country: countryCode }), ip]
    ).catch(() => {});

    const response = NextResponse.json({
      success: true,
      user: { name: user.name, role: user.role },
      country: countryCode,
    });
    setSessionCookie(response, token);
    return response;
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json(
      { error: "Error del servidor. Intente de nuevo." },
      { status: 500 }
    );
  }
}
