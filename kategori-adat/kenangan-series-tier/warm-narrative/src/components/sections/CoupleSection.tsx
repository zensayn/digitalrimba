"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useInvitationConfig } from "@/components/RimbaConfigProvider";

export default function CoupleSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-15%" });
  const { couple } = useInvitationConfig();

  const fadeUp = {
    hidden: { opacity: 0, y: 36 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.18, duration: 1, ease: "easeOut" as const },
    }),
  };

  const photoStyle = {
    width: "clamp(72px, 20vw, 96px)",
    height: "clamp(72px, 20vw, 96px)",
    borderRadius: "50%",
    border: "1px solid rgba(192,120,48,0.35)",
    flexShrink: 0 as const,
    background: "var(--surface-2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden" as const,
    marginBottom: "clamp(8px, 2vh, 14px)",
  };

  return (
    <section id="couple" className="snap-section" style={{ background: "var(--bg)" }}>
      <div className="paper-overlay" />

      {/* Italic watermark */}
      <div
        className="absolute font-display select-none pointer-events-none"
        style={{
          fontSize: "clamp(64px, 22vw, 120px)",
          fontWeight: 400,
          fontStyle: "italic",
          color: "rgba(192,120,48,0.03)",
          bottom: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          whiteSpace: "nowrap",
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        Mempelai
      </div>

      <div className="absolute top-0 left-0 right-0 copper-divider-full" />

      <div
        ref={ref}
        className="relative z-10 flex flex-col items-center text-center px-8 w-full max-w-sm mx-auto"
      >
        <motion.p
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="font-label"
          style={{
            color: "var(--gold-dim)",
            fontSize: "9px",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            marginBottom: "clamp(12px, 4vh, 28px)",
          }}
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
          style={{ marginBottom: "clamp(8px, 2.5vh, 20px)" }}
        >
          <div style={photoStyle}>
            <span
              className="font-display"
              style={{ color: "var(--gold-dim)", fontWeight: 400, fontSize: "clamp(20px, 5vw, 28px)" }}
            >
              {couple.groom.name[0]}
            </span>
          </div>
          <h2
            className="font-display"
            style={{
              color: "var(--gold)",
              fontWeight: 400,
              fontStyle: "italic",
              fontSize: "clamp(17px, 5vw, 22px)",
              marginBottom: 4,
            }}
          >
            {couple.groom.fullName}
          </h2>
          <p
            className="font-body"
            style={{
              color: "var(--text-muted)",
              fontSize: "clamp(11px, 2.8vw, 13px)",
              fontStyle: "italic",
              lineHeight: 1.6,
            }}
          >
            {couple.groom.parents}
          </p>
          <p
            className="font-label"
            style={{ color: "var(--gold-dim)", fontSize: "clamp(9px, 2.5vw, 11px)", letterSpacing: "0.08em", marginTop: 4 }}
          >
            {couple.groom.instagram}
          </p>
        </motion.div>

        {/* & separator */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex items-center gap-4"
          style={{ marginTop: "clamp(4px, 1.5vh, 10px)", marginBottom: "clamp(4px, 1.5vh, 10px)" }}
        >
          <div className="copper-divider" />
          <span
            className="font-garamond"
            style={{ color: "var(--gold)", fontSize: "clamp(20px, 5vw, 26px)", fontStyle: "italic" }}
          >
            &amp;
          </span>
          <div className="copper-divider" />
        </motion.div>

        {/* Bride */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col items-center"
          style={{ marginBottom: "clamp(12px, 3vh, 24px)" }}
        >
          <div style={photoStyle}>
            <span
              className="font-display"
              style={{ color: "var(--gold-dim)", fontWeight: 400, fontSize: "clamp(20px, 5vw, 28px)" }}
            >
              {couple.bride.name[0]}
            </span>
          </div>
          <h2
            className="font-display"
            style={{
              color: "var(--gold)",
              fontWeight: 400,
              fontStyle: "italic",
              fontSize: "clamp(17px, 5vw, 22px)",
              marginBottom: 4,
            }}
          >
            {couple.bride.fullName}
          </h2>
          <p
            className="font-body"
            style={{
              color: "var(--text-muted)",
              fontSize: "clamp(11px, 2.8vw, 13px)",
              fontStyle: "italic",
              lineHeight: 1.6,
            }}
          >
            {couple.bride.parents}
          </p>
          <p
            className="font-label"
            style={{ color: "var(--gold-dim)", fontSize: "clamp(9px, 2.5vw, 11px)", letterSpacing: "0.08em", marginTop: 4 }}
          >
            {couple.bride.instagram}
          </p>
        </motion.div>

        {/* Couple quote */}
        <motion.p
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="font-display"
          style={{
            color: "var(--text-muted)",
            fontWeight: 400,
            fontStyle: "italic",
            fontSize: "clamp(12px, 3.2vw, 15px)",
            lineHeight: 1.8,
          }}
        >
          {couple.quote}
        </motion.p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 copper-divider-full" />
    </section>
  );
}
