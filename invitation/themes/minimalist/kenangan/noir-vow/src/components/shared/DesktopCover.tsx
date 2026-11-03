"use client";

// Panel cover dekoratif untuk layar lebar (PC/laptop) — sisi kiri layout split.
// Hanya tampil di >= 1024px (dikontrol CSS .desktop-cover). Di HP tidak dirender.

import { Suspense } from "react";
import SceneBackground from "./SceneBackground";
import VideoBackdrop from "./VideoBackdrop";
import FloralTitle from "./FloralTitle";
import GuestName from "./GuestName";
import OrnamentMark from "./OrnamentMark";
import type { InvitationConfig } from "@/lib/config-types";

export default function DesktopCover({
  couple,
  weddingDate,
  coverVideo,
}: {
  couple: InvitationConfig["couple"];
  weddingDate: string;
  coverVideo?: InvitationConfig["coverVideo"];
}) {
  const { groom, bride } = couple;
  const dateStr = new Date(weddingDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    // reveal-scope: dekorasi ber-[data-enter] di panel ini butuh pemicu entrance
    // sendiri — tanpa ini mereka tertahan transparan selamanya karena berada
    // di luar section mana pun.
    // Hero elegant-minimalist: latar bersih, tanpa ornamen tersebar (feedback
    // owner 2026-08-01) — cuma video + overlay gelap + teks.
    <aside className="desktop-cover reveal-scope">
      {/* Video sendiri untuk panel ini — terkurung ke lebar panel kiri, TIDAK
          berbagi elemen dengan video kolom kanan (lihat catatan di VideoBackdrop.tsx). */}
      <VideoBackdrop video={coverVideo} />
      <SceneBackground scrim={0.55} />

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
        {/* Monogram dalam ring — di slot teratas, diapit garis tipis kiri-kanan
            (pengganti lengkung botani). Label pindah ke bawahnya. */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, width: "100%", marginBottom: 8 }}>
          <div className="rule-fade" style={{ maxWidth: 64 }} />
          <div
            style={{
              position: "relative",
              width: "clamp(180px, 17vw, 250px)",
              height: "clamp(180px, 17vw, 250px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <OrnamentMark
              kind="ringOpen"
              className="ambient-anim"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", animation: "breathe 6s ease-in-out infinite" }}
            />
            <span className="font-script" style={{ fontSize: "clamp(42px, 4vw, 62px)", color: "var(--accent)", lineHeight: 1, paddingBottom: 6 }}>
              {groom.name[0]}&nbsp;&amp;&nbsp;{bride.name[0]}
            </span>
          </div>
          <div className="rule-fade rule-fade-flip" style={{ maxWidth: 64 }} />
        </div>

        <FloralTitle as="p" size="clamp(30px, 2.8vw, 40px)" flowerSize="clamp(20px, 1.9vw, 28px)" style={{ marginBottom: 14 }}>
          Undangan Pernikahan
        </FloralTitle>

        <h1 className="font-display" style={{ fontSize: "clamp(64px, 5.8vw, 100px)", fontWeight: 400, lineHeight: 1.03, color: "var(--text)", letterSpacing: "-0.01em" }}>
          {groom.name}
          <span className="font-script" style={{ display: "block", fontSize: "0.6em", color: "var(--accent)", margin: "-6px 0" }}>
            &amp;
          </span>
          {bride.name}
        </h1>

        <div className="divider" style={{ margin: "20px 0 16px" }} />

        {/* Blok tanggal + tamu — mengambang langsung di atas video (tanpa kartu),
            text-halo menjaga keterbacaan di atas latar gelap. */}
        <div style={{ width: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <p className="font-body text-halo" style={{ fontSize: 17, color: "var(--text-muted)", letterSpacing: "0.04em", marginBottom: 8 }}>
            {dateStr}
          </p>
          <p className="type-label text-halo" style={{ marginBottom: 2 }}>
            Kepada Yth.
          </p>
          <Suspense fallback={null}>
            <p className="font-script text-halo" style={{ fontSize: "clamp(32px, 3vw, 48px)", color: "var(--accent)", lineHeight: 1.1 }}>
              <GuestName />
            </p>
          </Suspense>
        </div>
      </div>
    </aside>
  );
}
