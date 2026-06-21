"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useInvitationConfig } from "@/components/RimbaConfigProvider";
import type { InvitationConfig } from "@/lib/config-types";

type LoveStoryEntry = InvitationConfig["loveStory"][number];

const ROMAN = ["I", "II", "III", "IV", "V"];

// ── Individual story entry — has its own inView trigger ──────────────────────
function StoryEntry({ entry, index }: { entry: LoveStoryEntry; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: "-15%" });

  return (
    <div
      ref={ref}
      style={{
        height: "100dvh",
        scrollSnapAlign: "start",
        scrollSnapStop: "always",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Image — top 45dvh */}
      <div style={{ position: "relative", height: "45dvh", overflow: "hidden", flexShrink: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={entry.image}
          alt={entry.chapter}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "sepia(25%) contrast(1.08) brightness(0.82)",
          }}
        />
        {/* Roman numeral watermark */}
        <div
          className="font-display"
          style={{
            position: "absolute",
            bottom: 0,
            right: 12,
            fontSize: "clamp(90px, 28vw, 160px)",
            fontStyle: "italic",
            color: "var(--gold)",
            opacity: 0.18,
            lineHeight: 0.85,
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          {ROMAN[index] ?? String(index + 1)}
        </div>
        {/* Bottom fade into bg */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, var(--bg) 0%, rgba(14,12,10,0.2) 45%, transparent 100%)",
          }}
        />
      </div>

      {/* Text — fills remaining 55dvh */}
      <div
        style={{
          flex: 1,
          padding: "clamp(20px, 4vh, 32px) var(--gutter) var(--pb-safe)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="font-label"
          style={{ fontSize: 10, letterSpacing: "0.25em", color: "var(--gold-dim)", marginBottom: 8 }}
        >
          {entry.year}
        </motion.p>

        <motion.h3
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="font-display"
          style={{
            fontSize: "clamp(22px, 6vw, 30px)",
            fontStyle: "italic",
            color: "var(--text)",
            lineHeight: 1.2,
            marginBottom: 14,
          }}
        >
          {entry.chapter}
        </motion.h3>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="amber-divider"
          style={{ marginBottom: 14, transformOrigin: "left" }}
        />

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="font-body"
          style={{ fontStyle: "italic", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.85 }}
        >
          {entry.description}
        </motion.p>
      </div>
    </div>
  );
}

// ── Main slide ───────────────────────────────────────────────────────────────
export default function LoveStorySlide() {
  const { loveStory } = useInvitationConfig();

  return (
    <div className="slide-page" style={{ justifyContent: "flex-start" }}>
      <div
        data-prevent-snap="true"
        className="overflow-y-auto"
        style={{
          width: "100%",
          height: "100dvh",
          scrollSnapType: "y mandatory",
        }}
      >
        {/* ── Intro section ── */}
        <div
          style={{
            height: "100dvh",
            scrollSnapAlign: "start",
            scrollSnapStop: "always",
            flexShrink: 0,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 var(--gutter)",
            overflow: "hidden",
          }}
        >
          {/* Large faded chapter III numeral */}
          <div
            className="font-display"
            style={{
              position: "absolute",
              right: -20,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "clamp(140px, 45vw, 220px)",
              fontStyle: "italic",
              color: "var(--gold)",
              opacity: 0.05,
              lineHeight: 1,
              userSelect: "none",
              pointerEvents: "none",
            }}
          >
            III
          </div>

          <p
            className="font-label"
            style={{
              fontSize: 9,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "var(--gold-dim)",
              marginBottom: 14,
            }}
          >
            Perjalanan Kami
          </p>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(40px, 12vw, 64px)",
              fontStyle: "italic",
              color: "var(--gold)",
              lineHeight: 1.05,
              marginBottom: 20,
            }}
          >
            Kisah Kami
          </h2>
          <div className="amber-divider" style={{ marginBottom: 20 }} />
          <p
            className="font-body"
            style={{ fontStyle: "italic", fontSize: 14, color: "var(--text-dim)", lineHeight: 1.8, maxWidth: 260 }}
          >
            Setiap pertemuan punya kisahnya sendiri.
          </p>

          {/* Scroll hint */}
          <p
            className="font-label"
            style={{
              position: "absolute",
              bottom: "calc(var(--pb-safe) - 60px)",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: 9,
              color: "var(--text-dim)",
              letterSpacing: "0.2em",
              animation: "pulse-hint 3s ease-in-out infinite",
              whiteSpace: "nowrap",
            }}
          >
            geser ↓
          </p>
        </div>

        {/* ── Story entries ── */}
        {loveStory.map((entry, i) => (
          <StoryEntry key={i} entry={entry} index={i} />
        ))}
      </div>
    </div>
  );
}
