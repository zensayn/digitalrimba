"use client";

// src/components/sections/CoverSection.tsx
// ─── Cover — Pintu Kelola ──────────────────────────────────────────────────────
// Visual: Latar parchment warm, nama besar Playfair Display, countdown elegan,
//         ornamen sudut Art Nouveau, motif garis tipis di tepian.

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useInvitationConfig } from "@/components/RimbaConfigProvider";

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

// ── Section ───────────────────────────────────────────────────────────────────
export default function CoverSection() {
  const config = useInvitationConfig();
  const { groom, bride } = config.couple;
  const weddingDate = new Date(config.weddingDate);
  const countdown = useCountdown(config.weddingDate);
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
      style={{ background: "var(--bg)", overflow: "hidden" }}
    >
      {/* Paper texture */}
      <div className="paper-overlay" />

      {/* Art Nouveau corner ornaments */}
      <span className="corner-ornament tl" />
      <span className="corner-ornament tr" />
      <span className="corner-ornament bl" />
      <span className="corner-ornament br" />

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
          padding: "0 32px",
          gap: 0,
        }}
      >
        {/* Label atas */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "10px",
            fontWeight: 500,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--gold)",
            marginBottom: "24px",
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

        {/* Nama mempelai pria */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="font-display"
          style={{
            fontSize: "clamp(42px, 11vw, 76px)",
            fontWeight: 400,
            lineHeight: 1.1,
            color: "var(--text)",
            letterSpacing: "-0.01em",
          }}
        >
          {groom.name}
        </motion.h1>

        {/* Simbol "&" */}
        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="font-garamond"
          style={{
            fontSize: "clamp(20px, 5vw, 32px)",
            fontStyle: "italic",
            color: "var(--gold)",
            marginTop: "4px",
            marginBottom: "4px",
            letterSpacing: "0.05em",
          }}
        >
          &amp;
        </motion.p>

        {/* Nama mempelai wanita */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85 }}
          className="font-display"
          style={{
            fontSize: "clamp(42px, 11vw, 76px)",
            fontWeight: 400,
            lineHeight: 1.1,
            color: "var(--text)",
            letterSpacing: "-0.01em",
          }}
        >
          {bride.name}
        </motion.h1>

        {/* Divider bawah nama */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="copper-divider"
          style={{ marginTop: "28px", marginBottom: "20px" }}
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
        {countdown !== null && (
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
                  }}
                >
                  {String(val).padStart(2, "0")}
                </span>
                <span
                  className="font-label"
                  style={{
                    fontSize: "9px",
                    fontWeight: 500,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "var(--text-dim)",
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </motion.div>
        )}

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
