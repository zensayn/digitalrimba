"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import InfiniteMenu from "@/components/shared/InfiniteMenu";
import { useInvitationConfig } from "@/components/shared/RimbaConfigProvider";

export default function GallerySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-15%" });
  const [isPreview, setIsPreview] = useState(false);
  const { gallery } = useInvitationConfig();

  useEffect(() => {
    setIsPreview(window.location.search.includes("preview=1"));
  }, []);

  const menuItems = useMemo(() => {
    return gallery.map(item => ({
      image: item.src,
      link: "",
      title: item.alt,
      description: "",
    }));
  }, [gallery]);

  return (
    <section id="gallery" className="snap-section" style={{ background: "var(--surface-2)" }}>
      <div className="noise-overlay" />

      {/* Decorative bg text */}
      <div
        className="absolute font-display select-none pointer-events-none"
        style={{
          fontSize: "clamp(80px, 25vw, 140px)",
          fontWeight: 300,
          color: "rgba(201,168,76,0.025)",
          top: "5%",
          left: "50%",
          transform: "translateX(-50%)",
          letterSpacing: "-0.05em",
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        GALERI
      </div>

      <div
        ref={ref}
        className="relative z-10 flex flex-col items-center w-full px-6"
        style={{ gap: "clamp(14px, 3vh, 24px)" }}
      >
        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-xs tracking-[0.3em] uppercase"
          style={{ color: "var(--gold-dim)" }}
        >
          Kenangan Terindah
        </motion.p>

        {/* Framed globe */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.2 }}
          style={{
            width: "100%",
            maxWidth: "360px",
            height: "clamp(260px, 55vw, 380px)",
            border: "1px solid var(--border)",
            borderRadius: "2px",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 0 60px rgba(201,168,76,0.06), inset 0 0 40px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isPreview ? (
            <div style={{ color: "var(--gold-dim)", fontSize: "12px", letterSpacing: "0.2em", textAlign: "center" }}>
              <div style={{ fontSize: "24px", marginBottom: "8px", opacity: 0.4 }}>◈</div>
              GALLERY
            </div>
          ) : null}
          {/* Corner ornaments */}
          {(["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"] as const).map((pos, i) => (
            <div
              key={i}
              className={`absolute ${pos} pointer-events-none z-10`}
              style={{
                width: 16,
                height: 16,
                borderTop: i < 2 ? "1px solid var(--gold)" : "none",
                borderBottom: i >= 2 ? "1px solid var(--gold)" : "none",
                borderLeft: i % 2 === 0 ? "1px solid var(--gold)" : "none",
                borderRight: i % 2 === 1 ? "1px solid var(--gold)" : "none",
                opacity: 0.6,
              }}
            />
          ))}

          {!isPreview && <InfiniteMenu items={menuItems} scale={1.4} />}
        </motion.div>

        {/* Caption */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="font-display italic text-center"
          style={{
            color: "var(--text-dim)",
            fontSize: "clamp(12px, 3.5vw, 14px)",
            fontWeight: 300,
            letterSpacing: "0.05em",
          }}
        >
          Putar untuk menjelajahi kenangan kami
        </motion.p>
      </div>
    </section>
  );
}
