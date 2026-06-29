"use client";

import { useState } from "react";
import * as motion from "framer-motion/client";
import { ExternalLink, X } from "lucide-react";
import type { InvitationConfig } from "@/lib/config-types";

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
  const [dateNum, dateMonth, dateYear] = event.date.split(" ");

  const bgAsset = isAkad
    ? `${process.env.NEXT_PUBLIC_THEMES_CDN}/adat/kenangan/warm-narrative/CincinEmas.webp`
    : `${process.env.NEXT_PUBLIC_THEMES_CDN}/adat/kenangan/warm-narrative/TempatPernikahan.webp`;

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

  const fade = (delay: number) => ({
    hidden: { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0, transition: { delay, duration: 0.85, ease: "easeOut" as const } },
  });

  return (
    <section
      id={sectionId}
      className="snap-section"
      style={{ background: isAkad ? "var(--surface)" : "var(--bg)" }}
    >
      <div className="paper-overlay" />

      {/* Large background icon */}
      <div
        className="absolute pointer-events-none select-none"
        style={{ top: "18%", left: "50%", transform: "translateX(-50%)", width: isAkad ? "clamp(300px, 85vw, 440px)" : "clamp(340px, 90vw, 500px)", height: isAkad ? "clamp(300px, 85vw, 440px)" : "clamp(340px, 90vw, 500px)", zIndex: 0, opacity: isAkad ? 0.10 : 0.20 }}
      >
        <img src={bgAsset} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>

      {/* Radial glow */}
      <div
        className="absolute pointer-events-none"
        style={{ top: "22%", left: "50%", transform: "translateX(-50%)", width: "clamp(160px, 50vw, 240px)", height: "clamp(160px, 50vw, 240px)", borderRadius: "50%", background: "radial-gradient(circle, rgba(192,120,48,0.07) 0%, transparent 70%)", zIndex: 1 }}
      />

      {/* Roman numeral watermark */}
      <div
        className="absolute font-display select-none pointer-events-none"
        style={{ fontSize: "clamp(120px, 35vw, 220px)", fontWeight: 400, fontStyle: "italic", color: "rgba(192,120,48,0.025)", bottom: "5%", right: "-2%", lineHeight: 1, letterSpacing: "-0.05em", zIndex: 1 }}
      >
        {isAkad ? "I" : "II"}
      </div>

      <div
        className="relative z-10 flex flex-col items-center w-full max-w-xs mx-auto px-8"
        style={{ gap: "clamp(12px, 3vh, 22px)", paddingTop: "clamp(28px, 6vh, 48px)", paddingBottom: "calc(clamp(20px, 4vh, 36px) + 72px)" }}
      >
        {/* Label */}
        <motion.div variants={fade(0)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} className="flex flex-col items-center gap-2">
          <p className="font-label" style={{ fontSize: "9px", letterSpacing: "0.35em", textTransform: "uppercase", color: "var(--gold-dim)" }}>
            {isAkad ? "Akad Nikah" : "Resepsi"}
          </p>
          <div className="copper-divider" style={{ width: 40 }} />
        </motion.div>

        {/* Date hero */}
        <motion.div variants={fade(0.1)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} className="flex flex-col items-center">
          <p className="font-display" style={{ color: "var(--text-muted)", fontSize: "clamp(13px, 3.5vw, 16px)", fontStyle: "italic", letterSpacing: "0.12em", marginBottom: 2 }}>{event.day}</p>
          <p className="font-display text-copper-gradient leading-none" style={{ fontSize: "clamp(72px, 22vw, 110px)", fontWeight: 400, lineHeight: 0.88 }}>{dateNum}</p>
          <p className="font-display" style={{ color: "var(--gold-dim)", fontSize: "clamp(11px, 3vw, 14px)", letterSpacing: "0.28em", textTransform: "uppercase", marginTop: 6 }}>{dateMonth} · {dateYear}</p>
        </motion.div>

        {/* Ornamental divider */}
        <motion.div variants={fade(0.18)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} className="flex items-center w-full" style={{ gap: 10 }}>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, var(--gold-dim))", opacity: 0.4 }} />
          <img src={bgAsset} alt="" style={{ width: 22, height: 22, objectFit: "contain", opacity: 0.55, flexShrink: 0 }} />
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, var(--gold-dim), transparent)", opacity: 0.4 }} />
        </motion.div>

        {/* Venue card */}
        <motion.div
          variants={fade(0.3)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }}
          className="flex flex-col items-center text-center w-full"
          style={{ gap: 10, padding: "clamp(12px, 3vh, 18px) clamp(14px, 4vw, 20px)", background: isAkad ? "rgba(192,120,48,0.03)" : "rgba(192,120,48,0.04)", border: "1px solid var(--border)" }}
        >
          <p className="font-label" style={{ fontSize: "11px", letterSpacing: "0.14em", color: "var(--text-muted)", borderBottom: "1px solid var(--border)", paddingBottom: 8, width: "100%" }}>{event.time}</p>
          <p className="font-display" style={{ color: "var(--text)", fontSize: "clamp(15px, 4.5vw, 20px)", fontWeight: 400, fontStyle: "italic", letterSpacing: "0.04em", lineHeight: 1.2 }}>{event.venue}</p>
          <div className="flex items-start justify-center gap-2" style={{ marginTop: 2 }}>
            <img src={`${process.env.NEXT_PUBLIC_THEMES_CDN}/adat/kenangan/warm-narrative/LocationPin.webp`} alt="" style={{ width: 14, height: 14, objectFit: "contain", opacity: 0.75, flexShrink: 0, marginTop: 1 }} />
            <p className="font-label" style={{ color: "var(--text-dim)", fontSize: "11px", lineHeight: 1.5 }}>{event.address}</p>
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
            height="260"
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

          {/* Overlay: tap to activate */}
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

          {/* Done button when interactive */}
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
          <a href={event.mapsUrl} target="_blank" rel="noopener noreferrer" className="event-action-link flex items-center gap-2 transition-colors duration-300 font-label" style={{ color: "var(--gold-dim)", fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", padding: "6px 16px", borderRight: "1px solid var(--border)" }}>
            <ExternalLink size={10} />
            Maps
          </a>
          <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="event-action-link flex items-center gap-2 transition-colors duration-300 font-label" style={{ color: "var(--gold-dim)", fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", padding: "6px 16px" }}>
            <img src={`${process.env.NEXT_PUBLIC_THEMES_CDN}/adat/kenangan/warm-narrative/Calendar.webp`} alt="" style={{ width: 12, height: 12, objectFit: "contain", opacity: 0.8 }} />
            Kalender
          </a>
        </motion.div>
      </div>
    </section>
  );
}
