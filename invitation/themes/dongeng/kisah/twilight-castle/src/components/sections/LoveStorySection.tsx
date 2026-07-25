"use client";

// ─── Kisah Kami — Perjalanan Cinta ────────────────────────────────────────────
// Linimasa bab kisah pasangan: potret bundar + tahun + judul + narasi.
// Bahasa visual twilight: latar senja + ornamen emas + fairy dust.

import { motion } from "framer-motion";
import TwilightTitle from "@/components/shared/TwilightTitle";
import SectionCastleDecor from "@/components/shared/SectionCastleDecor";
import Stardust from "@/components/shared/Stardust";
import SceneBackground from "@/components/shared/SceneBackground";
import { hideBrokenImage } from "@/lib/image-fallback";
import { invitationPhoto } from "@/lib/invitation-media";
import type { InvitationConfig } from "@/lib/config-types";

export default function LoveStorySection({ loveStory }: { loveStory: NonNullable<InvitationConfig["loveStory"]> }) {
  // Reveal saat scroll dinonaktifkan — konten tampil langsung.
  const fade = {
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section
      id="lovestory"
      className="snap-section flow-section reveal-scope"
      style={{ justifyContent: "flex-start", paddingTop: "clamp(120px, 20vh, 180px)", paddingBottom: "clamp(40px, 9vh, 72px)" }}
    >
      <SceneBackground scrim={0.42} edgeFade />
      <Stardust count={24} />
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
          Perjalanan
        </motion.p>

        <motion.div variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-15%" }}>
          <TwilightTitle serif>Kisah Kami</TwilightTitle>
        </motion.div>

        <motion.div
          variants={fade}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="flex w-full flex-col text-left"
          style={{ gap: "clamp(20px, 4.5vh, 30px)", marginTop: "clamp(6px, 2vh, 12px)" }}
        >
          {loveStory.map((ch, i) => (
            <div key={i} className="flex items-center" style={{ gap: 16 }}>
              <div
                style={{
                  width: "clamp(76px, 20vw, 92px)",
                  height: "clamp(76px, 20vw, 92px)",
                  flexShrink: 0,
                  overflow: "hidden",
                  borderRadius: "50%",
                  border: "1px solid var(--border)",
                  background: "var(--surface-2)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={invitationPhoto(ch.image)}
                  alt={ch.chapter}
                  loading="lazy"
                  decoding="async"
                  onError={hideBrokenImage}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className="type-label" style={{ color: "var(--accent)", fontSize: "12px", letterSpacing: "0.16em" }}>
                  {ch.year}
                </span>
                <h3
                  className="font-display"
                  style={{ color: "var(--text)", fontStyle: "italic", fontWeight: 500, fontSize: "clamp(19px, 5vw, 23px)", lineHeight: 1.2, margin: "3px 0 5px" }}
                >
                  {ch.chapter}
                </h3>
                <p
                  className="font-body"
                  style={{ color: "var(--text-muted)", fontSize: "clamp(13px, 3.3vw, 15px)", lineHeight: 1.7, fontWeight: 300 }}
                >
                  {ch.description}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
