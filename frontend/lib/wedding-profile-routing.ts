import type { WeddingProfile } from "@/lib/api/weddings";

export function getWeddingProfileRedirectPath(
  profile: WeddingProfile | null | undefined,
  pathname: string,
): string | null {
  if (profile === undefined) return null;

  const normalizedPath = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;

  if (profile === null && isDashboardPath(normalizedPath)) {
    return "/onboarding";
  }

  if (profile && normalizedPath === "/onboarding") {
    return "/dashboard";
  }

  return null;
}

function isDashboardPath(pathname: string) {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}
