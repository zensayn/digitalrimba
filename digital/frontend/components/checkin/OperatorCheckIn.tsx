"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Input } from "@/components/ui/input";
import { TextureButton } from "@/components/ui/texture-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQrScanner } from "@/components/checkin/hooks/useQrScanner";
import { useOfflineGuestCache } from "@/components/checkin/hooks/useOfflineGuestCache";
import { useScanQueue } from "@/components/checkin/hooks/useScanQueue";
import {
  ScanSuccessSheet,
  type CheckInOptions,
} from "@/components/checkin/ScanSuccessSheet";
import {
  KioskChrome,
  requestKioskFullscreen,
} from "@/components/checkin/KioskChrome";
import { WalkInForm } from "@/components/checkin/WalkInForm";
import type { CheckinCountsView } from "@/components/checkin/types";
import {
  authOperator,
  createWalkIn,
  lookupByQR,
  searchGuests,
  toggleSouvenir,
  type CheckInGuest,
} from "@/lib/api/checkin-operator";
import {
  readSession,
  subscribeSession,
  writeSession,
} from "@/lib/checkin/session";
import {
  countPendingScans,
  getMeta,
  setMeta,
  wipeOfflineData,
} from "@/lib/checkin/offline-db";
import { fuzzySearchGuests } from "@/lib/checkin/fuzzy-search";
import {
  primeAudio,
  successFeedback,
  warningFeedback,
} from "@/lib/checkin/haptics-audio";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
const SCANNER_ID = "operator-checkin-reader";
// Scoped per event so two events checked in from the same device never
// share an envelope-tag sequence.
const giftTagMetaKey = (eventCode: string) => `nextGiftTag:${eventCode}`;

const padTag = (n: number) => String(n).padStart(3, "0");

type OperatorCheckInProps = {
  eventCode: string;
};

function useOnline(): boolean {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener("online", cb);
      window.addEventListener("offline", cb);
      return () => {
        window.removeEventListener("online", cb);
        window.removeEventListener("offline", cb);
      };
    },
    () => navigator.onLine,
    () => true
  );
}

export function OperatorCheckIn({ eventCode }: OperatorCheckInProps) {
  const session = useSyncExternalStore(
    subscribeSession,
    () => readSession(eventCode),
    () => null
  );
  const token = session?.token ?? null;
  const operatorLabel = session?.label ?? "";
  const online = useOnline();

  const [counts, setCounts] = useState<CheckinCountsView>({
    arrived: 0,
    total: 0,
    arrivedPax: 0,
    totalPax: 0,
  });
  const [guest, setGuest] = useState<CheckInGuest | null>(null);
  const [alreadyIn, setAlreadyIn] = useState(false);
  const [justArrived, setJustArrived] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [serverResults, setServerResults] = useState<{
    for: string;
    results: CheckInGuest[];
  }>({ for: "", results: [] });
  const [busy, setBusy] = useState(false);
  const [scanNotice, setScanNotice] = useState("");
  const [nextGiftTag, setNextGiftTag] = useState(1);

  const sheetOpenRef = useRef(false);
  const scanCooldownRef = useRef(false);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const { roster, upsertGuest, refresh: refreshRoster } =
    useOfflineGuestCache(token);
  const { submitScan, pendingCount, flush } = useScanQueue(token);

  // ── Gift tag counter: survive refresh via IndexedDB meta ────────────────────
  useEffect(() => {
    if (!token) return;
    void getMeta(giftTagMetaKey(eventCode)).then((v) => {
      const stored = typeof v === "number" ? v : 0;
      setNextGiftTag((current) => Math.max(current, stored, 1));
    });
  }, [token, eventCode]);

  const consumeGiftTag = useCallback(() => {
    const tag = padTag(nextGiftTag);
    const next = nextGiftTag + 1;
    setNextGiftTag(next);
    void setMeta(giftTagMetaKey(eventCode), next);
    return tag;
  }, [nextGiftTag, eventCode]);

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
                total?: number;
                arrived_pax?: number;
                total_pax?: number;
              };
              setCounts({
                arrived: d.arrived ?? 0,
                total: d.total ?? 0,
                arrivedPax: d.arrived_pax ?? d.arrived ?? 0,
                totalPax: d.total_pax ?? d.total ?? 0,
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

  // ── Navigation speed bump while a session is active ─────────────────────────
  useEffect(() => {
    if (!token) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [token]);

  // ── Notices ──────────────────────────────────────────────────────────────────
  const showNotice = useCallback((message: string) => {
    clearTimeout(noticeTimer.current);
    setScanNotice(message);
    noticeTimer.current = setTimeout(() => setScanNotice(""), 2500);
  }, []);

  // ── Sheet open/close ─────────────────────────────────────────────────────────
  const openGuestSheet = useCallback(
    (g: CheckInGuest, opts?: { justArrived?: boolean }) => {
      sheetOpenRef.current = true;
      setGuest(g);
      setAlreadyIn(!!g.arrivedAt);
      setJustArrived(opts?.justArrived ?? false);
      setSheetOpen(true);
    },
    []
  );

  const closeGuestSheet = useCallback(() => {
    sheetOpenRef.current = false;
    setSheetOpen(false);
    setGuest(null);
    setJustArrived(false);
  }, []);

  function handleSheetOpenChange(open: boolean) {
    sheetOpenRef.current = open;
    setSheetOpen(open);
    if (!open) {
      setGuest(null);
      setJustArrived(false);
    }
  }

  // ── QR scanner ───────────────────────────────────────────────────────────────
  async function handleScannedText(text: string) {
    if (!token || busy || sheetOpenRef.current || scanCooldownRef.current)
      return;
    scanCooldownRef.current = true;
    setBusy(true);
    try {
      // Read-only lookup — does NOT mark arrival yet. Falls back to the
      // offline roster cache when the network is down.
      let found: CheckInGuest | null = null;
      if (online) found = await lookupByQR(token, text).catch(() => null);
      found ??= roster.find((g) => g.qrToken === text) ?? null;

      if (found) {
        if (found.arrivedAt) warningFeedback();
        else successFeedback();
        openGuestSheet(found);
      } else {
        warningFeedback();
        showNotice("QR tidak dikenal");
      }
    } finally {
      setBusy(false);
      setTimeout(() => {
        scanCooldownRef.current = false;
      }, 2000);
    }
  }

  const { torchAvailable, torchOn, toggleTorch, cameraError } = useQrScanner({
    elementId: SCANNER_ID,
    enabled: Boolean(token),
    onScan: handleScannedText,
  });

  // ── Check-in write (live or queued) ─────────────────────────────────────────
  async function handleCheckIn(options: CheckInOptions) {
    if (!guest || !token) return;
    setBusy(true);
    try {
      const giftTagCode = guest.giftTagCode || consumeGiftTag();
      const result = await submitScan({
        qrToken: guest.qrToken,
        souvenirGiven: options.souvenirGiven,
        actualPax: options.actualPax,
        proxyName: options.proxyName || undefined,
        giftTagCode,
        checkedInByLabel: operatorLabel || undefined,
      });

      if (result.queued) {
        const optimistic: CheckInGuest = {
          ...guest,
          arrivedAt: new Date().toISOString(),
          souvenirCollected: options.souvenirGiven,
          actualPax: options.actualPax,
          proxyName: options.proxyName || undefined,
          giftTagCode,
          checkedInByLabel: operatorLabel || undefined,
        };
        upsertGuest(optimistic);
        successFeedback();
        showNotice("Tersimpan offline — akan disinkronkan");
        closeGuestSheet();
      } else if (result.alreadyArrived) {
        warningFeedback();
        upsertGuest(result.guest);
        setGuest(result.guest);
        setAlreadyIn(true);
        setJustArrived(false);
      } else {
        upsertGuest(result.guest);
        successFeedback();
        closeGuestSheet();
      }
    } catch (err) {
      warningFeedback();
      showNotice(err instanceof Error ? err.message : "Scan gagal");
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleSouvenir() {
    // Only reachable for already-arrived guests; pre-check-in souvenir state
    // lives inside the sheet and rides along with the scan payload.
    if (!guest || !token) return;
    const next = !guest.souvenirCollected;
    try {
      const actual = await toggleSouvenir(token, guest.id, next);
      const updated = { ...guest, souvenirCollected: actual };
      setGuest(updated);
      upsertGuest(updated);
    } catch {
      warningFeedback();
    }
  }

  // ── Search: instant local fuzzy + debounced server merge ────────────────────
  const trimmedQuery = searchQuery.trim();
  const localResults = useMemo(
    () => (trimmedQuery ? fuzzySearchGuests(roster, trimmedQuery) : []),
    [roster, trimmedQuery]
  );

  useEffect(() => {
    if (!trimmedQuery || !token || !online) return;
    const query = trimmedQuery;
    const timer = setTimeout(() => {
      searchGuests(token, query)
        .then((results) => setServerResults({ for: query, results }))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [trimmedQuery, token, online]);

  const searchResults = useMemo(() => {
    if (!trimmedQuery) return [];
    // Server results are keyed by the query they answered — anything else is
    // a stale response and simply doesn't render.
    const remote = serverResults.for === trimmedQuery ? serverResults.results : [];
    const seen = new Set(localResults.map((g) => g.id));
    return [...localResults, ...remote.filter((g) => !seen.has(g.id))].slice(0, 8);
  }, [trimmedQuery, localResults, serverResults]);

  function handleSearchSelect(g: CheckInGuest) {
    openGuestSheet(g);
    setSearchQuery("");
  }

  // ── Walk-in ──────────────────────────────────────────────────────────────────
  async function handleWalkIn(name: string, partySize: number) {
    if (!token) return;
    const created = await createWalkIn(token, {
      name,
      partySize,
      giftTagCode: consumeGiftTag(),
      checkedInByLabel: operatorLabel || undefined,
    });
    upsertGuest(created);
    successFeedback();
    setWalkInOpen(false);
    openGuestSheet(created, { justArrived: true });
    void refreshRoster();
  }

  // ── Kiosk menu actions ───────────────────────────────────────────────────────
  const verifyPin = useCallback(
    async (pin: string) => {
      try {
        await authOperator(eventCode, pin);
        return true;
      } catch {
        return false;
      }
    },
    [eventCode]
  );

  const endEvent = useCallback(async () => {
    // Only wipe local data once every queued scan is safely on the server.
    // flush() never throws — it leaves scans pending when offline — so the
    // pending count after flushing is the source of truth. Throwing lets the
    // kiosk menu surface the message and re-enable its buttons.
    await flush().catch(() => {});
    const remaining = await countPendingScans().catch(() => 1);
    if (remaining > 0) {
      warningFeedback();
      throw new Error(
        "Masih ada scan offline yang belum tersinkron — sambungkan internet lalu coba lagi"
      );
    }
    await wipeOfflineData().catch(() => {});
    writeSession(eventCode, null);
    window.location.reload();
  }, [eventCode, flush]);

  // ── PIN auth screen ────────────────────────────────────────────────────────
  if (!token) {
    return <PinScreen eventCode={eventCode} />;
  }

  // ── Main operator UI ───────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col overflow-hidden" data-testid="checkin-shell">
      <KioskChrome
        eventCode={eventCode}
        operatorLabel={operatorLabel}
        counts={counts}
        pendingCount={pendingCount}
        online={online}
        onVerifyPin={verifyPin}
        onEndEvent={endEvent}
      />

      {/* Camera */}
      <div className="flex-1 relative bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
        <div
          id={SCANNER_ID}
          data-testid="camera-viewfinder"
          className="absolute inset-0"
        />

        {/* Decorative aiming guide — the whole camera frame is scanned */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 pointer-events-none z-10">
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

        {/* Transient notice (unknown QR, queued offline, errors) */}
        {scanNotice && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-[#212121] text-white text-xs font-semibold px-4 py-2 rounded-full">
            {scanNotice}
          </div>
        )}

        <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-white/50 z-10 pointer-events-none">
          {cameraError
            ? "Kamera tidak tersedia — gunakan pencarian di bawah"
            : "Arahkan QR tamu ke kamera"}
        </p>

        {torchAvailable && (
          <button
            type="button"
            aria-label={torchOn ? "Matikan senter" : "Nyalakan senter"}
            aria-pressed={torchOn}
            onClick={toggleTorch}
            className={`absolute top-3 right-3 z-10 h-10 w-10 rounded-full flex items-center justify-center transition-transform duration-150 ease-out active:scale-[0.97] ${
              torchOn ? "bg-white text-[#212121]" : "bg-white/15 text-white"
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 3h12v3l-3 4v11a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V10L6 6V3Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Search bar + walk-in */}
      <div className="bg-white px-4 py-2.5 flex-shrink-0 border-t border-neutral-100">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
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
              data-testid="guest-search"
              autoFocus
              className="pl-9 h-10 rounded-full bg-[#f5f3f0] border-0 text-sm"
              placeholder="Cari nama tamu…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="button"
            disabled={!online}
            onClick={() => setWalkInOpen(true)}
            className="h-10 flex-shrink-0 rounded-full bg-[#212121] text-white text-xs font-semibold px-4 transition-transform duration-150 ease-out active:scale-[0.97] disabled:opacity-30 disabled:active:scale-100"
          >
            + Walk-in
          </button>
        </div>

        {searchResults.length > 0 && (
          <div
            data-testid="search-results"
            className="mt-2 bg-white rounded-xl ring-1 ring-foreground/10 overflow-hidden"
          >
            {searchResults.map((g) => (
              <button
                key={g.id}
                className="w-full flex items-center gap-3 px-4 py-3 text-left border-b border-neutral-50 last:border-0 transition-colors"
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
                  <p className="text-xs text-[#93939f]">
                    {g.tag}
                    {g.partySize > 1 ? ` · ${g.partySize} pax` : ""}
                  </p>
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

      <ScanSuccessSheet
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        guest={guest}
        alreadyIn={alreadyIn}
        justArrived={justArrived}
        busy={busy}
        giftTagPreview={padTag(nextGiftTag)}
        onCheckIn={handleCheckIn}
        onToggleSouvenir={handleToggleSouvenir}
        onDismiss={closeGuestSheet}
      />

      <WalkInForm
        open={walkInOpen}
        onOpenChange={setWalkInOpen}
        onSubmit={handleWalkIn}
      />
    </div>
  );
}

// ── PIN auth screen ────────────────────────────────────────────────────────────

function PinScreen({ eventCode }: { eventCode: string }) {
  const [pin, setPin] = useState("");
  const [label, setLabel] = useState("");
  const [authError, setAuthError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setBusy(true);
    try {
      const res = await authOperator(eventCode, pin);
      // User gesture: unlock audio + enter kiosk fullscreen while we can.
      primeAudio();
      requestKioskFullscreen();
      // Seed the sequential envelope-tag counter from the server max.
      const stored = await getMeta(giftTagMetaKey(eventCode)).catch(() => 0);
      const storedNum = typeof stored === "number" ? stored : 0;
      await setMeta(
        giftTagMetaKey(eventCode),
        Math.max(res.nextGiftTag, storedNum, 1)
      ).catch(() => {});
      writeSession(eventCode, { token: res.token, label: label.trim() });
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Wrong PIN");
    } finally {
      setBusy(false);
    }
  }

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
            data-testid="pin-input"
            type="password"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="6-digit PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            className="h-12 text-center text-xl tracking-widest font-mono rounded-xl"
            autoComplete="off"
          />
          <Input
            placeholder="Nama operator (opsional)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={40}
            className="h-12 rounded-xl"
            autoComplete="off"
          />
          {authError && (
            <p className="text-xs text-[#b30000] text-center">{authError}</p>
          )}
          <TextureButton
            data-testid="pin-submit"
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
