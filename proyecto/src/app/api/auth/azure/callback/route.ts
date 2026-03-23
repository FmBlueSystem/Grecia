import { NextRequest, NextResponse } from "next/server";
import { createSession, setSessionCookie } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { DEFAULT_COUNTRY } from "@/lib/constants";
import type { UserRecord } from "@/lib/auth";

interface AzureTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  error?: string;
  error_description?: string;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  // Error desde Azure
  if (errorParam) {
    return NextResponse.redirect(new URL(`/login?error=azure_error`, request.url));
  }

  // Verificar state CSRF
  const cookieState = request.cookies.get("az_state")?.value;
  if (!state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(new URL(`/login?error=azure_invalid_state`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL(`/login?error=azure_no_code`, request.url));
  }

  try {
    // Intercambiar code por token
    const tenantId = process.env.AZURE_AD_TENANT_ID!;
    const clientId = process.env.AZURE_AD_CLIENT_ID!;
    const clientSecret = process.env.AZURE_AD_CLIENT_SECRET!;
    const redirectUri = process.env.AZURE_AD_REDIRECT_URI!;

    const tokenRes = await fetch(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
          scope: "openid email profile",
        }),
      }
    );

    const tokens: AzureTokenResponse = await tokenRes.json();

    if (tokens.error) {
      console.error("[Azure Auth] Token error:", tokens.error_description);
      return NextResponse.redirect(new URL(`/login?error=azure_token_error`, request.url));
    }

    // Decodificar el ID token para obtener el email del usuario
    const idTokenParts = tokens.id_token.split(".");
    const b64 = idTokenParts[1].replace(/-/g, "+").replace(/_/g, "/");
    const idPayload = JSON.parse(Buffer.from(b64, "base64").toString("utf-8"));

    const email = (
      idPayload.email ||
      idPayload.preferred_username ||
      idPayload.unique_name ||
      ""
    ).toLowerCase();

    const displayName: string = idPayload.name || "";

    if (!email) {
      return NextResponse.redirect(new URL(`/login?error=azure_no_email`, request.url));
    }

    // Buscar usuario en la base de datos por email
    const user = await queryOne<UserRecord>(
      "SELECT id, email, name, role, countries, default_country, active, sap_employee_id FROM casos.users WHERE LOWER(email) = $1",
      [email]
    );

    if (!user) {
      return NextResponse.redirect(new URL(`/login?error=azure_user_not_found`, request.url));
    }

    if (!user.active) {
      return NextResponse.redirect(new URL(`/login?error=azure_user_inactive`, request.url));
    }

    const token = await createSession({
      userId: user.id,
      email: user.email,
      name: displayName || user.name,
      role: user.role,
      country: (user.default_country as any) || DEFAULT_COUNTRY,
      countries: user.countries || [DEFAULT_COUNTRY],
      sapEmployeeId: user.sap_employee_id,
    });

    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    setSessionCookie(response, token);
    response.cookies.delete("az_state");
    return response;
  } catch (err) {
    console.error("[Azure Auth] Callback error:", err);
    return NextResponse.redirect(new URL(`/login?error=azure_error`, request.url));
  }
}
