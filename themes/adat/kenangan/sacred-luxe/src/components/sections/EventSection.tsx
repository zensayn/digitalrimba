"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MapPin, ExternalLink, CalendarPlus } from "lucide-react";

interface EventCardProps {
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

export default function EventSection({ event, index, sectionId }: EventCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  const isAkad = index === 0;

  // "14 Juni 2026" → ["14", "Juni", "2026"]
  const [dateNum, dateMonth, dateYear] = event.date.split(" ");

  const calendarUrl = (() => {
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: `${event.title} — Pangky & Radit`,
      dates: `${event.startISO}/${event.endISO}`,
      details: `Anda diundang ke ${event.title} pernikahan Pangky & Radit.\n\n${event.time} WIB`,
      location: `${event.venue}, ${event.address}`,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  })();

  const fade = (delay: number) => ({
    hidden: { opacity: 0, y: 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay, duration: 0.85, ease: "easeOut" as const },
    },
  });

  return (
    <section
      id={sectionId}
      className="snap-section"
      style={{ background: isAkad ? "var(--surface)" : "var(--bg)" }}
    >
      <div className="noise-overlay" />

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(201,168,76,0.05) 0%, transparent 70%)",
        }}
      />

      {/* Roman numeral bg */}
      <div
        className="absolute font-display select-none pointer-events-none"
        style={{
          fontSize: "clamp(120px, 35vw, 220px)",
          fontWeight: 300,
          color: "rgba(201,168,76,0.025)",
          bottom: "5%",
          right: "-2%",
          lineHeight: 1,
          letterSpacing: "-0.05em",
        }}
      >
        {isAkad ? "I" : "II"}
      </div>

      <div
        ref={ref}
        className="relative z-10 flex flex-col items-center w-full max-w-xs mx-auto px-8"
        style={{ gap: "clamp(18px, 4vh, 36px)", paddingTop: "clamp(32px, 6vh, 56px)", paddingBottom: "calc(clamp(24px, 4vh, 40px) + 72px)" }}
      >

        {/* ── Label ── */}
        <motion.div
          variants={fade(0)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col items-center gap-2"
        >
          <p
            className="text-xs tracking-[0.35em] uppercase"
            style={{ color: "var(--gold-dim)", fontSize: "9px" }}
          >
            {isAkad ? "Akad Nikah" : "Resepsi"}
          </p>
          <div className="gold-divider" style={{ width: 40 }} />
        </motion.div>

        {/* ── Date hero ── */}
        <motion.div
          variants={fade(0.1)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col items-center"
          style={{ gap: 0 }}
        >
          {/* Day name */}
          <p
            className="font-display italic"
            style={{
              color: "var(--text-dim)",
              fontSize: "clamp(13px, 3.5vw, 16px)",
              letterSpacing: "0.12em",
              marginBottom: 2,
            }}
          >
            {event.day}
          </p>

          {/* Big date number */}
          <p
            className="font-display text-gold-gradient leading-none"
            style={{
              fontSize: "clamp(72px, 22vw, 110px)",
              fontWeight: 300,
              lineHeight: 0.88,
            }}
          >
            {dateNum}
          </p>

          {/* Month · Year */}
          <p
            className="font-display tracking-widest"
            style={{
              color: "var(--gold-dim)",
              fontSize: "clamp(11px, 3vw, 14px)",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              marginTop: 6,
            }}
          >
            {dateMonth} · {dateYear}
          </p>
        </motion.div>

        {/* ── Time badge ── */}
        <motion.div
          variants={fade(0.2)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div
            style={{
              padding: "6px 20px",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
              fontSize: "11px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 300,
              letterSpacing: "0.12em",
            }}
          >
            {event.time}
          </div>
        </motion.div>

        {/* ── Venue ── */}
        <motion.div
          variants={fade(0.3)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col items-center text-center"
          style={{ gap: 6 }}
        >
          {/* Diamond ornament */}
          <svg width="12" height="12" viewBox="0 0 12 12" style={{ opacity: 0.4 }}>
            <path d="M6 0 L12 6 L6 12 L0 6 Z" fill="var(--gold)" />
          </svg>

          <p
            className="font-display"
            style={{
              color: "var(--text)",
              fontSize: "clamp(17px, 5vw, 22px)",
              fontWeight: 300,
              letterSpacing: "0.04em",
              lineHeight: 1.2,
            }}
          >
            {event.venue}
          </p>

          <div className="flex items-start justify-center gap-2">
            <MapPin size={11} color="var(--gold-dim)" strokeWidth={1.5} style={{ marginTop: 2, flexShrink: 0 }} />
            <p
              style={{
                color: "var(--text-dim)",
                fontSize: "11px",
                fontFamily: "Inter, sans-serif",
                fontWeight: 300,
                lineHeight: 1.5,
              }}
            >
              {event.address}
            </p>
          </div>
        </motion.div>

        {/* ── Map ── */}
        <motion.div
          variants={fade(0.4)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="w-full"
          style={{
            border: "1px solid var(--border)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Top-left corner accent */}
          <div style={{ position: "absolute", top: 0, left: 0, width: 20, height: 20, zIndex: 10, pointerEvents: "none" }}>
            <svg width="20" height="20"><path d="M0 20 L0 0 L20 0" stroke="var(--gold)" strokeWidth="1" fill="none" opacity="0.5"/></svg>
          </div>
          {/* Bottom-right corner accent */}
          <div style={{ position: "absolute", bottom: 0, right: 0, width: 20, height: 20, zIndex: 10, pointerEvents: "none" }}>
            <svg width="20" height="20"><path d="M20 0 L20 20 L0 20" stroke="var(--gold)" strokeWidth="1" fill="none" opacity="0.5"/></svg>
          </div>

          <div style={{ position: "absolute", inset: 0, background: "rgba(10,10,8,0.12)", pointerEvents: "none", zIndex: 5 }} />
          <iframe
            src={event.embedUrl}
            width="100%"
            height="150"
            style={{ border: 0, display: "block", filter: "grayscale(70%) invert(88%) contrast(85%) brightness(75%)" }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Lokasi ${event.title}`}
          />
        </motion.div>

        {/* ── Action buttons ── */}
        <motion.div
          variants={fade(0.5)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex items-center justify-center"
          style={{ gap: 0 }}
        >
          <a
            href={event.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 transition-colors duration-300"
            style={{
              color: "var(--gold-dim)",
              fontSize: "9px",
              fontFamily: "Inter, sans-serif",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              padding: "6px 16px",
              borderRight: "1px solid var(--border)",
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "var(--gold)")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "var(--gold-dim)")}
          >
            <ExternalLink size={10} />
            Maps
          </a>

          <a
            href={calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 transition-colors duration-300"
            style={{
              color: "var(--gold-dim)",
              fontSize: "9px",
              fontFamily: "Inter, sans-serif",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              padding: "6px 16px",
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "var(--gold)")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "var(--gold-dim)")}
          >
            <CalendarPlus size={10} />
            Kalender
          </a>
        </motion.div>

      </div>
    </section>
  );
}
