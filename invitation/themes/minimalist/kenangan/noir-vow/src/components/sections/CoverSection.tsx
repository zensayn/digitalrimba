"use client";

// src/components/sections/CoverSection.tsx
// ─── Cover — Quiet Ink ──────────────────────────────────────────────────────────
// Latar video gelap + scrim dramatis, hero bersih tanpa ornamen tersebar (cuma
// video + overlay + teks), ring terbuka di sekeliling monogram, countdown.

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import FloralTitle from "@/components/shared/FloralTitle";
import SceneBackground from "@/components/shared/SceneBackground";
import OrnamentMark from "@/components/shared/OrnamentMark";
import { rhythmVars } from "@/lib/rhythm";
import type { InvitationConfig } from "@/lib/config-types";

// ── Countdown ──────────────────────────────────────────────────────────────────
// Angka di-update langsung via textContent (bukan setState): setState 1 dtk sekali
// membuat SELURUH CoverSection (banyak elemen framer-motion) render ulang tiap
// detik → main thread macet ±100-200ms berkala → scroll terasa "melekat"/magnet
// di semua section. Dengan DOM langsung, tiap detak cuma menulis 4 string.
function Countdown({ targetDateString }: { targetDateString: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cells: Record<string, HTMLElement | null> = {
      d: root.querySelector("[data-cd=d]"),
      h: root.querySelector("[data-cd=h]"),
      m: root.querySelector("[data-cd=m]"),
      s: root.querySelector("[data-cd=s]"),
    };
    const end = new Date(targetDateString).getTime();
    const tick = () => {
      const gap = Math.max(0, end - Date.now());
      const v = {
        d: Math.floor(gap / 86_400_000),
        h: Math.floor((gap % 86_400_000) / 3_600_000),
        m: Math.floor((gap % 3_600_000) / 60_000),
        s: Math.floor((gap % 60_000) / 1_000),
      };
      for (const k of ["d", "h", "m", "s"] as const) {
        const el = cells[k];
        if (el) el.textContent = String(v[k]).padStart(2, "0");
      }
    };
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [targetDateString]);

  return (
    <motion.div
      ref={rootRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 1.2 }}
      style={{ display: "flex", gap: "14px" }}
    >
      {[
        { key: "d", label: "Hari" },
        { key: "h", label: "Jam" },
        { key: "m", label: "Menit" },
        { key: "s", label: "Detik" },
      ].map(({ key, label }) => (
        <div
          key={key}
          className="card"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            minWidth: 58,
            padding: "14px 9px",
          }}
        >
          <span data-cd={key} className="type-figure">
            00
          </span>
          <span className="type-label">{label}</span>
        </div>
      ))}
    </motion.div>
  );
}

export default function CoverSection({
  couple,
  weddingDate: weddingDateString,
}: {
  couple: InvitationConfig["couple"];
  weddingDate: string;
}) {
  const { groom, bride } = couple;
  const weddingDate = new Date(weddingDateString);
  const sectionRef = useRef<HTMLElement>(null);

  const dateStr = weddingDate.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleOpen = () => {
    document.dispatchEvent(new CustomEvent("invitation-open"));
  };
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const onTouch = () => handleOpen();
    el.addEventListener("touchstart", onTouch, { once: true });
    el.addEventListener("click", handleOpen, { once: true });
    return () => {
      el.removeEventListener("touchstart", onTouch);
      el.removeEventListener("click", handleOpen);
    };
  }, []);

  return (
    <section
      id="cover"
      className="snap-section reveal-scope"
      ref={sectionRef}
      style={{ ...rhythmVars("cover"), justifyContent: "flex-start" }}
    >
      {/* Latar video + scrim gelap dramatis. edgeFade: tepi bawah larut ke latar
          → tak ada garis potong lurus ke section berikutnya (jahitan menyambung).
          Hero elegant-minimalist: latar bersih, tanpa ornamen tersebar (feedback
          owner 2026-08-01) — cuma video + overlay gelap + teks. */}
      <SceneBackground scrim={0.62} edgeFade />

      {/* Larutkan tepi bawah ke latar → tak ada garis potong lurus di batas
          section, menyambung mulus ke section berikutnya. */}
      <div aria-hidden="true" className="edge-dissolve" style={{ zIndex: 5 }} />

      {/* Konten utama. Tidak di-center vertikal: bingkai atas melebar mengikuti
          viewport (persegi, dense ±1/3 lebarnya), jadi pada layar lebar konten
          yang di-center akan naik menabrak bunga (monogram tenggelam — temuan
          QA). Ruang atasnya berskala dengan lebar bingkai lewat --section-pad-top.

          --shell-gap: 0 — SATU-SATUNYA section yang ritme dalamnya disetel tangan.
          Alasannya struktural, bukan selera: cover ber-overflow:hidden dan wajib
          muat satu viewport, jadi jarak antar-elemennya sengaja tidak seragam
          (rapat di monogram, longgar sebelum countdown) untuk memenangkan ruang.
          Margin/gutter/lebar kolomnya tetap tunduk pada token seperti yang lain. */}
      <div
        className="section-shell"
        // zIndex 3 (bukan 10 bawaan .section-shell): pita pelarut tepi bawah
        // duduk di zIndex 5 dan memang harus melintas DI ATAS ujung konten.
        style={{ "--shell-gap": "0", zIndex: 3 } as React.CSSProperties}
      >
        {/* Monogram dalam wreath — bernapas halus */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.0, delay: 0.2 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "clamp(10px, 4vw, 22px)",
            width: "100%",
            marginBottom: "10px",
          }}
        >
          {/* Garis tipis kiri-kanan monogram — pengganti lengkung botani */}
          <div className="rule-fade" style={{ maxWidth: 56 }} />
          <div
            style={{
              position: "relative",
              width: "clamp(150px, 41vw, 210px)",
              height: "clamp(150px, 41vw, 210px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <OrnamentMark
              kind="ringOpen"
              className="ambient-anim"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                animation: "breathe 6s ease-in-out infinite",
              }}
            />
            {/* paddingBottom 6: nudge optik glif script di dalam wreath, bukan ritme */}
            <span className="type-script" style={{ paddingBottom: 6 }}>
              {groom.name[0]}&nbsp;&amp;&nbsp;{bride.name[0]}
            </span>
          </div>
          <div className="rule-fade rule-fade-flip" style={{ maxWidth: 56 }} />
        </motion.div>

        {/* Label undangan — di bawah monogram, di bukaan lengkung yang lapang
            (di puncak ia terjepit & tertimpa kluster bunga kiri-kanan) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          style={{ marginBottom: "14px" }}
        >
          <FloralTitle as="p" size="clamp(24px, 6.6vw, 32px)" flowerSize="clamp(18px, 4.8vw, 24px)">
            Undangan Pernikahan
          </FloralTitle>
        </motion.div>

        {/* Nama mempelai */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.5 }}
          className="type-display"
        >
          {groom.name}
          <span className="amp-stacked">&amp;</span>
          {bride.name}
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.95 }}
          className="divider"
          style={{ marginTop: "20px", marginBottom: "18px" }}
        />

        {/* Tanggal duduk tepat di atas pita bukit LatarPadang — titik paling gelap
            di lukisan. Dengan --text-muted + berat 300 bawaan body, kontrasnya
            cuma 4.42:1 (3.55:1 di atas bukit) alias di bawah ambang WCAG, dan
            glow 14px malah mencerahkan latar di sekeliling glif sampai batang
            hurufnya larut (laporan owner 2026-07-27). Diperbaiki bertahap:
            warna --text, berat 400, halo dirapatkan. Terukur jadi ~10:1. */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.05 }}
          className="cover-date text-halo"
          style={{ marginBottom: "30px" }}
        >
          {dateStr}
        </motion.p>

        {/* Countdown — kartu specimen crisp */}
        <Countdown targetDateString={weddingDateString} />

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 2.5, delay: 2.0, repeat: Infinity, ease: "easeInOut" }}
          style={{ marginTop: "34px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
        >
          <div className="scroll-hint-line" />
          <span className="type-label text-halo-strong">Gulir</span>
        </motion.div>
      </div>
    </section>
  );
}
