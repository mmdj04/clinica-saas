import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PUBLIC_PATH_PREFIXES = ["/login", "/register", "/forgot-password"];

const PUBLIC_EXACT = new Set(["/"]);

const isDemo = !process.env.DATABASE_URL || process.env.DEMO_MODE === "true";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = isDemo
    ? "demo-session"
    : getSessionCookie(request, {
        cookiePrefix: "clinica",
      });

  const isPublicExact = PUBLIC_EXACT.has(pathname);
  const isPublicPrefix = PUBLIC_PATH_PREFIXES.some((p) => pathname.startsWith(p));
  const isApp = pathname.startsWith("/app");

  // Rotas protegidas exigem sessão
  if (isApp && !sessionToken) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Páginas de auth redirecionam usuários logados para o app
  if (isPublicPrefix && sessionToken) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  // Headers de segurança (camada extra além de next.config)
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  void isPublicExact;
  return response;
}

export const config = {
  matcher: [
    // Exclui estáticos, API e assets
    "/((?!_next|api|trpc|.*\\..*).*)",
  ],
};