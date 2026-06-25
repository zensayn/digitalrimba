"use client";

import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, useInView } from "framer-motion";
import { MapPin, Calendar, X } from "lucide-react";
import type { EventConfig, InvitationConfig } from "@/lib/config-types";

interface EventSlideProps {
  couple: InvitationConfig["couple"];
  event: EventConfig;
  index: number;
  sectionId: string;
}

export default function EventSlide({ couple, event, index, sectionId }: EventSlideProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-10%" });
  const [mapOpen, setMapOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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

  /**
   * Portal renders the iframe directly into document.body — completely outside
   * the slide scroll container. Touch and pinch events go straight to the iframe
   * without any ancestor scroll container competing for them.
   */
  const mapModal = mapOpen && mounted
    ? createPortal(
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            background: "#0A0805",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderBottom: "1px solid var(--border)",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MapPin size={13} color="var(--gold-dim)" />
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.14em", color: "var(--text-muted)", textTransform: "uppercase" }}>
                {event.venue}
              </span>
            </div>
            <button
              onClick={() => setMapOpen(false)}
              aria-label="Tutup peta"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid var(--border)",
                cursor: "pointer",
                color: "var(--text-muted)",
              }}
            >
              <X size={14} />
            </button>
          </div>
          <iframe
            src={event.embedUrl}
            width="100%"
            style={{ flex: 1, border: 0, display: "block" }}
            allowFullScreen
            title={`Lokasi ${event.venue}`}
          />
        </div>,
        document.body
      )
    : null;

  return (
    <div id={sectionId} className="slide-page" style={{ background: "var(--surface)", justifyContent: "flex-start" }}>
      {mapModal}

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
            style={{ fontSize: 9, letterSpacing: "0.35em", color: "var(--gold-dim)", textTransform: "uppercase", marginBottom: 16 }}
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

          <motion.div custom={2} variants={fadeUp} initial="hidden" animate={isInView ? "visible" : "hidden"} style={{ marginBottom: 16 }}>
            <div className="amber-divider" />
          </motion.div>

          <motion.div custom={3} variants={fadeUp} initial="hidden" animate={isInView ? "visible" : "hidden"} style={{ marginBottom: 20 }}>
            <span className="font-label" style={{ display: "inline-block", padding: "5px 14px", border: "1px solid var(--border)", borderRadius: 100, fontSize: 11, letterSpacing: "0.1em", color: "var(--gold)" }}>
              {event.time}
            </span>
          </motion.div>

          <motion.p
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="font-display"
            style={{ fontStyle: "italic", fontSize: "clamp(17px, 4.5vw, 22px)", color: "var(--text)", marginBottom: 6 }}
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

          {/* Map — tap to open fullscreen modal via portal */}
          <motion.div
            custom={6}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            style={{ position: "relative", marginBottom: 16, overflow: "hidden" }}
          >
            {/* Corner accents */}
            <svg style={{ position: "absolute", top: 0, left: 0, width: 16, height: 16, zIndex: 2, pointerEvents: "none" }} viewBox="0 0 16 16" fill="none">
              <polyline points="16,0 0,0 0,16" stroke="var(--gold-dim)" strokeWidth="1" />
            </svg>
            <svg style={{ position: "absolute", top: 0, right: 0, width: 16, height: 16, zIndex: 2, pointerEvents: "none" }} viewBox="0 0 16 16" fill="none">
              <polyline points="0,0 16,0 16,16" stroke="var(--gold-dim)" strokeWidth="1" />
            </svg>

            {/* Static preview — pointer-events none so scroll works */}
            <iframe
              src={event.embedUrl}
              width="100%"
              height="180"
              style={{ border: 0, display: "block", filter: "sepia(30%) contrast(0.9) brightness(0.8) saturate(0.7)", pointerEvents: "none" }}
              loading="lazy"
            />

            {/* Transparent clickable layer — map preview fully visible */}
            <div
              onClick={() => setMapOpen(true)}
              role="button"
              aria-label="Buka peta interaktif"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setMapOpen(true)}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 20,
                cursor: "pointer",
              }}
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
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, letterSpacing: "0.1em", color: "var(--text-dim)", textDecoration: "none", transition: "color 0.2s" }}
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
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, letterSpacing: "0.1em", color: "var(--text-dim)", textDecoration: "none", transition: "color 0.2s" }}
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
