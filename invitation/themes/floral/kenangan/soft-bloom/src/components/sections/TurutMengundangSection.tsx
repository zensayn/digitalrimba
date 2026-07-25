"use client";

// ─── Turut Mengundang — Keluarga & Kerabat ────────────────────────────────────
// Daftar keluarga/kerabat yang turut mengundang: nama serif italic + catatan
// kecil. Diadaptasi dari TurutMengundangSection prada-melati, diterjemahkan ke
// bahasa visual soft-bloom. Duduk sebelum Closing (LatarPadang) → mood-meadow
// (belum dipakai section lain) supaya nuansanya tidak mengulang tetangganya.

import { motion } from "framer-motion";
import TopFrame from "@/components/shared/TopFrame";
import SectionDecor from "@/components/shared/SectionDecor";
import FloralDivider from "@/components/shared/FloralDivider";
import FloralTitle from "@/components/shared/FloralTitle";
import type { InvitationConfig } from "@/lib/config-types";

export default function TurutMengundangSection({
  turutMengundang,
}: {
  turutMengundang: NonNullable<InvitationConfig["turutMengundang"]>;
}) {
  // Reveal saat scroll dinonaktifkan — konten tampil langsung.
  const fade = {
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section
      id="turut"
      className="snap-section flow-section mood-meadow reveal-scope"
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
          style={{ color: "var(--text-muted)", fontSize: "clamp(14px, 3.6vw, 17px)", lineHeight: 1.85, fontWeight: 300, maxWidth: "36ch" }}
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
          style={{ gap: "clamp(18px, 4vh, 26px)", marginTop: "clamp(6px, 2vh, 12px)" }}
        >
          {turutMengundang.map((item, i) => (
            <div key={i} className="flex flex-col items-center" style={{ gap: 4 }}>
              <span
                className="font-display"
                style={{ color: "var(--text)", fontStyle: "italic", fontWeight: 500, fontSize: "clamp(19px, 5vw, 23px)", lineHeight: 1.25 }}
              >
                {item.name}
              </span>
              {item.note && <span className="type-caption">{item.note}</span>}
            </div>
          ))}
        </motion.div>

        <FloralDivider width="60vw" maxWidth={290} style={{ marginTop: "clamp(6px, 2vh, 12px)" }} />
      </div>
    </section>
  );
}
