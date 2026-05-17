"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type GuestTag = "VIP" | "Family" | "Friend" | "Vendor";

export type CheckInGuest = {
  id: string;
  name: string;
  tag: GuestTag;
  tableNumber?: string;
  arrivedAt: string | null;
  souvenirCollected: boolean;
  qrToken: string;
};

type OperatorCheckInProps = {
  eventCode: string;
};

type Html5QrcodeInstance = {
  clear: () => Promise<void> | void;
  start: (
    cameraConfig: { facingMode: string },
    config: { fps: number; qrbox: { width: number; height: number } },
    onScanSuccess: (decodedText: string) => void,
    onScanError?: () => void
  ) => Promise<void>;
  stop: () => Promise<void>;
};

type Html5QrcodeConstructor = new (elementId: string) => Html5QrcodeInstance;

declare global {
  interface Window {
    Html5Qrcode?: Html5QrcodeConstructor;
  }
}

const scannerElementId = "operator-checkin-reader";
const html5QrcodeCdn =
  "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js";

const mockGuests: CheckInGuest[] = [
  {
    id: "guest-001",
    name: "Alya Mahendra",
    tag: "VIP",
    tableNumber: "A1",
    arrivedAt: "2026-05-15T10:08:00.000Z",
    souvenirCollected: false,
    qrToken: "qr-vip-alya",
  },
  {
    id: "guest-002",
    name: "Bima Santoso",
    tag: "Family",
    tableNumber: "B4",
    arrivedAt: null,
    souvenirCollected: false,
    qrToken: "qr-family-bima",
  },
  {
    id: "guest-003",
    name: "Citra Lestari",
    tag: "Friend",
    tableNumber: "C2",
    arrivedAt: "2026-05-15T10:22:00.000Z",
    souvenirCollected: true,
    qrToken: "qr-friend-citra",
  },
  {
    id: "guest-004",
    name: "Dian Prakoso",
    tag: "Vendor",
    arrivedAt: null,
    souvenirCollected: false,
    qrToken: "qr-vendor-dian",
  },
  {
    id: "guest-005",
    name: "Eka Putri",
    tag: "VIP",
    tableNumber: "A2",
    arrivedAt: null,
    souvenirCollected: false,
    qrToken: "qr-vip-eka",
  },
];

const delay = (duration = 260) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });

export async function authOperator(eventCode: string, pin: string) {
  await delay();

  if (!eventCode || pin.length !== 6) {
    throw new Error("Enter a valid 6-digit PIN.");
  }

  return {
    eventCode,
    operatorName: "Check-in operator",
  };
}

export async function scanGuest(qrToken: string): Promise<CheckInGuest> {
  await delay();

  const matchedGuest =
    mockGuests.find((guest) => guest.qrToken === qrToken) ?? mockGuests[0];

  return {
    ...matchedGuest,
    arrivedAt: new Date().toISOString(),
  };
}

export async function searchGuests(query: string): Promise<CheckInGuest[]> {
  await delay(180);

  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  return mockGuests.filter((guest) =>
    guest.name.toLowerCase().includes(normalizedQuery)
  );
}

export async function toggleSouvenir(guestId: string) {
  await delay(180);

  return { guestId };
}

function formatArrivalTime(value: string | null) {
  if (!value) {
    return "Pending arrival";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function loadHtml5Qrcode() {
  return new Promise<Html5QrcodeConstructor | null>((resolve) => {
    if (window.Html5Qrcode) {
      resolve(window.Html5Qrcode);
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${html5QrcodeCdn}"]`
    );

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        () => resolve(window.Html5Qrcode ?? null),
        { once: true }
      );
      existingScript.addEventListener("error", () => resolve(null), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = html5QrcodeCdn;
    script.async = true;
    script.onload = () => resolve(window.Html5Qrcode ?? null);
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
}

function mergeGuest(guests: CheckInGuest[], checkedInGuest: CheckInGuest) {
  const exists = guests.some((guest) => guest.id === checkedInGuest.id);

  if (!exists) {
    return [checkedInGuest, ...guests];
  }

  return guests.map((guest) =>
    guest.id === checkedInGuest.id ? { ...guest, ...checkedInGuest } : guest
  );
}

export function OperatorCheckIn({ eventCode }: OperatorCheckInProps) {
  const [pin, setPin] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guests, setGuests] = useState(mockGuests);
  const [activeGuest, setActiveGuest] = useState<CheckInGuest | null>(null);
  const [scanStatus, setScanStatus] = useState("Camera readying");
  const [scanError, setScanError] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CheckInGuest[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const lastScanTokenRef = useRef("");

  const arrivedCount = useMemo(
    () => guests.filter((guest) => Boolean(guest.arrivedAt)).length,
    [guests]
  );

  const upsertArrivedGuest = useCallback((guest: CheckInGuest) => {
    setGuests((currentGuests) => mergeGuest(currentGuests, guest));
    setActiveGuest(guest);
  }, []);

  const handleScanToken = useCallback(
    async (qrToken: string) => {
      if (!qrToken || lastScanTokenRef.current === qrToken) {
        return;
      }

      lastScanTokenRef.current = qrToken;
      setScanStatus("Validating guest");
      setScanError("");

      try {
        const guest = await scanGuest(qrToken);
        upsertArrivedGuest(guest);
        setScanStatus("Scanner ready");
      } catch (error) {
        setScanError(error instanceof Error ? error.message : "Scan failed.");
        setScanStatus("Scanner ready");
      }
    },
    [upsertArrivedGuest]
  );

  useEffect(() => {
    if (!isAuthed) {
      return;
    }

    let isMounted = true;
    let scanner: Html5QrcodeInstance | null = null;

    async function startScanner() {
      const Html5Qrcode = await loadHtml5Qrcode();

      if (!isMounted) {
        return;
      }

      if (!Html5Qrcode) {
        setScanStatus("Scanner preview ready");
        setScanError("Camera library unavailable. Use sample scan or manual search.");
        return;
      }

      try {
        scanner = new Html5Qrcode(scannerElementId);
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          handleScanToken,
          () => undefined
        );

        if (isMounted) {
          setScanStatus("Scanner ready");
          setScanError("");
        }
      } catch {
        if (isMounted) {
          setScanStatus("Scanner preview ready");
          setScanError("Camera unavailable. Use sample scan or manual search.");
        }
      }
    }

    startScanner();

    return () => {
      isMounted = false;

      if (scanner) {
        scanner
          .stop()
          .then(() => scanner?.clear())
          .catch(() => undefined);
      }
    };
  }, [handleScanToken, isAuthed]);

  useEffect(() => {
    if (!isAuthed) {
      return;
    }

    let isCurrent = true;

    async function runSearch() {
      setIsSearching(true);

      try {
        const guestResults = await searchGuests(query);

        if (isCurrent) {
          setResults(guestResults);
        }
      } finally {
        if (isCurrent) {
          setIsSearching(false);
        }
      }
    }

    runSearch();

    return () => {
      isCurrent = false;
    };
  }, [isAuthed, query]);

  async function handlePinSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setAuthError("");

    try {
      await authOperator(eventCode, pin);
      setIsAuthed(true);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "PIN check failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleManualGuest(guest: CheckInGuest) {
    await handleScanToken(guest.qrToken);
  }

  async function handleSouvenirToggle() {
    if (!activeGuest) {
      return;
    }

    await toggleSouvenir(activeGuest.id);

    const updatedGuest = {
      ...activeGuest,
      souvenirCollected: !activeGuest.souvenirCollected,
    };

    setActiveGuest(updatedGuest);
    setGuests((currentGuests) => mergeGuest(currentGuests, updatedGuest));
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f3ea] text-[#1b1b17]">
      <div
        className="fixed left-1/2 top-0 z-30 flex h-14 w-full max-w-[375px] -translate-x-1/2 items-center justify-between border-b border-black/10 bg-[#f7f3ea]/95 px-4 backdrop-blur"
        data-testid="arrival-counter"
        style={{ maxWidth: 375 }}
      >
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#70695d]">
          Arrived
        </span>
        <span className="font-mono text-sm font-bold tabular-nums text-[#1b1b17]">
          {arrivedCount} / {guests.length}
        </span>
      </div>

      <section
        className="mx-auto flex min-h-screen w-full max-w-[375px] flex-col gap-4 overflow-x-hidden px-4 pb-6 pt-20"
        data-testid="checkin-shell"
        style={{ maxWidth: 375 }}
      >
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#887c69]">
            Operator check-in
          </p>
          <h1 className="text-2xl font-semibold leading-tight text-[#171713]">
            Event {eventCode}
          </h1>
        </div>

        {!isAuthed ? (
          <PinPanel
            authError={authError}
            isSubmitting={isSubmitting}
            onSubmit={handlePinSubmit}
            pin={pin}
            setPin={setPin}
          />
        ) : (
          <>
            <ScannerPanel
              onSampleScan={() => handleScanToken("qr-vip-eka")}
              scanError={scanError}
              scanStatus={scanStatus}
            />
            {activeGuest ? (
              <GuestCard guest={activeGuest} onSouvenirToggle={handleSouvenirToggle} />
            ) : null}
            <ManualSearch
              isSearching={isSearching}
              onGuestSelect={handleManualGuest}
              query={query}
              results={results}
              setQuery={setQuery}
            />
          </>
        )}
      </section>
    </main>
  );
}

function PinPanel({
  authError,
  isSubmitting,
  onSubmit,
  pin,
  setPin,
}: {
  authError: string;
  isSubmitting: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  pin: string;
  setPin: (value: string) => void;
}) {
  return (
    <form
      className="rounded-[8px] border border-black/10 bg-white p-4 shadow-[0_12px_32px_rgba(27,27,23,0.08)]"
      onSubmit={onSubmit}
    >
      <label
        className="block text-sm font-semibold text-[#2b2924]"
        htmlFor="operator-pin"
      >
        Operator PIN
      </label>
      <input
        autoComplete="one-time-code"
        className="mt-3 h-14 w-full rounded-[8px] border border-black/15 bg-[#fbfaf7] px-3 text-center font-mono text-2xl font-semibold tracking-[0.32em] text-[#1b1b17] outline-none transition focus:border-[#1a7f64] focus:ring-4 focus:ring-[#1a7f64]/15"
        data-testid="pin-input"
        id="operator-pin"
        inputMode="numeric"
        maxLength={6}
        onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
        placeholder="000000"
        type="text"
        value={pin}
      />
      {authError ? (
        <p className="mt-2 text-sm font-medium text-[#a13a2d]">{authError}</p>
      ) : null}
      <button
        className="mt-4 h-12 w-full rounded-[8px] bg-[#1b1b17] text-sm font-semibold text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        data-testid="pin-submit"
        disabled={pin.length !== 6 || isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Checking PIN" : "Submit"}
      </button>
    </form>
  );
}

function ScannerPanel({
  onSampleScan,
  scanError,
  scanStatus,
}: {
  onSampleScan: () => void;
  scanError: string;
  scanStatus: string;
}) {
  return (
    <section className="rounded-[8px] border border-black/10 bg-[#171713] p-3 text-white">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">QR scanner</h2>
          <p className="truncate text-xs text-white/60" data-testid="scanner-status">
            {scanStatus}
          </p>
        </div>
        <button
          className="h-9 shrink-0 rounded-[8px] border border-white/15 px-3 text-xs font-semibold text-white transition active:scale-[0.98]"
          onClick={onSampleScan}
          type="button"
        >
          Sample scan
        </button>
      </div>

      <div
        className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[8px] border border-white/12 bg-[#23231e]"
        data-testid="camera-viewfinder"
      >
        <div className="absolute inset-0" id={scannerElementId} />
        <div className="pointer-events-none absolute inset-7 rounded-[8px] border-2 border-[#f4d06f] shadow-[0_0_0_999px_rgba(0,0,0,0.28)]" />
        <div className="pointer-events-none absolute left-10 right-10 top-1/2 h-px bg-[#f4d06f]/90 shadow-[0_0_18px_rgba(244,208,111,0.85)]" />
        <span className="pointer-events-none absolute bottom-4 rounded-full bg-black/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
          Align QR code
        </span>
      </div>

      {scanError ? (
        <p className="mt-3 text-sm leading-snug text-[#f6c6bd]" data-testid="scan-error">
          {scanError}
        </p>
      ) : null}
    </section>
  );
}

function GuestCard({
  guest,
  onSouvenirToggle,
}: {
  guest: CheckInGuest;
  onSouvenirToggle: () => void;
}) {
  const isVip = guest.tag === "VIP";

  return (
    <article
      className="rounded-[8px] border border-black/10 bg-white p-4 shadow-[0_12px_32px_rgba(27,27,23,0.08)]"
      data-testid="guest-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="break-words text-xl font-semibold leading-tight text-[#171713]">
            {guest.name}
          </h2>
          <p className="mt-1 text-sm text-[#70695d]">
            Arrived {formatArrivalTime(guest.arrivedAt)}
          </p>
        </div>
        <span
          className={
            isVip
              ? "shrink-0 rounded-full bg-[#f3c14f] px-3 py-1 text-xs font-bold text-[#3c2a00]"
              : "shrink-0 rounded-full bg-[#e7e3dc] px-3 py-1 text-xs font-bold text-[#5f5a51]"
          }
          data-testid="guest-tag"
        >
          {guest.tag}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-[8px] bg-[#f7f3ea] p-3">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#887c69]">
            Table
          </dt>
          <dd className="mt-1 text-base font-semibold text-[#1b1b17]">
            {guest.tableNumber ?? "None"}
          </dd>
        </div>
        <div className="rounded-[8px] bg-[#f7f3ea] p-3">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#887c69]">
            Souvenir
          </dt>
          <dd className="mt-1 text-base font-semibold text-[#1b1b17]">
            {guest.souvenirCollected ? "Collected" : "Pending"}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-[8px] border border-black/10 p-3">
        <span className="min-w-0 text-sm font-semibold text-[#2b2924]">
          Souvenir collected
        </span>
        <button
          aria-checked={guest.souvenirCollected}
          aria-label="Toggle souvenir collected"
          className={
            guest.souvenirCollected
              ? "relative h-7 w-12 shrink-0 rounded-full bg-[#1a7f64] transition"
              : "relative h-7 w-12 shrink-0 rounded-full bg-[#d4cec2] transition"
          }
          data-testid="souvenir-toggle"
          onClick={onSouvenirToggle}
          role="switch"
          type="button"
        >
          <span
            className={
              guest.souvenirCollected
                ? "absolute right-1 top-1 size-5 rounded-full bg-white transition"
                : "absolute left-1 top-1 size-5 rounded-full bg-white transition"
            }
          />
        </button>
      </div>
    </article>
  );
}

function ManualSearch({
  isSearching,
  onGuestSelect,
  query,
  results,
  setQuery,
}: {
  isSearching: boolean;
  onGuestSelect: (guest: CheckInGuest) => void;
  query: string;
  results: CheckInGuest[];
  setQuery: (value: string) => void;
}) {
  return (
    <section className="rounded-[8px] border border-black/10 bg-white p-4 shadow-[0_12px_32px_rgba(27,27,23,0.08)]">
      <label className="text-sm font-semibold text-[#2b2924]" htmlFor="guest-search">
        Manual search
      </label>
      <input
        className="mt-3 h-11 w-full rounded-[8px] border border-black/15 bg-[#fbfaf7] px-3 text-base text-[#1b1b17] outline-none transition placeholder:text-[#9b9387] focus:border-[#1a7f64] focus:ring-4 focus:ring-[#1a7f64]/15"
        data-testid="guest-search"
        id="guest-search"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search guest name"
        type="search"
        value={query}
      />

      <div className="mt-3 space-y-2" data-testid="search-results">
        {isSearching ? (
          <p className="text-sm text-[#70695d]">Searching</p>
        ) : query && results.length === 0 ? (
          <p className="text-sm text-[#70695d]">No guest found</p>
        ) : (
          results.map((guest) => (
            <button
              className="flex w-full items-center justify-between gap-3 rounded-[8px] border border-black/10 bg-[#f7f3ea] p-3 text-left transition active:scale-[0.99]"
              key={guest.id}
              onClick={() => onGuestSelect(guest)}
              type="button"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-[#1b1b17]">
                  {guest.name}
                </span>
                <span className="block truncate text-xs text-[#70695d]">
                  {guest.tableNumber ? `Table ${guest.tableNumber}` : "No table"}
                </span>
              </span>
              <span
                className={
                  guest.tag === "VIP"
                    ? "shrink-0 rounded-full bg-[#f3c14f] px-2.5 py-1 text-[11px] font-bold text-[#3c2a00]"
                    : "shrink-0 rounded-full bg-[#e7e3dc] px-2.5 py-1 text-[11px] font-bold text-[#5f5a51]"
                }
              >
                {guest.tag}
              </span>
            </button>
          ))
        )}
      </div>
    </section>
  );
}
