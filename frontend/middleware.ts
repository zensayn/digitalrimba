import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// next-intl locale negotiation + routing. Required for the App Router `[locale]`
// setup: it redirects `/` to the default locale, rewrites locale-prefixed paths,
// and sets the `x-next-intl-locale` header that the navigation hooks
// (`usePathname`/`useRouter` from `@/i18n/routing`) rely on. Without this,
// client-side locale switching can't strip the active prefix and double-prefixes
// the path (e.g. `/en/en/...`).
export default createMiddleware(routing);

export const config = {
  // Match all pathnames except:
  //  - API routes (`/api`)
  //  - Next.js internals (`/_next`, `/_vercel`)
  //  - files with an extension (e.g. `favicon.ico`, images, fonts)
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
