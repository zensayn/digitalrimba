"use client";

// ─── Event (Akad / Resepsi) — Gapura Penuh ────────────────────────────────────
// Satu section = satu gapura (referensi undangan katsudoto): PavilionArch
// membentang memenuhi section dan SEMUA konten acara duduk di dalam jendela
// gapura — bukan gapura kecil di tengah dengan kartu-kartu terpisah di bawahnya.
// Konsekuensinya preview peta inline & modalnya dilepas; navigasi tetap lewat
// tautan eksternal Maps/Kalender seperti tombol "View Maps" di referensi.

import { motion } from "framer-motion";
import { MapPin, ExternalLink, Calendar } from "lucide-react";
import FloralTitle from "@/components/shared/FloralTitle";
import SceneBackground from "@/components/shared/SceneBackground";
import CardVines from "@/components/shared/CardVines";
import TallBlooms from "@/components/shared/TallBlooms";
import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";
import type { InvitationConfig } from "@/lib/config-types";

interface EventSectionProps {
  couple: InvitationConfig["couple"];
  event: InvitationConfig["events"]["akad"];
  index: number;
  sectionId: string;
}

export default function EventSection({ couple, event, index, sectionId }: EventSectionProps) {
  const isAkad = index === 0;
  const [dateNum, dateMonth, dateYear] = event.date.split(" ");

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
  const fade = () => ({
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 },
  });

  return (
    <section id={sectionId} className={`snap-section reveal-scope ${isAkad ? "" : "mood-blush"}`} style={{ overflow: "hidden" }}>
      {isAkad ? <SceneBackground file="LatarParchmentVines.webp" scrim={0.54} edgeFade /> : <SceneBackground file="LatarBotanicalBokeh.webp" scrim={0.62} edgeFade />}

      {/* Gapura memenuhi section. Dilebarkan 150% (left -25%) supaya kolom
          gemuk di kanvas (pita x ±5–30%) terdorong menempel tepi layar dan
          jendela tengah cukup lapang untuk teks. Pada 390×844 lebar tampil
          585px ≈ tinggi natural 878px → distorsi objectFit fill minim. */}
      {/* Gapura DIAM — tanpa breathe: pada bingkai sebesar section, denyut
          scale terasa seperti seluruh halaman berkedut. Kesan hidup datang
          dari kelimpahan bunga di kakinya, bukan dari animasi. */}
      <img
        src={asset("PavilionArch.webp")}
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: "-25%",
          width: "150%",
          // Tailwind preflight menset img { max-width: 100% } → tanpa ini
          // width 150% terpotong jadi 100% dan gapura melenceng ke kiri.
          maxWidth: "none",
          height: "100%",
          objectFit: "fill",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* Bunga pengapit gapura ala referensi: sulur berjuntai di sudut atas,
          bunga tangkai tinggi menjulang dari kaki kolom di kedua tepi. */}
      <CardVines width="clamp(96px, 27vw, 140px)" top={-6} inset={-12} zIndex={2} />
      <TallBlooms sides={["left", "right"]} width="clamp(120px, 34vw, 176px)" zIndex={2} />

      {/* Kaki gapura penuh bunga: hamparan meadow selebar section + buket
          padat menumpuk di kaki tiap kolom (statis, menjorok sedikit keluar
          tepi & bawah supaya terasa tertanam, bukan stiker menempel). */}
      <img
        src={asset("MeadowBloomBand.webp")}
        alt=""
        aria-hidden="true"
        onError={hideBrokenImage}
        loading="lazy"
        decoding="async"
        // translateY 12%: tangkai teratas band sempat naik ke belakang tombol
        // Maps/Kalender di layar pendek — digeser turun supaya baris aksi bersih.
        style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: "auto", zIndex: 2, pointerEvents: "none", transform: "translateY(12%)" }}
      />
      {(["left", "right"] as const).map((s) => (
        <img
          key={s}
          src={asset("PillarTopBouquet.webp")}
          alt=""
          aria-hidden="true"
          onError={hideBrokenImage}
          loading="lazy"
          decoding="async"
          style={{
            position: "absolute",
            bottom: "-5%",
            [s]: "-9%",
            width: "clamp(150px, 42vw, 210px)",
            zIndex: 3,
            pointerEvents: "none",
            transform: s === "right" ? "scaleX(-1)" : undefined,
          }}
        />
      ))}

      {/* Konten di dalam jendela gapura. Bukaan jendela duduk sedikit di bawah
          pusat section (mahkota gapura memakan ±30% atas) → konten digeser
          turun. Sapuan kertas radial menjaga teks terbaca di atas latar. */}
      <div
        className="relative z-10 flex flex-col items-center text-center"
        style={{
          width: "min(62vw, 300px)",
          marginTop: "9vh",
          gap: "clamp(7px, 1.5vh, 13px)",
          padding: "clamp(18px, 3vh, 28px) 8px",
          background: "radial-gradient(64% 58% at 50% 48%, rgba(248,242,231,0.93), rgba(248,242,231,0.62) 62%, rgba(248,242,231,0) 85%)",
        }}
      >
        <motion.div variants={fade()} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }}>
          <FloralTitle size="clamp(22px, 6vw, 28px)">{event.title}</FloralTitle>
        </motion.div>

        <motion.div variants={fade()} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} className="flex flex-col items-center">
          <p className="font-display" style={{ color: "var(--text-muted)", fontSize: "clamp(13px, 3.5vw, 16px)", fontStyle: "italic", letterSpacing: "0.1em", marginBottom: 2 }}>{event.day}</p>
          <p className="font-display" style={{ fontSize: "clamp(46px, 13vw, 66px)", fontWeight: 500, lineHeight: 0.95, color: "var(--accent)" }}>{dateNum}</p>
          <p className="font-display" style={{ color: "var(--accent)", fontSize: "clamp(11px, 3vw, 14px)", letterSpacing: "0.24em", textTransform: "uppercase", marginTop: 4 }}>{dateMonth} · {dateYear}</p>
        </motion.div>

        <div style={{ width: 38, height: 1, background: "var(--accent-soft)", opacity: 0.6 }} />

        <motion.div variants={fade()} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} className="flex flex-col items-center" style={{ gap: 6 }}>
          <p className="type-label">{event.time}</p>
          <p className="font-display" style={{ color: "var(--text)", fontSize: "clamp(16px, 4.6vw, 21px)", fontWeight: 500, fontStyle: "italic", lineHeight: 1.25 }}>{event.venue}</p>
          <div className="flex items-start justify-center gap-2">
            <MapPin size={13} color="var(--leaf)" style={{ flexShrink: 0, marginTop: 2 }} />
            <p className="type-caption" style={{ textAlign: "center", maxWidth: "26ch" }}>{event.address}</p>
          </div>
        </motion.div>

        <motion.div variants={fade()} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} className="flex items-center justify-center" style={{ marginTop: 2 }}>
          <a href={event.mapsUrl} target="_blank" rel="noopener noreferrer" className="event-action-link type-label flex items-center gap-2 transition-colors duration-300" style={{ padding: "6px 14px", borderRight: "1px solid var(--border)" }}>
            <ExternalLink size={11} />
            Maps
          </a>
          <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="event-action-link type-label flex items-center gap-2 transition-colors duration-300" style={{ padding: "6px 14px" }}>
            <Calendar size={11} />
            Kalender
          </a>
        </motion.div>
      </div>
    </section>
  );
}
