"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Copy, Check, Gift } from "lucide-react";
import SectionDecor from "@/components/shared/SectionDecor";
import FloralTitle from "@/components/shared/FloralTitle";
import TopFrame from "@/components/shared/TopFrame";
import SceneBackground from "@/components/shared/SceneBackground";
import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";
import type { InvitationConfig } from "@/lib/config-types";

export default function GiftSection({ bankAccounts }: { bankAccounts: InvitationConfig["bankAccounts"] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-15%" });
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copyStatus, setCopyStatus] = useState("");

  const handleCopy = async (text: string, idx: number, bank: string) => {
    const clean = text.replace(/\s/g, "");
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(clean);
      } else {
        const el = document.createElement("textarea");
        el.value = clean;
        el.style.cssText = "position:fixed;opacity:0;pointer-events:none";
        document.body.appendChild(el);
        el.select();
        const copied = document.execCommand("copy");
        document.body.removeChild(el);
        if (!copied) throw new Error("Copy command was rejected");
      }
      setCopiedIdx(idx);
      setCopyStatus(`Nomor rekening ${bank} berhasil disalin.`);
      window.setTimeout(() => setCopiedIdx(null), 2000);
    } catch {
      setCopyStatus(`Nomor rekening ${bank} belum dapat disalin. Salin secara manual.`);
    }
  };

  // Reveal saat scroll dinonaktifkan — konten tampil langsung.
  const fadeUp = {
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="gift" className="snap-section flow-section reveal-scope" style={{ paddingTop: "clamp(130px, 20vh, 170px)" }}>
      <SceneBackground file="LatarParchmentVines.webp" scrim={0.55} edgeFade />
      <TopFrame maxWidth={500} opacity={0.85} zIndex={1} />
      {/* Pojok bawah dibuat asimetris: pedestal bunga melayang di kiri, kluster
          mawar SectionDecor di kanan — tidak mirror identik. Kanvas planter
          persegi, konten x 12–88% y 3–97% → sedikit ditenggelamkan ke tepi. */}
      <div
        aria-hidden="true"
        data-enter="bl"
        style={{
          position: "absolute",
          bottom: "-3%",
          left: "-6%",
          width: "clamp(120px, 33vw, 190px)",
          aspectRatio: "1 / 1",
          zIndex: 1,
          pointerEvents: "none",
        }}
      >
        <img
          src={asset("BrokenPillarPlanter.webp")}
          alt=""
          onError={hideBrokenImage}
          loading="lazy"
          decoding="async"
          className="ambient-anim"
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "contain",
            opacity: 0.92,
            animation: "pillarFloat 9.5s ease-in-out infinite",
          }}
        />
      </div>
      <SectionDecor corners={["br"]} size="clamp(100px, 27vw, 180px)" opacity={0.88} />

      <div ref={ref} className="relative z-10 flex flex-col items-center text-center w-full max-w-xs mx-auto px-6">
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          style={{ width: 54, height: 54, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", background: "rgba(255,255,255,0.6)", color: "var(--accent)", marginBottom: 14 }}
        >
          <Gift size={22} strokeWidth={1.5} />
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
          style={{ color: "var(--text-muted)", fontSize: "clamp(11px, 2.8vw, 13px)", lineHeight: 1.9, fontWeight: 300, marginBottom: "clamp(20px, 5vh, 36px)" }}
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
              style={{ padding: "18px 20px", borderRadius: 5, border: "1px solid var(--border)", background: "var(--bg)", boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex flex-col items-start gap-1">
                <span className="type-label" style={{ color: "var(--accent)" }}>{acc.bank}</span>
                <span className="font-body" style={{ color: "var(--text)", fontSize: "14px", letterSpacing: "0.04em" }}>{acc.number}</span>
                <span className="type-caption">a.n. {acc.name}</span>
              </div>
              <button
                onClick={() => handleCopy(acc.number, i, acc.bank)}
                aria-label={`Salin nomor rekening ${acc.bank}`}
                type="button"
                className="flex items-center gap-1 transition-all duration-300"
                style={{ padding: "9px 11px", borderRadius: 4, border: "1px solid var(--border)", color: copiedIdx === i ? "var(--accent)" : "var(--text-muted)", background: "transparent", cursor: "pointer" }}
              >
                {copiedIdx === i ? <Check size={13} /> : <Copy size={13} />}
              </button>
            </motion.div>
          ))}
        </div>
        <p className="sr-only" role="status" aria-live="polite">{copyStatus}</p>
      </div>
    </section>
  );
}
