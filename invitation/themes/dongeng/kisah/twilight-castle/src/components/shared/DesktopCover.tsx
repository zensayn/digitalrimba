"use client";

// Panel cover dekoratif untuk layar lebar (PC/laptop) — sisi kiri layout split.
// Hanya tampil di >= 1024px (dikontrol CSS .desktop-cover). Di HP tidak dirender.
// Bahasa visual twilight: dunia istana + cincin emas + fairy dust (tanpa aset floral).

import { Suspense } from "react";
import SceneBackground from "./SceneBackground";
import Stardust from "./Stardust";
import GoldCorner from "./GoldCorner";
import GuestName from "./GuestName";
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
    <aside className="desktop-cover reveal-scope">
      <SceneBackground file="DuniaIstana.webp" scrim={0.5} />
      <Stardust count={30} />
      <GoldCorner corner="tl" />
      <GoldCorner corner="tr" />

      <div
        style={{
          position: "relative",
          zIndex: 4,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "10vh 9% 0",
        }}
      >
        <p className="font-display" style={{ fontSize: "clamp(30px, 2.8vw, 40px)", fontStyle: "italic", color: "var(--gold-light)", marginBottom: 14 }}>
          Undangan Pernikahan
        </p>

        <h1 className="font-display" style={{ fontSize: "clamp(64px, 5.8vw, 100px)", fontWeight: 400, lineHeight: 1.03, color: "var(--text)", letterSpacing: "-0.01em" }}>
          {groom.name}
          <span className="font-script" style={{ display: "block", fontSize: "0.6em", color: "var(--gold-light)", margin: "-6px 0" }}>
            &amp;
          </span>
          {bride.name}
        </h1>

        <div style={{ width: 56, height: 1, background: "linear-gradient(90deg, transparent, var(--accent), transparent)", opacity: 0.7, margin: "20px 0 16px" }} />

        {/* Blok tanggal + tamu di atas panel gelap */}
        <div
          className="bloom-panel"
          style={{ width: "auto", padding: "14px 32px 16px", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
        >
          <p className="font-script" style={{ fontSize: 20, fontWeight: 500, color: "var(--text-muted)", letterSpacing: "0.04em", marginBottom: 8 }}>
            {dateStr}
          </p>
          <p className="type-label" style={{ marginBottom: 2 }}>
            Kepada Yth.
          </p>
          <Suspense fallback={null}>
            <p className="font-script" style={{ fontSize: "clamp(32px, 3vw, 48px)", color: "var(--gold-light)", lineHeight: 1.1 }}>
              <GuestName />
            </p>
          </Suspense>
        </div>
      </div>
    </aside>
  );
}
