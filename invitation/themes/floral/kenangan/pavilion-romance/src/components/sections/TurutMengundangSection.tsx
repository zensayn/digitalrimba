"use client";

// ─── Turut Mengundang — Keluarga & Kerabat ────────────────────────────────────
// Daftar keluarga/kerabat yang turut mengundang: nama serif italic + catatan
// kecil. Diadaptasi dari TurutMengundangSection prada-melati, diterjemahkan ke
// bahasa visual Pavilion Romance. Duduk di antara Rundown (mood-butter) dan
// Closing (ClosingGardenPavilion) → memakai mood-mist agar bergantian.

import { motion } from "framer-motion";
import TopFrame from "@/components/shared/TopFrame";
import SectionDecor from "@/components/shared/SectionDecor";
import FloralDivider from "@/components/shared/FloralDivider";
import FloralTitle from "@/components/shared/FloralTitle";
import type { InvitationConfig } from "@/lib/config-types";

export default function TurutMengundangSection({
  turutMengundang,
}: {
  turutMengundang: InvitationConfig["turutMengundang"];
}) {
  // Reveal saat scroll dinonaktifkan — konten tampil langsung.
  const fade = {
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section
      id="turut"
      className="snap-section flow-section mood-mist reveal-scope"
      style={{ paddingTop: "clamp(150px, 24vh, 200px)" }}
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
          Turut Mengundang
        </motion.p>

        <motion.div variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-15%" }}>
          <FloralTitle serif>Keluarga &amp; Kerabat</FloralTitle>
        </motion.div>

        <motion.p
          variants={fade}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="font-body"
          style={{ color: "var(--text-muted)", fontSize: "clamp(11px, 2.8vw, 13px)", lineHeight: 1.9, fontWeight: 300, maxWidth: "34ch" }}
        >
          Terima kasih kepada keluarga dan kerabat yang turut mengundang serta
          mendoakan kebahagiaan kami.
        </motion.p>

        <motion.div
          variants={fade}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="flex w-full flex-col items-center"
          style={{ gap: "clamp(16px, 3.5vh, 22px)", marginTop: "clamp(4px, 1.5vh, 10px)" }}
        >
          {turutMengundang.map((item, i) => (
            <div key={i} className="flex flex-col items-center" style={{ gap: 3 }}>
              <span
                className="font-display"
                style={{ color: "var(--text)", fontStyle: "italic", fontWeight: 500, fontSize: "clamp(16px, 4.4vw, 19px)", lineHeight: 1.25 }}
              >
                {item.name}
              </span>
              {item.note && <span className="type-caption">{item.note}</span>}
            </div>
          ))}
        </motion.div>

        <FloralDivider width="52vw" maxWidth={230} style={{ marginTop: "clamp(8px, 2vh, 14px)" }} />
      </div>
    </section>
  );
}
