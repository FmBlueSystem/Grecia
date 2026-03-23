import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { COOKIE_NAME } from "./lib/constants";

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// Paths exempt from CSRF check (public APIs, cron)
const CSRF_EXEMPT = ["/api/auth/", "/api/csat", "/api/escalation/check", "/api/telemetry", "/api/intake/"];

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  return response;
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;

  // Public paths that don't require auth
  const isPublic = pathname === "/login" || pathname === "/forgot-password" || pathname === "/reset-password" || pathname.startsWith("/api/auth/") || pathname === "/api/csat" || pathname === "/api/health" || pathname.startsWith("/encuesta") || pathname === "/api/escalation/check" || pathname.startsWith("/api/intake/");

  if (!token && !isPublic) {
    return addSecurityHeaders(NextResponse.redirect(new URL("/login", request.url)));
  }

  if (token && isPublic && pathname === "/login") {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      await jwtVerify(token, secret);
      return addSecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
    } catch {
      const response = NextResponse.next();
      response.cookies.delete(COOKIE_NAME);
      return addSecurityHeaders(response);
    }
  }

  // CSRF: validate Origin for mutations on authenticated endpoints
  if (MUTATION_METHODS.has(request.method) && !CSRF_EXEMPT.some((p) => pathname.startsWith(p))) {
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    if (!origin && !referer) {
      return addSecurityHeaders(
        NextResponse.json({ error: "Solicitud no autorizada (CSRF)" }, { status: 403 })
      );
    }
    // Behind reverse proxy: use forwarded headers to determine expected origin
    const fwdProto = request.headers.get("x-forwarded-proto") || new URL(request.url).protocol.replace(":", "");
    const fwdHost = request.headers.get("x-forwarded-host") || request.headers.get("host") || new URL(request.url).host;
    const expectedOrigin = `${fwdProto}://${fwdHost}`;
    const valid =
      (origin && new URL(origin).origin === expectedOrigin) ||
      (referer && new URL(referer).origin === expectedOrigin);
    if (!valid) {
      return addSecurityHeaders(
        NextResponse.json({ error: "Solicitud no autorizada (CSRF)" }, { status: 403 })
      );
    }
  }

  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\.ico|.*\.(?:png|jpg|svg|ico|webmanifest|xml|txt)).*)",
  ],
};
