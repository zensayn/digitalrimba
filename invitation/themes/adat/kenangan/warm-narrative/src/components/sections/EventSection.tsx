"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MapPin, ExternalLink, CalendarPlus } from "lucide-react";
import { useInvitationConfig } from "@/components/shared/RimbaConfigProvider";

interface EventSectionProps {
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

export default function EventSection({ event, index, sectionId }: EventSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const { couple } = useInvitationConfig();

  const isAkad = index === 0;
  const [dateNum, dateMonth, dateYear] = event.date.split(" ");

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

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(192,120,48,0.05) 0%, transparent 70%)",
        }}
      />

      {/* Roman numeral watermark */}
      <div
        className="absolute font-display select-none pointer-events-none"
        style={{
          fontSize: "clamp(120px, 35vw, 220px)",
          fontWeight: 400,
          fontStyle: "italic",
          color: "rgba(192,120,48,0.025)",
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
        style={{
          gap: "clamp(14px, 3.5vh, 28px)",
          paddingTop: "clamp(28px, 6vh, 48px)",
          paddingBottom: "calc(clamp(20px, 4vh, 36px) + 72px)",
        }}
      >
        {/* Label */}
        <motion.div
          variants={fade(0)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col items-center gap-2"
        >
          <p
            className="font-label"
            style={{ fontSize: "9px", letterSpacing: "0.35em", textTransform: "uppercase", color: "var(--gold-dim)" }}
          >
            {isAkad ? "Akad Nikah" : "Resepsi"}
          </p>
          <div className="copper-divider" style={{ width: 40 }} />
        </motion.div>

        {/* Date hero */}
        <motion.div
          variants={fade(0.1)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col items-center"
        >
          <p
            className="font-display"
            style={{ color: "var(--text-muted)", fontSize: "clamp(13px, 3.5vw, 16px)", fontStyle: "italic", letterSpacing: "0.12em", marginBottom: 2 }}
          >
            {event.day}
          </p>
          <p
            className="font-display text-copper-gradient leading-none"
            style={{ fontSize: "clamp(72px, 22vw, 110px)", fontWeight: 400, lineHeight: 0.88 }}
          >
            {dateNum}
          </p>
          <p
            className="font-display"
            style={{ color: "var(--gold-dim)", fontSize: "clamp(11px, 3vw, 14px)", letterSpacing: "0.28em", textTransform: "uppercase", marginTop: 6 }}
          >
            {dateMonth} · {dateYear}
          </p>
        </motion.div>

        {/* Time badge */}
        <motion.div variants={fade(0.2)} initial="hidden" animate={isInView ? "visible" : "hidden"}>
          <div
            className="font-label"
            style={{
              padding: "6px 20px",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
              fontSize: "11px",
              letterSpacing: "0.12em",
            }}
          >
            {event.time}
          </div>
        </motion.div>

        {/* Venue */}
        <motion.div
          variants={fade(0.3)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col items-center text-center"
          style={{ gap: 12 }}
        >
          {isAkad ? (
            <img
              src="/images/CincinEmas.webp"
              alt="Akad"
              style={{
                width: "clamp(48px, 15vw, 72px)",
                height: "clamp(48px, 15vw, 72px)",
                objectFit: "contain",
                opacity: 0.95
              }}
            />
          ) : (
            <img
              src="/images/TempatPernikahan.webp"
              alt="Resepsi"
              style={{
                width: "clamp(48px, 15vw, 72px)",
                height: "clamp(48px, 15vw, 72px)",
                objectFit: "contain",
                opacity: 0.95
              }}
            />
          )}
          <p
            className="font-display"
            style={{ color: "var(--text)", fontSize: "clamp(16px, 5vw, 22px)", fontWeight: 400, fontStyle: "italic", letterSpacing: "0.04em", lineHeight: 1.2 }}
          >
            {event.venue}
          </p>
          <div className="flex flex-col items-center gap-1.5 mt-2">
            <img
              src="/images/PinLokasi.webp"
              alt="Pin Lokasi"
              style={{
                width: "clamp(24px, 7vw, 32px)",
                height: "clamp(24px, 7vw, 32px)",
                objectFit: "contain",
                opacity: 0.9
              }}
            />
            <div className="flex items-start justify-center gap-2">
              <MapPin size={11} color="var(--gold-dim)" strokeWidth={1.5} style={{ marginTop: 2, flexShrink: 0 }} />
              <p
                className="font-label"
                style={{ color: "var(--text-dim)", fontSize: "11px", lineHeight: 1.5 }}
              >
                {event.address}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Map */}
        <motion.div
          variants={fade(0.4)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="w-full"
          style={{ border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, width: 20, height: 20, zIndex: 10, pointerEvents: "none" }}>
            <svg width="20" height="20"><path d="M0 20 L0 0 L20 0" stroke="var(--gold)" strokeWidth="0.8" fill="none" opacity="0.5"/></svg>
          </div>
          <div style={{ position: "absolute", bottom: 0, right: 0, width: 20, height: 20, zIndex: 10, pointerEvents: "none" }}>
            <svg width="20" height="20"><path d="M20 0 L20 20 L0 20" stroke="var(--gold)" strokeWidth="0.8" fill="none" opacity="0.5"/></svg>
          </div>
          <div style={{ position: "absolute", inset: 0, background: "rgba(250,247,242,0.06)", pointerEvents: "none", zIndex: 5 }} />
          <iframe
            src={event.embedUrl}
            width="100%"
            height="140"
            style={{ border: 0, display: "block", filter: "sepia(35%) contrast(0.92) brightness(1.05) saturate(0.8)" }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Lokasi ${event.title}`}
          />
        </motion.div>

        {/* Action links */}
        <motion.div
          variants={fade(0.5)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex items-center justify-center"
        >
          <a
            href={event.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 transition-colors duration-300 font-label"
            style={{ color: "var(--gold-dim)", fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", padding: "6px 16px", borderRight: "1px solid var(--border)" }}
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
            className="flex items-center gap-2 transition-colors duration-300 font-label"
            style={{ color: "var(--gold-dim)", fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", padding: "6px 16px" }}
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
