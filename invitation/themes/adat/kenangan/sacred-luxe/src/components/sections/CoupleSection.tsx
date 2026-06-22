"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useInvitationConfig } from "@/components/shared/RimbaConfigProvider";

export default function CoupleSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-15%" });
  const { couple } = useInvitationConfig();

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.18, duration: 1, ease: "easeOut" as const },
    }),
  };

  const photoStyle = {
    width: "clamp(72px, 20vw, 100px)",
    height: "clamp(72px, 20vw, 100px)",
    borderRadius: "50%",
    border: "1px solid rgba(201,168,76,0.4)",
    boxShadow: "0 0 30px rgba(201,168,76,0.1)",
    flexShrink: 0,
  };

  return (
    <section id="couple" className="snap-section" style={{ background: "var(--bg)" }}>
      <div className="noise-overlay" />
      <div className="vignette" />

      {/* Top gold line */}
      <div className="absolute top-0 left-0 right-0 gold-divider-full" />

      <div
        ref={ref}
        className="relative z-10 flex flex-col items-center text-center px-8 w-full max-w-sm mx-auto"
      >
        {/* Section label */}
        <motion.p
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-xs tracking-[0.3em] uppercase"
          style={{ color: "var(--gold-dim)", marginBottom: "clamp(12px, 4vh, 28px)" }}
        >
          Mempelai
        </motion.p>

        {/* Groom */}
        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col items-center"
          style={{ marginBottom: "clamp(8px, 2.5vh, 24px)" }}
        >
          <div
            className="relative overflow-hidden flex items-center justify-center"
            style={{ ...photoStyle, marginBottom: "clamp(8px, 2vh, 16px)", background: "var(--surface-2)" }}
          >
            <span className="font-display text-3xl" style={{ color: "var(--gold-dim)", fontWeight: 300 }}>P</span>
          </div>
          <h2
            className="font-display mb-1"
            style={{ color: "var(--gold-light)", fontWeight: 400, fontSize: "clamp(16px, 5vw, 22px)" }}
          >
            {couple.groom.fullName}
          </h2>
          <p
            className="font-light leading-relaxed"
            style={{ color: "var(--text-dim)", letterSpacing: "0.04em", fontSize: "clamp(10px, 2.5vw, 12px)" }}
          >
            {couple.groom.parents}
          </p>
          <p
            className="font-light"
            style={{ color: "var(--gold-dim)", fontSize: "clamp(9px, 2.5vw, 11px)", letterSpacing: "0.08em", marginTop: 4 }}
          >
            {couple.groom.instagram}
          </p>
        </motion.div>

        {/* Separator */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex items-center gap-4"
          style={{ marginTop: "clamp(4px, 1.5vh, 12px)", marginBottom: "clamp(4px, 1.5vh, 12px)" }}
        >
          <div className="gold-divider" />
          <span className="font-display italic text-xl" style={{ color: "var(--gold)" }}>&amp;</span>
          <div className="gold-divider" />
        </motion.div>

        {/* Bride */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col items-center"
          style={{ marginBottom: "clamp(12px, 3vh, 28px)" }}
        >
          <div
            className="relative overflow-hidden flex items-center justify-center"
            style={{ ...photoStyle, marginBottom: "clamp(8px, 2vh, 16px)", background: "var(--surface-2)" }}
          >
            <span className="font-display text-3xl" style={{ color: "var(--gold-dim)", fontWeight: 300 }}>R</span>
          </div>
          <h2
            className="font-display mb-1"
            style={{ color: "var(--gold-light)", fontWeight: 400, fontSize: "clamp(16px, 5vw, 22px)" }}
          >
            {couple.bride.fullName}
          </h2>
          <p
            className="font-light leading-relaxed"
            style={{ color: "var(--text-dim)", letterSpacing: "0.04em", fontSize: "clamp(10px, 2.5vw, 12px)" }}
          >
            {couple.bride.parents}
          </p>
          <p
            className="font-light"
            style={{ color: "var(--gold-dim)", fontSize: "clamp(9px, 2.5vw, 11px)", letterSpacing: "0.08em", marginTop: 4 }}
          >
            {couple.bride.instagram}
          </p>
        </motion.div>

        {/* Quote */}
        <motion.p
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="font-display italic"
          style={{ color: "var(--text-muted)", fontWeight: 300, fontSize: "clamp(13px, 3.5vw, 16px)" }}
        >
          &ldquo;{couple.quote}&rdquo;
        </motion.p>
      </div>

      {/* Bottom gold line */}
      <div className="absolute bottom-0 left-0 right-0 gold-divider-full" />
    </section>
  );
}
