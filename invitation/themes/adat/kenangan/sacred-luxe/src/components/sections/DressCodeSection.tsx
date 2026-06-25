import * as motion from "framer-motion/client";
import type { InvitationConfig } from "@/lib/config-types";

export default function DressCodeSection({ dressCode }: { dressCode: InvitationConfig["dressCode"] }) {

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
  };

  return (
    <section id="dresscode" className="snap-section" style={{ background: "var(--bg)" }}>
      <div className="noise-overlay" />
      <div className="vignette" />

      {/* Decorative large bg text */}
      <div
        className="absolute font-display select-none pointer-events-none z-0"
        style={{
          fontSize: "clamp(60px, 20vw, 120px)",
          fontWeight: 300,
          color: "rgba(201,168,76,0.06)",
          top: "6%",
          left: "50%",
          transform: "translateX(-50%)",
          letterSpacing: "0.15em",
          whiteSpace: "nowrap",
          lineHeight: 1,
        }}
      >
        ATTIRE
      </div>

      <div
        className="relative z-10 flex flex-col items-center text-center px-8 w-full max-w-sm mx-auto"
        style={{ gap: "clamp(10px, 2.5vh, 20px)" }}
      >
        {/* Label */}
        <motion.p
          custom={0}
          transition={{ delay: 0 * 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="text-xs tracking-[0.3em] uppercase"
          style={{ color: "var(--gold-dim)" }}
        >
          Dress Code
        </motion.p>

        {/* Theme name */}
        <motion.h2
          custom={1}
          transition={{ delay: 1 * 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="font-display"
          style={{
            fontSize: "clamp(28px, 8vw, 42px)",
            fontWeight: 300,
            color: "var(--gold-light)",
            lineHeight: 1.1,
          }}
        >
          {dressCode.theme}
        </motion.h2>

        {/* Divider */}
        <motion.div
          custom={2}
          transition={{ delay: 2 * 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="gold-divider mx-auto"
        />

        {/* Description */}
        <motion.p
          custom={3}
          transition={{ delay: 3 * 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="font-light leading-relaxed"
          style={{
            color: "var(--text-muted)",
            fontSize: "clamp(12px, 3vw, 13px)",
            lineHeight: 1.85,
            maxWidth: "32ch",
          }}
        >
          {dressCode.description}
        </motion.p>

        {/* Color swatches */}
        <motion.div
          custom={4}
          transition={{ delay: 4 * 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="flex flex-wrap justify-center"
          style={{ gap: "clamp(12px, 4vw, 20px)", marginTop: "clamp(4px, 1.5vh, 12px)" }}
        >
          {dressCode.colors.map((color) => (
            <div key={color.hex} className="flex flex-col items-center" style={{ gap: 8 }}>
              {/* Swatch circle */}
              <div
                style={{
                  width: "clamp(36px, 10vw, 48px)",
                  height: "clamp(36px, 10vw, 48px)",
                  borderRadius: "50%",
                  background: color.hex,
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: `0 4px 16px ${color.hex}40, inset 0 1px 0 rgba(255,255,255,0.12)`,
                  flexShrink: 0,
                }}
              />
              {/* Color name */}
              <span
                style={{
                  fontSize: "clamp(8px, 2vw, 9px)",
                  color: "var(--text-dim)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 300,
                }}
              >
                {color.name}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Avoid section */}
        <motion.div
          custom={5}
          transition={{ delay: 5 * 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="flex flex-col items-center"
          style={{ gap: 8, marginTop: "clamp(4px, 1vh, 10px)" }}
        >
          <p
            style={{
              fontSize: "9px",
              color: "var(--text-dim)",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Hindari
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            {dressCode.avoid.map((item) => (
              <span
                key={item}
                style={{
                  fontSize: "clamp(9px, 2.5vw, 11px)",
                  color: "var(--text-dim)",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 300,
                  padding: "4px 12px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "1px",
                  letterSpacing: "0.05em",
                  textDecoration: "line-through",
                  textDecorationColor: "rgba(201,168,76,0.3)",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom gold line */}
      <div className="absolute bottom-0 left-0 right-0 gold-divider-full" />
    </section>
  );
}
