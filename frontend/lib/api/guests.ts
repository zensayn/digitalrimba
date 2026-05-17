import type { Guest, GuestTag, RSVPStatus } from "@/components/guests/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

type GuestPayload = {
  id: string;
  name: string;
  email?: string;
  phone: string;
  tag: GuestTag;
  qr_token?: string;
  qrToken?: string;
  rsvp_status?: string;
  rsvpStatus?: string;
  notes?: string;
  party_size?: number;
  method?: string;
  responded_at?: string;
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

export async function fetchGuests(): Promise<Guest[]> {
  const res = await authedFetch(`${BASE}/api/guests`);
  if (!res.ok) throw new Error("Failed to fetch guests");
  const guests = (await res.json()) as GuestPayload[];
  return guests.map(normalizeGuest);
}

export async function deleteGuests(ids: string[]): Promise<void> {
  const res = await authedFetch(`${BASE}/api/guests`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error("Failed to delete guests");
}

export async function updateGuestTag(id: string, tag: GuestTag): Promise<void> {
  const res = await authedFetch(`${BASE}/api/guests/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tag }),
  });
  if (!res.ok) throw new Error("Failed to update guest tag");
}

export async function importGuests(file: File): Promise<void> {
  const form = new FormData();
  form.append("file", file);
  const res = await authedFetch(`${BASE}/api/guests/import`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Failed to import guests");
}

function normalizeGuest(guest: GuestPayload): Guest {
  return {
    id: guest.id,
    name: guest.name,
    email: guest.email ?? "",
    phone: guest.phone,
    tag: guest.tag as GuestTag,
    rsvpStatus: ((guest.rsvp_status ?? guest.rsvpStatus ?? "pending") as RSVPStatus),
    qrToken: guest.qrToken ?? guest.qr_token ?? "",
    notes: guest.notes ?? "",
    partySize: guest.party_size ?? 1,
    method: guest.method ?? "",
    respondedAt: guest.responded_at ?? "",
  };
}
