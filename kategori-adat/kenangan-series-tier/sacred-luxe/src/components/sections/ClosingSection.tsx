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
    <section id="closing" className="snap-section" style={{ background: "var(--surface)" }}>
      <div className="noise-overlay" />

      {/* Decorative rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div
          className="rounded-full border opacity-5"
          style={{ width: "min(500px, 85vw)", height: "min(500px, 85vw)", borderColor: "var(--gold)" }}
        />
      </div>

      <div
        ref={ref}
        className="relative z-10 flex flex-col items-center text-center w-full max-w-xs mx-auto px-6"
      >
        {/* Label */}
        <motion.p
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-xs tracking-[0.3em] uppercase mb-8"
          style={{ color: "var(--gold-dim)" }}
        >
          Terima Kasih
        </motion.p>

        {/* Names */}
        <motion.h2
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="font-display text-gold-gradient mb-2 leading-tight"
          style={{ fontSize: "clamp(48px, 14vw, 80px)", fontWeight: 300 }}
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
          <div className="gold-divider" />
          <span className="font-display italic text-xl" style={{ color: "var(--gold-dim)" }}>&amp;</span>
          <div className="gold-divider" />
        </motion.div>

        <motion.h2
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="font-display text-gold-gradient mb-8 leading-tight"
          style={{ fontSize: "clamp(48px, 14vw, 80px)", fontWeight: 300 }}
        >
          {couple.bride.name}
        </motion.h2>

        {/* Quote */}
        <motion.p
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="font-garamond italic text-base leading-relaxed mb-8"
          style={{ color: "var(--text-muted)", lineHeight: 1.9 }}
        >
          &ldquo;Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya.&rdquo;
          <br />
          <span style={{ color: "var(--text-dim)", fontSize: "12px" }}>— QS. Ar-Rum: 21</span>
        </motion.p>

        <motion.div
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="gold-divider mx-auto mb-6"
        />

        {/* Hashtag */}
        <motion.p
          custom={6}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-xs tracking-widest"
          style={{ color: "var(--gold-dim)", letterSpacing: "0.2em" }}
        >
          {couple.hashtag}
        </motion.p>
      </div>

      {/* Footer brand */}
      <div className="absolute left-0 right-0 flex flex-col items-center gap-1 z-10" style={{ bottom: "calc(32px + 72px + env(safe-area-inset-bottom))" }}>
        <div className="gold-divider-full mb-4" />
        <p className="text-xs tracking-widest" style={{ color: "var(--text-dim)", fontSize: "9px", letterSpacing: "0.3em" }}>
          RIMBA DIGITAL · KENANGAN
        </p>
        <p className="text-xs" style={{ color: "var(--text-dim)", fontSize: "9px", opacity: 0.5 }}>
          Deeply Rooted in Your Moments
        </p>
      </div>
    </section>
  );
}
