"use client";

// ─── Dress Code — Taman Pastel ─────────────────────────────────────────────────
// Tema busana + swatch warna pastel (lingkaran "kelopak") + daftar warna yang
// dihindari. Mengikuti pola DressCodeSection warm-narrative, diterjemahkan ke
// bahasa visual soft-bloom (FloralTitle, kelas .type-*, ornamen wildflower).

import { motion } from "framer-motion";
import SceneBackground from "@/components/shared/SceneBackground";
import FloralTitle from "@/components/shared/FloralTitle";
import FloralDivider from "@/components/shared/FloralDivider";
import { rhythmVars } from "@/lib/rhythm";
import type { InvitationConfig } from "@/lib/config-types";

export default function DressCodeSection({
  dressCode,
}: {
  dressCode: InvitationConfig["dressCode"];
}) {
  // Reveal saat scroll dinonaktifkan — konten tampil langsung.
  const fade = {
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section
      id="dresscode"
      className="snap-section flow-section mood-butter reveal-scope"
      style={rhythmVars("dresscode")}
    >
      <SceneBackground scrim={0.58} edgeFade />

      <div className="section-shell">
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
          className="type-body"
          style={{ maxWidth: "36ch" }}
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
          style={{ gap: "var(--space-lg)" }}
        >
          {dressCode.colors.map((color) => (
            <div key={color.hex} className="flex flex-col items-center" style={{ gap: "var(--space-2xs)" }}>
              {/* Warna kelopak adalah DATA dari config, bukan keputusan gaya —
                  masuk sebagai token --swatch; .swatch yang memakainya untuk
                  latar sekaligus menurunkan warna bayangannya. */}
              <div className="swatch" style={{ "--swatch": color.hex } as React.CSSProperties} />
              <span className="type-label">{color.name}</span>
            </div>
          ))}
        </motion.div>

        <FloralDivider width="60vw" maxWidth={290} />

        {/* Hindari */}
        <motion.div
          variants={fade}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="flex flex-col items-center"
          style={{ gap: "var(--space-xs)" }}
        >
          <p className="type-label">Mohon Hindari</p>
          <div className="flex flex-wrap justify-center" style={{ gap: "var(--space-xs)" }}>
            {dressCode.avoid.map((item) => (
              <span key={item} className="chip chip-struck">
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
