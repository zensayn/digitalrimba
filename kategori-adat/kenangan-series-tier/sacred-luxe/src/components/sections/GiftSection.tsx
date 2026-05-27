"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { bankAccounts } from "@/data/invitation";

export default function GiftSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-15%" });
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = (text: string, idx: number) => {
    const clean = text.replace(/\s/g, "");
    if (navigator.clipboard) {
      navigator.clipboard.writeText(clean);
    } else {
      // Fallback untuk HTTP (non-localhost)
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
    <section id="gift" className="snap-section" style={{ background: "var(--bg)" }}>
      <div className="noise-overlay" />
      <div className="vignette" />

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
          className="text-xs tracking-[0.3em] uppercase mb-2"
          style={{ color: "var(--gold-dim)" }}
        >
          Amplop Digital
        </motion.p>

        <motion.h2
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="font-display mb-3"
          style={{ fontSize: "clamp(32px, 9vw, 48px)", fontWeight: 300, color: "var(--gold-light)" }}
        >
          Hadiah
        </motion.h2>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-xs font-light leading-relaxed mb-8"
          style={{ color: "var(--text-dim)", lineHeight: 1.9 }}
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
              className="flex items-center justify-between px-5 py-4"
              style={{
                border: "1px solid var(--border)",
                background: "var(--surface)",
                borderRadius: "2px",
              }}
            >
              <div className="flex flex-col items-start gap-1">
                <span
                  className="text-xs tracking-widest uppercase"
                  style={{ color: "var(--gold)", fontSize: "9px", letterSpacing: "0.2em" }}
                >
                  {acc.bank}
                </span>
                <span className="text-sm font-light" style={{ color: "var(--text)" }}>
                  {acc.number}
                </span>
                <span className="text-xs font-light" style={{ color: "var(--text-dim)" }}>
                  a.n. {acc.name}
                </span>
              </div>
              <button
                id={`copy-btn-${i}`}
                onClick={() => handleCopy(acc.number, i)}
                className="flex items-center gap-1 px-3 py-2 transition-all duration-300"
                style={{
                  border: "1px solid var(--border)",
                  color: copiedIdx === i ? "var(--gold)" : "var(--text-dim)",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "10px",
                  letterSpacing: "0.1em",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {copiedIdx === i ? (
                  <Check size={12} />
                ) : (
                  <Copy size={12} />
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
