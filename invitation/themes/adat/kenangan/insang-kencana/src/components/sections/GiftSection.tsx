"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Copy, Check, Gift } from "lucide-react";
import SectionDecor from "@/components/shared/SectionDecor";
import FloralTitle from "@/components/shared/FloralTitle";
import TopFrame from "@/components/shared/TopFrame";
import SceneBackground from "@/components/shared/SceneBackground";
import { rhythmVars } from "@/lib/rhythm";
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
    <section id="gift" className="snap-section flow-section reveal-scope" style={rhythmVars("gift")}>
      <SceneBackground file="LatarDaun.webp" scrim={0.55} edgeFade />
      <TopFrame opacity={0.85} zIndex={1} />
      <SectionDecor corners={["bl", "br"]} size="clamp(120px, 32vw, 220px)" opacity={0.88} />

      <div ref={ref} className="section-shell">
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="icon-badge"
          style={{ width: 66, height: 66 }}
        >
          <Gift size={28} strokeWidth={1.5} />
        </motion.div>

        <motion.p
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="type-eyebrow"
        >
          Amplop Digital
        </motion.p>

        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <FloralTitle serif>Tanda Kasih</FloralTitle>
        </motion.div>

        <motion.p
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="type-body text-on-scene"
        >
          Doa dan kehadiran Anda adalah hadiah terindah bagi kami. Namun bila ingin
          memberi tanda kasih, berikut rekening kami.
        </motion.p>

        {/* Kartu bank — daftar berulang, jaraknya --space-md (sama dgn card grid
            warm-narrative/prada), bukan gap-4 Tailwind yang kebetulan senilai. */}
        <div className="flex w-full flex-col" style={{ gap: "var(--space-md)" }}>
          {bankAccounts.map((acc, i) => (
            <motion.div
              key={i}
              custom={i + 4}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="card-solid bank-card flex items-center justify-between"
            >
              <div className="flex flex-col items-start" style={{ gap: "var(--space-2xs)" }}>
                <span className="type-label-accent">{acc.bank}</span>
                <span className="type-account">{acc.number}</span>
                <span className="type-caption">a.n. {acc.name}</span>
              </div>
              {/* Keadaan "tersalin" lewat data-copied → CSS yang menentukan
                  warnanya, bukan ternary di dalam style inline. */}
              <button
                onClick={() => handleCopy(acc.number, i)}
                aria-label="Salin nomor rekening"
                className="btn-icon"
                data-copied={copiedIdx === i}
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
