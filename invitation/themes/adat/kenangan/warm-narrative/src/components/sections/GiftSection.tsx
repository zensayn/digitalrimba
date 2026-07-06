"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Copy, Check } from "lucide-react";
import ParallaxScene from "@/components/shared/ParallaxScene";
import { sceneFrame } from "@/components/shared/sceneFrame";
import type { InvitationConfig } from "@/lib/config-types";

const BASE = `${process.env.NEXT_PUBLIC_THEMES_CDN}/adat/kenangan/warm-narrative`;

export default function GiftSection({ bankAccounts }: { bankAccounts: InvitationConfig["bankAccounts"] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-15%" });
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = (text: string, idx: number) => {
    const clean = text.replace(/\s/g, "");
    if (navigator.clipboard) {
      navigator.clipboard.writeText(clean);
    } else {
      const el = document.createElement("textarea");
      el.value = clean;
      el.style.cssText = "position:fixed;opacity:0;pointer-events:none";
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.18, duration: 0.9, ease: "easeOut" as const },
    }),
  };

  return (
    <section id="gift" className="snap-section" style={{ background: "transparent" }}>
      {/* RSVP's overhang corners cover our top (topFrame off — the old drape
          doubled up with it); our light band overhangs into Closing. */}
      <ParallaxScene
        layers={sceneFrame({ base: BASE, bg: `${BASE}/GiftBg.webp`, variant: 0, density: "light", topFrame: false, seam: "overhang" })}
      />
      <div className="paper-overlay" />

      {/* Watermark */}
      <div
        className="absolute font-display select-none pointer-events-none"
        style={{
          fontSize: "clamp(60px, 20vw, 110px)",
          fontWeight: 400,
          fontStyle: "italic",
          color: "rgba(192,120,48,0.025)",
          bottom: "6%",
          left: "50%",
          transform: "translateX(-50%)",
          whiteSpace: "nowrap",
          lineHeight: 1,
        }}
      >
        Hadiah
      </div>

      <div
        ref={ref}
        className="relative z-10 flex flex-col items-center text-center w-full max-w-[400px] mx-auto px-8"
      >
        <motion.p
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="font-label"
          style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--gold-deep)", marginBottom: 8, textShadow: "0 1px 5px rgba(250,247,242,0.95), 0 0 10px rgba(250,247,242,0.85)" }}
        >
          Amplop Digital
        </motion.p>

        <motion.h2
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="font-display"
          style={{ fontSize: "clamp(32px, 9vw, 48px)", fontWeight: 400, fontStyle: "italic", color: "var(--gold)", marginBottom: 12 }}
        >
          Hadiah
        </motion.h2>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="font-body"
          style={{
            color: "var(--text-muted)",
            fontSize: "clamp(12px, 3.1vw, 14px)",
            fontStyle: "italic",
            lineHeight: 1.9,
            marginBottom: "clamp(20px, 5vh, 36px)",
            textShadow: "0 1px 5px rgba(250,247,242,0.95), 0 0 10px rgba(250,247,242,0.85)",
          }}
        >
          Doa dan kehadiran Anda adalah hadiah terbesar bagi kami.
          <br />
          Namun jika Anda ingin memberikan hadiah, berikut rekening kami.
        </motion.p>

        {/* Bank cards */}
        <div className="flex flex-col gap-4 w-full">
          {bankAccounts.map((acc, i) => (
            <motion.div
              key={i}
              custom={i + 3}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="flex items-center justify-between"
              style={{
                padding: "18px 20px",
                border: "1px solid var(--border)",
                background: "var(--bg)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div className="flex flex-col items-start gap-1">
                <span
                  className="font-label"
                  style={{ color: "var(--gold)", fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase" }}
                >
                  {acc.bank}
                </span>
                <span className="font-body" style={{ color: "var(--text)", fontSize: "13px" }}>
                  {acc.number}
                </span>
                <span className="font-label" style={{ color: "var(--text-dim)", fontSize: "11px" }}>
                  a.n. {acc.name}
                </span>
              </div>
              <button
                onClick={() => handleCopy(acc.number, i)}
                className="flex items-center gap-1 transition-all duration-300 font-label"
                style={{
                  padding: "8px 12px",
                  border: "1px solid var(--border)",
                  color: copiedIdx === i ? "var(--gold)" : "var(--text-dim)",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "10px",
                  letterSpacing: "0.1em",
                }}
              >
                {copiedIdx === i ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
