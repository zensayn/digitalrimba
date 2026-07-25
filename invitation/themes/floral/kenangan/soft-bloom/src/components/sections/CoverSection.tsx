"use client";

// src/components/sections/CoverSection.tsx
// ─── Cover — Wildflower Pastel ─────────────────────────────────────────────────
// Latar terang dengan sapuan pastel (CSS), rangkaian bunga liar bergoyang di tiap
// sudut, kupu-kupu terbang, monogram dalam wreath, nama Fraunces, countdown.

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import FallingFlowers from "@/components/shared/FallingFlowers";
import FloralTitle from "@/components/shared/FloralTitle";
import Butterflies from "@/components/shared/Butterflies";
import SceneBackground from "@/components/shared/SceneBackground";
import TopFrame from "@/components/shared/TopFrame";
import Meadow from "@/components/shared/Meadow";
import BottomClusters from "@/components/shared/BottomClusters";
import { asset } from "@/lib/assets";
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
          className="specimen-card"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            minWidth: 58,
            padding: "14px 9px",
          }}
        >
          <span data-cd={key} className="font-display" style={{ fontSize: "clamp(26px, 6.8vw, 38px)", fontWeight: 500, color: "var(--accent)", lineHeight: 1 }}>
            00
          </span>
          <span className="type-label" style={{ letterSpacing: "0.16em" }}>
            {label}
          </span>
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
  const [bgLoaded, setBgLoaded] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setBgLoaded(true));
    return () => cancelAnimationFrame(id);
  }, []);

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
    <section id="cover" className="snap-section reveal-scope" ref={sectionRef} style={{ background: "var(--bg)", justifyContent: "flex-start" }}>
      {/* Latar lukisan padang bunga + scrim. edgeFade: tepi bawah larut ke kertas
          → tak ada garis potong lurus ke section berikutnya (jahitan menyambung). */}
      <SceneBackground file="LatarPadang.webp" scrim={0.5} edgeFade />
      {/* Bingkai lengkung botani di puncak */}
      <TopFrame maxWidth={640} zIndex={2} />

      {/* Dekorasi berat di-defer setelah first paint (LCP) */}
      {bgLoaded && (
        <>
          <Meadow sprigs={7} zIndex={1} />
          <BottomClusters size="clamp(170px, 48vw, 340px)" zIndex={1} />
          <Butterflies count={2} zIndex={4} />
        </>
      )}

      {/* Bunga liar berjatuhan */}
      <FallingFlowers count={12} zIndex={3} />

      {/* Larutkan tepi bawah (padang + MeadowStrip + kluster sudut) ke warna kertas.
          Diletakkan DI ATAS semua flora (zIndex 5) supaya band bunga tak terpotong
          garis lurus di batas section — menyambung mulus ke section berikutnya. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "clamp(120px, 22vh, 210px)",
          background: "linear-gradient(to bottom, rgba(253,252,250,0) 0%, rgba(253,252,250,0.7) 55%, var(--bg) 92%)",
          zIndex: 5,
          pointerEvents: "none",
        }}
      />

      {/* Konten utama. Tidak di-center vertikal: bingkai atas melebar mengikuti
          viewport (persegi, dense ±30% lebarnya), jadi pada layar lebar konten
          yang di-center akan naik menabrak bunga (monogram tenggelam — temuan
          QA). paddingTop berskala dengan lebar bingkai → monogram selalu mulai
          di bawah lengkung bunga, di semua ukuran layar. */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "min(32vw, 220px) 32px clamp(34px, 6vh, 64px)",
          width: "100%",
        }}
      >
        {/* Monogram dalam wreath — bernapas halus */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.0, delay: 0.2 }}
          style={{
            position: "relative",
            width: "clamp(150px, 41vw, 210px)",
            height: "clamp(150px, 41vw, 210px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          <img
            src={asset("WreathInisial.webp")}
            alt=""
            fetchPriority="high"
            className="ambient-anim"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              pointerEvents: "none",
              animation: "breathe 6s ease-in-out infinite",
            }}
          />
          <span
            className="font-script"
            style={{ fontSize: "clamp(34px, 9.8vw, 52px)", color: "var(--accent)", lineHeight: 1, paddingBottom: 6 }}
          >
            {groom.name[0]}&nbsp;&amp;&nbsp;{bride.name[0]}
          </span>
        </motion.div>

        {/* Label undangan — di bawah monogram, di bukaan lengkung yang lapang
            (di puncak ia terjepit & tertimpa kluster bunga kiri-kanan) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          style={{ marginBottom: "14px" }}
        >
          <FloralTitle as="p" glow size="clamp(24px, 6.6vw, 32px)" flowerSize="clamp(18px, 4.8vw, 24px)">
            Undangan Pernikahan
          </FloralTitle>
        </motion.div>

        {/* Nama mempelai */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.5 }}
          className="font-display"
          style={{
            fontSize: "clamp(46px, 13vw, 82px)",
            fontWeight: 400,
            lineHeight: 1.05,
            color: "var(--text)",
            letterSpacing: "-0.01em",
          }}
        >
          {groom.name}
          <span
            className="font-script"
            style={{ display: "block", fontSize: "0.62em", color: "var(--accent)", margin: "-2px 0", fontWeight: 400 }}
          >
            &amp;
          </span>
          {bride.name}
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.95 }}
          className="leaf-divider"
          style={{ marginTop: "20px", marginBottom: "18px" }}
        />

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.05 }}
          className="font-body"
          style={{
            fontSize: "15px",
            color: "var(--text-muted)",
            letterSpacing: "0.04em",
            marginBottom: "30px",
            textShadow: "0 1px 3px rgba(253,252,250,0.95), 0 0 14px rgba(253,252,250,0.9)",
          }}
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
          <div style={{ width: 1, height: 30, background: "linear-gradient(to bottom, var(--leaf), transparent)" }} />
          <span className="type-label" style={{ letterSpacing: "0.25em", textShadow: "0 1px 3px rgba(253,252,250,0.95), 0 0 12px rgba(253,252,250,0.9)" }}>
            Gulir
          </span>
        </motion.div>
      </div>
    </section>
  );
}
