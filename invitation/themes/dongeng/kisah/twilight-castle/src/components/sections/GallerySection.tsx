"use client";

import { motion } from "framer-motion";
import TwilightTitle from "@/components/shared/TwilightTitle";
import SectionCastleDecor from "@/components/shared/SectionCastleDecor";
import Stardust from "@/components/shared/Stardust";
import SceneBackground from "@/components/shared/SceneBackground";
import { hideBrokenImage } from "@/lib/image-fallback";
import type { InvitationConfig } from "@/lib/config-types";

// Kemiringan polaroid selang-seling → terasa scrapbook tertempel, bukan grid kaku.
const TILTS = [-1.2, 2.1, -2.3, 1.7, -1.9, 1.4, -2.1, 1.8];

export default function GallerySection({ gallery }: { gallery: InvitationConfig["gallery"] }) {
  return (
    <section
      id="gallery"
      className="snap-section flow-section reveal-scope"
      style={{ justifyContent: "flex-start", paddingTop: "clamp(120px, 20vh, 180px)", paddingBottom: "clamp(40px, 9vh, 72px)" }}
    >
      <SceneBackground file="LatarSenja.webp" scrim={0.5} edgeFade />
      <Stardust count={22} />
      <SectionCastleDecor />

      <div className="relative z-10 flex flex-col items-center w-full max-w-lg px-6" style={{ gap: "clamp(16px, 3.5vh, 28px)" }}>
        <p className="type-eyebrow">Galeri</p>

        <div style={{ marginBottom: 4 }}>
          <TwilightTitle serif>Kenangan Kami</TwilightTitle>
        </div>

        {/* Pembatas emas */}
        <div style={{ width: "min(66vw, 340px)", height: 1, background: "linear-gradient(90deg, transparent, var(--accent), transparent)", opacity: 0.7, marginBottom: 8 }} />

        <div className="grid grid-cols-2 w-full" style={{ gap: "clamp(15px, 4vw, 22px)", maxWidth: 420 }}>
          {gallery.map((item, i) => {
            // Bento berirama: foto pembuka (dan penutup bila jumlah genap) melebar
            // dua kolom, sisanya persegi seragam → baris selalu rata, tanpa lubang.
            const isWide = i === 0 || (gallery.length % 2 === 0 && i === gallery.length - 1);
            const tilt = TILTS[i % TILTS.length] * (isWide ? 0.55 : 1);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.72, rotate: 0 }}
                whileInView={{ opacity: 1, scale: 1, rotate: tilt }}
                whileHover={{ rotate: 0, scale: 1.02 }}
                viewport={{ once: true, margin: "-8%" }}
                transition={{ duration: 0.8, ease: [0.34, 1.45, 0.5, 1], delay: Math.min(i * 0.09, 0.36) }}
                style={{ position: "relative", gridColumn: isWide ? "1 / -1" : undefined }}
              >
                {/* Polaroid: pigura terang + caption script di strip bawah */}
                <div
                  style={{
                    background: "rgba(244,234,216,0.95)",
                    padding: "9px 9px 5px",
                    borderRadius: 3,
                    border: "1px solid var(--border)",
                    boxShadow: "0 12px 28px rgba(0,0,0,0.4)",
                  }}
                >
                  <div style={{ aspectRatio: isWide ? "16 / 10" : "1 / 1", overflow: "hidden", borderRadius: 2, background: "var(--surface)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.src}
                      alt={item.alt}
                      loading="lazy"
                      onError={hideBrokenImage}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </div>
                  <p
                    className="font-script"
                    style={{
                      textAlign: "center",
                      fontSize: isWide ? "clamp(23px, 5.8vw, 29px)" : "clamp(20px, 5vw, 24px)",
                      color: "var(--accent-soft)",
                      padding: "10px 4px 5px",
                      lineHeight: 1,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.alt}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Penutup grid — pembatas emas menggemakan pembuka */}
        <div style={{ width: "min(66vw, 340px)", height: 1, background: "linear-gradient(90deg, transparent, var(--accent), transparent)", opacity: 0.7, marginTop: 8 }} />
      </div>
    </section>
  );
}
