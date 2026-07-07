"use client";

// src/components/sections/CoverSection.tsx
// ─── Cover — Pintu Kelola ──────────────────────────────────────────────────────
// Visual: Latar parchment warm, nama besar Playfair Display, countdown elegan,
//         ornamen sudut Art Nouveau, motif garis tipis di tepian.

import { useEffect, useState, useRef } from "react";
import { m as motion } from "framer-motion";
import FallingFlowers from "@/components/shared/FallingFlowers";
import ParallaxScene from "@/components/shared/ParallaxScene";
import type { InvitationConfig } from "@/lib/config-types";

import { ASSET_BASE as BASE } from "@/lib/assets";

// ── Countdown ──────────────────────────────────────────────────────────────────
function useCountdown(targetDateString: string) {
  const [diff, setDiff] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const end = new Date(targetDateString).getTime();
      const gap = Math.max(0, end - now);
      setDiff({
        d: Math.floor(gap / 86_400_000),
        h: Math.floor((gap % 86_400_000) / 3_600_000),
        m: Math.floor((gap % 3_600_000) / 60_000),
        s: Math.floor((gap % 60_000) / 1_000),
      });
    };
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [targetDateString]);

  return diff;
}

// Komponen terpisah agar tick per-detik hanya me-render ulang digit countdown,
// bukan seluruh cover (parallax scene + falling flowers + semua motion element).
function Countdown({ targetDateString }: { targetDateString: string }) {
  const countdown = useCountdown(targetDateString);
  if (countdown === null) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 1.25 }}
      style={{
        display: "flex",
        gap: "20px",
      }}
    >
      {[
        { val: countdown.d, label: "Hari" },
        { val: countdown.h, label: "Jam" },
        { val: countdown.m, label: "Menit" },
        { val: countdown.s, label: "Detik" },
      ].map(({ val, label }, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            minWidth: 44,
          }}
        >
          <span
            className="font-display"
            style={{
              fontSize: "clamp(22px, 5.5vw, 34px)",
              fontWeight: 400,
              color: "var(--gold)",
              lineHeight: 1,
              letterSpacing: "-0.01em",
              textShadow: "0 1px 3px rgba(250,247,242,0.98), 0 2px 14px rgba(250,247,242,1), 0 0 7px rgba(250,247,242,0.9)",
            }}
          >
            {String(val).padStart(2, "0")}
          </span>
          <span
            className="font-label"
            style={{
              fontSize: "9px",
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              textShadow: "0 1px 3px rgba(250,247,242,0.98), 0 2px 14px rgba(250,247,242,1), 0 0 7px rgba(250,247,242,0.9)",
            }}
          >
            {label}
          </span>
        </div>
      ))}
    </motion.div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────
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

  // Format tanggal display
  const dateStr = weddingDate.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Dispatch "invitation-open" saat user interaksi pertama (untuk MusicPlayer)
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
      className="snap-section"
      ref={sectionRef}
      // Jangan beri overflow:hidden — FallingFlowers menggantung 40svh ke
      // section berikutnya (fade via mask), sama seperti pola seam overhang.
      style={{ background: "transparent" }}
    >
      {/* Painterly sakura scene — parallax background + framing arch */}
      <ParallaxScene
        fadeTop={0}
        layers={[
          { src: `${BASE}/CoverBg.webp`, depth: 0.03, priority: true, zIndex: 0 },
          { src: `${BASE}/CoverArch.webp`, depth: 0.07, priority: true, opacity: 0.97, zIndex: 1 },
          { src: `${BASE}/SakuraColumnL.webp`, depth: 0.08, priority: true, opacity: 0.8, zIndex: 1, box: { top: "-2%", left: "-13%", height: "102svh", enterY: 0 } },
          { src: `${BASE}/SakuraColumnR.webp`, depth: 0.08, priority: true, opacity: 0.8, zIndex: 1, box: { top: "-2%", right: "-13%", height: "102svh", enterY: 0 } },
          { src: `${BASE}/SakuraTopL.webp`, depth: 0.11, opacity: 0.9, zIndex: 2, box: { top: "-3%", left: "-5%", width: "40%" } },
          { src: `${BASE}/SakuraTopR.webp`, depth: 0.12, opacity: 0.9, zIndex: 2, box: { top: "-3%", right: "-5%", width: "40%" } },
          { src: `${BASE}/SakuraCornerL.webp`, depth: 0.13, opacity: 0.9, zIndex: 2, box: { bottom: "0%", left: "-7%", width: "44%" } },
          { src: `${BASE}/SakuraCornerR.webp`, depth: 0.14, opacity: 0.9, zIndex: 2, box: { bottom: "0%", right: "-7%", width: "44%" } },
        ]}
      />

      {/* Legibility scrim — soft cream glow lifts text off the florals */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            "radial-gradient(ellipse 78% 56% at 50% 47%, rgba(250,247,242,0.62) 0%, rgba(250,247,242,0.30) 45%, rgba(250,247,242,0) 72%)",
        }}
      />

      {/* Falling Flower Animation */}
      <FallingFlowers count={20} zIndex={1} />

      {/* Paper texture */}
      <div className="paper-overlay" />

      {/* Border frame tipis */}
      <div
        style={{
          position: "absolute",
          inset: "20px",
          border: "1px solid var(--border)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "24px",
          border: "1px solid var(--border)",
          opacity: 0.5,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Konten utama */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          // Top padding lowers the centered block (~half its value) so the
          // names sit below the arch instead of crowding it.
          padding: "clamp(48px, 10svh, 84px) 32px 0",
          gap: 0,
          width: "100%",
        }}
      >
        {/* Label atas */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.26em",
            textTransform: "uppercase",
            color: "var(--gold)",
            marginBottom: "24px",
            textShadow: "0 1px 3px rgba(250,247,242,0.98), 0 2px 14px rgba(250,247,242,1), 0 0 7px rgba(250,247,242,0.9)",
          }}
        >
          Undangan Pernikahan
        </motion.p>

        {/* Divider atas */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="copper-divider"
          style={{ marginBottom: "28px" }}
        />

        {/* Names Frame Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.45 }}
          style={{
            position: "relative",
            padding: "45px 30px",
            width: "100%",
            maxWidth: "310px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
          }}
        >
          {/* Nama mempelai pria */}
          <h1
            className="font-display"
            style={{
              fontSize: "clamp(34px, 9.5vw, 64px)",
              fontWeight: 400,
              lineHeight: 1.1,
              color: "var(--text)",
              letterSpacing: "-0.01em",
            }}
          >
            {groom.name}
          </h1>

          {/* Simbol "&" */}
          <p
            className="font-display"
            style={{
              fontSize: "clamp(18px, 4.5vw, 28px)",
              fontStyle: "italic",
              color: "var(--gold)",
              marginTop: "4px",
              marginBottom: "4px",
              letterSpacing: "0.05em",
            }}
          >
            &amp;
          </p>

          {/* Nama mempelai wanita */}
          <h1
            className="font-display"
            style={{
              fontSize: "clamp(34px, 9.5vw, 64px)",
              fontWeight: 400,
              lineHeight: 1.1,
              color: "var(--text)",
              letterSpacing: "-0.01em",
            }}
          >
            {bride.name}
          </h1>
        </motion.div>

        {/* Divider bawah nama */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="copper-divider"
          style={{ marginTop: "12px", marginBottom: "20px" }}
        />

        {/* Tanggal */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.1 }}
          className="font-body"
          style={{
            fontSize: "13px",
            fontStyle: "italic",
            color: "var(--text-muted)",
            letterSpacing: "0.04em",
            marginBottom: "32px",
          }}
        >
          {dateStr}
        </motion.p>

        {/* Countdown */}
        <Countdown targetDateString={weddingDateString} />

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 2.5, delay: 2.0, repeat: Infinity, ease: "easeInOut" }}
          style={{
            marginTop: "40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 1,
              height: 32,
              background: "linear-gradient(to bottom, var(--gold-dim), transparent)",
            }}
          />
          <span
            className="font-label"
            style={{
              fontSize: "9px",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "var(--text-dim)",
            }}
          >
            Gulir
          </span>
        </motion.div>
      </div>
    </section>
  );
}
