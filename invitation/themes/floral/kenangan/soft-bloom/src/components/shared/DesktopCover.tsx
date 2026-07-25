"use client";

// Panel cover dekoratif untuk layar lebar (PC/laptop) — sisi kiri layout split.
// Hanya tampil di >= 1024px (dikontrol CSS .desktop-cover). Di HP tidak dirender.

import { Suspense } from "react";
import SceneBackground from "./SceneBackground";
import TopFrame from "./TopFrame";
import Meadow from "./Meadow";
import BottomClusters from "./BottomClusters";
import Butterflies from "./Butterflies";
import FloralTitle from "./FloralTitle";
import GuestName from "./GuestName";
import { asset } from "@/lib/assets";
import type { InvitationConfig } from "@/lib/config-types";

export default function DesktopCover({
  couple,
  weddingDate,
}: {
  couple: InvitationConfig["couple"];
  weddingDate: string;
}) {
  const { groom, bride } = couple;
  const dateStr = new Date(weddingDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    // reveal-scope: dekorasi ber-[data-enter] di panel ini (bingkai, padang,
    // kluster) butuh pemicu entrance sendiri — tanpa ini mereka tertahan
    // transparan selamanya karena berada di luar section mana pun.
    <aside className="desktop-cover reveal-scope">
      <SceneBackground file="LatarPadang.webp" scrim={0.42} />
      {/* Bingkai dari potongan tepi (tidak diregangkan) → tak penyok di panel lebar */}
      <TopFrame maxWidth={760} zIndex={2} />
      <Meadow sprigs={9} zIndex={1} />
      <BottomClusters size="clamp(220px, 25vw, 380px)" zIndex={1} />
      <Butterflies count={2} zIndex={3} />

      <div
        style={{
          position: "relative",
          zIndex: 4,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          textAlign: "center",
          // Jarak atas berskala dengan lebar panel (= lebar bingkai persegi)
          // supaya monogram mulai di bawah lengkung bunga; dibatasi 20vh agar
          // konten tetap muat di laptop pendek (panel overflow:hidden).
          padding: "min(calc((100vw - clamp(420px, 33vw, 500px)) * 0.24), 200px, 20vh) 9% 0",
        }}
      >
        {/* Monogram dalam wreath — di slot teratas (wreath tahan tumpang-tindih
            tipis dengan lengkung; teks tidak). Label pindah ke bawahnya. */}
        <div
          style={{
            position: "relative",
            width: "clamp(180px, 17vw, 250px)",
            height: "clamp(180px, 17vw, 250px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 8,
          }}
        >
          <img
            src={asset("WreathInisial.webp")}
            alt=""
            className="ambient-anim"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", animation: "breathe 6s ease-in-out infinite" }}
          />
          <span className="font-script" style={{ fontSize: "clamp(42px, 4vw, 62px)", color: "var(--accent)", lineHeight: 1, paddingBottom: 6 }}>
            {groom.name[0]}&nbsp;&amp;&nbsp;{bride.name[0]}
          </span>
        </div>

        <FloralTitle as="p" glow size="clamp(30px, 2.8vw, 40px)" flowerSize="clamp(20px, 1.9vw, 28px)" style={{ marginBottom: 14 }}>
          Undangan Pernikahan
        </FloralTitle>

        <h1 className="font-display" style={{ fontSize: "clamp(64px, 5.8vw, 100px)", fontWeight: 400, lineHeight: 1.03, color: "var(--text)", letterSpacing: "-0.01em" }}>
          {groom.name}
          <span className="font-script" style={{ display: "block", fontSize: "0.6em", color: "var(--accent)", margin: "-6px 0" }}>
            &amp;
          </span>
          {bride.name}
        </h1>

        <div className="leaf-divider" style={{ margin: "20px 0 16px" }} />

        {/* Blok tanggal + tamu duduk di atas padang bunga terpadat → panel kertas
            (glow teks saja tidak cukup melawan flora serapat itu). */}
        <div
          className="bloom-panel"
          style={{ width: "auto", padding: "14px 32px 16px", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
        >
          <p className="font-body" style={{ fontSize: 17, color: "var(--text-muted)", letterSpacing: "0.04em", marginBottom: 8 }}>
            {dateStr}
          </p>
          <p className="type-label" style={{ marginBottom: 2 }}>
            Kepada Yth.
          </p>
          <Suspense fallback={null}>
            <p className="font-script" style={{ fontSize: "clamp(32px, 3vw, 48px)", color: "var(--accent)", lineHeight: 1.1 }}>
              <GuestName />
            </p>
          </Suspense>
        </div>
      </div>
    </aside>
  );
}
