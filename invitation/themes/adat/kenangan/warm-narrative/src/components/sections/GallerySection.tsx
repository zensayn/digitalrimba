"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import ParallaxScene from "@/components/shared/ParallaxScene";
import type { InvitationConfig } from "@/lib/config-types";

const BASE = `${process.env.NEXT_PUBLIC_THEMES_CDN}/adat/kenangan/warm-narrative`;

export default function GallerySection({ gallery }: { gallery: InvitationConfig["gallery"] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-15%" });

  const photos = gallery.slice(0, 5);

  return (
    <section id="gallery" className="snap-section" style={{ background: "transparent", minHeight: "auto", paddingTop: "clamp(60px, 12vh, 100px)", paddingBottom: "clamp(60px, 12vh, 100px)" }}>
      {/* Dress Code's garland hangs over our top (its own sprigs doubled up
          with it). Short section — bottom sprigs stay small and contained, so
          RSVP below keeps its full top frame. */}
      <ParallaxScene
        layers={[
          { src: `${BASE}/GalleryBg.webp`, depth: 0.03, zIndex: 0 },
          { src: `${BASE}/SakuraSprigSmall.webp`, depth: 0.10, opacity: 0.85, zIndex: 1, box: { bottom: "0%", left: "-2%", width: "26%" } },
          { src: `${BASE}/SakuraSprigSmall2.webp`, depth: 0.11, opacity: 0.85, zIndex: 1, box: { bottom: "0%", right: "-2%", width: "26%", flipX: true } },
        ]}
      />
      <div className="paper-overlay" />

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% 40%, rgba(192,120,48,0.07) 0%, transparent 70%)", zIndex: 0 }}
      />

      {/* Italic watermark */}
      <div
        className="absolute font-display select-none pointer-events-none"
        style={{ fontSize: "clamp(56px, 18vw, 100px)", fontWeight: 400, fontStyle: "italic", color: "rgba(192,120,48,0.03)", bottom: "10%", left: "-2%", letterSpacing: "-0.01em", lineHeight: 1, whiteSpace: "nowrap", zIndex: 0 }}
      >
        Galeri
      </div>

      <div
        ref={ref}
        className="relative z-10 flex flex-col items-center w-full"
        style={{ gap: "clamp(14px, 3vh, 24px)" }}
      >
        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="font-label"
          style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.35em", textTransform: "uppercase", color: "var(--gold-deep)", textShadow: "0 1px 5px rgba(250,247,242,0.95), 0 0 10px rgba(250,247,242,0.85)" }}
        >
          Kenangan Terindah
        </motion.p>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="copper-divider"
          style={{ transformOrigin: "center" }}
        />

        {/* Photo grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.2 }}
          style={{
            // Same 32px side gutter as every other section (336 = 400 − 64).
            width: "calc(100% - 64px)",
            maxWidth: "336px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
          }}
        >
          {photos.map((item, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                gridColumn: i === 0 ? "1 / -1" : undefined,
                aspectRatio: i === 0 ? "4/3" : "1",
                overflow: "hidden",
                border: i === 0 ? "none" : "1px solid var(--border)",
                boxShadow: "var(--shadow-warm)",
              }}
            >
              <img
                src={item.src}
                alt={item.alt}
                draggable={false}
                style={
                  i === 0
                    ? { position: "absolute", top: "13%", left: "8.5%", width: "83%", height: "74%", objectFit: "cover", display: "block", filter: "sepia(20%) contrast(1.05) brightness(0.97)" }
                    : { width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "sepia(20%) contrast(1.05) brightness(0.97)" }
                }
              />
              {i === 0 && (
                <img
                  src={`${BASE}/PhotoFrameLandscape.webp`}
                  alt=""
                  aria-hidden="true"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 2 }}
                />
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
