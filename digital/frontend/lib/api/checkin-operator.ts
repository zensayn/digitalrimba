// Operator-session check-in API client. Unlike lib/api/checkin-events.ts
// (organizer JWT), every call here takes the PIN-session token explicitly.

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
const REQUEST_TIMEOUT_MS = 10_000;

// Bounded fetch so a stalled request on flaky venue Wi-Fi fails cleanly
// instead of hanging the caller's busy state indefinitely. On timeout this
// aborts like a plain network failure (not a CheckinApiError), so it still
// flows into the existing offline-queue path.
function fetchWithTimeout(input: string, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
}

export type CheckInGuest = {
  id: string;
  name: string;
  tag: string;
  arrivedAt: string | null;
  souvenirCollected: boolean;
  qrToken: string;
  partySize: number;
  actualPax?: number;
  proxyName?: string;
  giftTagCode?: string;
  checkedInByLabel?: string;
};

export type ScanPayload = {
  qrToken: string;
  souvenirGiven?: boolean;
  actualPax?: number;
  proxyName?: string;
  giftTagCode?: string;
  checkedInByLabel?: string;
};

export type WalkInPayload = {
  name: string;
  partySize: number;
  giftTagCode?: string;
  checkedInByLabel?: string;
};

/** HTTP-level failure (guest not found, unauthorized…). Do NOT queue these
 * for offline replay — only network failures (fetch TypeError) are queued. */
export class CheckinApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "CheckinApiError";
  }
}

async function checkOk(res: Response, action: string, defaultMessage?: string): Promise<Response> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new CheckinApiError(
      (body as { error?: string }).error ?? defaultMessage ?? `${action} failed`,
      res.status
    );
  }
  return res;
}

export function normalizeGuest(raw: Record<string, unknown>): CheckInGuest {
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    tag: String(raw.tag ?? raw.guest_group ?? ""),
    arrivedAt: raw.arrived_at ? String(raw.arrived_at) : null,
    souvenirCollected: Boolean(raw.souvenir_given ?? raw.souvenir_claimed),
    qrToken: String(raw.qr_token ?? ""),
    partySize: raw.party_size ? Number(raw.party_size) : 1,
    actualPax: raw.actual_pax ? Number(raw.actual_pax) : undefined,
    proxyName: raw.proxy_name ? String(raw.proxy_name) : undefined,
    giftTagCode: raw.gift_tag_code ? String(raw.gift_tag_code) : undefined,
    checkedInByLabel: raw.checked_in_by_label
      ? String(raw.checked_in_by_label)
      : undefined,
  };
}

function authHeaders(token: string, json = false): HeadersInit {
  return json
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { Authorization: `Bearer ${token}` };
}

export async function authOperator(eventCode: string, pin: string) {
  const res = await checkOk(
    await fetchWithTimeout(`${BASE}/api/checkin/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventCode, pin }),
    }),
    "Auth",
    "Wrong PIN"
  );
  const data = (await res.json()) as {
    token: string;
    expires_at?: string;
    next_gift_tag?: number;
  };
  return {
    token: data.token,
    expiresAt: data.expires_at ?? null,
    nextGiftTag: data.next_gift_tag ?? 1,
  };
}

/** Read-only QR lookup — does NOT mark the guest as arrived. */
export async function lookupByQR(
  token: string,
  qrToken: string
): Promise<CheckInGuest | null> {
  const res = await checkOk(
    await fetchWithTimeout(`${BASE}/api/checkin/guests?qr=${encodeURIComponent(qrToken)}`, {
      headers: authHeaders(token),
    }),
    "Guest lookup"
  );
  const data = (await res.json()) as unknown[];
  if (!Array.isArray(data) || data.length === 0) return null;
  return normalizeGuest(data[0] as Record<string, unknown>);
}

/** Write — marks the guest as arrived with the kiosk details. */
export async function scanGuest(token: string, payload: ScanPayload) {
  const res = await checkOk(
    await fetchWithTimeout(`${BASE}/api/checkin/scan`, {
      method: "POST",
      headers: authHeaders(token, true),
      body: JSON.stringify({
        qr_token: payload.qrToken,
        souvenir_given: payload.souvenirGiven ?? false,
        actual_pax: payload.actualPax ?? null,
        proxy_name: payload.proxyName ?? "",
        gift_tag_code: payload.giftTagCode ?? "",
        checked_in_by_label: payload.checkedInByLabel ?? "",
      }),
    }),
    "Scan"
  );
  const data = (await res.json()) as {
    guest: Record<string, unknown>;
    already_arrived?: boolean;
  };
  return {
    guest: normalizeGuest(data.guest),
    alreadyArrived: Boolean(data.already_arrived),
  };
}

export async function searchGuests(
  token: string,
  query: string
): Promise<CheckInGuest[]> {
  const res = await checkOk(
    await fetchWithTimeout(`${BASE}/api/checkin/guests?q=${encodeURIComponent(query)}`, {
      headers: authHeaders(token),
    }),
    "Guest search"
  );
  const data = (await res.json()) as unknown;
  const list = Array.isArray(data)
    ? data
    : ((data as { guests?: unknown[] }).guests ?? []);
  return (list as Record<string, unknown>[]).map(normalizeGuest);
}

/** Full guest list for the offline cache. */
export async function fetchRoster(token: string): Promise<CheckInGuest[]> {
  const res = await checkOk(
    await fetchWithTimeout(`${BASE}/api/checkin/roster`, { headers: authHeaders(token) }),
    "Roster"
  );
  const data = (await res.json()) as Record<string, unknown>[];
  return data.map(normalizeGuest);
}

export async function toggleSouvenir(
  token: string,
  guestId: string,
  collected: boolean
): Promise<boolean> {
  const res = await checkOk(
    await fetchWithTimeout(`${BASE}/api/checkin/guests/${guestId}/souvenir`, {
      method: "PATCH",
      headers: authHeaders(token, true),
      body: JSON.stringify({ collected }),
    }),
    "Souvenir toggle"
  );
  const data = (await res.json()) as { souvenir_claimed?: boolean };
  return data.souvenir_claimed ?? collected;
}

/** Creates a walk-in guest, checked in immediately. Online only. */
export async function createWalkIn(
  token: string,
  payload: WalkInPayload
): Promise<CheckInGuest> {
  const res = await checkOk(
    await fetchWithTimeout(`${BASE}/api/checkin/walkin`, {
      method: "POST",
      headers: authHeaders(token, true),
      body: JSON.stringify({
        name: payload.name,
        party_size: payload.partySize,
        gift_tag_code: payload.giftTagCode ?? "",
        checked_in_by_label: payload.checkedInByLabel ?? "",
      }),
    }),
    "Walk-in"
  );
  const data = (await res.json()) as { guest: Record<string, unknown> };
  return normalizeGuest(data.guest);
}
