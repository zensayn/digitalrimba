"use client";

// ─── MarketingChrome ──────────────────────────────────────────────────────────
// Renders the global Header (sticky/morph) and Footer (parallax) once, gated
// by pathname. Skips routes where the chrome would be wrong:
//   - /dashboard (app shell)
//   - /auth, /login, /sign-up (auth flow has its own minimal chrome)
//   - /onboarding (focused setup flow)
//
// Mount this once in app/[locale]/layout.tsx so individual marketing pages
// don't have to import <Header />, <Footer />, or <Navbar />.

import { usePathname } from "@/i18n/routing";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import Footer from "@/components/Footer";

// Routes that should NOT show the marketing chrome
const NON_MARKETING_PREFIXES = [
  "/dashboard",
  "/auth",
  "/login",
  "/sign-up",
  "/onboarding",
] as const;

function isMarketingPath(pathname: string): boolean {
  return !NON_MARKETING_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

// Landing page uses the scroll-triggered Header; all other marketing pages
// get the always-visible PageHeader.
function isLandingPage(pathname: string): boolean {
  const cleanPath = pathname.replace(/^\/(id|en)(\/|$)/, "/");
  return cleanPath === "/" || cleanPath === "";
}

export function MarketingHeader() {
  const pathname = usePathname();
  if (!isMarketingPath(pathname)) return null;
  return isLandingPage(pathname) ? <Header /> : <PageHeader />;
}

export function MarketingFooter() {
  const pathname = usePathname();
  if (!isMarketingPath(pathname)) return null;
  return <Footer />;
}
