// Direct browser → R2 upload worker for studio assets (photos + music).
//
// The Next.js presign route (digital/frontend/app/api/upload/presign) hands
// the authenticated browser a key + this worker's URL + a shared secret; the
// browser PUTs the raw file here with `X-Upload-Token`. Files are served
// publicly via the bucket's custom domain (assets-invitations.rimba.io),
// never through this worker.
//
// Keys always contain a server-generated uuid (enforced by KEY_RE below), so
// re-uploading a same-named file yields a fresh key — the edge cache can
// never serve a stale object. The catalog prefix (music/catalog/) is NOT
// writable here; curated tracks go through invitation/scripts/upload-music.sh.

type R2Bucket = {
  put(
    key: string,
    value: ReadableStream | null,
    options?: { httpMetadata?: { contentType?: string; contentDisposition?: string } },
  ): Promise<unknown>;
};

interface Env {
  BUCKET: R2Bucket;
  UPLOAD_SECRET: string;
}

// invitations/{userId}/{uuid}{.ext} — the exact shape the presign route mints.
const KEY_RE = /^invitations\/[A-Za-z0-9_-]+\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(\.[a-z0-9]+)?$/;

const MB = 1024 * 1024;
const MAX_BYTES: Record<string, number> = {
  "image/jpeg": 15 * MB,
  "image/png": 15 * MB,
  "image/webp": 15 * MB,
  "image/gif": 15 * MB,
  "audio/mpeg": 5 * MB,
  "audio/mp4": 5 * MB,
  "audio/aac": 5 * MB,
  "audio/ogg": 5 * MB,
  "audio/wav": 5 * MB,
};

const CORS_HEADERS = {
  // Auth is the shared secret header, not the origin; * keeps localhost and
  // preview deployments working.
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Upload-Token",
  "Access-Control-Max-Age": "86400",
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    if (request.method !== "PUT") {
      return json(405, { error: "Method not allowed" });
    }

    const token = request.headers.get("X-Upload-Token");
    if (!token || token !== env.UPLOAD_SECRET) {
      return json(401, { error: "Invalid upload token" });
    }

    const key = decodeURIComponent(new URL(request.url).pathname.slice(1));
    if (!KEY_RE.test(key)) {
      return json(403, { error: "Invalid upload key" });
    }

    const contentType = (request.headers.get("Content-Type") ?? "").split(";")[0].trim().toLowerCase();
    const maxBytes = MAX_BYTES[contentType];
    if (!maxBytes) {
      return json(400, { error: `Unsupported content type: ${contentType || "(none)"}` });
    }

    const contentLength = Number(request.headers.get("Content-Length"));
    if (!Number.isFinite(contentLength) || contentLength <= 0) {
      return json(400, { error: "Content-Length required" });
    }
    if (contentLength > maxBytes) {
      return json(413, { error: `File too large (max ${maxBytes / MB} MB)` });
    }

    // `inline` forces browsers to render/stream the object as media instead
    // of downloading or executing it, even if the declared type was spoofed.
    await env.BUCKET.put(key, request.body, {
      httpMetadata: { contentType, contentDisposition: "inline" },
    });

    return json(200, { key });
  },
};
