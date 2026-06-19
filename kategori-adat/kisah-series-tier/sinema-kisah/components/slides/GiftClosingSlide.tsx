"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { useInvitationConfig } from "@/components/RimbaConfigProvider";

export default function GiftClosingSlide() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-10%" });
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const { bankAccounts, couple } = useInvitationConfig();

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
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.8, ease: "easeOut" as const },
    }),
  };

  return (
    <div className="slide-page" style={{ justifyContent: "flex-start" }}>
      <div
        ref={ref}
        data-prevent-snap="true"
        className="overflow-y-auto"
        style={{ width: "100%", height: "100dvh", paddingBottom: "clamp(80px,15vh,120px)" }}
      >
        {/* ── Gift section ── */}
        <div
          style={{
            padding: "clamp(40px,8vh,64px) 28px clamp(32px,6vh,48px)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="font-label"
            style={{
              fontSize: 9,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--gold-dim)",
              marginBottom: 8,
            }}
          >
            Amplop Digital
          </motion.p>
          <motion.h2
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="font-display"
            style={{
              fontStyle: "italic",
              fontSize: "clamp(26px, 7vw, 36px)",
              color: "var(--gold)",
              marginBottom: 12,
            }}
          >
            Hadiah
          </motion.h2>
          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="font-body"
            style={{ fontStyle: "italic", fontSize: 13, color: "var(--text-dim)", lineHeight: 1.9, marginBottom: 24 }}
          >
            Doa dan kehadiran Anda adalah hadiah terbesar bagi kami.
          </motion.p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {bankAccounts.map((acc, i) => (
              <motion.div
                key={i}
                custom={i + 3}
                variants={fadeUp}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 18px",
                  border: "1px solid var(--border)",
                  background: "var(--surface-2)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <span
                    className="font-label"
                    style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)" }}
                  >
                    {acc.bank}
                  </span>
                  <span className="font-body" style={{ fontSize: 14, color: "var(--text)", letterSpacing: "0.05em" }}>
                    {acc.number}
                  </span>
                  <span className="font-label" style={{ fontSize: 10, color: "var(--text-dim)" }}>
                    a.n. {acc.name}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(acc.number, i)}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid var(--border)",
                    background: "transparent",
                    color: copiedIdx === i ? "var(--gold)" : "var(--text-dim)",
                    cursor: "pointer",
                    transition: "color 0.2s",
                  }}
                >
                  {copiedIdx === i ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Closing section ── */}
        <div
          style={{
            padding: "clamp(32px,6vh,48px) 28px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* Intersecting rings */}
          <div style={{ position: "relative", width: 160, height: 80, marginBottom: 32, flexShrink: 0 }}>
            <div
              style={{
                position: "absolute",
                width: 100,
                height: 100,
                borderRadius: "50%",
                border: "1px solid var(--border)",
                opacity: 0.4,
                top: "50%",
                left: "50%",
                transform: "translate(-60%, -50%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                width: 100,
                height: 100,
                borderRadius: "50%",
                border: "1px solid var(--border)",
                opacity: 0.4,
                top: "50%",
                left: "50%",
                transform: "translate(-40%, -50%)",
              }}
            />
          </div>

          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="font-label"
            style={{
              fontSize: 9,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--gold-dim)",
              marginBottom: 16,
            }}
          >
            Terima Kasih
          </motion.p>

          <motion.h2
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="font-display text-amber-gradient"
            style={{ fontSize: "clamp(36px, 12vw, 56px)", lineHeight: 1.1, marginBottom: 4 }}
          >
            {couple.groom.name}
          </motion.h2>

          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 4 }}
          >
            <div className="amber-divider" />
            <span className="font-display" style={{ fontStyle: "italic", color: "var(--gold-dim)", fontSize: 24 }}>
              &amp;
            </span>
            <div className="amber-divider" />
          </motion.div>

          <motion.h2
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="font-display text-amber-gradient"
            style={{ fontSize: "clamp(36px, 12vw, 56px)", lineHeight: 1.1, marginBottom: 24 }}
          >
            {couple.bride.name}
          </motion.h2>

          <motion.p
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="font-body"
            style={{
              fontStyle: "italic",
              color: "var(--text-muted)",
              fontSize: 13,
              lineHeight: 1.9,
              marginBottom: 8,
            }}
          >
            &ldquo;Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri.&rdquo;
          </motion.p>

          <motion.span
            custom={5}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="font-label"
            style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em" }}
          >
            — QS. Ar-Rum: 21
          </motion.span>

          <motion.div
            custom={6}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            style={{ marginTop: 20, marginBottom: 12 }}
          >
            <div className="amber-divider" />
          </motion.div>

          <motion.p
            custom={7}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="font-label"
            style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold-dim)" }}
          >
            {couple.hashtag}
          </motion.p>

          <motion.p
            custom={8}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="font-label"
            style={{ marginTop: 24, fontSize: 8, letterSpacing: "0.3em", color: "var(--text-dim)" }}
          >
            RIMBA DIGITAL · KISAH
          </motion.p>
        </div>
      </div>
    </div>
  );
}
