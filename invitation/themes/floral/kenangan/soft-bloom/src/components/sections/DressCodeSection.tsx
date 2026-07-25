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
      <TopFrame maxWidth={560} opacity={0.85} zIndex={1} />
      <SectionDecor corners={["bl", "br"]} size="clamp(120px, 32vw, 220px)" opacity={0.88} />

      <div
        className="relative z-10 flex flex-col items-center text-center w-full max-w-sm mx-auto px-7"
        style={{ gap: "clamp(14px, 3vh, 24px)" }}
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
          style={{ color: "var(--text-muted)", fontSize: "clamp(14px, 3.6vw, 17px)", lineHeight: 1.85, fontWeight: 300, maxWidth: "36ch" }}
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
          style={{ gap: "clamp(16px, 5vw, 24px)", marginTop: "clamp(6px, 2vh, 12px)" }}
        >
          {dressCode.colors.map((color) => (
            <div key={color.hex} className="flex flex-col items-center" style={{ gap: 6 }}>
              <div
                style={{
                  width: "clamp(46px, 12vw, 58px)",
                  height: "clamp(46px, 12vw, 58px)",
                  borderRadius: "50%",
                  background: color.hex,
                  border: "1px solid var(--border)",
                  boxShadow: `inset 0 -4px 8px rgba(58,58,54,0.06), 0 5px 14px ${color.hex}55`,
                  flexShrink: 0,
                }}
              />
              <span className="type-label" style={{ fontSize: "12px", letterSpacing: "0.08em" }}>
                {color.name}
              </span>
            </div>
          ))}
        </motion.div>

        <FloralDivider width="60vw" maxWidth={290} style={{ margin: "clamp(8px, 2vh, 14px) 0 4px" }} />

        {/* Hindari */}
        <motion.div
          variants={fade}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="flex flex-col items-center"
          style={{ gap: 8 }}
        >
          <p className="type-label" style={{ letterSpacing: "0.18em", fontSize: "12px" }}>
            Mohon Hindari
          </p>
          <div className="flex gap-2 flex-wrap justify-center">
            {dressCode.avoid.map((item) => (
              <span
                key={item}
                className="font-label"
                style={{
                  fontSize: "clamp(13px, 3.4vw, 15px)",
                  color: "var(--text-muted)",
                  padding: "7px 16px",
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
