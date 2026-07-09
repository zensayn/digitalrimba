import type { InvitationConfig } from '@/lib/invitation-config';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

// content is the rich InvitationConfig. The backend PATCH merges per
// TOP-LEVEL key only — always send complete top-level values, never partial
// nested objects (a partial `events` would wipe the sibling event).
export type InvitationContent = Partial<InvitationConfig>;

export type Invitation = {
  id: string;
  owner_id?: string;
  couple_names: string;
  slug: string;
  content: InvitationContent;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

let _cachedToken: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  const now = Date.now();
  if (_cachedToken && _cachedToken.expiresAt > now) {
    return _cachedToken.value;
  }
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
  if (options?.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  return fetch(url, { ...options, headers });
}

export function errorStatus(err: unknown): number | undefined {
  return (err as { status?: number } | null)?.status;
}

function statusError(message: string, status: number): Error {
  return Object.assign(new Error(`${message}: ${status}`), { status });
}

export async function fetchInvitations(): Promise<Invitation[]> {
  const res = await authedFetch(`${BASE}/api/invitations`);
  if (!res.ok) throw statusError('Invitations fetch failed', res.status);
  return res.json();
}

export async function fetchInvitation(id: string): Promise<Invitation> {
  const res = await authedFetch(`${BASE}/api/invitations/by-id/${id}`);
  if (!res.ok) throw statusError('Invitation fetch failed', res.status);
  return res.json();
}

export type SlugCheck = {
  slug: string;
  available: boolean;
  reason: 'taken' | 'invalid' | 'reserved' | '';
};

export async function checkSlug(slug: string): Promise<SlugCheck> {
  const res = await authedFetch(`${BASE}/api/invitations/slug-check?slug=${encodeURIComponent(slug)}`);
  if (!res.ok) throw statusError('Slug check failed', res.status);
  return res.json();
}
