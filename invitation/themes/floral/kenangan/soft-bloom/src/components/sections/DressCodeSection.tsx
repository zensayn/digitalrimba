"use client";

// ─── Dress Code — Taman Pastel ─────────────────────────────────────────────────
// Tema busana + swatch warna pastel (lingkaran "kelopak") + daftar warna yang
// dihindari. Mengikuti pola DressCodeSection warm-narrative, diterjemahkan ke
// bahasa visual soft-bloom (FloralTitle, kelas .type-*, ornamen wildflower).

import { motion } from "framer-motion";
import TopFrame from "@/components/shared/TopFrame";
import SectionDecor from "@/components/shared/SectionDecor";
import FloralTitle from "@/components/shared/FloralTitle";
import FloralDivider from "@/components/shared/FloralDivider";
import type { InvitationConfig } from "@/lib/config-types";

export default function DressCodeSection({ dressCode }: { dressCode: InvitationConfig["dressCode"] }) {
  // Reveal saat scroll dinonaktifkan — konten tampil langsung.
  const fade = {
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section
      id="dresscode"
      className="snap-section flow-section mood-butter reveal-scope"
      style={{ paddingTop: "clamp(130px, 20vh, 170px)" }}
    >
      <div className="soft-wash" />
      <TopFrame maxWidth={500} opacity={0.85} zIndex={1} />
      <SectionDecor corners={["bl", "br"]} size="clamp(100px, 27vw, 180px)" opacity={0.88} />

      <div
        className="relative z-10 flex flex-col items-center text-center w-full max-w-xs mx-auto px-6"
        style={{ gap: "clamp(10px, 2.5vh, 18px)" }}
      >
        <motion.p
          variants={fade}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="type-eyebrow"
        >
          Dress Code
        </motion.p>

        <motion.div variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-15%" }}>
          <FloralTitle serif>{dressCode.theme}</FloralTitle>
        </motion.div>

        <motion.p
          variants={fade}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="font-body"
          style={{ color: "var(--text-muted)", fontSize: "clamp(11px, 2.8vw, 13px)", lineHeight: 1.9, fontWeight: 300, maxWidth: "34ch" }}
        >
          {dressCode.description}
        </motion.p>

        {/* Swatch warna — kelopak pastel */}
        <motion.div
          variants={fade}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="flex flex-wrap justify-center"
          style={{ gap: "clamp(12px, 4vw, 18px)", marginTop: "clamp(4px, 1.5vh, 10px)" }}
        >
          {dressCode.colors.map((color) => (
            <div key={color.hex} className="flex flex-col items-center" style={{ gap: 6 }}>
              <div
                style={{
                  width: "clamp(36px, 10vw, 46px)",
                  height: "clamp(36px, 10vw, 46px)",
                  borderRadius: "50%",
                  background: color.hex,
                  border: "1px solid var(--border)",
                  boxShadow: `inset 0 -4px 8px rgba(58,58,54,0.06), 0 5px 14px ${color.hex}55`,
                  flexShrink: 0,
                }}
              />
              <span className="type-label" style={{ fontSize: "9px", letterSpacing: "0.1em" }}>
                {color.name}
              </span>
            </div>
          ))}
        </motion.div>

        <FloralDivider width="52vw" maxWidth={230} style={{ margin: "clamp(6px, 1.5vh, 12px) 0 2px" }} />

        {/* Hindari */}
        <motion.div
          variants={fade}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="flex flex-col items-center"
          style={{ gap: 8 }}
        >
          <p className="type-label" style={{ letterSpacing: "0.25em", fontSize: "9px" }}>
            Mohon Hindari
          </p>
          <div className="flex gap-2 flex-wrap justify-center">
            {dressCode.avoid.map((item) => (
              <span
                key={item}
                className="font-label"
                style={{
                  fontSize: "clamp(10px, 2.6vw, 11px)",
                  color: "var(--text-muted)",
                  padding: "5px 14px",
                  borderRadius: 999,
                  border: "1px solid var(--border)",
                  background: "rgba(255,255,255,0.55)",
                  letterSpacing: "0.06em",
                  textDecoration: "line-through",
                  textDecorationColor: "rgba(126,105,150,0.45)",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
