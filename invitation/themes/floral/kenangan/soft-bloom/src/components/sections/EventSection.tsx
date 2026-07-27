"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { MapPin, ExternalLink, Calendar, X } from "lucide-react";
import TopFrame from "@/components/shared/TopFrame";
import FloralTitle from "@/components/shared/FloralTitle";
import SideVines from "@/components/shared/SideVines";
import SceneBackground from "@/components/shared/SceneBackground";
import CardVines from "@/components/shared/CardVines";
import { asset } from "@/lib/assets";
import { rhythmVars } from "@/lib/rhythm";
import type { InvitationConfig } from "@/lib/config-types";

interface EventSectionProps {
  couple: InvitationConfig["couple"];
  event: InvitationConfig["events"]["akad"];
  index: number;
  sectionId: string;
}

export default function EventSection({ couple, event, index, sectionId }: EventSectionProps) {
  const isAkad = index === 0;
  const [mapOpen, setMapOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dateNum, dateMonth, dateYear] = event.date.split(" ");

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const calendarUrl = (() => {
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: `${event.title} — ${couple.groom.name} & ${couple.bride.name}`,
      dates: `${event.startISO}/${event.endISO}`,
      details: `Anda diundang ke ${event.title} pernikahan ${couple.groom.name} & ${couple.bride.name}.\n\n${event.time}`,
      location: `${event.venue}, ${event.address}`,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  })();

  // Reveal saat scroll dinonaktifkan — konten tampil langsung.
  const fade = (_delay?: number) => ({
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 },
  });

  const mapModal = mapOpen && mounted
    ? createPortal(
        <div className="map-sheet">
          <div className="map-sheet-bar">
            <div className="flex items-center" style={{ gap: "var(--space-xs)" }}>
              <MapPin size={13} color="var(--accent)" />
              <span className="type-label">{event.venue}</span>
            </div>
            <button onClick={() => setMapOpen(false)} aria-label="Tutup peta" className="btn-icon btn-icon-round">
              <X size={14} />
            </button>
          </div>
          <iframe
            src={event.embedUrl}
            width="100%"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            title={`Lokasi ${event.title}`}
          />
        </div>,
        document.body
      )
    : null;

  return (
    <section
      id={sectionId}
      className={`snap-section flow-section reveal-scope ${isAkad ? "" : "mood-blush"}`}
      style={rhythmVars(sectionId)}
    >
      {mapModal}
      {isAkad ? <SceneBackground file="LatarLangit.webp" scrim={0.52} edgeFade /> : <div className="soft-wash" />}
      <TopFrame opacity={0.85} zIndex={1} />
      {/* Ranting 3:1 — dipendekkan agar tak menjulur sampai ke bawah teks tanggal */}
      <SideVines sides={isAkad ? ["left"] : ["right"]} height="min(48vh, 400px)" opacity={0.7} zIndex={1} />

      <div className="section-shell">
        {/* Label */}
        <motion.div variants={fade(0)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} className="flex flex-col items-center gap-2">
          <FloralTitle>{isAkad ? "Akad Nikah" : "Resepsi"}</FloralTitle>
        </motion.div>

        {/* Date hero */}
        <motion.div variants={fade(0.1)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} className="flex flex-col items-center">
          <p className="type-lead">{event.day}</p>
          <p className="type-numeral">{dateNum}</p>
          <p className="event-date-tail" style={{ marginTop: "var(--space-xs)" }}>{dateMonth} · {dateYear}</p>
        </motion.div>

        {/* Motif tangkai kuncup */}
        <motion.div variants={fade(0.18)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} className="flex w-full items-center" style={{ gap: "var(--space-sm)" }}>
          <div className="rule-fade" />
          <img src={asset("TangkaiKuncup.webp")} alt="" style={{ width: 34, height: 34, objectFit: "contain", flexShrink: 0 }} />
          <div className="rule-fade rule-fade-flip" />
        </motion.div>

        {/* Venue card — dengan juntaian bunga menggantung di sudut */}
        <motion.div
          variants={fade(0.3)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }}
          className="card venue-card flex w-full flex-col items-center text-center"
        >
          {/* Cluster bunga (SudutBunga) — sengaja beda dari RantingSamping SideVines
              + bayangan lebih tegas agar "mengambang" jelas di atas juntaian tepi. */}
          <CardVines file="SudutBunga.webp" width="clamp(66px, 18vw, 100px)" top={-30} inset={-20} dropShadow="var(--drop-lg)" />
          <p className="type-label venue-card-time">{event.time}</p>
          <p className="type-heading">{event.venue}</p>
          <div className="flex items-start justify-center" style={{ gap: "var(--space-xs)" }}>
            <MapPin size={16} color="var(--leaf)" style={{ flexShrink: 0, marginTop: 3 }} />
            <p className="type-caption" style={{ textAlign: "left" }}>{event.address}</p>
          </div>
        </motion.div>

        {/* Map tap-to-open */}
        <motion.div
          variants={fade(0.4)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }}
          className="map-frame w-full"
        >
          <iframe
            src={event.embedUrl}
            width="100%"
            height="170"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Preview lokasi ${event.title}`}
          />
          <div
            onClick={() => setMapOpen(true)}
            role="button"
            aria-label="Buka peta interaktif"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setMapOpen(true)}
            style={{ position: "absolute", inset: 0, zIndex: 20, cursor: "pointer" }}
          />
        </motion.div>

        {/* Action links */}
        <motion.div variants={fade(0.5)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} className="flex items-center justify-center">
          {/* Garis pemisah antar-aksi lewat :not(:last-child) di CSS */}
          <a href={event.mapsUrl} target="_blank" rel="noopener noreferrer" className="event-action-link type-label">
            <ExternalLink size={14} />
            Maps
          </a>
          <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="event-action-link type-label">
            <Calendar size={14} />
            Kalender
          </a>
        </motion.div>
      </div>
    </section>
  );
}
