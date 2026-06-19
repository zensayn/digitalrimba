"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useInvitationConfig } from "@/components/RimbaConfigProvider";

interface GreetingSlideProps {
  guestName?: string;
}

export default function GreetingSlide({ guestName }: GreetingSlideProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-10%" });
  const { couple } = useInvitationConfig();

  const letters = guestName ? guestName.split("") : [];

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.7, ease: "easeOut" as const },
    }),
  };

  return (
    <div className="slide-page" style={{ background: "var(--bg)" }}>
      <div
        ref={ref}
        className="relative z-10 flex flex-col items-center text-center"
        style={{ maxWidth: 300, padding: "0 24px", gap: "clamp(16px, 3vh, 24px)", display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        {/* Bismillah */}
        <motion.p
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="font-display"
          style={{ fontSize: 22, fontStyle: "italic", color: "var(--gold)", textAlign: "center" }}
        >
          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
        </motion.p>

        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div className="amber-divider" />
        </motion.div>

        {/* Body */}
        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="font-body"
          style={{
            fontStyle: "italic",
            fontSize: "clamp(12px, 3vw, 14px)",
            color: "var(--text-muted)",
            lineHeight: 1.9,
            textAlign: "center",
          }}
        >
          Dengan penuh kebahagiaan dan rasa syukur kepada Allah SWT, kami mengundang Anda untuk turut merayakan hari istimewa kami.
        </motion.p>

        {/* Guest name — letter by letter */}
        {guestName && (
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }} className="font-display">
            {letters.map((letter, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  visible: (idx: number) => ({
                    opacity: 1,
                    y: 0,
                    transition: { delay: 0.4 + idx * 0.04, duration: 0.5 },
                  }),
                }}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                style={{
                  fontSize: "clamp(20px, 6vw, 28px)",
                  color: "var(--gold)",
                  display: "inline-block",
                  width: letter === " " ? "0.3em" : "auto",
                }}
              >
                {letter === " " ? " " : letter}
              </motion.span>
            ))}
          </div>
        )}

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div className="amber-divider" />
        </motion.div>

        {/* Signature */}
        <motion.p
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="font-display"
          style={{ fontStyle: "italic", fontSize: 16, color: "var(--text-dim)", textAlign: "center" }}
        >
          — {couple.groom.name} &amp; {couple.bride.name}
        </motion.p>
      </div>
    </div>
  );
}
