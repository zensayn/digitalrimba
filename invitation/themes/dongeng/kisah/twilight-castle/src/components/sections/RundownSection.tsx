"use client";

// ─── Susunan Acara — Rundown ──────────────────────────────────────────────────
// Dua linimasa (Akad & Resepsi) dalam kartu gelap twilight.

import { motion } from "framer-motion";
import TwilightTitle from "@/components/shared/TwilightTitle";
import SectionCastleDecor from "@/components/shared/SectionCastleDecor";
import Stardust from "@/components/shared/Stardust";
import SceneBackground from "@/components/shared/SceneBackground";
import type { InvitationConfig, RundownItem } from "@/lib/config-types";

function Timeline({ title, items }: { title: string; items: RundownItem[] }) {
  if (items.length === 0) return null;

  return (
    <div
      className="flex w-full flex-col text-left"
      style={{ padding: "20px 24px 12px", borderRadius: 5, border: "1px solid var(--border)", background: "var(--surface)", boxShadow: "var(--shadow-card)" }}
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
      className="snap-section flow-section reveal-scope"
      style={{ paddingTop: "clamp(120px, 18vh, 160px)" }}
    >
      <SceneBackground scrim={0.4} edgeFade />
      <Stardust count={16} />
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
          Rundown
        </motion.p>

        <motion.div variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-15%" }}>
          <TwilightTitle serif>Susunan Acara</TwilightTitle>
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
