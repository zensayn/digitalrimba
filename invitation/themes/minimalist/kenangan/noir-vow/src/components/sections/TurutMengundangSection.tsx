"use client";

// ─── Turut Mengundang — Keluarga & Kerabat ────────────────────────────────────
// Daftar keluarga/kerabat yang turut mengundang: nama serif italic + catatan
// kecil. Diadaptasi dari TurutMengundangSection prada-melati, diterjemahkan ke
// bahasa visual soft-bloom. Duduk sebelum Closing (LatarPadang) → mood-meadow
// (belum dipakai section lain) supaya nuansanya tidak mengulang tetangganya.

import { motion } from "framer-motion";
import SceneBackground from "@/components/shared/SceneBackground";
import FloralDivider from "@/components/shared/FloralDivider";
import FloralTitle from "@/components/shared/FloralTitle";
import { rhythmVars } from "@/lib/rhythm";
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
      style={rhythmVars("turut")}
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
          className="type-body"
          style={{ maxWidth: "36ch" }}
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
          style={{ gap: "var(--space-group)" }}
        >
          {turutMengundang.map((item, i) => (
            <div key={i} className="flex flex-col items-center" style={{ gap: "var(--space-2xs)" }}>
              <span className="type-name">{item.name}</span>
              {item.note && <span className="type-caption">{item.note}</span>}
            </div>
          ))}
        </motion.div>

        <FloralDivider width="60vw" maxWidth={290} />
      </div>
    </section>
  );
}
