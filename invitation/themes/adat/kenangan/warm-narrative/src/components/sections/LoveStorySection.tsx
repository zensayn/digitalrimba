"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { InvitationConfig } from "@/lib/config-types";

const ROMAN = ["I", "II", "III", "IV", "V"];

export default function LoveStorySection({ loveStory }: { loveStory: InvitationConfig["loveStory"] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section
      id="lovestory"
      className="snap-section"
      style={{ background: "var(--surface)", justifyContent: "flex-start", minHeight: "auto" }}
    >
      <div className="paper-overlay" />

      {/* Italic watermark */}
      <div
        className="absolute font-display select-none pointer-events-none z-0"
        style={{ fontSize: "clamp(56px, 18vw, 100px)", fontWeight: 400, fontStyle: "italic", color: "rgba(192,120,48,0.025)", bottom: "8%", right: "-2%", letterSpacing: "-0.01em", lineHeight: 1, whiteSpace: "nowrap" }}
      >
        Kisah Kami
      </div>

      {/* Header */}
      <div
        ref={ref}
        className="w-full flex flex-col items-center flex-shrink-0 z-10"
        style={{ paddingTop: "clamp(28px, 6vh, 48px)", paddingBottom: "clamp(10px, 2vh, 16px)" }}
      >
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="font-label"
          style={{ fontSize: "9px", letterSpacing: "0.35em", textTransform: "uppercase", color: "var(--gold-dim)" }}
        >
          Kisah Kami
        </motion.p>
        <div className="copper-divider" style={{ marginTop: 8 }} />
      </div>

      {/* Vertical chapters */}
      <div className="w-full z-10" style={{ paddingBottom: "clamp(36px, 8vh, 60px)" }}>
        {loveStory.map((chapter, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-5%" }}
            transition={{ duration: 0.7 }}
            style={{
              padding: "clamp(20px, 5vh, 36px) clamp(28px, 8vw, 52px)",
              display: "flex",
              flexDirection: "column",
              gap: "clamp(10px, 2vh, 16px)",
            }}
          >
            {/* Photo */}
            <div className="relative flex-shrink-0" style={{ width: "100%", maxWidth: "clamp(220px, 70vw, 300px)" }}>
              <img
                src={`${process.env.NEXT_PUBLIC_THEMES_CDN}/adat/kenangan/warm-narrative/Sparkle.webp`}
                alt=""
                style={{ position: "absolute", width: "clamp(24px, 7vw, 32px)", height: "clamp(24px, 7vw, 32px)", top: "-12px", right: "-12px", zIndex: 10, opacity: 0.85, pointerEvents: "none" }}
              />
              <img
                src={`${process.env.NEXT_PUBLIC_THEMES_CDN}/adat/kenangan/warm-narrative/Sparkle.webp`}
                alt=""
                style={{ position: "absolute", width: "clamp(16px, 5vw, 22px)", height: "clamp(16px, 5vw, 22px)", bottom: "-8px", left: "-8px", zIndex: 10, opacity: 0.7, pointerEvents: "none" }}
              />
              <div style={{ width: "100%", aspectRatio: "4/3", border: "1px solid var(--border)", overflow: "hidden", position: "relative", boxShadow: "var(--shadow-warm)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={chapter.image}
                  alt={chapter.chapter}
                  style={{ width: "100%", height: "100%", objectFit: "cover", filter: "sepia(20%) contrast(1.05) brightness(0.97)", display: "block" }}
                />
                <div style={{ position: "absolute", inset: 0, background: "rgba(192,120,48,0.04)", pointerEvents: "none" }} />
              </div>
            </div>

            {/* Chapter number + year */}
            <div className="flex items-center gap-3" style={{ marginTop: "clamp(4px, 1vh, 8px)" }}>
              <span className="font-garamond" style={{ fontSize: "clamp(11px, 2.8vw, 14px)", fontStyle: "italic", color: "var(--gold)", letterSpacing: "0.15em" }}>
                {ROMAN[i] ?? String(i + 1)}
              </span>
              <div style={{ width: 28, height: 1, background: "rgba(192,120,48,0.35)" }} />
              <span className="font-label" style={{ fontSize: "clamp(10px, 2.5vw, 12px)", color: "var(--text-dim)", letterSpacing: "0.2em" }}>
                {chapter.year}
              </span>
            </div>

            {/* Chapter title */}
            <h2 className="font-display" style={{ fontSize: "clamp(26px, 8vw, 42px)", fontWeight: 400, fontStyle: "italic", color: "var(--text)", lineHeight: 1.1 }}>
              {chapter.chapter}
            </h2>

            {/* Copper ornamental divider */}
            <div className="flex items-center gap-2">
              <div style={{ width: 28, height: 1, background: "linear-gradient(90deg, transparent, var(--gold))", opacity: 0.45 }} />
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--gold)", opacity: 0.45 }} />
              <div style={{ width: 28, height: 1, background: "linear-gradient(90deg, var(--gold), transparent)", opacity: 0.45 }} />
            </div>

            {/* Description */}
            <p className="font-body" style={{ color: "var(--text-muted)", fontSize: "clamp(13px, 3.2vw, 15px)", fontStyle: "italic", fontWeight: 300, lineHeight: 1.85, maxWidth: "34ch" }}>
              &ldquo;{chapter.description}&rdquo;
            </p>

            {/* Separator between chapters */}
            {i < loveStory.length - 1 && (
              <div className="copper-divider-full" style={{ marginTop: "clamp(4px, 1.5vh, 12px)" }} />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
