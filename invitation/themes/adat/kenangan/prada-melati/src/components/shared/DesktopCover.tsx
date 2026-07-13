"use client";

// Panel cover dekoratif untuk layar lebar (PC/laptop) — sisi kiri layout split.
// Tampil di >= 1024px (dikontrol CSS .desktop-cover). Gemakan CoverSection dalam
// bahasa kelir prada, plus blok "Kepada Yth. [GuestName]". Aset sama dengan
// CoverSection → nol request jaringan tambahan di desktop.

import { Suspense } from "react";
import type { WheelEvent } from "react";

import KelirScene from "./KelirScene";
import RonceanMelati from "./RonceanMelati";
import SceneContent from "./SceneContent";
import Countdown from "./Countdown";
import { kelirFor } from "./sceneKelir";
import GuestName from "@/components/GuestName";
import type { InvitationConfig } from "@/lib/config-types";

export default function DesktopCover({
  couple,
  weddingDate,
}: {
  couple: InvitationConfig["couple"];
  weddingDate: string;
}) {
  const preset = kelirFor("cover")!;
  const dateStr = new Date(weddingDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Scroll terjadi di .snap-container (bukan window); teruskan roda mouse dari
  // panel kiri agar kolom kanan tetap tergulir (pola warm-narrative).
  const forwardWheel = (e: WheelEvent) => {
    document.querySelector<HTMLElement>(".snap-container")?.scrollBy({ top: e.deltaY });
  };

  return (
    <aside className="desktop-cover" aria-hidden="true" onWheel={forwardWheel}>
      <KelirScene preset={preset} kain="KainBadan">
        <RonceanMelati zIndex={3} />
        <SceneContent align="center" maxWidth={460}>
          <p className="font-label text-xs uppercase tracking-[0.3em] text-[var(--text-dim)]">
            Undangan Pernikahan
          </p>
          <h1
            className="font-display mt-5 text-[var(--text)]"
            style={{ fontSize: "clamp(40px, 4vw, 68px)", lineHeight: 1.08, textShadow: "0 2px 20px rgba(0,0,0,0.7)" }}
          >
            {couple.groom.name} &amp; {couple.bride.name}
          </h1>
          <div className="gold-divider mx-auto my-5" />
          <p className="font-body text-[var(--text-muted)]">{dateStr}</p>
          <div className="mt-6">
            <Countdown targetDate={weddingDate} />
          </div>

          <div className="mt-9 flex flex-col items-center gap-1.5">
            <p className="font-label text-[10px] uppercase tracking-[0.25em] text-[var(--text-dim)]">
              Kepada Yth.
            </p>
            <p className="font-display text-[var(--gold)]" style={{ fontSize: "clamp(20px, 1.9vw, 30px)" }}>
              <Suspense fallback={null}>
                <GuestName />
              </Suspense>
            </p>
          </div>
        </SceneContent>
      </KelirScene>
    </aside>
  );
}
