"use client";

import { useRef } from "react";
import { m as motion, useInView } from "framer-motion";
import ParallaxScene from "@/components/shared/ParallaxScene";
import { sceneFrame } from "@/components/shared/sceneFrame";
import type { InvitationConfig } from "@/lib/config-types";

const BASE = `${process.env.NEXT_PUBLIC_THEMES_CDN}/adat/kenangan/warm-narrative`;

interface ClosingSectionProps {
  couple: InvitationConfig["couple"];
  gallery: InvitationConfig["gallery"];
}

export default function ClosingSection({ couple }: ClosingSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.3 });

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 28 },
    animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 },
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const, delay },
  });

  return (
    <section
      ref={sectionRef}
      id="closing"
      className="snap-section"
      style={{ background: "transparent", height: "100svh", overflow: "hidden" }}
    >
      {/* Painterly sakura scene — grove background + overhanging canopy.
          Gift's garland hangs over our top (topFrame off); last section, so
          the bottom band stays contained. */}
      <ParallaxScene
        fadeBottom={0}
        layers={sceneFrame({ base: BASE, bg: `${BASE}/ClosingBg.webp`, arch: `${BASE}/ClosingCanopy.webp`, variant: 1, density: "full", topFrame: false })}
      />

      <div className="paper-overlay" />

      {/* Warm radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 90% 70% at 50% 50%, rgba(192,120,48,0.08) 0%, transparent 70%)",
          zIndex: 0,
        }}
      />

      {/* Legibility scrim — z 6: above the seam garland (z 5), below content
          (z 10). The closing scene is the densest in the theme; without this
          the quote drowns in the grove artwork. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 6, background: "radial-gradient(ellipse 84% 58% at 50% 44%, rgba(250,247,242,0.6) 0%, rgba(250,247,242,0.3) 48%, rgba(250,247,242,0) 74%)" }}
      />

      {/* Large italic watermark */}
      <div
        className="absolute font-display select-none pointer-events-none"
        style={{
          fontSize: "clamp(80px, 28vw, 160px)",
          fontWeight: 400,
          fontStyle: "italic",
          color: "rgba(192,120,48,0.055)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          whiteSpace: "nowrap",
          lineHeight: 1,
          zIndex: 0,
        }}
      >
        {couple.hashtag.replace("#", "")}
      </div>

      {/* Intersecting rings */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <div
          style={{
            width: "min(320px, 68vw)",
            height: "min(320px, 68vw)",
            borderRadius: "50%",
            border: "1px solid rgba(192,120,48,0.25)",
            transform: "translateX(-13%)",
            flexShrink: 0,
          }}
        />
        <div
          style={{
            width: "min(320px, 68vw)",
            height: "min(320px, 68vw)",
            borderRadius: "50%",
            border: "1px solid rgba(192,120,48,0.25)",
            position: "absolute",
            transform: "translateX(13%)",
          }}
        />
      </div>

      {/* Content */}
      <div
        className="relative z-10 flex flex-col items-center text-center w-full max-w-[400px] mx-auto px-8"
        style={{
          paddingTop: "clamp(64px, 13svh, 108px)",
          paddingBottom: "calc(160px + env(safe-area-inset-bottom))",
        }}
      >
        <motion.p
          {...anim(0)}
          className="font-label"
          style={{
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--gold-deep)",
            marginBottom: "clamp(20px, 5vh, 36px)",
            textShadow: "0 1px 5px rgba(250,247,242,0.95), 0 0 10px rgba(250,247,242,0.85)",
          }}
        >
          Terima Kasih
        </motion.p>

        {/* Groom name */}
        <motion.h2
          {...anim(0.1)}
          className="font-display text-copper-gradient leading-tight"
          style={{ fontSize: "clamp(48px, 14vw, 80px)", fontWeight: 400 }}
        >
          {couple.groom.name}
        </motion.h2>

        <motion.div {...anim(0.35)} className="flex items-center gap-4 my-2">
          <div className="copper-divider" />
          <span
            className="font-display"
            style={{ color: "var(--gold-dim)", fontSize: "clamp(18px, 5vw, 24px)", fontStyle: "italic" }}
          >
            &amp;
          </span>
          <div className="copper-divider" />
        </motion.div>

        {/* Bride name */}
        <motion.h2
          {...anim(0.5)}
          className="font-display text-copper-gradient leading-tight"
          style={{ fontSize: "clamp(48px, 14vw, 80px)", fontWeight: 400 }}
        >
          {couple.bride.name}
        </motion.h2>

        {/* Quote */}
        <motion.div
          {...anim(0.85)}
          style={{ marginTop: "clamp(16px, 4vh, 28px)", marginBottom: "clamp(16px, 4vh, 28px)" }}
        >
          <p
            className="font-display"
            style={{
              color: "var(--text-muted)",
              fontStyle: "italic",
              fontSize: "clamp(13px, 3.5vw, 15px)",
              lineHeight: 1.85,
              padding: "0 8px",
              textShadow: "0 1px 5px rgba(250,247,242,0.95), 0 0 10px rgba(250,247,242,0.85)",
            }}
          >
            &ldquo;Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya.&rdquo;
            <br />
            <span
              className="font-label"
              style={{ color: "var(--text)", fontSize: "12px", fontWeight: 500, fontStyle: "normal", display: "block", marginTop: "8px", textShadow: "0 1px 6px rgba(250,247,242,0.92), 0 0 3px rgba(250,247,242,0.85)" }}
            >
              — QS. Ar-Rum: 21
            </span>
          </p>
        </motion.div>

        <motion.div {...anim(1.0)}>
          <div className="copper-divider mx-auto" style={{ marginBottom: 16 }} />
        </motion.div>

        <motion.p
          {...anim(1.05)}
          className="font-label"
          style={{ color: "var(--gold)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", textShadow: "0 1px 6px rgba(250,247,242,0.95), 0 0 3px rgba(250,247,242,0.85)" }}
        >
          {couple.hashtag}
        </motion.p>
      </div>

      {/* Footer brand */}
      <div
        className="absolute left-0 right-0 flex flex-col items-center gap-1 z-10"
        style={{ bottom: "calc(32px + 72px + env(safe-area-inset-bottom))" }}
      >
        <div className="copper-divider-full" style={{ marginBottom: 12 }} />
        <p className="font-label" style={{ color: "var(--text)", fontSize: "10.5px", fontWeight: 500, letterSpacing: "0.3em", textShadow: "0 1px 4px rgba(250,247,242,1), 0 0 12px rgba(250,247,242,0.95), 0 0 24px rgba(250,247,242,0.85)" }}>
          RIMBA DIGITAL · KISAH
        </p>
        <p className="font-label" style={{ color: "var(--text-muted)", fontSize: "9.5px", letterSpacing: "0.06em", textShadow: "0 1px 4px rgba(250,247,242,1), 0 0 12px rgba(250,247,242,0.95), 0 0 24px rgba(250,247,242,0.85)" }}>
          Deeply Rooted in Your Moments
        </p>
      </div>

    </section>
  );
}
