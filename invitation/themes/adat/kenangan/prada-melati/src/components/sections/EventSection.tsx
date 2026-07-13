"use client";

import { useState } from "react";
import { ExternalLink, X } from "lucide-react";

import KelirScene from "@/components/shared/KelirScene";
import SceneContent from "@/components/shared/SceneContent";
import { kelirFor } from "@/components/shared/sceneKelir";
import type { EventConfig, InvitationConfig } from "@/lib/config-types";

export default function EventSection({
  couple,
  event,
  index,
  sectionId,
}: {
  couple: InvitationConfig["couple"];
  event: EventConfig;
  index: number;
  sectionId: string;
}) {
  const preset = kelirFor(sectionId);
  const isAkad = index === 0;
  const [mapOn, setMapOn] = useState(false);
  const [dNum, dMonth, dYear] = event.date.split(" ");

  const calendarUrl = (() => {
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: `${event.title} — ${couple.groom.name} & ${couple.bride.name}`,
      dates: `${event.startISO}/${event.endISO}`,
      details: `Anda diundang ke ${event.title} pernikahan ${couple.groom.name} & ${couple.bride.name}.`,
      location: `${event.venue}, ${event.address}`,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  })();

  return (
    <section className="snap-section">
      <KelirScene preset={preset} kain="KainBadan">
        <SceneContent scroll maxWidth={360}>
          <p className="font-display" style={{ color: "var(--gold)", fontSize: "clamp(26px, 7.5vw, 40px)", lineHeight: 1.1 }}>
            {isAkad ? "Akad Nikah" : "Resepsi"}
          </p>
          <div className="gold-divider mx-auto my-3" style={{ width: 40 }} />

          <p className="font-body italic" style={{ color: "var(--text-muted)", fontSize: "clamp(13px, 3.5vw, 16px)", letterSpacing: "0.12em" }}>
            {event.day}
          </p>
          <span className="font-display text-gold-gradient" style={{ fontSize: "clamp(54px, 16vw, 84px)", lineHeight: 0.95, display: "block" }}>
            {dNum}
          </span>
          <p className="font-display" style={{ color: "var(--gold-dim)", fontSize: "clamp(11px, 3vw, 14px)", letterSpacing: "0.26em", textTransform: "uppercase" }}>
            {dMonth} · {dYear}
          </p>

          {/* Venue */}
          <div
            className="mt-5 w-full"
            style={{ padding: "14px 18px", border: "1px solid var(--border)", background: "rgba(20,12,6,0.5)" }}
          >
            <p className="font-label" style={{ color: "var(--text-muted)", fontSize: 11, letterSpacing: "0.14em", borderBottom: "1px solid var(--border)", paddingBottom: 6 }}>
              {event.time}
            </p>
            <p className="font-display mt-2" style={{ color: "var(--text)", fontSize: "clamp(15px, 4.5vw, 20px)", lineHeight: 1.2 }}>
              {event.venue}
            </p>
            <p className="font-label mt-1" style={{ color: "var(--text-muted)", fontSize: 11, lineHeight: 1.5 }}>
              {event.address}
            </p>
          </div>

          {/* Map */}
          <div className="mt-4 w-full" style={{ border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
            <iframe
              src={event.embedUrl}
              width="100%"
              height="180"
              style={{ border: 0, display: "block", filter: "grayscale(0.3) brightness(0.85)", pointerEvents: mapOn ? "auto" : "none" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Lokasi ${event.title}`}
            />
            {!mapOn ? (
              <div
                onClick={() => setMapOn(true)}
                role="button"
                tabIndex={0}
                aria-label="Aktifkan peta"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setMapOn(true);
                  }
                }}
                style={{ position: "absolute", inset: 0, cursor: "pointer", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 10 }}
              >
                <span className="font-label" style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text)", background: "rgba(20,12,6,0.85)", padding: "4px 10px" }}>
                  Ketuk untuk menggeser
                </span>
              </div>
            ) : (
              <button
                onClick={() => setMapOn(false)}
                aria-label="Selesai"
                className="font-label"
                style={{ position: "absolute", top: 8, right: 8, display: "flex", alignItems: "center", gap: 4, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--gold)", background: "rgba(20,12,6,0.9)", border: "1px solid var(--border)", padding: "4px 10px", cursor: "pointer" }}
              >
                <X size={10} /> Selesai
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center justify-center">
            <a
              href={event.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-label flex items-center gap-2"
              style={{ color: "var(--gold)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", padding: "6px 16px", borderRight: "1px solid var(--border)" }}
            >
              <ExternalLink size={11} /> Maps
            </a>
            <a
              href={calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-label flex items-center gap-2"
              style={{ color: "var(--gold)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", padding: "6px 16px" }}
            >
              Kalender
            </a>
          </div>
        </SceneContent>
      </KelirScene>
    </section>
  );
}
