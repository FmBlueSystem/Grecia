import { NextRequest, NextResponse } from "next/server";
import { getSamlInstance, extractSamlUser } from "@/lib/saml";
import { createSession, setSessionCookie } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { query } from "@/lib/db";
import { type CountryCode } from "@/lib/constants";

interface UserRecord {
  id: number;
  email: string;
  name: string;
  role: "agente" | "supervisor" | "admin";
  countries: string[];
  default_country: string;
  active: boolean;
  sap_employee_id: number | null;
}

/**
 * POST /api/auth/saml/callback
 * ADFS envía la respuesta SAML aquí (HTTP-POST binding).
 * Valida el assertion, busca el usuario en DB y crea sesión JWT.
 */
export async function POST(request: NextRequest) {
  try {
    const saml = getSamlInstance();

    // Parsear el body como form-urlencoded (SAML usa este formato)
    const body = await request.text();
    const params = new URLSearchParams(body);
    const samlResponse = params.get("SAMLResponse");

    if (!samlResponse) {
      return NextResponse.redirect(new URL("/login?error=saml_invalid", request.url));
    }

    // Validar y parsear el assertion SAML
    const { profile } = await saml.validatePostResponseAsync({ SAMLResponse: samlResponse });

    if (!profile) {
      console.error("[SAML] Assertion vacío recibido del ADFS");
      return NextResponse.redirect(new URL("/login?error=saml_empty", request.url));
    }

    const samlUser = extractSamlUser(profile as Record<string, unknown>);

    if (!samlUser.email) {
      console.error("[SAML] No se recibió email en el assertion:", profile);
      return NextResponse.redirect(new URL("/login?error=saml_no_email", request.url));
    }

    // Buscar usuario en la base de datos por email
    const user = await queryOne<UserRecord>(
      "SELECT id, email, name, role, countries, default_country, active, sap_employee_id FROM casos.users WHERE email = $1",
      [samlUser.email.toLowerCase()]
    );

    if (!user) {
      console.warn("[SAML] Usuario AD no encontrado en DB:", samlUser.email);
      return NextResponse.redirect(new URL("/login?error=saml_user_not_found", request.url));
    }

    if (!user.active) {
      console.warn("[SAML] Usuario AD desactivado:", samlUser.email);
      return NextResponse.redirect(new URL("/login?error=saml_user_inactive", request.url));
    }

    const country = user.default_country as CountryCode;

    const token = await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      country,
      countries: user.countries,
      sapEmployeeId: user.sap_employee_id,
    });

    // Registrar en audit log
    await query(
      "INSERT INTO casos.audit_logs (user_id, action, details, ip_address) VALUES ($1, $2, $3, $4)",
      [
        user.id,
        "login_saml",
        JSON.stringify({ email: user.email, name: user.name, method: "adfs" }),
        request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for") || "unknown",
      ]
    ).catch(() => {});

    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error("[SAML] Error procesando callback:", error);
    return NextResponse.redirect(new URL("/login?error=saml_error", request.url));
  }
}
