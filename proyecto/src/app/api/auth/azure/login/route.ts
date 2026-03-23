import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function GET() {
  const tenantId = process.env.AZURE_AD_TENANT_ID!;
  const clientId = process.env.AZURE_AD_CLIENT_ID!;
  const redirectUri = process.env.AZURE_AD_REDIRECT_URI!;

  // State aleatorio para protección CSRF
  const state = randomBytes(16).toString("hex");

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    response_mode: "query",
    scope: "openid email profile",
    state,
  });

  const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params}`;

  const response = NextResponse.redirect(authUrl);
  // Guardar state en cookie para verificar en callback
  response.cookies.set("az_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutos
    path: "/",
  });

  return response;
}
