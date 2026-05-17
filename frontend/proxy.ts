import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { routing } from "./i18n/routing";

const intl = createIntlMiddleware(routing);

const isProtectedRoute = (pathname: string) =>
  pathname.startsWith("/dashboard") ||
  pathname.startsWith("/invitation") ||
  /^\/[a-z]{2}\/dashboard/.test(pathname) ||
  /^\/[a-z]{2}\/invitation/.test(pathname);

// Routes owned by the (dashboard) route group — next-intl must not intercept
// them or it re-adds the locale prefix and creates an infinite redirect loop.
const isDashboardRoute = (pathname: string) =>
  pathname === "/dashboard" || pathname.startsWith("/dashboard/");

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = getSessionCookie(request);

  // 1. API routes — pass through immediately, never locale-prefix them.
  //    Without this, /api/auth/... would become /id/api/auth/... and 404.
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // 2. Auth guard — redirect unauthenticated users before any locale processing.
  if (isProtectedRoute(pathname) && !session) {
    return NextResponse.redirect(new URL("/id/auth", request.url));
  }

  // 3. /dashboard/** — bypass next-intl to avoid locale↔non-locale redirect loop.
  if (isDashboardRoute(pathname)) {
    return NextResponse.next();
  }

  // 4. Everything else — locale routing via next-intl.
  return intl(request);
}

export const config = {
  matcher: [
    "/",
    "/(id|en)/:path*",
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
