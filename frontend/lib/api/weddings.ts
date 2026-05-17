const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export type WeddingProfile = {
  id: string;
  slug: string;
  couple_name: string;
  event_date: string;
  venue_name: string;
  venue_address: string;
  tier: string;
  status: string;
};

export type SaveWeddingProfileInput = {
  couple_name: string;
  event_date?: string;
  venue_name?: string;
  venue_address?: string;
};

type WeddingProfileResponse = {
  wedding: WeddingProfile | null;
};

let _cachedToken: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  const now = Date.now();
  if (_cachedToken && _cachedToken.expiresAt > now) {
    return _cachedToken.value;
  }

  const res = await fetch("/api/auth/token");
  if (!res.ok) throw new Error("Not signed in");

  const { token } = (await res.json()) as { token: string };
  _cachedToken = { value: token, expiresAt: now + 13 * 60 * 1000 };
  return token;
}

async function authedFetch(url: string, options?: RequestInit): Promise<Response> {
  const token = await getToken();
  const headers = new Headers(options?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  return fetch(url, { ...options, headers });
}

export async function fetchWeddingProfile(): Promise<WeddingProfile | null> {
  const res = await authedFetch(`${BASE}/api/weddings/profile`);
  if (!res.ok) throw new Error(`Wedding profile fetch failed: ${res.status}`);
  const body = (await res.json()) as WeddingProfileResponse;
  return body.wedding ?? null;
}

export async function saveWeddingProfile(input: SaveWeddingProfileInput): Promise<WeddingProfile> {
  const res = await authedFetch(`${BASE}/api/weddings/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Wedding profile save failed: ${res.status}`);

  const body = (await res.json()) as WeddingProfileResponse;
  if (!body.wedding) throw new Error("Wedding profile save returned no profile");
  return body.wedding;
}
