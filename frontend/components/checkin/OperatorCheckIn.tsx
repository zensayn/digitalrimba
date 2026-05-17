"use client";

import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { TextureButton } from "@/components/ui/texture-button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// ── Types ─────────────────────────────────────────────────────────────────────

type GuestTag = "VIP" | "Family" | "Friend" | "Vendor";

export type CheckInGuest = {
  id: string;
  name: string;
  tag: GuestTag | string;
  tableNumber?: string;
  arrivedAt: string | null;
  souvenirCollected: boolean;
  qrToken: string;
  partySize?: number;
  rsvpStatus?: string;
};

type OperatorCheckInProps = {
  eventCode: string;
};

type Html5QrcodeInstance = {
  start: (
    cameraConfig: { facingMode: string },
    config: { fps: number; qrbox: { width: number; height: number } },
    onScanSuccess: (decodedText: string) => void,
    onScanError?: () => void
  ) => Promise<void>;
  stop: () => Promise<void>;
};

declare global {
  interface Window {
    Html5Qrcode?: new (elementId: string) => Html5QrcodeInstance;
  }
}

// ── API helpers ────────────────────────────────────────────────────────────────

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
const SCANNER_ID = "operator-checkin-reader";

async function apiAuthOperator(eventCode: string, pin: string) {
  const res = await fetch(`${BASE}/api/checkin/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventCode, pin }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Wrong PIN" }));
    throw new Error((body as { error?: string }).error ?? "Wrong PIN");
  }
  const data = (await res.json()) as {
    token: string;
    arrived_count?: number;
    total_count?: number;
  };
  return {
    token: data.token,
    arrivedCount: data.arrived_count ?? 0,
    totalCount: data.total_count ?? 0,
  };
}

/** Read-only QR lookup — does NOT mark the guest as arrived. */
async function apiLookupByQR(
  token: string,
  qrToken: string
): Promise<CheckInGuest | null> {
  const res = await fetch(
    `${BASE}/api/checkin/guests?qr=${encodeURIComponent(qrToken)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) return null;
  const data = (await res.json()) as unknown[];
  if (!Array.isArray(data) || data.length === 0) return null;
  return normalizeGuest(data[0] as Record<string, unknown>);
}

/** Write — marks the guest as arrived. Call only on explicit Check In tap. */
async function apiScanGuest(token: string, qrToken: string) {
  const res = await fetch(`${BASE}/api/checkin/scan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ qr_token: qrToken }),
  });
  if (!res.ok) throw new Error("Scan failed");
  const data = (await res.json()) as {
    guest: Record<string, unknown>;
    already_arrived?: boolean;
  };
  return {
    guest: normalizeGuest(data.guest),
    alreadyArrived: Boolean(data.already_arrived),
  };
}

async function apiSearchGuests(
  token: string,
  query: string
): Promise<CheckInGuest[]> {
  const res = await fetch(
    `${BASE}/api/checkin/guests?q=${encodeURIComponent(query)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) return [];
  const data = (await res.json()) as unknown;
  const list = Array.isArray(data)
    ? data
    : ((data as { guests?: unknown[] }).guests ?? []);
  return (list as Record<string, unknown>[]).map(normalizeGuest);
}

async function apiToggleSouvenir(
  token: string,
  guestId: string,
  collected: boolean
): Promise<boolean> {
  const res = await fetch(`${BASE}/api/checkin/guests/${guestId}/souvenir`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ collected }),
  });
  if (!res.ok) throw new Error("Toggle failed");
  const data = (await res.json()) as { souvenir_claimed?: boolean };
  return data.souvenir_claimed ?? collected;
}

function normalizeGuest(raw: Record<string, unknown>): CheckInGuest {
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    tag: String(raw.tag ?? raw.guest_group ?? "") as GuestTag,
    tableNumber: raw.table_number ? String(raw.table_number) : undefined,
    arrivedAt: raw.arrived_at ? String(raw.arrived_at) : null,
    souvenirCollected: Boolean(raw.souvenir_given ?? raw.souvenir_claimed),
    qrToken: String(raw.qr_token ?? ""),
    partySize: raw.party_size ? Number(raw.party_size) : undefined,
    rsvpStatus: raw.rsvp_status ? String(raw.rsvp_status) : undefined,
  };
}

// ── Component ──────────────────────────────────────────────────────────────────

export function OperatorCheckIn({ eventCode }: OperatorCheckInProps) {
  const [token, setToken] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [authError, setAuthError] = useState("");
  const [counts, setCounts] = useState({ arrived: 0, total: 0 });
  const [guest, setGuest] = useState<CheckInGuest | null>(null);
  const [alreadyIn, setAlreadyIn] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CheckInGuest[]>([]);
  const [busy, setBusy] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Prevent scans from firing while the guest sheet is open.
  const sheetOpenRef = useRef(false);

  // ── SSE live counter (authenticated fetch — avoids token in URL) ────────────
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();

    async function streamCounts() {
      try {
        const res = await fetch(`${BASE}/api/checkin/stream`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (!res.ok || !res.body) return;
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const d = JSON.parse(line.slice(6)) as {
                arrived?: number;
                arrived_count?: number;
                total?: number;
                total_count?: number;
              };
              setCounts({
                arrived: d.arrived ?? d.arrived_count ?? 0,
                total: d.total ?? d.total_count ?? 0,
              });
            } catch {}
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        // Reconnect after a short delay on unexpected disconnect.
        setTimeout(streamCounts, 2000);
      }
    }

    void streamCounts();
    return () => controller.abort();
  }, [token]);

  // ── QR scanner ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token || !scannerRef.current) return;
    if (!window.Html5Qrcode) return;

    const scanner = new window.Html5Qrcode(SCANNER_ID);
    let active = true;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        async (text) => {
          // Guard: skip if another scan is in-flight or sheet is already open.
          if (!active || busy || sheetOpenRef.current) return;
          active = false;
          setBusy(true);
          try {
            // Read-only lookup — does NOT mark arrival yet.
            const found = await apiLookupByQR(token, text);
            if (found) {
              sheetOpenRef.current = true;
              setGuest(found);
              setAlreadyIn(!!found.arrivedAt);
              setSheetOpen(true);
            }
          } finally {
            setBusy(false);
            setTimeout(() => {
              active = true;
            }, 2000);
          }
        },
        () => {}
      )
      .catch(() => {});

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Debounced search ────────────────────────────────────────────────────────
  useEffect(() => {
    clearTimeout(searchTimer.current);
    if (!searchQuery.trim() || !token) {
      setSearchResults([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      const results = await apiSearchGuests(token, searchQuery);
      setSearchResults(results);
    }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [searchQuery, token]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setBusy(true);
    try {
      const res = await apiAuthOperator(eventCode, pin);
      setToken(res.token);
      setCounts({ arrived: res.arrivedCount, total: res.totalCount });
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Wrong PIN");
    } finally {
      setBusy(false);
    }
  }

  /** Explicit Check In — this is the only place that calls the write endpoint. */
  async function handleCheckIn() {
    if (!guest || !token) return;
    setBusy(true);
    try {
      const result = await apiScanGuest(token, guest.qrToken);
      setGuest(result.guest);
      setAlreadyIn(result.alreadyArrived);
      if (!result.alreadyArrived) {
        sheetOpenRef.current = false;
        setSheetOpen(false);
        setGuest(null);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleSouvenir() {
    if (!guest || !token) return;
    const next = !guest.souvenirCollected;
    const actual = await apiToggleSouvenir(token, guest.id, next);
    setGuest((g) => (g ? { ...g, souvenirCollected: actual } : g));
  }

  function handleSearchSelect(g: CheckInGuest) {
    sheetOpenRef.current = true;
    setGuest(g);
    setAlreadyIn(!!g.arrivedAt);
    setSheetOpen(true);
    setSearchQuery("");
    setSearchResults([]);
  }

  function handleSheetOpenChange(open: boolean) {
    sheetOpenRef.current = open;
    setSheetOpen(open);
    if (!open) setGuest(null);
  }

  // ── PIN auth screen ────────────────────────────────────────────────────────

  if (!token) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-[#212121] mb-1">
            Operator Login
          </h1>
          <p className="text-sm text-[#93939f] mb-6">
            Event:{" "}
            <span className="font-semibold text-[#212121]">{eventCode}</span>
          </p>
          <form onSubmit={handleAuth} className="space-y-3">
            <Input
              type="password"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="6-digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="h-12 text-center text-xl tracking-widest font-mono rounded-xl"
              autoComplete="off"
            />
            {authError && (
              <p className="text-xs text-[#b30000] text-center">{authError}</p>
            )}
            <TextureButton
              variant="primary"
              className="w-full"
              type="submit"
              disabled={pin.length !== 6 || busy}
            >
              {busy ? "Verifying…" : "Unlock Check-in"}
            </TextureButton>
          </form>
        </div>
      </div>
    );
  }

  // ── Main operator UI ───────────────────────────────────────────────────────

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="bg-white flex items-center justify-between px-4 py-3 flex-shrink-0 border-b border-neutral-100 z-10">
        <div>
          <p className="text-sm font-bold text-[#212121]">{eventCode}</p>
          <p className="text-xs text-[#93939f]">Check-in active</p>
        </div>
        <div className="bg-[#edfce9] rounded-full px-3 py-1">
          <span className="text-xs font-semibold text-[#346739]">
            {counts.arrived} / {counts.total}
          </span>
        </div>
      </div>

      {/* Camera */}
      <div className="flex-1 relative bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
        <div id={SCANNER_ID} ref={scannerRef} className="absolute inset-0" />

        {/* QR frame overlay */}
        <div className="relative w-52 h-52 pointer-events-none z-10">
          {(["tl", "tr", "bl", "br"] as const).map((c) => (
            <span
              key={c}
              className={`absolute w-6 h-6 border-white ${
                c === "tl"
                  ? "top-0 left-0 border-t-[2.5px] border-l-[2.5px] rounded-tl"
                  : c === "tr"
                    ? "top-0 right-0 border-t-[2.5px] border-r-[2.5px] rounded-tr"
                    : c === "bl"
                      ? "bottom-0 left-0 border-b-[2.5px] border-l-[2.5px] rounded-bl"
                      : "bottom-0 right-0 border-b-[2.5px] border-r-[2.5px] rounded-br"
              }`}
            />
          ))}
        </div>

        <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-white/50 z-10 pointer-events-none">
          Align guest QR code inside the frame
        </p>
      </div>

      {/* Search bar */}
      <div className="bg-white px-4 py-2.5 flex-shrink-0 border-t border-neutral-100">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93939f]"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path
              d="m16 16 4 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <Input
            className="pl-9 h-10 rounded-full bg-[#f5f3f0] border-0 text-sm"
            placeholder="Search guest by name…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {searchResults.length > 0 && (
          <div className="mt-2 bg-white rounded-xl ring-1 ring-foreground/10 overflow-hidden">
            {searchResults.slice(0, 5).map((g) => (
              <button
                key={g.id}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 text-left border-b border-neutral-50 last:border-0"
                onClick={() => handleSearchSelect(g)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[#edfce9] text-[#346739] text-xs font-bold">
                    {g.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#212121] truncate">
                    {g.name}
                  </p>
                  <p className="text-xs text-[#93939f]">{g.tag}</p>
                </div>
                {g.arrivedAt && (
                  <span className="text-[10px] font-bold text-[#346739] bg-[#edfce9] px-2 py-0.5 rounded-full">
                    IN
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Guest sheet */}
      <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl px-5 pb-8 pt-3 max-h-[65vh] overflow-y-auto"
        >
          <div className="w-9 h-1 bg-[#e8e4df] rounded-full mx-auto mb-5" />

          {guest && (
            <div className="space-y-4">
              {/* Guest header */}
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11">
                  <AvatarFallback
                    className={`text-sm font-bold ${
                      alreadyIn
                        ? "bg-[#fef2f2] text-[#b30000]"
                        : "bg-[#edfce9] text-[#346739]"
                    }`}
                  >
                    {guest.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-[#212121] truncate">
                    {guest.name}
                  </p>
                  <p className="text-xs text-[#93939f]">
                    {alreadyIn && guest.arrivedAt
                      ? `Arrived at ${new Date(guest.arrivedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                      : guest.tag}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide flex-shrink-0 ${
                    alreadyIn
                      ? "bg-[#fef2f2] text-[#b30000]"
                      : "bg-[#edfce9] text-[#346739]"
                  }`}
                >
                  {alreadyIn ? "Already In" : guest.tag}
                </span>
              </div>

              {/* Info chips */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Table", value: guest.tableNumber ?? "—" },
                  {
                    label: "Party",
                    value: guest.partySize ? `×${guest.partySize}` : "—",
                  },
                  {
                    label: "RSVP",
                    value: guest.rsvpStatus === "accepted" ? "✓" : "—",
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="bg-[#faf8f5] rounded-xl py-2 text-center"
                  >
                    <p className="text-[9px] font-bold uppercase tracking-wide text-[#93939f]">
                      {label}
                    </p>
                    <p
                      className={`text-sm font-bold mt-0.5 ${
                        value === "✓" ? "text-[#346739]" : "text-[#212121]"
                      }`}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Souvenir toggle */}
              <button
                className="w-full flex items-center justify-between bg-[#faf8f5] rounded-xl px-4 py-3"
                onClick={handleToggleSouvenir}
              >
                <div className="text-left">
                  <p className="text-sm font-semibold text-[#212121]">
                    Souvenir claimed
                  </p>
                  <p className="text-xs text-[#93939f]">
                    Toggle after handing out
                  </p>
                </div>
                <div
                  className={`relative w-10 h-6 rounded-full transition-colors duration-150 ${
                    guest.souvenirCollected ? "bg-[#346739]" : "bg-neutral-200"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-150 ${
                      guest.souvenirCollected
                        ? "translate-x-5"
                        : "translate-x-1"
                    }`}
                  />
                </div>
              </button>

              {/* CTA */}
              {alreadyIn ? (
                <div className="w-full flex items-center justify-center gap-2 bg-[#fef2f2] text-[#b30000] rounded-full py-3.5 text-sm font-semibold">
                  ⚠ Already checked in — scan another
                </div>
              ) : (
                <TextureButton
                  variant="primary"
                  className="w-full"
                  onClick={handleCheckIn}
                  disabled={busy}
                >
                  {busy ? "Checking in…" : "✓ Check In"}
                </TextureButton>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
