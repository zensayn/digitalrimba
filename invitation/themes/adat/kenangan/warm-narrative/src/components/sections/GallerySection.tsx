"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { InvitationConfig } from "@/lib/config-types";

export default function GallerySection({ gallery }: { gallery: InvitationConfig["gallery"] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-15%" });

  const photos = gallery.slice(0, 5);

  return (
    <section id="gallery" className="snap-section" style={{ background: "var(--surface-2)", minHeight: "auto", paddingTop: "clamp(60px, 12vh, 100px)", paddingBottom: "clamp(60px, 12vh, 100px)" }}>
      <div className="paper-overlay" />


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
          style={{ fontSize: "9px", letterSpacing: "0.35em", textTransform: "uppercase", color: "var(--gold-dim)" }}
        >
          Kenangan Terindah
        </motion.p>

        {/* Photo grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.2 }}
          style={{
            width: "80%",
            maxWidth: "320px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
          }}
        >
          {photos.map((item, i) => (
            <div
              key={i}
              style={{
                gridColumn: i === 0 ? "1 / -1" : undefined,
                aspectRatio: i === 0 ? "4/3" : "1",
                overflow: "hidden",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-warm)",
              }}
            >
              <img
                src={item.src}
                alt={item.alt}
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  filter: "sepia(20%) contrast(1.05) brightness(0.97)",
                }}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
