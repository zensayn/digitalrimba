import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { routing } from "./i18n/routing";
import { isNonLocalizedAppRoute, isProtectedRoute } from "./lib/proxy-route-matching";

const intl = createIntlMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. API routes — pass through immediately, never locale-prefix them.
  //    Without this, /api/auth/... would become /id/api/auth/... and 404.
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // 2. Auth guard — fail closed: a cookie we can't parse is unauthenticated.
  let session: ReturnType<typeof getSessionCookie> = null;
  try {
    session = getSessionCookie(request);
  } catch (err: unknown) {
    console.error("[Proxy Middleware] session cookie parse failed:", err);
  }
  if (isProtectedRoute(pathname) && !session) {
    return NextResponse.redirect(new URL("/id/auth", request.url));
  }

  // 3. Non-localized app routes — bypass next-intl to avoid locale redirect loops.
  if (isNonLocalizedAppRoute(pathname)) {
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
