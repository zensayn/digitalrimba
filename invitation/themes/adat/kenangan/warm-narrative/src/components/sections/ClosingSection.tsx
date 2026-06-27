import * as motion from "framer-motion/client";
import type { InvitationConfig } from "@/lib/config-types";

export default function ClosingSection({ couple }: { couple: InvitationConfig["couple"] }) {

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: "easeOut" as const },
    },
  };

  return (
    <section id="closing" className="snap-section" style={{ background: "var(--bg)" }}>
      <div className="paper-overlay" />

      {/* Decorative intersecting rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div
          style={{
            width: "min(340px, 72vw)",
            height: "min(340px, 72vw)",
            borderRadius: "50%",
            border: "1px solid var(--border)",
            opacity: 0.45,
            transform: "translateX(-14%)",
            flexShrink: 0,
          }}
        />
        <div
          style={{
            width: "min(340px, 72vw)",
            height: "min(340px, 72vw)",
            borderRadius: "50%",
            border: "1px solid var(--border)",
            opacity: 0.45,
            position: "absolute",
            transform: "translateX(14%)",
          }}
        />
      </div>

      <div
        className="relative z-10 flex flex-col items-center text-center w-full max-w-xs mx-auto px-6"
        style={{
          paddingTop: "clamp(28px, 6vh, 48px)",
          paddingBottom: "calc(160px + env(safe-area-inset-bottom))"
        }}
      >
        <motion.p
          custom={0}
          transition={{ delay: 0 * 0.2, duration: 1, ease: "easeOut" }}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="font-label"
          style={{
            fontSize: "9px",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--gold-dim)",
            marginBottom: "clamp(20px, 5vh, 36px)",
          }}
        >
          Terima Kasih
        </motion.p>

        <motion.h2
          custom={1}
          transition={{ delay: 1 * 0.2, duration: 1, ease: "easeOut" }}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="font-display text-copper-gradient leading-tight"
          style={{ fontSize: "clamp(48px, 14vw, 80px)", fontWeight: 400 }}
        >
          {couple.groom.name}
        </motion.h2>

        <motion.div
          custom={2}
          transition={{ delay: 2 * 0.2, duration: 1, ease: "easeOut" }}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="flex items-center gap-4 my-2"
        >
          <div className="copper-divider" />
          <span
            className="font-garamond"
            style={{ color: "var(--gold-dim)", fontSize: "clamp(18px, 5vw, 24px)", fontStyle: "italic" }}
          >
            &amp;
          </span>
          <div className="copper-divider" />
        </motion.div>

        <motion.h2
          custom={3}
          transition={{ delay: 3 * 0.2, duration: 1, ease: "easeOut" }}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="font-display text-copper-gradient leading-tight"
          style={{ fontSize: "clamp(48px, 14vw, 80px)", fontWeight: 400 }}
        >
          {couple.bride.name}
        </motion.h2>

        <motion.div
          custom={4}
          transition={{ delay: 4 * 0.2, duration: 1, ease: "easeOut" }}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="relative w-full flex flex-col items-center justify-center"
          style={{
            marginTop: "clamp(16px, 4vh, 28px)",
            marginBottom: "clamp(16px, 4vh, 28px)",
          }}
        >
          <p
            className="font-garamond"
            style={{
              color: "var(--text-muted)",
              fontStyle: "italic",
              fontSize: "clamp(13px, 3.5vw, 15px)",
              lineHeight: 1.85,
              padding: "0 10px",
            }}
          >
            &ldquo;Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya.&rdquo;
            <br />
            <span className="font-label" style={{ color: "var(--text-dim)", fontSize: "11px", fontStyle: "normal", display: "block", marginTop: "8px" }}>
              — QS. Ar-Rum: 21
            </span>
          </p>
        </motion.div>

        <motion.div custom={5} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-15%" }} transition={{ delay: 5 * 0.2, duration: 1, ease: "easeOut" }}>
          <div className="copper-divider mx-auto" style={{ marginBottom: 16 }} />
        </motion.div>

        <motion.p
          custom={6}
          transition={{ delay: 6 * 0.2, duration: 1, ease: "easeOut" }}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="font-label"
          style={{ color: "var(--gold-dim)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase" }}
        >
          {couple.hashtag}
        </motion.p>
      </div>

      {/* Footer brand */}
      <div
        className="absolute left-0 right-0 flex flex-col items-center gap-1 z-10"
        style={{ bottom: "calc(32px + 72px + env(safe-area-inset-bottom))" }}
      >
        <div className="copper-divider-full" style={{ marginBottom: 12 }} />
        <p className="font-label" style={{ color: "var(--text-dim)", fontSize: "9px", letterSpacing: "0.3em" }}>
          RIMBA DIGITAL · KISAH
        </p>
        <p className="font-label" style={{ color: "var(--text-dim)", fontSize: "9px", opacity: 0.5 }}>
          Deeply Rooted in Your Moments
        </p>
      </div>

      {/* Bottom border ornament */}
      <div
        className="absolute pointer-events-none select-none z-10"
        style={{ bottom: 0, left: 0, right: 0, width: "100%", transform: "translateY(40%)" }}
      >
        <img
          src={`${process.env.NEXT_PUBLIC_THEMES_CDN}/adat/kenangan/warm-narrative/Borderbawah.webp`}
          alt="Bottom Border"
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </div>
    </section>
  );
}
