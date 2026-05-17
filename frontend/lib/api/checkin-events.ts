const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export interface CheckinEventConfig {
  eventCode: string;
  operatorUrl: string;
  totalGuests: number;
  arrivedGuests: number;
  souvenirCount: number;
}

export interface CreateCheckinEventResult {
  eventCode: string;
  pin: string; // plain PIN — returned once per call, store in React state
}

let _cachedToken: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  const now = Date.now();
  if (_cachedToken && _cachedToken.expiresAt > now) return _cachedToken.value;
  const res = await fetch('/api/auth/token');
  if (!res.ok) throw new Error('Not signed in');
  const { token } = (await res.json()) as { token: string };
  _cachedToken = { value: token, expiresAt: now + 13 * 60 * 1000 };
  return token;
}

async function authedFetch(url: string, options?: RequestInit): Promise<Response> {
  const token = await getToken();
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string> | undefined),
    Authorization: `Bearer ${token}`,
  };
  if (options?.body !== undefined) headers['Content-Type'] = 'application/json';
  return fetch(url, { ...options, headers });
}

/** Creates the check-in event or regenerates the PIN. Returns plain PIN once. */
export async function createCheckinEvent(): Promise<CreateCheckinEventResult> {
  const res = await authedFetch(`${BASE}/api/checkin/events`, { method: 'POST' });
  if (!res.ok) throw new Error(`createCheckinEvent failed: ${res.status}`);
  return res.json();
}

/** Returns event config for the caller's wedding, or null if not yet configured. */
export async function getCheckinEvent(): Promise<CheckinEventConfig | null> {
  const res = await authedFetch(`${BASE}/api/checkin/events`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`getCheckinEvent failed: ${res.status}`);
  return res.json();
}

/** Triggers per-guest QR email. Returns number of emails queued. */
export async function triggerQREmail(): Promise<{ queued: number }> {
  const res = await authedFetch(`${BASE}/api/checkin/events/qr/email`, { method: 'POST' });
  if (!res.ok) throw new Error(`triggerQREmail failed: ${res.status}`);
  return res.json();
}

/** Returns absolute URL for the QR PDF — use with anchor click or window.open. */
export function getQRPdfUrl(): string {
  return `${BASE}/api/checkin/events/qr/pdf`;
}
