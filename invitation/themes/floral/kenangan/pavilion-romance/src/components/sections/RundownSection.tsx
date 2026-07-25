"use client";

// ─── Susunan Acara — Rundown ──────────────────────────────────────────────────
// Dua linimasa (Akad & Resepsi) dalam kartu kertas bergaya GiftSection.
// Diadaptasi dari RundownSection prada-melati, diterjemahkan ke bahasa visual
// Pavilion Romance. Duduk di antara Gift (LatarParchmentVines) dan Turut
// Mengundang → memakai mood + soft-wash supaya latar tidak berulang.

import { motion } from "framer-motion";
import TopFrame from "@/components/shared/TopFrame";
import TallBlooms from "@/components/shared/TallBlooms";
import SectionDecor from "@/components/shared/SectionDecor";
import FloralTitle from "@/components/shared/FloralTitle";
import type { InvitationConfig, RundownItem } from "@/lib/config-types";

function Timeline({ title, items }: { title: string; items: RundownItem[] }) {
  if (items.length === 0) return null;

  return (
    <div
      className="flex w-full flex-col text-left"
      style={{ padding: "16px 20px 8px", borderRadius: 5, border: "1px solid var(--border)", background: "var(--bg)", boxShadow: "var(--shadow-card)" }}
    >
      <span className="type-label" style={{ color: "var(--accent)" }}>
        {title}
      </span>
      <div className="mt-1 flex flex-col">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-baseline"
            style={{ gap: 16, padding: "11px 0", borderTop: i === 0 ? "none" : "1px solid var(--border)" }}
          >
            <span
              className="font-label shrink-0"
              style={{ color: "var(--accent)", fontSize: "11px", letterSpacing: "0.08em", minWidth: 46 }}
            >
              {item.time}
            </span>
            <span className="font-body" style={{ color: "var(--text)", fontSize: "clamp(12px, 3.2vw, 14px)", lineHeight: 1.5, fontWeight: 300 }}>
              {item.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RundownSection({ rundown }: { rundown: InvitationConfig["rundown"] }) {
  // Reveal saat scroll dinonaktifkan — konten tampil langsung.
  const fade = {
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section
      id="rundown"
      className="snap-section flow-section mood-butter reveal-scope"
      style={{ paddingTop: "clamp(150px, 24vh, 200px)" }}
    >
      <div className="soft-wash" />
      <TopFrame maxWidth={500} opacity={0.85} zIndex={1} />
      {/* Bunga tangkai tinggi di belakang kluster sudut (pola DressCode) —
          kedalaman taman di kedua tepi tanpa menyaingi kartu rundown */}
      <TallBlooms sides={["left", "right"]} opacity={0.85} zIndex={1} />
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
          style={{ gap: "clamp(14px, 3vh, 20px)", marginTop: "clamp(4px, 1.5vh, 10px)" }}
        >
          <Timeline title="Akad Nikah" items={rundown.akad} />
          <Timeline title="Resepsi" items={rundown.resepsi} />
        </motion.div>
      </div>
    </section>
  );
}
