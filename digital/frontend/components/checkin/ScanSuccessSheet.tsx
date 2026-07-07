"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { TextureButton } from "@/components/ui/texture-button";
import { Input } from "@/components/ui/input";
import type { CheckInGuest } from "@/lib/api/checkin-operator";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export type CheckInOptions = {
  actualPax: number;
  proxyName: string;
  souvenirGiven: boolean;
};

type ScanSuccessSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guest: CheckInGuest | null;
  alreadyIn: boolean;
  /** Fresh success (walk-in confirmation) — green banner instead of the red duplicate one. */
  justArrived?: boolean;
  busy: boolean;
  /** Envelope tag that will be assigned on check-in (already-assigned tag wins). */
  giftTagPreview: string;
  onCheckIn: (options: CheckInOptions) => void;
  /** Only used for already-arrived guests (server-side toggle). */
  onToggleSouvenir: () => void;
  onDismiss: () => void;
};

export function ScanSuccessSheet({
  open,
  onOpenChange,
  guest,
  alreadyIn,
  justArrived = false,
  busy,
  giftTagPreview,
  onCheckIn,
  onToggleSouvenir,
  onDismiss,
}: ScanSuccessSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="rounded-t-[22px] border-t-0 bg-white px-5 pb-8 pt-3 max-h-[85vh] overflow-y-auto gap-0"
      >
        <div className="w-9 h-1 bg-[#e8e4df] rounded-full mx-auto mb-4" />
        {guest && (
          <SheetBody
            key={guest.id + String(alreadyIn)}
            guest={guest}
            alreadyIn={alreadyIn}
            justArrived={justArrived}
            busy={busy}
            giftTagPreview={giftTagPreview}
            onCheckIn={onCheckIn}
            onToggleSouvenir={onToggleSouvenir}
            onDismiss={onDismiss}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

// Keyed by guest so stepper/toggle state resets per scan without effects.
function SheetBody({
  guest,
  alreadyIn,
  justArrived = false,
  busy,
  giftTagPreview,
  onCheckIn,
  onToggleSouvenir,
  onDismiss,
}: Omit<ScanSuccessSheetProps, "open" | "onOpenChange" | "guest"> & {
  guest: CheckInGuest;
}) {
  const [pax, setPax] = useState(guest.actualPax ?? guest.partySize ?? 1);
  const [isProxy, setIsProxy] = useState(Boolean(guest.proxyName));
  const [proxyName, setProxyName] = useState(guest.proxyName ?? "");
  const [souvenir, setSouvenir] = useState(guest.souvenirCollected);

  const giftTag = guest.giftTagCode || giftTagPreview;
  const souvenirOn = alreadyIn ? guest.souvenirCollected : souvenir;

  function handleSouvenirToggle() {
    if (alreadyIn) {
      onToggleSouvenir();
    } else {
      setSouvenir((s) => !s);
    }
  }

  return (
    <div className="space-y-4" data-testid="guest-card">
      {/* Status chip + group tag */}
      <div className="flex items-center gap-2">
        <span
          className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase ${
            alreadyIn && !justArrived
              ? "bg-[#fef2f2] text-[#b30000]"
              : "bg-[#edfce9] text-[#346739]"
          }`}
        >
          {alreadyIn ? "Sudah Check-in" : "Belum Check-in"}
        </span>
        {guest.tag && (
          <span
            data-testid="guest-tag"
            className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#faf8f5] text-[#616161]"
          >
            {guest.tag}
          </span>
        )}
      </div>

      {/* Aggressive-typography guest name — readable from arm's length */}
      <SheetTitle asChild>
        <h2 className="text-[clamp(30px,9vw,40px)] leading-[1.05] font-bold text-[#212121] break-words">
          {guest.name}
        </h2>
      </SheetTitle>

      {/* Arrival banner: green fresh success, calm red duplicate */}
      {alreadyIn && guest.arrivedAt && (
        <div
          className={`rounded-xl px-4 py-3 ${
            justArrived ? "bg-[#edfce9]" : "bg-[#fef2f2]"
          }`}
        >
          <p
            className={`text-sm font-semibold ${
              justArrived ? "text-[#346739]" : "text-[#b30000]"
            }`}
          >
            {justArrived ? "✓ Berhasil check-in " : "Sudah check-in "}
            {formatTime(guest.arrivedAt)}
            {guest.checkedInByLabel ? ` oleh ${guest.checkedInByLabel}` : ""}
          </p>
          {guest.proxyName && (
            <p
              className={`text-xs mt-0.5 ${
                justArrived ? "text-[#346739]/80" : "text-[#b30000]/80"
              }`}
            >
              Diwakilkan oleh {guest.proxyName}
            </p>
          )}
        </div>
      )}

      {/* Metadata columns (Luma-style label-over-value) */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Undangan", value: `${guest.partySize} pax` },
          {
            label: "Amplop",
            value: giftTag ? `#${giftTag}` : "—",
          },
          {
            label: "Tiba",
            value: guest.arrivedAt ? formatTime(guest.arrivedAt) : "—",
          },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#faf8f5] rounded-xl py-2.5 text-center">
            <p className="text-[10px] font-bold uppercase text-[#93939f]">
              {label}
            </p>
            <p className="text-sm font-bold mt-0.5 text-[#212121]">{value}</p>
          </div>
        ))}
      </div>

      {!alreadyIn && (
        <>
          {/* Actual pax stepper */}
          <div className="flex items-center justify-between bg-[#faf8f5] rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[#212121]">
                Jumlah hadir
              </p>
              <p className="text-xs text-[#93939f]">
                Undangan untuk {guest.partySize} pax
              </p>
            </div>
            <div className="flex items-center gap-1">
              <StepperButton
                label="Kurangi jumlah hadir"
                disabled={pax <= 1}
                onClick={() => setPax((p) => Math.max(1, p - 1))}
              >
                −
              </StepperButton>
              <span className="w-10 text-center text-xl font-bold text-[#212121] tabular-nums">
                {pax}
              </span>
              <StepperButton
                label="Tambah jumlah hadir"
                disabled={pax >= 99}
                onClick={() => setPax((p) => Math.min(99, p + 1))}
              >
                +
              </StepperButton>
            </div>
          </div>

          {/* Proxy / wakil toggle */}
          <div className="bg-[#faf8f5] rounded-xl px-4 py-3 space-y-3">
            <ToggleRow
              title="Diwakilkan"
              subtitle="Tamu tidak hadir sendiri"
              on={isProxy}
              onToggle={() => setIsProxy((p) => !p)}
            />
            {isProxy && (
              <Input
                autoFocus
                placeholder="Nama wakil…"
                value={proxyName}
                onChange={(e) => setProxyName(e.target.value)}
                className="h-11 rounded-xl bg-white border-[#e5e7eb]"
              />
            )}
          </div>
        </>
      )}

      {/* Souvenir */}
      <div className="bg-[#faf8f5] rounded-xl px-4 py-3">
        <ToggleRow
          testId="souvenir-toggle"
          title="Souvenir diberikan"
          subtitle="Aktifkan setelah menyerahkan"
          on={souvenirOn}
          onToggle={handleSouvenirToggle}
        />
      </div>

      {/* Souvenir instruction — the loud kiosk cue */}
      {!alreadyIn && (
        <div className="rounded-xl bg-[#edfce9] px-4 py-4 text-center">
          <p className="text-[11px] font-bold uppercase text-[#346739]/70">
            Instruksi
          </p>
          <p className="text-2xl font-bold text-[#346739] leading-tight">
            BERIKAN {pax} SOUVENIR
          </p>
        </div>
      )}

      {/* CTA */}
      {alreadyIn ? (
        <TextureButton variant="secondary" className="w-full" onClick={onDismiss}>
          Tutup — scan berikutnya
        </TextureButton>
      ) : (
        <TextureButton
          variant="primary"
          className="w-full"
          onClick={() =>
            onCheckIn({
              actualPax: pax,
              proxyName: isProxy ? proxyName.trim() : "",
              souvenirGiven: souvenir,
            })
          }
          disabled={busy || (isProxy && proxyName.trim() === "")}
        >
          {busy ? "Memproses…" : "✓ Check In"}
        </TextureButton>
      )}
    </div>
  );
}

function StepperButton({
  children,
  label,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="h-11 w-11 rounded-full bg-white ring-1 ring-[#e5e7eb] text-xl font-bold text-[#212121] transition-transform duration-150 ease-out active:scale-[0.95] disabled:opacity-30 disabled:active:scale-100"
    >
      {children}
    </button>
  );
}

function ToggleRow({
  title,
  subtitle,
  on,
  onToggle,
  testId,
}: {
  title: string;
  subtitle: string;
  on: boolean;
  onToggle: () => void;
  testId?: string;
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      role="switch"
      aria-checked={on}
      className="w-full flex items-center justify-between transition-transform duration-150 ease-out active:scale-[0.99]"
      onClick={onToggle}
    >
      <div className="text-left">
        <p className="text-sm font-semibold text-[#212121]">{title}</p>
        <p className="text-xs text-[#93939f]">{subtitle}</p>
      </div>
      <div
        className={`relative w-11 h-6 shrink-0 rounded-full transition-colors duration-150 ${
          on ? "bg-[#346739]" : "bg-neutral-200"
        }`}
      >
        <span
          className={`absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-150 ease-out ${
            on ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </div>
    </button>
  );
}
