"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { TextureButton } from "@/components/ui/texture-button";
import type { CheckinCountsView } from "@/components/checkin/types";

type KioskChromeProps = {
  eventCode: string;
  operatorLabel: string;
  counts: CheckinCountsView;
  pendingCount: number;
  online: boolean;
  /** Server-side PIN re-check guarding the hidden kiosk menu. */
  onVerifyPin: (pin: string) => Promise<boolean>;
  onEndEvent: () => Promise<void>;
};

/**
 * Persistent kiosk top chrome: pax-aware capacity bar, offline/pending badge,
 * battery level, fullscreen resume nudge, and a long-press hidden menu
 * (PIN-gated) for refresh + End Event wipe.
 */
export function KioskChrome({
  eventCode,
  operatorLabel,
  counts,
  pendingCount,
  online,
  onVerifyPin,
  onEndEvent,
}: KioskChromeProps) {
  const battery = useBatteryLevel();
  const fullscreen = useIsFullscreen();
  const [menuOpen, setMenuOpen] = useState(false);

  // Long-press (700ms) on the event-code block opens the hidden menu.
  const pressTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const startPress = () => {
    pressTimer.current = setTimeout(() => setMenuOpen(true), 700);
  };
  const cancelPress = () => clearTimeout(pressTimer.current);

  const pct =
    counts.totalPax > 0
      ? Math.min(100, Math.round((counts.arrivedPax / counts.totalPax) * 100))
      : 0;
  const nearCapacity = pct >= 90;

  return (
    <>
      <div className="bg-white flex-shrink-0 border-b border-neutral-100 z-10">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div
            className="select-none touch-none"
            onPointerDown={startPress}
            onPointerUp={cancelPress}
            onPointerLeave={cancelPress}
            onContextMenu={(e) => e.preventDefault()}
          >
            <p className="text-sm font-bold text-[#212121]">{eventCode}</p>
            <p className="text-xs text-[#93939f]">
              {operatorLabel || "Check-in active"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!online && (
              <span className="text-[10px] font-bold uppercase bg-[#fff3ec] text-[#c2410c] px-2 py-1 rounded-full">
                Offline
              </span>
            )}
            {pendingCount > 0 && (
              <span className="text-[10px] font-bold bg-[#fff3ec] text-[#c2410c] px-2 py-1 rounded-full tabular-nums">
                {pendingCount} antre
              </span>
            )}
            {battery !== null && (
              <span
                className={`text-[10px] font-semibold px-2 py-1 rounded-full tabular-nums ${
                  battery <= 20
                    ? "bg-[#fef2f2] text-[#b30000]"
                    : "bg-[#faf8f5] text-[#616161]"
                }`}
              >
                {battery}%
              </span>
            )}
            <div
              data-testid="arrival-counter"
              className={`rounded-full px-3 py-1 ${
                nearCapacity ? "bg-[#fff3ec]" : "bg-[#edfce9]"
              }`}
            >
              <span
                className={`text-xs font-semibold tabular-nums ${
                  nearCapacity ? "text-[#c2410c]" : "text-[#346739]"
                }`}
              >
                {counts.arrivedPax} / {counts.totalPax} pax
              </span>
            </div>
          </div>
        </div>

        {/* Capacity bar — transform-only animation */}
        <div className="h-1 bg-[#f5f3f0] overflow-hidden">
          <div
            className={`h-full origin-left transition-transform duration-300 ease-out motion-reduce:transition-none ${
              nearCapacity ? "bg-[#ff7759]" : "bg-[#346739]"
            }`}
            style={{ transform: `scaleX(${pct / 100})` }}
          />
        </div>
      </div>

      {/* Fullscreen resume nudge — browsers require a user gesture to re-enter */}
      {fullscreen.supported && !fullscreen.active && fullscreen.wasActive && (
        <button
          type="button"
          onClick={fullscreen.request}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-[#212121] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg transition-transform duration-150 ease-out active:scale-[0.97]"
        >
          Ketuk untuk kembali fullscreen
        </button>
      )}

      {menuOpen && (
        <HiddenKioskMenu
          pendingCount={pendingCount}
          onClose={() => setMenuOpen(false)}
          onVerifyPin={onVerifyPin}
          onEndEvent={onEndEvent}
        />
      )}
    </>
  );
}

/** Requests fullscreen from a user gesture. Exposed for the PIN submit. */
export function requestKioskFullscreen() {
  const el = document.documentElement;
  if (document.fullscreenElement || !el.requestFullscreen) return;
  el.requestFullscreen().catch(() => {});
}

function useIsFullscreen() {
  const [active, setActive] = useState(false);
  const [wasActive, setWasActive] = useState(false);

  useEffect(() => {
    const update = () => {
      const on = Boolean(document.fullscreenElement);
      setActive(on);
      if (on) setWasActive(true);
    };
    update();
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);

  return {
    active,
    wasActive,
    supported:
      typeof document !== "undefined" && Boolean(document.fullscreenEnabled),
    request: requestKioskFullscreen,
  };
}

type BatteryManagerLike = {
  level: number;
  addEventListener: (type: string, cb: () => void) => void;
  removeEventListener: (type: string, cb: () => void) => void;
};

function useBatteryLevel(): number | null {
  const [level, setLevel] = useState<number | null>(null);

  useEffect(() => {
    const nav = navigator as Navigator & {
      getBattery?: () => Promise<BatteryManagerLike>;
    };
    if (!nav.getBattery) return; // Safari/Firefox — chip stays hidden
    let alive = true;
    let manager: BatteryManagerLike | null = null;
    const update = () => {
      if (alive && manager) setLevel(Math.round(manager.level * 100));
    };
    nav.getBattery().then((b) => {
      if (!alive) return;
      manager = b;
      update();
      b.addEventListener("levelchange", update);
    });
    return () => {
      alive = false;
      manager?.removeEventListener("levelchange", update);
    };
  }, []);

  return level;
}

function HiddenKioskMenu({
  pendingCount,
  onClose,
  onVerifyPin,
  onEndEvent,
}: {
  pendingCount: number;
  onClose: () => void;
  onVerifyPin: (pin: string) => Promise<boolean>;
  onEndEvent: () => Promise<void>;
}) {
  const [pin, setPin] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);

  const verify = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      if (await onVerifyPin(pin)) {
        setVerified(true);
      } else {
        setError("PIN salah");
      }
    } finally {
      setBusy(false);
    }
  }, [pin, onVerifyPin]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center">
      <div className="w-full max-w-[375px] bg-white rounded-t-[22px] px-5 pt-4 pb-8 space-y-4">
        <div className="w-9 h-1 bg-[#e8e4df] rounded-full mx-auto" />
        <h2 className="text-lg font-bold text-[#212121]">Menu Kiosk</h2>

        {!verified ? (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              void verify();
            }}
          >
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="PIN operator"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="h-12 text-center text-xl font-mono rounded-xl"
              autoFocus
              autoComplete="off"
            />
            {error && (
              <p className="text-xs text-[#b30000] text-center">{error}</p>
            )}
            <div className="flex gap-2">
              <TextureButton
                variant="secondary"
                className="flex-1"
                type="button"
                onClick={onClose}
              >
                Batal
              </TextureButton>
              <TextureButton
                variant="primary"
                className="flex-1"
                type="submit"
                disabled={pin.length !== 6 || busy}
              >
                {busy ? "Memeriksa…" : "Buka"}
              </TextureButton>
            </div>
          </form>
        ) : confirmEnd ? (
          <div className="space-y-3">
            <p className="text-sm text-[#616161]">
              Hapus semua data lokal (cache tamu & antrean) dan keluar?
            </p>
            {pendingCount > 0 && (
              <p className="text-sm font-semibold text-[#b30000]">
                ⚠ {pendingCount} scan belum tersinkron akan hilang. Sambungkan
                internet dulu jika memungkinkan.
              </p>
            )}
            {error && (
              <p className="text-xs text-[#b30000] text-center">{error}</p>
            )}
            <div className="flex gap-2">
              <TextureButton
                variant="secondary"
                className="flex-1"
                onClick={() => setConfirmEnd(false)}
              >
                Batal
              </TextureButton>
              <TextureButton
                variant="destructive"
                className="flex-1"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  setError("");
                  try {
                    await onEndEvent();
                  } catch (err) {
                    setBusy(false);
                    setError(
                      err instanceof Error ? err.message : "Gagal menghapus data"
                    );
                  }
                }}
              >
                {busy ? "Menghapus…" : "Hapus & Akhiri"}
              </TextureButton>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <TextureButton
              variant="secondary"
              className="w-full"
              onClick={() => window.location.reload()}
            >
              Muat ulang halaman
            </TextureButton>
            <TextureButton
              variant="destructive"
              className="w-full"
              onClick={() => setConfirmEnd(true)}
            >
              Akhiri acara (hapus data lokal)
            </TextureButton>
            <TextureButton variant="minimal" className="w-full" onClick={onClose}>
              Tutup
            </TextureButton>
          </div>
        )}
      </div>
    </div>
  );
}
