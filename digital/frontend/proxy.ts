import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { routing } from "./i18n/routing";
import { isNonLocalizedAppRoute, isProtectedRoute } from "./lib/proxy-route-matching";

const intl = createIntlMiddleware(routing);

export default function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const session = getSessionCookie(request);

    // 1. API routes — pass through immediately, never locale-prefix them.
    //    Without this, /api/auth/... would become /id/api/auth/... and 404.
    if (pathname.startsWith("/api/")) {
      console.log("[Proxy Middleware] API Route:", pathname, "-> NextResponse.next()");
      return NextResponse.next();
    }

    // 2. Auth guard — redirect unauthenticated users before any locale processing.
    if (isProtectedRoute(pathname) && !session) {
      return NextResponse.redirect(new URL("/id/auth", request.url));
    }

    // 3. Non-localized app routes — bypass next-intl to avoid locale redirect loops.
    if (isNonLocalizedAppRoute(pathname)) {
      return NextResponse.next();
    }

    // 4. Everything else — locale routing via next-intl.
    return intl(request);
  } catch (err: unknown) {
    console.error("[Proxy Middleware] ERROR:", err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/",
    "/(id|en)/:path*",
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
