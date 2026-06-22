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
      <div className="noise-overlay" />

      {/* Radial glow behind bismillah */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 45% at 50% 32%, rgba(201,168,76,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Corner ornaments */}
      {([
        ["top-5 left-5",    "M0 24 L0 0 L24 0",   1],
        ["top-5 right-5",   "M24 24 L24 0 L0 0",  1],
        ["bottom-5 left-5", "M0 0 L0 24 L24 24",  1],
        ["bottom-5 right-5","M24 0 L24 24 L0 24", 1],
      ] as const).map(([pos, d, _], i) => (
        <svg
          key={i}
          className={`absolute ${pos} pointer-events-none z-10`}
          width="24" height="24" viewBox="0 0 24 24" fill="none"
        >
          <path d={d} stroke="var(--gold)" strokeWidth="0.8" opacity="0.3" />
        </svg>
      ))}

      <div
        ref={ref}
        className="relative z-10 flex flex-col items-center text-center w-full max-w-xs mx-auto px-8"
        style={{ gap: 0 }}
      >
        {/* Label */}
        <motion.p
          variants={fade(0)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
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

        {/* Bismillah — hero */}
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
              fontSize: "clamp(32px, 10vw, 48px)",
              color: "var(--gold-light)",
              lineHeight: 1.6,
              textShadow: "0 0 40px rgba(201,168,76,0.25), 0 0 80px rgba(201,168,76,0.1)",
              letterSpacing: "0.04em",
            }}
          >
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </p>

          {/* Thin line below bismillah */}
          <div
            style={{
              width: "clamp(48px, 20vw, 80px)",
              height: "1px",
              marginTop: "clamp(10px, 2.5vh, 18px)",
              background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
              opacity: 0.5,
            }}
          />
        </motion.div>

        {/* Kepada + Guest name */}
        <motion.div
          variants={fade(0.25)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col items-center"
          style={{ marginBottom: "clamp(16px, 4vh, 28px)" }}
        >
          <p
            style={{
              color: "var(--text-dim)",
              fontSize: "10px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontFamily: "Inter, sans-serif",
              fontWeight: 300,
              marginBottom: guestName ? 10 : 0,
            }}
          >
            Kepada Yth.
          </p>

          {guestName && (
            <p
              className="font-display"
              style={{
                color: "var(--gold-light)",
                fontSize: "clamp(22px, 6vw, 30px)",
                fontWeight: 400,
                letterSpacing: "0.02em",
                lineHeight: 1.2,
              }}
            >
              {guestName}
            </p>
          )}
        </motion.div>

        {/* Divider with diamond */}
        <motion.div
          variants={fade(0.35)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex items-center gap-3"
          style={{ marginBottom: "clamp(16px, 4vh, 28px)" }}
        >
          <div style={{ width: "clamp(32px, 10vw, 56px)", height: "1px", background: "linear-gradient(to right, transparent, rgba(201,168,76,0.4))" }} />
          <svg width="8" height="8" viewBox="0 0 8 8"><path d="M4 0 L8 4 L4 8 L0 4 Z" fill="var(--gold)" opacity="0.5"/></svg>
          <div style={{ width: "clamp(32px, 10vw, 56px)", height: "1px", background: "linear-gradient(to left, transparent, rgba(201,168,76,0.4))" }} />
        </motion.div>

        {/* Body text */}
        <motion.p
          variants={fade(0.45)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          style={{
            color: "var(--text-muted)",
            fontSize: "clamp(12px, 3vw, 13px)",
            fontFamily: "Inter, sans-serif",
            fontWeight: 300,
            lineHeight: 1.95,
            marginBottom: "clamp(20px, 5vh, 36px)",
          }}
        >
          Tanpa mengurangi rasa hormat, kami mengundang Anda untuk hadir dan berbagi kebahagiaan dalam acara pernikahan kami.
        </motion.p>

        {/* Signature */}
        <motion.div
          variants={fade(0.55)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col items-center"
          style={{ gap: 8 }}
        >
          <div style={{ width: 40, height: "1px", background: "linear-gradient(90deg, transparent, var(--gold), transparent)", opacity: 0.4 }} />
          <p
            className="font-display italic"
            style={{
              color: "var(--gold)",
              fontSize: "clamp(18px, 5vw, 22px)",
              fontWeight: 300,
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
