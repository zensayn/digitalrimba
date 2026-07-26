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
  const preset = kelirFor("cover");
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
      {/* Hero cover dikecilkan (46svh, default 56) supaya ada pita gelap cukup di
          bawah gunungan untuk kicker + nama + tanggal + countdown + blok tamu —
          di layar desktop pendek konten tak lagi tertindih gunungan/hem. */}
      <KelirScene preset={preset} kain="KainBadan" heroSvh={46}>
        <RonceanMelati zIndex={3} />
        <SceneContent
          align="center"
          maxWidth={620}
          padTop="38svh"
          padBottom="clamp(80px, 12svh, 120px)"
        >
          {/* JARAK antar-baris = angka `marginTop` inline (px) pada tiap elemen di
              bawahnya. JANGAN pakai class margin Tailwind (mt- dsb) di sini — tak
              ter-generate di proyek ini, jadi tak ada efek. Ubah angkanya: makin
              besar makin renggang. */}

          {/* Kicker — baris pertama, tak butuh marginTop */}
          <p className="font-label text-halo text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
            Undangan Pernikahan
          </p>

          {/* Nama — marginTop = jarak KICKER → NAMA */}
          <h1
            className="font-display text-[var(--text)]"
            style={{ marginTop: 1, fontSize: "clamp(38px, 3.4vw, 58px)", lineHeight: 1.08, textShadow: "0 2px 20px rgba(0,0,0,0.7)" }}
          >
            {couple.groom.name} &amp; {couple.bride.name}
          </h1>

          {/* Garis emas — marginTop = jarak NAMA → GARIS. Tetap center via margin auto. */}
          <div className="gold-divider" style={{ marginTop: 1, marginLeft: "auto", marginRight: "auto" }} />

          {/* Tanggal — marginTop = jarak GARIS → TANGGAL */}
          <p className="font-body text-halo text-[var(--text-muted)]" style={{ marginTop: 2 }}>
            {dateStr}
          </p>

          {/* Countdown — marginTop = jarak TANGGAL → COUNTDOWN */}
          <div style={{ marginTop: 3 }}>
            <Countdown targetDate={weddingDate} />
          </div>

          {/* Blok tamu — marginTop = jarak COUNTDOWN → "Kepada Yth.";
              gap = jarak "Kepada Yth." → nama tamu */}
          <div className="flex flex-col items-center" style={{ marginTop: 5, gap: 2 }}>
            <p className="font-label text-halo text-[10px] uppercase tracking-[0.25em] text-[var(--text-muted)]">
              Kepada Yth.
            </p>
            <p className="font-display text-halo text-[var(--text)]" style={{ fontSize: "clamp(20px, 1.9vw, 30px)" }}>
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
