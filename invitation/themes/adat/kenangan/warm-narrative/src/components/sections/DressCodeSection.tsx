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
    <section id="dresscode" className="snap-section" style={{ background: "var(--surface)" }}>
      <div className="paper-overlay" />


      <div
        className="relative z-10 flex flex-col items-center text-center px-8 w-full max-w-sm mx-auto"
        style={{ gap: "clamp(10px, 2.5vh, 20px)" }}
      >
        <motion.p
          custom={0}
          transition={{ delay: 0 * 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="font-label"
          style={{ fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--gold-dim)" }}
        >
          Dress Code
        </motion.p>

        <motion.h2
          custom={1}
          transition={{ delay: 1 * 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="font-display"
          style={{
            fontSize: "clamp(26px, 7.5vw, 40px)",
            fontWeight: 400,
            fontStyle: "italic",
            color: "var(--gold)",
            lineHeight: 1.1,
          }}
        >
          {dressCode.theme}
        </motion.h2>

        <motion.div
          custom={2}
          transition={{ delay: 2 * 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="copper-divider mx-auto"
        />

        <motion.p
          custom={3}
          transition={{ delay: 3 * 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="font-body"
          style={{
            color: "var(--text-muted)",
            fontSize: "clamp(12px, 3vw, 13px)",
            fontStyle: "italic",
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
            <div key={color.hex} className="flex flex-col items-center" style={{ gap: 6 }}>
              <div
                style={{
                  width: "clamp(34px, 9vw, 46px)",
                  height: "clamp(34px, 9vw, 46px)",
                  borderRadius: "50%",
                  background: color.hex,
                  border: "1px solid rgba(192,120,48,0.2)",
                  boxShadow: `0 4px 16px ${color.hex}40`,
                  flexShrink: 0,
                }}
              />
              <span
                className="font-label"
                style={{ fontSize: "clamp(8px, 2vw, 9px)", color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase" }}
              >
                {color.name}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Avoid */}
        <motion.div
          custom={5}
          transition={{ delay: 5 * 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="flex flex-col items-center"
          style={{ gap: 8, marginTop: "clamp(4px, 1vh, 8px)" }}
        >
          <p
            className="font-label"
            style={{ fontSize: "9px", color: "var(--text-dim)", letterSpacing: "0.25em", textTransform: "uppercase" }}
          >
            Hindari
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            {dressCode.avoid.map((item) => (
              <span
                key={item}
                className="font-label"
                style={{
                  fontSize: "clamp(9px, 2.5vw, 11px)",
                  color: "var(--text-dim)",
                  padding: "4px 12px",
                  border: "1px solid var(--border)",
                  letterSpacing: "0.05em",
                  textDecoration: "line-through",
                  textDecorationColor: "rgba(192,120,48,0.35)",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 copper-divider-full" />
    </section>
  );
}
