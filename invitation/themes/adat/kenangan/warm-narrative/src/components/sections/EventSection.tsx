"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import ParallaxScene from "@/components/shared/ParallaxScene";
import { sceneFrame } from "@/components/shared/sceneFrame";
import type { InvitationConfig } from "@/lib/config-types";

const BASE = `${process.env.NEXT_PUBLIC_THEMES_CDN}/adat/kenangan/warm-narrative`;

interface EventSectionProps {
  couple: InvitationConfig["couple"];
  event: {
    title: string;
    day: string;
    date: string;
    time: string;
    venue: string;
    address: string;
    mapsUrl: string;
    embedUrl: string;
    startISO: string;
    endISO: string;
  };
  index: number;
  sectionId: string;
}

export default function EventSection({ couple, event, index, sectionId }: EventSectionProps) {
  const isAkad = index === 0;
  const [mapInteractive, setMapInteractive] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [dateNum, dateMonth, dateYear] = event.date.split(" ");

  const bgAsset = isAkad
    ? `${process.env.NEXT_PUBLIC_THEMES_CDN}/adat/kenangan/warm-narrative/CincinEmas.webp`
    : `${process.env.NEXT_PUBLIC_THEMES_CDN}/adat/kenangan/warm-narrative/TempatPernikahan.webp`;

  const sceneBg = isAkad ? `${BASE}/AkadBg.webp` : `${BASE}/ResepsiBg.webp`;
  const sceneArch = isAkad ? `${BASE}/AkadArch.webp` : `${BASE}/ResepsiArch.webp`;

  const calendarUrl = (() => {
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: `${event.title} — ${couple.groom.name} & ${couple.bride.name}`,
      dates: `${event.startISO}/${event.endISO}`,
      details: `Anda diundang ke ${event.title} pernikahan ${couple.groom.name} & ${couple.bride.name}.\n\n${event.time} WIB`,
      location: `${event.venue}, ${event.address}`,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  })();

  // Frame-first: let the sceneFrame's core pieces land before content reveals,
  // so the floral stage builds first and the text follows a beat later.
  const REVEAL_AFTER_FRAME = 0.6;

  // Direction-aware fade: Akad slides from left, Resepsi from right
  const fade = (delay: number) => ({
    hidden: { opacity: 0, x: isAkad ? -18 : 18 },
    visible: { opacity: 1, x: 0, transition: { delay: REVEAL_AFTER_FRAME + delay, duration: 0.85, ease: "easeOut" as const } },
  });

  return (
    <section
      ref={sectionRef}
      id={sectionId}
      className="snap-section"
      style={{ background: "transparent" }}
    >
      {/* Painterly sakura scene — dense frame assembled piece-by-piece (sceneFrame).
          Akad uses kit v1, Resepsi v2 so the two events don't look identical.
          No top frame: the previous section's garland hangs over this seam;
          our own bottom band overhangs into the next section the same way. */}
      <ParallaxScene
        fadeTop={6}
        fadeBottom={12}
        layers={sceneFrame({
          base: BASE,
          bg: sceneBg,
          arch: sceneArch,
          variant: isAkad ? 0 : 1,
          density: "full",
          topFrame: false,
          seam: "overhang",
        })}
      />

      <div className="paper-overlay" />

      {/* Resepsi — top-right gradient accent */}
      {!isAkad && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 40% at 80% 20%, rgba(212,160,86,0.08) 0%, transparent 60%)", zIndex: 0 }}
        />
      )}

      {/* Radial glow */}
      <div
        className="absolute pointer-events-none"
        style={{ top: "22%", left: "50%", transform: "translateX(-50%)", width: "clamp(160px, 50vw, 240px)", height: "clamp(160px, 50vw, 240px)", borderRadius: "50%", background: "radial-gradient(circle, rgba(192,120,48,0.07) 0%, transparent 70%)", zIndex: 1 }}
      />

      {/* Legibility scrim — z 6 sits above the seam garland (z 5) but below the
          content (z 10), lifting the label/date off the dense florals the same
          way the Cover does. Fades out before the framed edges so the flowers
          stay rich at the borders. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 6, background: "radial-gradient(ellipse 86% 60% at 50% 40%, rgba(250,247,242,0.66) 0%, rgba(250,247,242,0.32) 48%, rgba(250,247,242,0) 74%)" }}
      />

      {/* Roman numeral watermark */}
      <div
        className="absolute font-display select-none pointer-events-none"
        style={{ fontSize: "clamp(120px, 35vw, 220px)", fontWeight: 400, fontStyle: "italic", color: "rgba(192,120,48,0.025)", bottom: "5%", right: "-2%", lineHeight: 1, letterSpacing: "-0.05em", zIndex: 1 }}
      >
        {isAkad ? "I" : "II"}
      </div>

      <div
        className="relative z-10 flex flex-col items-center w-full max-w-[400px] mx-auto px-8"
        style={{ gap: "clamp(7px, 1.8vh, 13px)", paddingTop: "clamp(48px, 10svh, 80px)", paddingBottom: "calc(clamp(10px, 2vh, 18px) + 52px)" }}
      >
        {/* Label */}
        <motion.div variants={fade(0)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} className="flex flex-col items-center gap-2">
          {/* Deep copper, not runtime --gold (light #C07830 from the config
              theme vars) — the label sits inside the seam-garland zone and the
              light gold disappears into the pink florals. */}
          <p className="font-label" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.35em", textTransform: "uppercase", color: "var(--gold-deep)", textShadow: "0 1px 3px rgba(250,247,242,0.98), 0 2px 14px rgba(250,247,242,1), 0 0 7px rgba(250,247,242,0.9), 0 0 18px rgba(250,247,242,0.85)" }}>
            {isAkad ? "Akad Nikah" : "Resepsi"}
          </p>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.7, delay: REVEAL_AFTER_FRAME + 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="copper-divider"
            style={{ width: 40, transformOrigin: isAkad ? "left" : "right" }}
          />
        </motion.div>

        {/* Date hero with animated SVG ring */}
        <motion.div
          variants={fade(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          className="flex flex-col items-center"
        >
          {/* Day — above the date number */}
          <p className="font-display" style={{ color: "var(--text-muted)", fontSize: "clamp(13px, 3.5vw, 16px)", fontStyle: "italic", letterSpacing: "0.12em", marginBottom: "clamp(2px, 0.5vh, 4px)", textShadow: "0 1px 5px rgba(250,247,242,0.95), 0 0 10px rgba(250,247,242,0.85)" }}>{event.day}</p>

          {/* Date number */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.0, delay: REVEAL_AFTER_FRAME + 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(1px, 0.4vh, 4px) 0" }}
          >
            <span className="font-display text-copper-gradient" style={{ fontSize: "clamp(54px, 16vw, 84px)", fontWeight: 400, lineHeight: 0.9 }}>{dateNum}</span>
          </motion.div>

          {/* Month · Year — below the date */}
          <p className="font-display" style={{ color: "var(--gold-dim)", fontSize: "clamp(11px, 3vw, 14px)", letterSpacing: "0.26em", textTransform: "uppercase", marginTop: "clamp(2px, 0.5vh, 4px)", textShadow: "0 1px 5px rgba(250,247,242,0.95), 0 0 10px rgba(250,247,242,0.85)" }}>{dateMonth} · {dateYear}</p>
        </motion.div>

        {/* Ornamental divider */}
        <motion.div variants={fade(0.18)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} className="flex items-center w-full" style={{ gap: 10 }}>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, var(--gold-dim))", opacity: 0.4 }} />
          <img src={bgAsset} alt="" style={{ width: 22, height: 22, objectFit: "contain", opacity: 0.55, flexShrink: 0 }} />
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, var(--gold-dim), transparent)", opacity: 0.4 }} />
        </motion.div>

        {/* Venue card with corner ornaments */}
        <motion.div
          variants={fade(0.3)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }}
          className="flex flex-col items-center text-center w-full"
          style={{ position: "relative", gap: 7, padding: "clamp(9px, 2vh, 13px) clamp(14px, 4vw, 20px)", background: "rgba(250,247,242,0.62)", backdropFilter: "blur(2px)", border: "1px solid var(--border)" }}
        >
          <div className="corner-ornament tl" />
          <div className="corner-ornament tr" />
          <div className="corner-ornament bl" />
          <div className="corner-ornament br" />
          <p className="font-label" style={{ fontSize: "11px", letterSpacing: "0.14em", color: "var(--text-muted)", borderBottom: "1px solid var(--border)", paddingBottom: 6, width: "100%" }}>{event.time}</p>
          <p className="font-display" style={{ color: "var(--text)", fontSize: "clamp(15px, 4.5vw, 20px)", fontWeight: 400, fontStyle: "italic", letterSpacing: "0.04em", lineHeight: 1.2 }}>{event.venue}</p>
          <div className="flex items-start justify-center gap-2" style={{ marginTop: 2 }}>
            <img src={`${process.env.NEXT_PUBLIC_THEMES_CDN}/adat/kenangan/warm-narrative/LocationPin.webp`} alt="" style={{ width: 14, height: 14, objectFit: "contain", opacity: 0.75, flexShrink: 0, marginTop: 1 }} />
            <p className="font-label" style={{ color: "var(--text-muted)", fontSize: "11px", lineHeight: 1.5 }}>{event.address}</p>
          </div>
        </motion.div>

        {/* Inline interactive map */}
        <motion.div
          variants={fade(0.4)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }}
          className="w-full"
          style={{ border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, width: 20, height: 20, zIndex: 10, pointerEvents: "none" }}>
            <svg width="20" height="20"><path d="M0 20 L0 0 L20 0" stroke="var(--gold)" strokeWidth="0.8" fill="none" opacity="0.5"/></svg>
          </div>
          <div style={{ position: "absolute", bottom: 0, right: 0, width: 20, height: 20, zIndex: 10, pointerEvents: "none" }}>
            <svg width="20" height="20"><path d="M20 0 L20 20 L0 20" stroke="var(--gold)" strokeWidth="0.8" fill="none" opacity="0.5"/></svg>
          </div>

          <iframe
            src={event.embedUrl}
            width="100%"
            height="200"
            style={{
              border: 0,
              display: "block",
              filter: "sepia(25%) saturate(0.85) brightness(1.02) contrast(0.95)",
              pointerEvents: mapInteractive ? "auto" : "none",
            }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Lokasi ${event.title}`}
          />

          {!mapInteractive && (
            <div
              onClick={() => setMapInteractive(true)}
              role="button"
              aria-label="Aktifkan peta interaktif"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setMapInteractive(true)}
              style={{ position: "absolute", inset: 0, zIndex: 20, cursor: "pointer", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 10 }}
            >
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-dim)", background: "rgba(250,247,242,0.88)", padding: "4px 10px", backdropFilter: "blur(4px)" }}>
                Ketuk untuk menggeser
              </span>
            </div>
          )}

          {mapInteractive && (
            <button
              onClick={() => setMapInteractive(false)}
              aria-label="Selesai"
              style={{ position: "absolute", top: 8, right: 8, zIndex: 20, display: "flex", alignItems: "center", gap: 4, fontFamily: "Inter, sans-serif", fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--gold-dim)", background: "rgba(250,247,242,0.92)", border: "1px solid rgba(192,120,48,0.3)", padding: "4px 10px", cursor: "pointer", backdropFilter: "blur(4px)" }}
            >
              <X size={10} />
              Selesai
            </button>
          )}
        </motion.div>

        {/* Action links */}
        <motion.div variants={fade(0.5)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} className="flex items-center justify-center">
          <a href={event.mapsUrl} target="_blank" rel="noopener noreferrer" className="event-action-link flex items-center gap-2 transition-colors duration-300 font-label" style={{ color: "var(--gold-dim)", fontSize: "10px", fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", padding: "6px 16px", borderRight: "1px solid var(--border)", textShadow: "0 1px 5px rgba(250,247,242,0.95), 0 0 10px rgba(250,247,242,0.85)" }}>
            <ExternalLink size={10} />
            Maps
          </a>
          <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="event-action-link flex items-center gap-2 transition-colors duration-300 font-label" style={{ color: "var(--gold-dim)", fontSize: "10px", fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", padding: "6px 16px", textShadow: "0 1px 5px rgba(250,247,242,0.95), 0 0 10px rgba(250,247,242,0.85)" }}>
            <img src={`${process.env.NEXT_PUBLIC_THEMES_CDN}/adat/kenangan/warm-narrative/Calendar.webp`} alt="" style={{ width: 12, height: 12, objectFit: "contain", opacity: 0.8 }} />
            Kalender
          </a>
        </motion.div>
      </div>
    </section>
  );
}
