"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useInvitationConfig } from "@/components/RimbaConfigProvider";

export default function ClosingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-15%" });
  const { couple } = useInvitationConfig();

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 1, ease: "easeOut" as const },
    }),
  };

  return (
    <section id="closing" className="snap-section" style={{ background: "var(--bg)" }}>
      <div className="paper-overlay" />
      <span className="corner-ornament tl" />
      <span className="corner-ornament tr" />
      <span className="corner-ornament bl" />
      <span className="corner-ornament br" />

      {/* Decorative intersecting rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div
          style={{
            width: "min(340px, 72vw)",
            height: "min(340px, 72vw)",
            borderRadius: "50%",
            border: "1px solid var(--border)",
            opacity: 0.45,
            transform: "translateX(-14%)",
            flexShrink: 0,
          }}
        />
        <div
          style={{
            width: "min(340px, 72vw)",
            height: "min(340px, 72vw)",
            borderRadius: "50%",
            border: "1px solid var(--border)",
            opacity: 0.45,
            position: "absolute",
            transform: "translateX(14%)",
          }}
        />
      </div>

      <div
        ref={ref}
        className="relative z-10 flex flex-col items-center text-center w-full max-w-xs mx-auto px-6"
      >
        <motion.p
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="font-label"
          style={{
            fontSize: "9px",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--gold-dim)",
            marginBottom: "clamp(20px, 5vh, 36px)",
          }}
        >
          Terima Kasih
        </motion.p>

        <motion.h2
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="font-display text-copper-gradient leading-tight"
          style={{ fontSize: "clamp(48px, 14vw, 80px)", fontWeight: 400 }}
        >
          {couple.groom.name}
        </motion.h2>

        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex items-center gap-4 my-2"
        >
          <div className="copper-divider" />
          <span
            className="font-garamond"
            style={{ color: "var(--gold-dim)", fontSize: "clamp(18px, 5vw, 24px)", fontStyle: "italic" }}
          >
            &amp;
          </span>
          <div className="copper-divider" />
        </motion.div>

        <motion.h2
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="font-display text-copper-gradient leading-tight"
          style={{ fontSize: "clamp(48px, 14vw, 80px)", fontWeight: 400 }}
        >
          {couple.bride.name}
        </motion.h2>

        <motion.p
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="font-garamond"
          style={{
            color: "var(--text-muted)",
            fontStyle: "italic",
            fontSize: "clamp(13px, 3.5vw, 16px)",
            lineHeight: 1.9,
            marginTop: "clamp(16px, 4vh, 28px)",
            marginBottom: "clamp(16px, 4vh, 28px)",
          }}
        >
          &ldquo;Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya.&rdquo;
          <br />
          <span className="font-label" style={{ color: "var(--text-dim)", fontSize: "11px", fontStyle: "normal" }}>
            — QS. Ar-Rum: 21
          </span>
        </motion.p>

        <motion.div custom={5} variants={fadeUp} initial="hidden" animate={isInView ? "visible" : "hidden"}>
          <div className="copper-divider mx-auto" style={{ marginBottom: 16 }} />
        </motion.div>

        <motion.p
          custom={6}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="font-label"
          style={{ color: "var(--gold-dim)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase" }}
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
        <p className="font-label" style={{ color: "var(--text-dim)", fontSize: "9px", letterSpacing: "0.3em" }}>
          RIMBA DIGITAL · KISAH
        </p>
        <p className="font-label" style={{ color: "var(--text-dim)", fontSize: "9px", opacity: 0.5 }}>
          Deeply Rooted in Your Moments
        </p>
      </div>
    </section>
  );
}
