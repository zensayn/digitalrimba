"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useInvitationConfig } from "@/components/RimbaConfigProvider";

export default function GallerySlide() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-5%" });
  const { gallery, dressCode } = useInvitationConfig();

  return (
    <div className="slide-page" style={{ justifyContent: "flex-start" }}>
      {/* Header — gradient mask at top */}
      <div
        ref={ref}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          padding: "var(--pt-slide) var(--gutter) 16px",
          background: "linear-gradient(to bottom, var(--bg) 60%, transparent)",
          zIndex: 20,
        }}
      >
        <motion.p
          className="font-label"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            fontSize: 9,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--gold-dim)",
            marginBottom: 4,
          }}
        >
          Kenangan Terindah
        </motion.p>
        <motion.h2
          className="font-display"
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          style={{ fontStyle: "italic", fontSize: "clamp(24px, 7vw, 36px)", color: "var(--gold)" }}
        >
          Kenangan
        </motion.h2>
      </div>

      {/* Scrollable masonry */}
      <div
        data-prevent-snap="true"
        className="overflow-y-auto"
        style={{
          width: "100%",
          height: "100dvh",
          paddingTop: "clamp(100px,18vh,130px)",
          paddingBottom: "var(--pb-safe)",
          paddingLeft: 10,
          paddingRight: 10,
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ columns: "2 auto", columnGap: 8 }}
        >
          {gallery.map((item, i) => (
            <div
              key={i}
              style={{
                breakInside: "avoid",
                marginBottom: 8,
                border: "1px solid var(--border)",
                overflow: "hidden",
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
                  filter: "sepia(20%) contrast(1.05) brightness(0.9)",
                }}
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Dress code swatch strip — sticky at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          padding: "32px 20px calc(env(safe-area-inset-bottom) + 80px)",
          background: "linear-gradient(to top, var(--bg) 40%, transparent)",
        }}
      >
        <p
          className="font-label"
          style={{
            fontSize: 8,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--text-dim)",
            marginBottom: 10,
            textAlign: "center",
          }}
        >
          Dress Code · {dressCode.theme}
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          {dressCode.colors.map((c, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: c.hex,
                  border: "1px solid var(--border)",
                  boxShadow: `0 0 0 3px rgba(0,0,0,0.3), 0 0 8px ${c.hex}40`,
                }}
              />
              <span className="font-label" style={{ fontSize: 7, color: "var(--text-dim)", letterSpacing: "0.1em" }}>
                {c.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
