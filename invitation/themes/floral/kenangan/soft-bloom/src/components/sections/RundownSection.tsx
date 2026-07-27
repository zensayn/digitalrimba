"use client";

// ─── Susunan Acara — Rundown ──────────────────────────────────────────────────
// Dua linimasa (Akad & Resepsi) dalam kartu kertas bergaya GiftSection.
// Diadaptasi dari RundownSection prada-melati, diterjemahkan ke bahasa visual
// soft-bloom. Duduk setelah Gift (LatarDaun) → mood + soft-wash agar latar
// bergantian, bukan dua latar foto beruntun.

import { motion } from "framer-motion";
import TopFrame from "@/components/shared/TopFrame";
import SectionDecor from "@/components/shared/SectionDecor";
import FloralTitle from "@/components/shared/FloralTitle";
import { rhythmVars } from "@/lib/rhythm";
import type { InvitationConfig, RundownItem } from "@/lib/config-types";

function Timeline({ title, items }: { title: string; items: RundownItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="card-solid rundown-card flex w-full flex-col text-left">
      <span className="type-label-accent">{title}</span>
      <div className="flex flex-col">
        {/* Garis pemisah antar-baris lewat :not(:first-child) di CSS, bukan
            ternary borderTop di JSX — satu baris aturan, bukan cabang render. */}
        {items.map((item, i) => (
          <div key={i} className="rundown-row flex items-baseline">
            <span className="type-meta rundown-time">{item.time}</span>
            <span className="type-list">{item.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RundownSection({ rundown }: { rundown: NonNullable<InvitationConfig["rundown"]> }) {
  // Reveal saat scroll dinonaktifkan — konten tampil langsung.
  const fade = {
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section
      id="rundown"
      className="snap-section flow-section mood-butter reveal-scope"
      style={rhythmVars("rundown")}
    >
      <div className="soft-wash" />
      <TopFrame opacity={0.85} zIndex={1} />
      <SectionDecor corners={["bl", "br"]} size="clamp(120px, 32vw, 220px)" opacity={0.88} />

      <div className="section-shell">
        <motion.p
          variants={fade}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="type-eyebrow"
        >
          Rundown
        </motion.p>

        <motion.div variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-15%" }}>
          <FloralTitle serif>Susunan Acara</FloralTitle>
        </motion.div>

        <motion.div
          variants={fade}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="flex w-full flex-col"
          style={{ gap: "var(--space-group)" }}
        >
          <Timeline title="Akad Nikah" items={rundown.akad} />
          <Timeline title="Resepsi" items={rundown.resepsi} />
        </motion.div>
      </div>
    </section>
  );
}
