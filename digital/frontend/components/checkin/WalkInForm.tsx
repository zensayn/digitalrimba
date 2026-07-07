"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { TextureButton } from "@/components/ui/texture-button";
import { Input } from "@/components/ui/input";

type WalkInFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, partySize: number) => Promise<void>;
};

/** Minimal walk-in entry: name + pax. Online-only by design — the trigger
 * button is disabled while offline (minting guest IDs offline has no sane
 * reconciliation path for a rare, deliberate action). */
export function WalkInForm({ open, onOpenChange, onSubmit }: WalkInFormProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="rounded-t-[22px] border-t-0 bg-white px-5 pb-8 pt-3 gap-0"
      >
        <div className="w-9 h-1 bg-[#e8e4df] rounded-full mx-auto mb-4" />
        {open && <WalkInBody onSubmit={onSubmit} />}
      </SheetContent>
    </Sheet>
  );
}

function WalkInBody({
  onSubmit,
}: {
  onSubmit: (name: string, partySize: number) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [pax, setPax] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError("");
    try {
      await onSubmit(name.trim(), pax);
      setBusy(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambah tamu");
      setBusy(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <SheetTitle asChild>
        <h2 className="text-xl font-bold text-[#212121]">Tamu Walk-in</h2>
      </SheetTitle>

      <Input
        autoFocus
        placeholder="Nama tamu…"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-12 rounded-xl"
      />

      <div className="flex items-center justify-between bg-[#faf8f5] rounded-xl px-4 py-3">
        <p className="text-sm font-semibold text-[#212121]">Jumlah hadir</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Kurangi"
            disabled={pax <= 1}
            onClick={() => setPax((p) => Math.max(1, p - 1))}
            className="h-11 w-11 rounded-full bg-white ring-1 ring-[#e5e7eb] text-xl font-bold text-[#212121] transition-transform duration-150 ease-out active:scale-[0.95] disabled:opacity-30"
          >
            −
          </button>
          <span className="w-10 text-center text-xl font-bold text-[#212121] tabular-nums">
            {pax}
          </span>
          <button
            type="button"
            aria-label="Tambah"
            disabled={pax >= 99}
            onClick={() => setPax((p) => Math.min(99, p + 1))}
            className="h-11 w-11 rounded-full bg-white ring-1 ring-[#e5e7eb] text-xl font-bold text-[#212121] transition-transform duration-150 ease-out active:scale-[0.95] disabled:opacity-30"
          >
            +
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-[#b30000] text-center">{error}</p>}

      <TextureButton
        variant="primary"
        className="w-full"
        type="submit"
        disabled={!name.trim() || busy}
      >
        {busy ? "Menambahkan…" : "✓ Tambah & Check In"}
      </TextureButton>
    </form>
  );
}
