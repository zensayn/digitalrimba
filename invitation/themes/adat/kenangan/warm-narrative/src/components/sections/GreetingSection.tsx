import * as motion from "framer-motion/m";
import { Suspense } from "react";
import GuestName from "@/components/shared/GuestName";
import ParallaxScene from "@/components/shared/ParallaxScene";
import { sceneFrame } from "@/components/shared/sceneFrame";
import type { InvitationConfig } from "@/lib/config-types";

const BASE = `${process.env.NEXT_PUBLIC_THEMES_CDN}/adat/kenangan/warm-narrative`;

interface GreetingSectionProps {
  couple: InvitationConfig["couple"];
}

export default function GreetingSection({ couple }: GreetingSectionProps) {

  // Horizontal clip-path reveal (left → right)
  const clipH = (delay: number) => ({
    hidden: { clipPath: "inset(0 100% 0 0)" },
    visible: {
      clipPath: "inset(0 0% 0 0)",
      transition: { delay, duration: 1.0, ease: [0.22, 1, 0.36, 1] as const },
    },
  });

  const suratAppear = (delay: number) => ({
    hidden: { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay, duration: 1.0, ease: [0.22, 1, 0.36, 1] as const },
    },
  });

  return (
    <section id="greeting" className="snap-section" style={{ background: "transparent", paddingBottom: "clamp(24px, 6vh, 48px)" }}>
      <ParallaxScene
        layers={[
          // Full dense frame (was near-empty) + keep the signature top drape.
          // Cover above stays contained (petal clip), so we keep our top frame;
          // our bottom band hangs over the seam into Couple.
          ...sceneFrame({ base: BASE, bg: `${BASE}/GreetingBg.webp`, variant: 1, density: "full", seam: "overhang" }),
          { src: `${BASE}/SakuraDrapeTop.webp`, depth: 0.09, opacity: 0.9, zIndex: 1, enterDuration: 1.7, enterDelay: 0.35, overhang: true, box: { top: "-1svh", left: "0", width: "100%", enterX: 0, enterY: -90 } },
        ]}
      />
      <div className="paper-overlay" />

      {/* Enhanced radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 45% at 50% 35%, rgba(192,120,48,0.10) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center w-full" style={{ paddingTop: "clamp(24px, 5svh, 44px)" }}>
        {/* Header */}
        {/* Standard gutter: 32px each side, capped at the 400px frame width —
            matches every other section so text and images share one edge. */}
        <div className="flex flex-col items-center w-full max-w-[400px] px-8">
          {/* In-view is observed on this UN-clipped wrapper, and the variant
              state propagates to the clip-revealed children. Observing the
              children directly deadlocks: their hidden state is
              clip-path inset(0 100% 0 0) — a zero-area sliver the
              IntersectionObserver can never see enough of to fire. */}
          <motion.div
            className="flex flex-col items-center"
            style={{ marginBottom: "clamp(12px, 3vh, 22px)" }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
          >
            {/* Bismillah — horizontal clip reveal */}
            <motion.p
              variants={clipH(0.15)}
              className="font-display"
              style={{
                fontSize: "clamp(26px, 8vw, 42px)",
                // Deep copper (not the light runtime --gold) + strong cream halo:
                // the calligraphy sits right over the drape florals.
                color: "var(--gold-deep)",
                lineHeight: 1.5,
                letterSpacing: "0.04em",
                fontStyle: "italic",
                textShadow: "0 1px 3px rgba(250,247,242,0.98), 0 2px 14px rgba(250,247,242,1), 0 0 7px rgba(250,247,242,0.9)",
              }}
            >
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </motion.p>
            {/* Divider draws in after text */}
            <motion.div
              variants={clipH(0.7)}
              className="copper-divider"
              style={{ marginTop: "8px", opacity: 0.6 }}
            />
          </motion.div>
        </div>

        {/* Surat — fades up into view */}
        <motion.div
          variants={suratAppear(0.35)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          style={{
            position: "relative",
            aspectRatio: "3 / 4",
            // Same 32px side gutter as the text content (336 = 400 frame − 64),
            // still capped by viewport height so the letter fits on screen.
            width: "min(clamp(280px, 100vw - 64px, 336px), 43vh)",
          }}
        >
          {/* Float wrapper — image + text float together as one unit */}
          <div style={{ position: "absolute", inset: 0, animation: "float 4.5s ease-in-out infinite" }}>
            <img
              src={`${process.env.NEXT_PUBLIC_THEMES_CDN}/adat/kenangan/warm-narrative/Surat.webp`}
              alt=""
              loading="lazy"
              decoding="async"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "fill",
                opacity: 0.97,
                pointerEvents: "none",
              }}
            />

            {/* Isi surat — floats with the surat background */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                padding: "38% 20% 22%",
              display: "flex",
              flexDirection: "column",
              textAlign: "left",
            }}
          >
            <p
              className="font-label"
              style={{
                fontSize: "clamp(8px, 2.2vw, 10px)",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: 2,
              }}
            >
              Kepada Yth.
            </p>
            <p
              className="font-display"
              style={{
                fontSize: "clamp(15px, 4.3vw, 19px)",
                fontWeight: 400,
                fontStyle: "italic",
                color: "var(--gold)",
                lineHeight: 1.2,
                marginBottom: "5%",
              }}
            >
              <Suspense fallback="Tamu Undangan">
                <GuestName />
              </Suspense>
            </p>

            <div style={{ width: 24, height: 1, background: "var(--gold)", opacity: 0.3, marginBottom: "4%" }} />

            <p
              className="font-display"
              style={{
                fontSize: "clamp(10px, 2.7vw, 12px)",
                fontStyle: "italic",
                color: "var(--text-muted)",
                lineHeight: 1.75,
                marginBottom: "auto",
              }}
            >
              Assalamu&apos;alaikum Wr. Wb.
              <br /><br />
              Tanpa mengurangi rasa hormat, kami mengundang Bapak / Ibu / Saudara/i untuk hadir dan turut mendoakan dalam hari istimewa kami.
            </p>

            <div style={{ paddingTop: "5%", borderTop: "1px solid rgba(192,120,48,0.2)" }}>
              <p
                className="font-label"
                style={{
                  fontSize: "clamp(7px, 2vw, 9px)",
                  letterSpacing: "0.14em",
                  color: "var(--text-muted)",
                  marginBottom: 3,
                }}
              >
                Hormat kami,
              </p>
              <p
                className="font-display"
                style={{
                  fontSize: "clamp(13px, 3.4vw, 16px)",
                  fontStyle: "italic",
                  color: "var(--gold)",
                  lineHeight: 1.25,
                }}
              >
                {couple.groom.name} &amp; {couple.bride.name}
              </p>
            </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
