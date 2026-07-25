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
import type { InvitationConfig, RundownItem } from "@/lib/config-types";

function Timeline({ title, items }: { title: string; items: RundownItem[] }) {
  if (items.length === 0) return null;

  return (
    <div
      className="flex w-full flex-col text-left"
      style={{ padding: "20px 24px 12px", borderRadius: 5, border: "1px solid var(--border)", background: "var(--bg)", boxShadow: "var(--shadow-card)" }}
    >
      <span className="type-label" style={{ color: "var(--accent)" }}>
        {title}
      </span>
      <div className="mt-1 flex flex-col">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-baseline"
            style={{ gap: 18, padding: "13px 0", borderTop: i === 0 ? "none" : "1px solid var(--border)" }}
          >
            <span
              className="font-label shrink-0"
              style={{ color: "var(--accent)", fontSize: "14px", letterSpacing: "0.06em", minWidth: 54 }}
            >
              {item.time}
            </span>
            <span className="font-body" style={{ color: "var(--text)", fontSize: "clamp(14px, 3.5vw, 16px)", lineHeight: 1.5, fontWeight: 300 }}>
              {item.title}
            </span>
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
          style={{ gap: "clamp(16px, 3.5vh, 22px)", marginTop: "clamp(6px, 2vh, 12px)" }}
        >
          <Timeline title="Akad Nikah" items={rundown.akad} />
          <Timeline title="Resepsi" items={rundown.resepsi} />
        </motion.div>
      </div>
    </section>
  );
}
