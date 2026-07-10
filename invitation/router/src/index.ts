// Wildcard router for published invitations: {slug}.rimba.io.
//
// Looks up the invitation by subdomain slug on the Go API (only to learn its
// templateId), then forwards the request to the matching theme worker with a
// single `x-rimba-slug` header added. The theme fetches its own config by
// that slug — the config payload NEVER travels through headers (HTTP header
// size limits would break long stories/galleries with an opaque 431).
// Both this lookup and the theme's fetch ride the API's 60s Cache-Control.

type Fetcher = { fetch: (request: Request) => Promise<Response> };

interface Env {
  API_URL: string;
  THEME_DEV_ORIGIN?: string;
  THEME_WARM_NARRATIVE: Fetcher;
}

// Subdomains that must never resolve as invitation slugs. Kept in sync with
// reservedSlugs in digital/backend/internal/handlers/invitation.go, which
// prevents users from claiming them in the first place. sacred-luxe and
// sinema-kisah stay listed after their themes were removed: the demo links
// are still in circulation, so the names must not become claimable.
const RESERVED_SUBDOMAINS = new Set([
  "www",
  "api",
  "app",
  "admin",
  "mail",
  "staging",
  "assets-themes",
  "assets-invitations",
  "warm-narrative",
  "sacred-luxe",
  "sinema-kisah",
  "rimba",
  "dashboard",
  "invitation",
  "invitations",
]);

const DEFAULT_TEMPLATE = "warm-narrative";

// warm-narrative is the only theme that ships today. An unknown templateId has
// always fallen back to it rather than 404ing; add a case per theme as they land.
function themeFor(env: Env, templateId: string | undefined): Fetcher | null {
  switch (templateId ?? DEFAULT_TEMPLATE) {
    case "warm-narrative":
    default:
      return env.THEME_WARM_NARRATIVE ?? null;
  }
}

function notFound(): Response {
  return new Response(
    `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Invitation not found — Rimba</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #04241e; color: #fffaf0; font-family: ui-sans-serif, system-ui, sans-serif; text-align: center; }
    h1 { font-size: 1.4rem; font-weight: 600; margin: 0 0 .5rem; }
    p { margin: 0; opacity: .7; font-size: .9rem; }
    a { color: #e8b94a; }
  </style>
</head>
<body>
  <div>
    <h1>Invitation not found</h1>
    <p>This address isn't linked to a published invitation.<br><a href="https://rimba.io">rimba.io</a></p>
  </div>
</body>
</html>`,
    { status: 404, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } },
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    // x-forwarded-host is a dev-only seam: wrangler dev rewrites both
    // request.url and the Host header to the route's zone apex, so local
    // tests pass the intended host explicitly. Only honored when
    // THEME_DEV_ORIGIN marks a dev environment — in production the real
    // Host decides, so callers can't select an arbitrary slug via header.
    const forwardedHost = env.THEME_DEV_ORIGIN ? request.headers.get("x-forwarded-host") : null;
    const hostname = (forwardedHost ?? request.headers.get("host") ?? url.hostname)
      .split(":")[0];
    const labels = hostname.split(".");
    const slug = labels[0].toLowerCase();

    // Apex, www-style hosts, and reserved subdomains never map to invitations.
    if (labels.length < 3 || RESERVED_SUBDOMAINS.has(slug)) {
      return notFound();
    }

    // Timeout + parse guard: a stalled or malformed API response must fail
    // fast to a 503, not hang the edge request or throw a 1101.
    let invitation: { content?: { templateId?: string } };
    try {
      const apiRes = await fetch(`${env.API_URL}/api/invitations/${encodeURIComponent(slug)}`, {
        cf: { cacheTtl: 60, cacheEverything: true },
        signal: AbortSignal.timeout(5000),
      } as RequestInit);
      if (apiRes.status === 404) return notFound();
      if (!apiRes.ok) return new Response("service unavailable", { status: 503 });
      invitation = (await apiRes.json()) as { content?: { templateId?: string } };
    } catch (err) {
      console.error(`router: invitation lookup failed for ${slug}:`, err);
      return new Response("service unavailable", { status: 503 });
    }

    const headers = new Headers(request.headers);
    headers.set("x-rimba-slug", slug);
    const forwarded = new Request(request, { headers });

    // Local dev: forward to a plain origin (e.g. next dev) instead of a
    // service binding, which wrangler dev can't reach on its own.
    if (env.THEME_DEV_ORIGIN) {
      const devUrl = new URL(url.pathname + url.search, env.THEME_DEV_ORIGIN);
      return fetch(new Request(devUrl, forwarded));
    }

    const theme = themeFor(env, invitation.content?.templateId);
    if (!theme) return new Response("theme unavailable", { status: 503 });
    return theme.fetch(forwarded);
  },
};
