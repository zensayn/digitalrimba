"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useInvitationConfig } from "@/components/RimbaConfigProvider";

export default function GallerySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-15%" });
  const { gallery } = useInvitationConfig();

  return (
    <section
      id="gallery"
      className="snap-section"
      style={{ background: "var(--surface-2)", justifyContent: "flex-start" }}
    >
      <div className="paper-overlay" />

      {/* Watermark */}
      <div
        className="absolute font-display select-none pointer-events-none"
        style={{
          fontSize: "clamp(80px, 25vw, 140px)",
          fontWeight: 400,
          color: "rgba(192,120,48,0.025)",
          top: "5%",
          left: "50%",
          transform: "translateX(-50%)",
          letterSpacing: "-0.05em",
          lineHeight: 1,
          whiteSpace: "nowrap",
          textTransform: "uppercase",
        }}
      >
        GALERI
      </div>

      {/* Header */}
      <div
        ref={ref}
        className="relative z-20 w-full flex flex-col items-center"
        style={{
          paddingTop: "clamp(28px, 6vh, 48px)",
          paddingBottom: "clamp(12px, 2vh, 20px)",
          flexShrink: 0,
        }}
      >
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="font-label"
          style={{ fontSize: "9px", letterSpacing: "0.35em", textTransform: "uppercase", color: "var(--gold-dim)" }}
        >
          Kenangan Terindah
        </motion.p>
      </div>

      {/* Scrollable masonry grid */}
      <div
        data-prevent-snap="true"
        className="w-full overflow-y-auto"
        style={{
          flex: 1,
          minHeight: 0,
          paddingLeft: "clamp(12px, 3vw, 20px)",
          paddingRight: "clamp(12px, 3vw, 20px)",
          paddingBottom: "clamp(24px, 5vh, 48px)",
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ columns: "2 auto", columnGap: "8px" }}
        >
          {gallery.map((item, i) => (
            <div
              key={i}
              style={{
                breakInside: "avoid",
                marginBottom: "8px",
                border: "1px solid var(--border)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                style={{
                  width: "100%",
                  display: "block",
                  filter: "sepia(15%) contrast(1.04) brightness(0.98) saturate(0.9)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(192,120,48,0.03)",
                  pointerEvents: "none",
                }}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
