import * as motion from "framer-motion/client";
import { Suspense } from "react";
import GuestName from "@/components/shared/GuestName";
import type { InvitationConfig } from "@/lib/config-types";

interface GreetingSectionProps {
  couple: InvitationConfig["couple"];
}

export default function GreetingSection({ couple }: GreetingSectionProps) {

  const fade = (delay: number) => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay, duration: 0.9, ease: "easeOut" as const },
    },
  });

  return (
    <section id="greeting" className="snap-section" style={{ background: "var(--surface)", paddingBottom: "clamp(60px, 14vh, 110px)" }}>
      <div className="paper-overlay" />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 45% at 50% 35%, rgba(192,120,48,0.06) 0%, transparent 70%)",
        }}
      />

      <div
        className="relative z-10 flex flex-col items-center text-center w-full"
      >
        {/* Header — label, bunga, bismillah tetap terkontrol */}
        <div className="flex flex-col items-center w-full max-w-xs px-8">
          <motion.p
            variants={fade(0)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-15%" }}
            className="font-label"
            style={{
              color: "var(--gold-dim)",
              fontSize: "9px",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              marginBottom: "clamp(16px, 4vh, 28px)",
            }}
          >
          </motion.p>

          <motion.img
            variants={fade(0.05)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-15%" }}
            src={`${process.env.NEXT_PUBLIC_THEMES_CDN}/adat/kenangan/warm-narrative/Borderbawah.webp`}
            alt="Border Bawah"
            style={{
              width: "80vw",
              height: "auto",
              objectFit: "contain",
              marginBottom: "-55px",
              opacity: 0.85,
            }}
          />

          <motion.div
            variants={fade(0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-15%" }}
            className="flex flex-col items-center"
            style={{ marginBottom: "clamp(12px, 3vh, 22px)" }}
          >
            <p
              className="font-garamond"
              style={{
                fontSize: "clamp(26px, 8vw, 42px)",
                color: "var(--gold)",
                lineHeight: 1.5,
                letterSpacing: "0.04em",
                fontStyle: "italic",
              }}
            >
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </p>
            <div className="copper-divider" style={{ marginTop: "8px", opacity: 0.6 }} />
          </motion.div>
        </div>

        {/* Surat — semua isi di dalam */}
        <motion.div
          variants={fade(0.2)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          style={{
            position: "relative",
            aspectRatio: "3 / 4",
            width: "min(clamp(280px, 88vw, 400px), 43vh)",
            overflow: "hidden",
          }}
        >
          <img
            src={`${process.env.NEXT_PUBLIC_THEMES_CDN}/adat/kenangan/warm-narrative/Surat.webp`}
            alt="Surat Undangan"
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

          {/* Isi surat */}
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
            {/* Kepada */}
            <p
              className="font-label"
              style={{
                fontSize: "clamp(7px, 2vw, 9px)",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--text-dim)",
                marginBottom: 2,
              }}
            >
              Kepada Yth.
            </p>
            <p
              className="font-display"
              style={{
                fontSize: "clamp(14px, 4vw, 18px)",
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

            {/* Garis */}
            <div style={{ width: 24, height: 1, background: "var(--gold)", opacity: 0.3, marginBottom: "4%" }} />

            {/* Paragraf undangan */}
            <p
              className="font-garamond"
              style={{
                fontSize: "clamp(9px, 2.4vw, 11px)",
                fontStyle: "italic",
                color: "var(--text-muted)",
                lineHeight: 1.8,
                marginBottom: "auto",
              }}
            >
              Assalamu&apos;alaikum Wr. Wb.
              <br /><br />
              Tanpa mengurangi rasa hormat, kami mengundang Bapak / Ibu / Saudara/i untuk hadir dan turut mendoakan dalam hari istimewa kami.
            </p>

            {/* Tanda tangan */}
            <div style={{ paddingTop: "5%", borderTop: "1px solid rgba(192,120,48,0.2)" }}>
              <p
                className="font-label"
                style={{
                  fontSize: "clamp(6px, 1.8vw, 8px)",
                  letterSpacing: "0.14em",
                  color: "var(--text-dim)",
                  marginBottom: 3,
                }}
              >
                Hormat kami,
              </p>
              <p
                className="font-garamond"
                style={{
                  fontSize: "clamp(12px, 3.2vw, 15px)",
                  fontStyle: "italic",
                  color: "var(--gold)",
                  lineHeight: 1.25,
                }}
              >
                {couple.groom.name} &amp; {couple.bride.name}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
