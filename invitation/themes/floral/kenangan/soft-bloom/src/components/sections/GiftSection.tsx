"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Copy, Check, Gift } from "lucide-react";
import SectionDecor from "@/components/shared/SectionDecor";
import FloralTitle from "@/components/shared/FloralTitle";
import TopFrame from "@/components/shared/TopFrame";
import SceneBackground from "@/components/shared/SceneBackground";
import type { InvitationConfig } from "@/lib/config-types";

export default function GiftSection({ bankAccounts }: { bankAccounts: InvitationConfig["bankAccounts"] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-15%" });
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const showCopied = (idx: number) => {
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleCopy = (text: string, idx: number) => {
    const clean = text.replace(/\s/g, "");
    if (navigator.clipboard) {
      // Only show the checkmark once the async write actually succeeded;
      // fall back to the textarea trick when it's rejected (permissions).
      navigator.clipboard
        .writeText(clean)
        .then(() => showCopied(idx))
        .catch(() => {
          if (legacyCopy(clean)) showCopied(idx);
        });
      return;
    }
    if (legacyCopy(clean)) showCopied(idx);
  };

  const legacyCopy = (value: string): boolean => {
    const el = document.createElement("textarea");
    el.value = value;
    el.style.cssText = "position:fixed;opacity:0;pointer-events:none";
    document.body.appendChild(el);
    el.focus();
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  };

  // Reveal saat scroll dinonaktifkan — konten tampil langsung.
  const fadeUp = {
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="gift" className="snap-section flow-section reveal-scope" style={{ paddingTop: "clamp(130px, 20vh, 170px)" }}>
      <SceneBackground file="LatarDaun.webp" scrim={0.55} edgeFade />
      <TopFrame maxWidth={560} opacity={0.85} zIndex={1} />
      <SectionDecor corners={["bl", "br"]} size="clamp(120px, 32vw, 220px)" opacity={0.88} />

      <div ref={ref} className="relative z-10 flex flex-col items-center text-center w-full max-w-sm mx-auto px-7">
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          style={{ width: 66, height: 66, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", background: "rgba(255,255,255,0.6)", color: "var(--accent)", marginBottom: 16 }}
        >
          <Gift size={28} strokeWidth={1.5} />
        </motion.div>

        <motion.p
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="type-eyebrow"
          style={{ marginBottom: 8 }}
        >
          Amplop Digital
        </motion.p>

        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          style={{ marginBottom: 12 }}
        >
          <FloralTitle serif>Tanda Kasih</FloralTitle>
        </motion.div>

        <motion.p
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="font-body"
          style={{ color: "var(--text-muted)", fontSize: "clamp(14px, 3.6vw, 17px)", lineHeight: 1.85, fontWeight: 300, marginBottom: "clamp(24px, 5.5vh, 42px)" }}
        >
          Doa dan kehadiran Anda adalah hadiah terindah bagi kami. Namun bila ingin
          memberi tanda kasih, berikut rekening kami.
        </motion.p>

        {/* Bank cards */}
        <div className="flex flex-col gap-4 w-full">
          {bankAccounts.map((acc, i) => (
            <motion.div
              key={i}
              custom={i + 4}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="flex items-center justify-between"
              style={{ padding: "22px 24px", borderRadius: 5, border: "1px solid var(--border)", background: "var(--bg)", boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex flex-col items-start gap-1">
                <span className="type-label" style={{ color: "var(--accent)" }}>{acc.bank}</span>
                <span className="font-body" style={{ color: "var(--text)", fontSize: "17px", letterSpacing: "0.035em" }}>{acc.number}</span>
                <span className="type-caption">a.n. {acc.name}</span>
              </div>
              <button
                onClick={() => handleCopy(acc.number, i)}
                aria-label="Salin nomor rekening"
                className="flex items-center gap-1 transition-all duration-300"
                style={{ padding: "11px 13px", borderRadius: 4, border: "1px solid var(--border)", color: copiedIdx === i ? "var(--accent)" : "var(--text-muted)", background: "transparent", cursor: "pointer" }}
              >
                {copiedIdx === i ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
