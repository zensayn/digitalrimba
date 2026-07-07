import * as motion from "framer-motion/m";
import ParallaxScene from "@/components/shared/ParallaxScene";
import { sceneFrame } from "@/components/shared/sceneFrame";
import type { InvitationConfig } from "@/lib/config-types";

import { ASSET_BASE as BASE } from "@/lib/assets";

export default function DressCodeSection({ dressCode }: { dressCode: InvitationConfig["dressCode"] }) {

  const fadeUp = (delay: number) => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay, duration: 0.85, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
  });

  return (
    <section id="dresscode" className="snap-section" style={{ background: "transparent" }}>
      {/* Resepsi's garland hangs over our top (topFrame off — the old drape
          doubled up with it); our bottom band overhangs into Gallery. */}
      <ParallaxScene
        layers={sceneFrame({ base: BASE, bg: `${BASE}/DressCodeBg.webp`, variant: 0, density: "full", topFrame: false, seam: "overhang" })}
      />
      <div className="paper-overlay" />

      {/* Center vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(42,34,24,0.04) 100%)", zIndex: 0 }}
      />

      <div
        className="relative z-10 flex flex-col items-center text-center px-8 w-full max-w-[400px] mx-auto"
        style={{ gap: "clamp(10px, 2.5vh, 20px)", paddingTop: "clamp(48px, 10svh, 80px)" }}
      >
        {/* Label */}
        <motion.p
          variants={fadeUp(0)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="font-label"
          style={{ fontSize: "clamp(15px, 4vw, 18px)", fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--gold-deep)", textShadow: "0 1px 5px rgba(250,247,242,0.95), 0 0 10px rgba(250,247,242,0.85)" }}
        >
          Dress Code
        </motion.p>

        {/* Theme title */}
        <motion.h2
          variants={fadeUp(0.1)}
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

        {/* Divider draws from center */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="copper-divider mx-auto"
          style={{ transformOrigin: "center" }}
        />

        <motion.p
          variants={fadeUp(0.25)}
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

        {/* Fabric swatches — 3-column grid, x-stagger alternating */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 72px)",
            gap: "clamp(10px, 2.5vw, 14px)",
            marginTop: "clamp(4px, 1.5vh, 12px)",
          }}
        >
          {dressCode.colors.map((color, i) => (
            <motion.div
              key={color.hex}
              initial={{ opacity: 0, x: i % 2 === 0 ? -22 : 22 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.65, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "flex", flexDirection: "column", width: 72 }}
            >
              {/* Color block */}
              <div
                style={{
                  width: 72,
                  height: 80,
                  background: color.hex,
                  boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.10), 0 4px 16px rgba(42,34,24,0.12)`,
                }}
              />
              {/* Name + hex tag */}
              <div
                style={{
                  padding: "5px 6px 6px",
                  border: "1px solid rgba(192,120,48,0.18)",
                  borderTop: "none",
                  // Plate lebih pekat menggantikan backdrop-filter: blur —
                  // blur backdrop dihitung ulang GPU setiap frame selama
                  // ornamen wind di belakangnya bergerak, mahal di HP.
                  background: "rgba(250,247,242,0.82)",
                }}
              >
                <p
                  className="font-label"
                  style={{ fontSize: "8px", color: "var(--text)", letterSpacing: "0.05em", textTransform: "uppercase", lineHeight: 1.3, marginBottom: 2 }}
                >
                  {color.name}
                </p>
                <p
                  className="font-label"
                  style={{ fontSize: "7px", color: "var(--gold-dim)", letterSpacing: "0.04em", opacity: 0.8 }}
                >
                  {color.hex}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Avoid section */}
        <motion.div
          variants={fadeUp(0.55)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="flex flex-col items-center"
          style={{ gap: 8, marginTop: "clamp(4px, 1vh, 8px)" }}
        >
          <p
            className="font-label"
            style={{ fontSize: "10px", fontWeight: 600, color: "var(--gold-deep)", letterSpacing: "0.25em", textTransform: "uppercase", textShadow: "0 1px 5px rgba(250,247,242,0.95), 0 0 10px rgba(250,247,242,0.85)" }}
          >
            Hindari
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            {dressCode.avoid.map((item) => (
              <span
                key={item}
                className="font-label"
                style={{
                  fontSize: "clamp(10px, 2.8vw, 12px)",
                  color: "var(--text-muted)",
                  padding: "4px 12px",
                  border: "1px solid var(--border)",
                  // Solid-ish plate: the chips sit in the seam-garland zone, and
                  // a transparent background lets the flowers bleed through the text.
                  background: "rgba(250,247,242,0.85)",
                  letterSpacing: "0.05em",
                  textDecoration: "line-through",
                  textDecorationColor: "rgba(192,120,48,0.45)",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
