const protectedRouteSegments = ["dashboard", "onboarding", "invitation"];
const nonLocalizedAppRouteSegments = ["dashboard", "onboarding"];
const localePattern = /^[a-z]{2}$/;

export function isProtectedRoute(pathname: string): boolean {
  return protectedRouteSegments.some(
    (segment) => hasRootSegment(pathname, segment) || hasLocalizedSegment(pathname, segment),
  );
}

export function isNonLocalizedAppRoute(pathname: string): boolean {
  return nonLocalizedAppRouteSegments.some((segment) => hasRootSegment(pathname, segment));
}

function hasRootSegment(pathname: string, segment: string): boolean {
  const [first] = pathSegments(pathname);
  return first === segment;
}

function hasLocalizedSegment(pathname: string, segment: string): boolean {
  const [locale, route] = pathSegments(pathname);
  return localePattern.test(locale ?? "") && route === segment;
}

function pathSegments(pathname: string): string[] {
  return pathname.split("/").filter(Boolean);
}
