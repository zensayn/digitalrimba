"use client";

// ─── Kisah Kami — Perjalanan Cinta ────────────────────────────────────────────
// Linimasa bab kisah pasangan: potret bundar + tahun + judul + narasi.
// Diadaptasi dari LoveStorySection prada-melati, diterjemahkan ke bahasa visual
// soft-bloom (FloralTitle, kelas .type-*, ornamen wildflower).
// Duduk di antara Couple (LatarDaun) dan Akad (LatarLangit) — dua tetangganya
// sudah memakai latar foto, jadi section ini cukup mood + soft-wash.

import { motion } from "framer-motion";
import TopFrame from "@/components/shared/TopFrame";
import SideVines from "@/components/shared/SideVines";
import SectionDecor from "@/components/shared/SectionDecor";
import Butterflies from "@/components/shared/Butterflies";
import FloralTitle from "@/components/shared/FloralTitle";
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
      className="snap-section flow-section mood-blush reveal-scope"
      style={{ justifyContent: "flex-start", paddingTop: "clamp(140px, 22vh, 190px)", paddingBottom: "clamp(40px, 9vh, 72px)" }}
    >
      <div className="soft-wash" />
      <TopFrame maxWidth={560} opacity={0.85} zIndex={1} />
      {/* Ranting menjuntai dibatasi 48vh — sudut bawah tetap milik SectionDecor
          supaya tidak dobel ornamen di titik yang sama */}
      <SideVines sides={["left", "right"]} height="min(48vh, 400px)" opacity={0.55} zIndex={1} />
      <SectionDecor corners={["bl", "br"]} size="clamp(120px, 32vw, 220px)" opacity={0.88} />
      <Butterflies count={1} zIndex={3} />

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
          <FloralTitle serif>Kisah Kami</FloralTitle>
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
