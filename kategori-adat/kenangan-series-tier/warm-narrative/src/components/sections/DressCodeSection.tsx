"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useInvitationConfig } from "@/components/RimbaConfigProvider";

export default function DressCodeSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-15%" });
  const { dressCode } = useInvitationConfig();

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    }),
  };

  return (
    <section id="dresscode" className="snap-section" style={{ background: "var(--surface)" }}>
      <div className="paper-overlay" />

      {/* Watermark */}
      <div
        className="absolute font-display select-none pointer-events-none z-0"
        style={{
          fontSize: "clamp(60px, 20vw, 120px)",
          fontWeight: 400,
          color: "rgba(192,120,48,0.025)",
          top: "6%",
          left: "50%",
          transform: "translateX(-50%)",
          letterSpacing: "0.15em",
          whiteSpace: "nowrap",
          lineHeight: 1,
          textTransform: "uppercase",
        }}
      >
        BUSANA
      </div>

      <div
        ref={ref}
        className="relative z-10 flex flex-col items-center text-center px-8 w-full max-w-sm mx-auto"
        style={{ gap: "clamp(10px, 2.5vh, 20px)" }}
      >
        <motion.p
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="font-label"
          style={{ fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--gold-dim)" }}
        >
          Dress Code
        </motion.p>

        <motion.h2
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="font-display"
          style={{
            fontSize: "clamp(26px, 7.5vw, 40px)",
            fontWeight: 400,
            fontStyle: "italic",
            color: "var(--gold)",
            lineHeight: 1.1,
          }}
        >
          {dressCode.theme}
        </motion.h2>

        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="copper-divider mx-auto"
        />

        <motion.p
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="font-body"
          style={{
            color: "var(--text-muted)",
            fontSize: "clamp(12px, 3vw, 13px)",
            fontStyle: "italic",
            lineHeight: 1.85,
            maxWidth: "32ch",
          }}
        >
          {dressCode.description}
        </motion.p>

        {/* Color swatches */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-wrap justify-center"
          style={{ gap: "clamp(12px, 4vw, 20px)", marginTop: "clamp(4px, 1.5vh, 12px)" }}
        >
          {dressCode.colors.map((color) => (
            <div key={color.hex} className="flex flex-col items-center" style={{ gap: 6 }}>
              <div
                style={{
                  width: "clamp(34px, 9vw, 46px)",
                  height: "clamp(34px, 9vw, 46px)",
                  borderRadius: "50%",
                  background: color.hex,
                  border: "1px solid rgba(192,120,48,0.2)",
                  boxShadow: `0 4px 16px ${color.hex}40`,
                  flexShrink: 0,
                }}
              />
              <span
                className="font-label"
                style={{ fontSize: "clamp(8px, 2vw, 9px)", color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase" }}
              >
                {color.name}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Avoid */}
        <motion.div
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col items-center"
          style={{ gap: 8, marginTop: "clamp(4px, 1vh, 8px)" }}
        >
          <p
            className="font-label"
            style={{ fontSize: "9px", color: "var(--text-dim)", letterSpacing: "0.25em", textTransform: "uppercase" }}
          >
            Hindari
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            {dressCode.avoid.map((item) => (
              <span
                key={item}
                className="font-label"
                style={{
                  fontSize: "clamp(9px, 2.5vw, 11px)",
                  color: "var(--text-dim)",
                  padding: "4px 12px",
                  border: "1px solid var(--border)",
                  letterSpacing: "0.05em",
                  textDecoration: "line-through",
                  textDecorationColor: "rgba(192,120,48,0.35)",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 copper-divider-full" />
    </section>
  );
}
