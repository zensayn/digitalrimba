"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MapPin, Calendar } from "lucide-react";
import type { EventConfig } from "@/lib/config-types";
import { useInvitationConfig } from "@/components/shared/RimbaConfigProvider";

interface EventSlideProps {
  event: EventConfig;
  index: number;
  sectionId: string;
}

export default function EventSlide({ event, index, sectionId }: EventSlideProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-10%" });
  const { couple } = useInvitationConfig();

  const dateNum = event.date.split(" ")[0];
  const isAkad = index === 0;
  const eventLabel = isAkad ? "AKAD NIKAH" : "RESEPSI";

  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `${isAkad ? "Akad Nikah" : "Resepsi"} ${couple.groom.name} & ${couple.bride.name}`
  )}&dates=${event.startISO}/${event.endISO}&details=${encodeURIComponent(
    `${event.venue}, ${event.address}`
  )}&location=${encodeURIComponent(event.address)}`;

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.12, duration: 0.7, ease: "easeOut" as const },
    }),
  };

  return (
    <div id={sectionId} className="slide-page" style={{ background: "var(--surface)", justifyContent: "flex-start" }}>
      {/* Giant date watermark */}
      <div
        className="font-display"
        style={{
          position: "absolute",
          right: "-5%",
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: "clamp(100px, 30vw, 160px)",
          color: "var(--text)",
          opacity: 0.04,
          lineHeight: 1,
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        {dateNum}
      </div>

      <div
        ref={ref}
        data-prevent-snap="true"
        className="overflow-y-auto"
        style={{ width: "100%", height: "100dvh", paddingBottom: "var(--pb-safe)" }}
      >
        <div style={{ padding: "var(--pt-slide) var(--gutter) 0" }}>
          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="font-label"
            style={{
              fontSize: 9,
              letterSpacing: "0.35em",
              color: "var(--gold-dim)",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            {eventLabel}
          </motion.p>

          <motion.p
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="font-display"
            style={{ fontSize: "clamp(22px, 6vw, 32px)", color: "var(--text)", marginBottom: 8 }}
          >
            {event.day}, {event.date}
          </motion.p>

          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            style={{ marginBottom: 16 }}
          >
            <div className="amber-divider" />
          </motion.div>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            style={{ marginBottom: 20 }}
          >
            <span
              className="font-label"
              style={{
                display: "inline-block",
                padding: "5px 14px",
                border: "1px solid var(--border)",
                borderRadius: 100,
                fontSize: 11,
                letterSpacing: "0.1em",
                color: "var(--gold)",
              }}
            >
              {event.time}
            </span>
          </motion.div>

          <motion.p
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="font-display"
            style={{
              fontStyle: "italic",
              fontSize: "clamp(17px, 4.5vw, 22px)",
              color: "var(--text)",
              marginBottom: 6,
            }}
          >
            {event.venue}
          </motion.p>

          <motion.p
            custom={5}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="font-body"
            style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.75, marginBottom: 24 }}
          >
            {event.address}
          </motion.p>

          {/* Map */}
          <motion.div
            custom={6}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            style={{ position: "relative", marginBottom: 16, overflow: "hidden" }}
          >
            {/* Corner accents */}
            <svg
              style={{ position: "absolute", top: 0, left: 0, width: 16, height: 16, zIndex: 2 }}
              viewBox="0 0 16 16"
              fill="none"
            >
              <polyline points="16,0 0,0 0,16" stroke="var(--gold-dim)" strokeWidth="1" />
            </svg>
            <svg
              style={{ position: "absolute", top: 0, right: 0, width: 16, height: 16, zIndex: 2 }}
              viewBox="0 0 16 16"
              fill="none"
            >
              <polyline points="0,0 16,0 16,16" stroke="var(--gold-dim)" strokeWidth="1" />
            </svg>
            <iframe
              src={event.embedUrl}
              width="100%"
              height="180"
              style={{
                border: 0,
                display: "block",
                filter: "sepia(30%) contrast(0.9) brightness(0.8) saturate(0.7)",
              }}
              loading="lazy"
              allowFullScreen
            />
          </motion.div>

          {/* Links */}
          <motion.div
            custom={7}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            style={{ display: "flex", gap: 20 }}
          >
            <a
              href={event.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-label"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 10,
                letterSpacing: "0.1em",
                color: "var(--text-dim)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--gold)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-dim)")}
            >
              <MapPin size={12} /> Buka Maps →
            </a>
            <a
              href={calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-label"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 10,
                letterSpacing: "0.1em",
                color: "var(--text-dim)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--gold)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-dim)")}
            >
              <Calendar size={12} /> Simpan Kalender →
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
