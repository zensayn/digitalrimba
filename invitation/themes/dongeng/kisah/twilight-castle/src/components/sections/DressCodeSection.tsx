"use client";

// ─── Dress Code ────────────────────────────────────────────────────────────────
// Tema busana + swatch warna (lingkaran) + daftar warna yang dihindari.
// Bahasa visual twilight: latar senja + ornamen emas.

import { motion } from "framer-motion";
import TwilightTitle from "@/components/shared/TwilightTitle";
import SectionCastleDecor from "@/components/shared/SectionCastleDecor";
import Stardust from "@/components/shared/Stardust";
import SceneBackground from "@/components/shared/SceneBackground";
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
      className="snap-section flow-section reveal-scope"
      style={{ paddingTop: "clamp(120px, 18vh, 160px)" }}
    >
      <SceneBackground scrim={0.4} edgeFade />
      <Stardust count={18} />
      <SectionCastleDecor />

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
          <TwilightTitle serif>{dressCode.theme}</TwilightTitle>
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

        {/* Swatch warna */}
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
                  boxShadow: `inset 0 -4px 8px rgba(0,0,0,0.25), 0 5px 14px ${color.hex}55`,
                  flexShrink: 0,
                }}
              />
              <span className="type-label" style={{ fontSize: "12px", letterSpacing: "0.08em" }}>
                {color.name}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Pembatas emas */}
        <div
          style={{
            width: "min(60vw, 290px)",
            height: 1,
            background: "linear-gradient(90deg, transparent, var(--accent), transparent)",
            opacity: 0.7,
            margin: "clamp(8px, 2vh, 14px) 0 4px",
          }}
        />

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
                  background: "rgba(31,24,56,0.6)",
                  letterSpacing: "0.06em",
                  textDecoration: "line-through",
                  textDecorationColor: "rgba(212,175,55,0.5)",
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
