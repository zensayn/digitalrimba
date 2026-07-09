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
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", flexDirection: "column", background: "var(--bg)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderBottom: "1px solid var(--border)",
              background: "var(--surface)",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MapPin size={13} color="var(--accent)" />
              <span className="type-label" style={{ fontSize: "11px" }}>
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
                background: "rgba(126,105,150,0.08)",
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
            referrerPolicy="no-referrer-when-downgrade"
            title={`Lokasi ${event.title}`}
          />
        </div>,
        document.body
      )
    : null;

  return (
    <section id={sectionId} className={`snap-section flow-section reveal-scope ${isAkad ? "" : "mood-blush"}`}>
      {mapModal}
      {isAkad ? <SceneBackground file="LatarLangit.webp" scrim={0.52} edgeFade /> : <div className="soft-wash" />}
      <TopFrame maxWidth={520} opacity={0.85} zIndex={1} />
      {/* Ranting 3:1 — dipendekkan agar tak menjulur sampai ke bawah teks tanggal */}
      <SideVines sides={isAkad ? ["left"] : ["right"]} height="min(48vh, 400px)" opacity={0.7} zIndex={1} />

      <div
        className="relative z-10 flex flex-col items-center w-full max-w-xs mx-auto px-8"
        style={{ gap: "clamp(12px, 3vh, 22px)", paddingTop: "clamp(84px, 13vh, 120px)", paddingBottom: "calc(clamp(20px, 4vh, 36px) + 72px)" }}
      >
        {/* Label */}
        <motion.div variants={fade(0)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} className="flex flex-col items-center gap-2">
          <FloralTitle>{isAkad ? "Akad Nikah" : "Resepsi"}</FloralTitle>
        </motion.div>

        {/* Date hero */}
        <motion.div variants={fade(0.1)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} className="flex flex-col items-center">
          <p className="font-display" style={{ color: "var(--text-muted)", fontSize: "clamp(13px, 3.5vw, 16px)", fontStyle: "italic", letterSpacing: "0.1em", marginBottom: 2 }}>{event.day}</p>
          <p className="font-display" style={{ fontSize: "clamp(72px, 22vw, 108px)", fontWeight: 500, lineHeight: 0.9, color: "var(--accent)" }}>{dateNum}</p>
          <p className="font-display" style={{ color: "var(--accent)", fontSize: "clamp(11px, 3vw, 14px)", letterSpacing: "0.24em", textTransform: "uppercase", marginTop: 6 }}>{dateMonth} · {dateYear}</p>
        </motion.div>

        {/* Motif tangkai kuncup */}
        <motion.div variants={fade(0.18)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} className="flex items-center w-full" style={{ gap: 10 }}>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, var(--accent-soft))", opacity: 0.5 }} />
          <img src={asset("TangkaiKuncup.webp")} alt="" style={{ width: 26, height: 26, objectFit: "contain", flexShrink: 0 }} />
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, var(--accent-soft), transparent)", opacity: 0.5 }} />
        </motion.div>

        {/* Venue card — dengan juntaian bunga menggantung di sudut */}
        <motion.div
          variants={fade(0.3)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }}
          className="flex flex-col items-center text-center w-full"
          style={{ position: "relative", gap: 10, padding: "clamp(16px, 4vh, 22px) clamp(16px, 5vw, 24px)", borderRadius: 5, background: "rgba(255,255,255,0.8)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
        >
          {/* Cluster bunga (SudutBunga) — sengaja beda dari RantingSamping SideVines
              + bayangan lebih tegas agar "mengambang" jelas di atas juntaian tepi. */}
          <CardVines file="SudutBunga.webp" width="clamp(56px, 16vw, 84px)" top={-26} inset={-18} dropShadow="drop-shadow(0 8px 15px rgba(58,58,54,0.18))" />
          <p className="type-label" style={{ borderBottom: "1px solid var(--border)", paddingBottom: 8, width: "100%" }}>{event.time}</p>
          <p className="font-display" style={{ color: "var(--text)", fontSize: "clamp(16px, 4.6vw, 21px)", fontWeight: 500, fontStyle: "italic", lineHeight: 1.2 }}>{event.venue}</p>
          <div className="flex items-start justify-center gap-2" style={{ marginTop: 2 }}>
            <MapPin size={13} color="var(--leaf)" style={{ flexShrink: 0, marginTop: 2 }} />
            <p className="type-caption" style={{ textAlign: "left" }}>{event.address}</p>
          </div>
        </motion.div>

        {/* Map tap-to-open */}
        <motion.div
          variants={fade(0.4)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }}
          className="w-full"
          style={{ border: "1px solid var(--border)", borderRadius: 5, position: "relative", overflow: "hidden" }}
        >
          <iframe
            src={event.embedUrl}
            width="100%"
            height="140"
            style={{ border: 0, display: "block", filter: "saturate(0.9) brightness(1.02)", pointerEvents: "none" }}
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
          <a href={event.mapsUrl} target="_blank" rel="noopener noreferrer" className="event-action-link type-label flex items-center gap-2 transition-colors duration-300" style={{ padding: "6px 16px", borderRight: "1px solid var(--border)" }}>
            <ExternalLink size={11} />
            Maps
          </a>
          <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="event-action-link type-label flex items-center gap-2 transition-colors duration-300" style={{ padding: "6px 16px" }}>
            <Calendar size={11} />
            Kalender
          </a>
        </motion.div>
      </div>
    </section>
  );
}
