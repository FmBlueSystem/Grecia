import { NextResponse } from "next/server";
import { getSamlInstance } from "@/lib/saml";

/**
 * GET /api/auth/saml/login
 * Inicia el flujo SAML redirigiendo al ADFS corporativo.
 */
export async function GET() {
  try {
    const saml = getSamlInstance();
    const loginUrl = await saml.getAuthorizeUrlAsync("", "", {});
    return NextResponse.redirect(loginUrl);
  } catch (error) {
    console.error("[SAML] Error generando URL de login:", error);
    return NextResponse.json(
      { error: "SAML no configurado. Contacte al administrador." },
      { status: 503 }
    );
  }
}
