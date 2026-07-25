"use client";

// ─── Kisah Kami — Perjalanan Cinta ────────────────────────────────────────────
// Linimasa bab kisah pasangan: potret bundar + tahun + judul + narasi.
// Diadaptasi dari LoveStorySection prada-melati, diterjemahkan ke bahasa
// visual Pavilion Romance (FloralTitle, kelas .type-*, ornamen botani).
// Duduk di antara Couple (LatarParchmentVines) dan Akad (LatarParchmentVines)
// → memakai mood + soft-wash agar tiga section beruntun tidak sama latar.

import { motion } from "framer-motion";
import TopFrame from "@/components/shared/TopFrame";
import SideVines from "@/components/shared/SideVines";
import SectionDecor from "@/components/shared/SectionDecor";
import FloralTitle from "@/components/shared/FloralTitle";
import { hideBrokenImage } from "@/lib/image-fallback";
import { invitationPhoto } from "@/lib/invitation-media";
import type { InvitationConfig } from "@/lib/config-types";

export default function LoveStorySection({ loveStory }: { loveStory: InvitationConfig["loveStory"] }) {
  // Reveal saat scroll dinonaktifkan — konten tampil langsung.
  const fade = {
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section
      id="lovestory"
      className="snap-section flow-section mood-blush reveal-scope"
      style={{ justifyContent: "flex-start", paddingTop: "clamp(150px, 24vh, 200px)", paddingBottom: "clamp(40px, 9vh, 72px)" }}
    >
      <div className="soft-wash" />
      <TopFrame maxWidth={500} opacity={0.85} zIndex={1} />
      {/* Garland tepi menggantung membingkai linimasa (pola CoupleSection);
          sudut bawah tetap milik kluster SectionDecor */}
      <SideVines sides={["left", "right"]} height="min(48vh, 400px)" opacity={0.4} zIndex={1} />
      <SectionDecor corners={["bl", "br"]} size="clamp(100px, 27vw, 180px)" opacity={0.88} />

      <div
        className="relative z-10 flex flex-col items-center text-center w-full max-w-sm mx-auto px-8"
        style={{ gap: "clamp(10px, 2.5vh, 18px)" }}
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
          style={{ gap: "clamp(18px, 4vh, 26px)", marginTop: "clamp(8px, 2vh, 16px)" }}
        >
          {loveStory.map((ch, i) => (
            <div key={i} className="flex items-center" style={{ gap: 14 }}>
              <div
                style={{
                  width: "clamp(64px, 17vw, 76px)",
                  height: "clamp(64px, 17vw, 76px)",
                  flexShrink: 0,
                  overflow: "hidden",
                  borderRadius: "50%",
                  border: "1px solid rgba(184,149,94,0.55)",
                  background: "var(--surface-2)",
                  boxShadow: "0 6px 16px rgba(62,51,40,0.12)",
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
                <span className="type-label" style={{ color: "var(--accent)", fontSize: "9px", letterSpacing: "0.18em" }}>
                  {ch.year}
                </span>
                <h3
                  className="font-display"
                  style={{ color: "var(--text)", fontStyle: "italic", fontWeight: 500, fontSize: "clamp(16px, 4.6vw, 20px)", lineHeight: 1.2, margin: "2px 0 4px" }}
                >
                  {ch.chapter}
                </h3>
                <p
                  className="font-body"
                  style={{ color: "var(--text-muted)", fontSize: "clamp(11px, 2.8vw, 12.5px)", lineHeight: 1.7, fontWeight: 300 }}
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
