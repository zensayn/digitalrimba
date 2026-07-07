"use client";

import * as motion from "framer-motion/m";
import ParallaxScene from "@/components/shared/ParallaxScene";
import { sceneFrame } from "@/components/shared/sceneFrame";
import type { InvitationConfig } from "@/lib/config-types";

import { ASSET_BASE as BASE, hideOnError } from "@/lib/assets";

// Cream halo + soft plate so the names stay readable over the dense floral frame.
const HALO = "0 1px 7px rgba(250,247,242,0.95), 0 0 3px rgba(250,247,242,0.9)";
const TEXT_PLATE = "radial-gradient(ellipse 128% 116% at center, rgba(250,247,242,0.8) 0%, rgba(250,247,242,0.5) 55%, rgba(250,247,242,0) 100%)";

export default function CoupleSection({ couple }: { couple: InvitationConfig["couple"] }) {

  // Bottom-to-top "rises from the paper" reveal, transform-only: the outer
  // window slides up while the photo counter-slides down, so the net effect is
  // identical to a clip reveal but runs entirely on the compositor. The old
  // clip-path inset animation restyled + repainted the sepia-filtered photo
  // every frame and janked on mid-range phones.
  const curtain = (delay: number) => ({
    hidden: { y: "100%" },
    visible: {
      y: "0%",
      transition: { delay, duration: 1.0, ease: [0.22, 1, 0.36, 1] as const },
    },
  });
  const curtainInner = (delay: number) => ({
    hidden: { y: "-100%" },
    visible: {
      y: "0%",
      transition: { delay, duration: 1.0, ease: [0.22, 1, 0.36, 1] as const },
    },
  });

  const fadeUp = (delay: number) => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay, duration: 0.85, ease: "easeOut" as const },
    },
  });

  return (
    <section id="couple" className="snap-section" style={{ background: "transparent" }}>
      {/* Greeting's garland hangs over our top (topFrame off — the old drape
          doubled up with it); our corner pieces overhang into Love Story. */}
      <ParallaxScene
        layers={sceneFrame({ base: BASE, bg: `${BASE}/CoupleBg.webp`, variant: 1, density: "full", base_clusters: false, topFrame: false, seam: "overhang" })}
      />
      <div className="paper-overlay" />

      {/* Italic watermark */}
      <div
        className="absolute font-display select-none pointer-events-none"
        style={{
          fontSize: "clamp(64px, 22vw, 120px)",
          fontWeight: 400,
          fontStyle: "italic",
          color: "rgba(192,120,48,0.03)",
          bottom: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          whiteSpace: "nowrap",
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        Mempelai
      </div>

      {/* Radial glow behind photos */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          height: "50%",
          background: "radial-gradient(ellipse 70% 50% at 50% 45%, rgba(192,120,48,0.07) 0%, transparent 70%)",
          zIndex: 2,
        }}
      />

      <div
        className="relative z-10 flex flex-col items-center w-full max-w-[400px] mx-auto px-8"
        style={{ paddingBottom: "clamp(48px, 10svh, 80px)", paddingTop: "clamp(48px, 10svh, 80px)" }}
      >
        {/* Eyebrow + display title + intro — same header hierarchy as the
            Hadiah/RSVP sections: small tracked label, large Playfair Display
            italic title, garamond intro line. Halos lift everything off the
            garland hanging over this section's top. */}
        <motion.p
          variants={fadeUp(0)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-15%" }}
          className="font-label"
          style={{ color: "var(--gold-deep)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.32em", textTransform: "uppercase", textShadow: "0 1px 5px rgba(250,247,242,0.95), 0 0 10px rgba(250,247,242,0.85)" }}
        >
          Kedua Mempelai
        </motion.p>
        <motion.h2
          variants={fadeUp(0.08)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-15%" }}
          className="font-display"
          style={{ color: "var(--gold-deep)", fontSize: "clamp(30px, 9vw, 44px)", fontWeight: 400, fontStyle: "italic", lineHeight: 1.15, marginTop: 4, textShadow: "0 1px 5px rgba(250,247,242,0.95), 0 0 12px rgba(250,247,242,0.9)" }}
        >
          Mempelai
        </motion.h2>
        <motion.p
          variants={fadeUp(0.16)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-15%" }}
          className="font-display"
          style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "clamp(13px, 3.4vw, 15px)", marginTop: 8, marginBottom: "clamp(14px, 3.5vh, 24px)", textAlign: "center", textShadow: "0 1px 5px rgba(250,247,242,0.95), 0 0 10px rgba(250,247,242,0.85)" }}
        >
          Dua insan, satu kisah baru yang dimulai.
        </motion.p>

        {/* GROOM — photo left, details beside on the right */}
        <div className="w-full flex items-center" style={{ gap: "clamp(14px, 4.5vw, 22px)" }}>
          <div style={{ position: "relative", width: "49%", flexShrink: 0, aspectRatio: "3/4", transform: "translateX(-6px)", zIndex: 1 }}>
            <div style={{ position: "absolute", top: "6.5%", left: "6.5%", right: "6.5%", bottom: "6.5%", overflow: "hidden", boxShadow: "var(--shadow-warm)" }}>
              <motion.div variants={curtain(0.15)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
                <motion.div variants={curtainInner(0.15)} style={{ position: "absolute", inset: 0 }}>
                  <img src={couple.groom.photo} alt={couple.groom.name} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "sepia(18%) contrast(1.04) brightness(0.97)", display: "block" }} />
                </motion.div>
              </motion.div>
            </div>
            <img
              src={`${BASE}/PhotoFramePortrait.webp`}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              onError={hideOnError}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 3 }}
            />
          </div>
          <motion.div
            variants={fadeUp(0.32)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }}
            style={{ flex: 1, minWidth: 0, textAlign: "left", background: TEXT_PLATE, padding: "6px 10px", borderRadius: 12 }}
          >
            <span className="font-label" style={{ color: "var(--gold-dim)", fontSize: "9px", letterSpacing: "0.22em", textTransform: "uppercase", textShadow: HALO }}>Mempelai Pria</span>
            <h2 className="font-display" style={{ color: "var(--text)", fontWeight: 400, fontStyle: "italic", fontSize: "clamp(19px, 5.6vw, 27px)", lineHeight: 1.08, margin: "5px 0 8px", textShadow: HALO }}>
              {couple.groom.fullName}
            </h2>
            <p className="font-body" style={{ color: "var(--text-muted)", fontSize: "clamp(10.5px, 2.7vw, 12px)", fontStyle: "italic", lineHeight: 1.55, textShadow: HALO }}>
              {couple.groom.parents}
            </p>
            <p className="font-label" style={{ color: "var(--gold)", fontSize: "11px", letterSpacing: "0.06em", marginTop: 6, textShadow: HALO }}>
              {couple.groom.instagram}
            </p>
          </motion.div>
        </div>

        {/* & separator */}
        <motion.div
          variants={fadeUp(0.4)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }}
          className="flex items-center justify-center"
          style={{ gap: 14, width: "100%", maxWidth: 230, margin: "clamp(5px, 1.6vh, 11px) 0" }}
        >
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, var(--gold-dim))", opacity: 0.55 }} />
          <span className="font-display" style={{ color: "var(--gold)", fontSize: "clamp(24px, 6.5vw, 32px)", fontStyle: "italic", lineHeight: 1 }}>&amp;</span>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, var(--gold-dim), transparent)", opacity: 0.55 }} />
        </motion.div>

        {/* BRIDE — details left, photo right (mirrored) */}
        <div className="w-full flex items-center" style={{ gap: "clamp(14px, 4.5vw, 22px)" }}>
          <motion.div
            variants={fadeUp(0.52)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }}
            style={{ flex: 1, minWidth: 0, textAlign: "right", background: TEXT_PLATE, padding: "6px 10px", borderRadius: 12 }}
          >
            <span className="font-label" style={{ color: "var(--gold-dim)", fontSize: "9px", letterSpacing: "0.22em", textTransform: "uppercase", textShadow: HALO }}>Mempelai Wanita</span>
            <h2 className="font-display" style={{ color: "var(--text)", fontWeight: 400, fontStyle: "italic", fontSize: "clamp(19px, 5.6vw, 27px)", lineHeight: 1.08, margin: "5px 0 8px", textShadow: HALO }}>
              {couple.bride.fullName}
            </h2>
            <p className="font-body" style={{ color: "var(--text-muted)", fontSize: "clamp(10.5px, 2.7vw, 12px)", fontStyle: "italic", lineHeight: 1.55, textShadow: HALO }}>
              {couple.bride.parents}
            </p>
            <p className="font-label" style={{ color: "var(--gold)", fontSize: "11px", letterSpacing: "0.06em", marginTop: 6, textShadow: HALO }}>
              {couple.bride.instagram}
            </p>
          </motion.div>
          <div style={{ position: "relative", width: "49%", flexShrink: 0, aspectRatio: "3/4", transform: "translateX(6px)", zIndex: 1 }}>
            <div style={{ position: "absolute", top: "6.5%", left: "6.5%", right: "6.5%", bottom: "6.5%", overflow: "hidden", boxShadow: "var(--shadow-warm)" }}>
              <motion.div variants={curtain(0.62)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
                <motion.div variants={curtainInner(0.62)} style={{ position: "absolute", inset: 0 }}>
                  <img src={couple.bride.photo} alt={couple.bride.name} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "sepia(18%) contrast(1.04) brightness(0.97)", display: "block" }} />
                </motion.div>
              </motion.div>
            </div>
            <img
              src={`${BASE}/PhotoFramePortrait.webp`}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              onError={hideOnError}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 3 }}
            />
          </div>
        </div>

        {/* Quote */}
        <motion.p
          variants={fadeUp(0.72)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-15%" }}
          className="font-display"
          style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "clamp(13px, 3.4vw, 15px)", lineHeight: 1.85, marginTop: "clamp(14px, 3.5vh, 24px)", textAlign: "center", padding: "10px 14px", background: TEXT_PLATE, borderRadius: 12, textShadow: HALO }}
        >
          &ldquo;{couple.quote}&rdquo;
        </motion.p>
      </div>
    </section>
  );
}
