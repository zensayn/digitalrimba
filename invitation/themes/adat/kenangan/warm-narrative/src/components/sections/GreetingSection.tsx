"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useInvitationConfig } from "@/components/shared/RimbaConfigProvider";

interface GreetingSectionProps {
  guestName?: string;
}

export default function GreetingSection({ guestName }: GreetingSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-15%" });
  const { couple } = useInvitationConfig();

  const fade = (delay: number) => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay, duration: 0.9, ease: "easeOut" as const },
    },
  });

  return (
    <section id="greeting" className="snap-section" style={{ background: "var(--surface)" }}>
      <div className="paper-overlay" />
      <span className="corner-ornament tl" />
      <span className="corner-ornament tr" />
      <span className="corner-ornament bl" />
      <span className="corner-ornament br" />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 45% at 50% 35%, rgba(192,120,48,0.06) 0%, transparent 70%)",
        }}
      />

      <div
        ref={ref}
        className="relative z-10 flex flex-col items-center text-center w-full max-w-xs mx-auto px-8"
      >
        <motion.p
          variants={fade(0)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="font-label"
          style={{
            color: "var(--gold-dim)",
            fontSize: "9px",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            marginBottom: "clamp(20px, 5vh, 36px)",
          }}
        >
          Undangan Pernikahan
        </motion.p>

        {/* Rangka Bunga Decoration */}
        <motion.img
          variants={fade(0.05)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          src="/images/RangkaBunga.webp"
          alt="Rangka Bunga"
          style={{
            width: "120px",
            height: "auto",
            objectFit: "contain",
            marginBottom: "8px",
            opacity: 0.85
          }}
        />

        {/* Bismillah */}
        <motion.div
          variants={fade(0.1)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col items-center"
          style={{ marginBottom: "clamp(16px, 4vh, 28px)" }}
        >
          <p
            className="font-garamond"
            style={{
              fontSize: "clamp(30px, 9vw, 46px)",
              color: "var(--gold)",
              lineHeight: 1.6,
              letterSpacing: "0.04em",
              fontStyle: "italic",
            }}
          >
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </p>
          <div className="copper-divider" style={{ marginTop: "clamp(10px, 2.5vh, 18px)", opacity: 0.6 }} />
        </motion.div>

        {/* Guest name wrapped in Letter envelope frame */}
        <motion.div
          variants={fade(0.25)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col items-center justify-center"
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "280px",
            minHeight: "150px",
            padding: "36px 20px",
            marginBottom: "clamp(16px, 4vh, 24px)",
          }}
        >
          <img
            src="/images/Letter.webp"
            alt="Surat Undangan"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              opacity: 0.95,
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <p
              className="font-label"
              style={{
                color: "var(--text-dim)",
                fontSize: "10px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: guestName ? 8 : 0,
              }}
            >
              Kepada Yth.
            </p>
            {guestName && (
              <p
                className="font-display"
                style={{
                  color: "var(--gold)",
                  fontSize: "clamp(18px, 5vw, 24px)",
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  lineHeight: 1.2,
                }}
              >
                {guestName}
              </p>
            )}
          </div>
        </motion.div>

        {/* Ornament divider */}
        <motion.div
          variants={fade(0.35)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="dot-divider"
          style={{ width: "100%", marginBottom: "clamp(16px, 4vh, 28px)" }}
        >
          <span
            className="font-garamond"
            style={{ color: "var(--gold-dim)", fontSize: "16px", opacity: 0.8, lineHeight: 1 }}
          >
            ✦
          </span>
        </motion.div>

        <motion.p
          variants={fade(0.45)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="font-body"
          style={{
            color: "var(--text-muted)",
            fontSize: "clamp(12px, 3vw, 14px)",
            fontStyle: "italic",
            lineHeight: 1.95,
            marginBottom: "clamp(20px, 5vh, 36px)",
          }}
        >
          Tanpa mengurangi rasa hormat, kami mengundang Anda untuk hadir dan berbagi kebahagiaan dalam hari istimewa kami.
        </motion.p>

        {/* Signature */}
        <motion.div
          variants={fade(0.55)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col items-center"
          style={{ gap: 8 }}
        >
          <div className="copper-divider" style={{ opacity: 0.4 }} />
          <p
            className="font-display"
            style={{
              color: "var(--gold)",
              fontSize: "clamp(18px, 5vw, 22px)",
              fontWeight: 400,
              fontStyle: "italic",
              letterSpacing: "0.04em",
            }}
          >
            {couple.groom.name} &amp; {couple.bride.name}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
