"use client";

// Panel cover dekoratif untuk tablet & PC — sisi kiri layout split.
// Hanya tampil di >= 768px (dikontrol CSS .desktop-cover); di HP tersembunyi
// dan gambar-gambarnya loading="lazy" sehingga tidak ikut terunduh.
// Pola diadopsi dari template soft-bloom, aset & tipografi memakai bahasa
// visual warm-narrative (lukisan sakura + Playfair Display).

import { Suspense } from "react";
import FallingFlowers from "./FallingFlowers";
import GuestName from "./GuestName";
import { asset, hideOnError } from "@/lib/assets";
import type { InvitationConfig } from "@/lib/config-types";

// Ornamen lukisan yang membingkai panel. Semua file ini juga dipakai
// CoverSection, jadi di desktop tidak ada request jaringan tambahan.
const DECOR = [
  { file: "SakuraColumnL.webp", style: { top: "-2%", left: "-4%", height: "104%", opacity: 0.8 } },
  { file: "SakuraColumnR.webp", style: { top: "-2%", right: "-4%", height: "104%", opacity: 0.8 } },
  { file: "SakuraTopL.webp", style: { top: "-3%", left: "-2%", width: "30%", opacity: 0.9 } },
  { file: "SakuraTopR.webp", style: { top: "-3%", right: "-2%", width: "30%", opacity: 0.9 } },
  { file: "SakuraCornerL.webp", style: { bottom: "-2%", left: "-3%", width: "32%", opacity: 0.9 } },
  { file: "SakuraCornerR.webp", style: { bottom: "-2%", right: "-3%", width: "32%", opacity: 0.9 } },
] as const;

// Glow krem yang sama dengan CoverSection agar teks terangkat dari lukisan.
const TEXT_GLOW =
  "0 1px 3px rgba(250,247,242,0.98), 0 2px 14px rgba(250,247,242,1), 0 0 7px rgba(250,247,242,0.9)";

export default function DesktopCover({
  couple,
  weddingDate,
}: {
  couple: InvitationConfig["couple"];
  weddingDate: string;
}) {
  const { groom, bride } = couple;
  const dateStr = new Date(weddingDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Scroll di layout ini terjadi di .snap-container (bukan window), jadi roda
  // mouse di atas panel kiri tidak menggulir apa pun — teruskan manual.
  const forwardWheel = (e: React.WheelEvent) => {
    document.querySelector<HTMLElement>(".snap-container")?.scrollBy({ top: e.deltaY });
  };

  return (
    <aside className="desktop-cover" aria-hidden="true" onWheel={forwardWheel}>
      {/* Latar lukisan full-bleed */}
      <img
        src={asset("CoverBg.webp")}
        alt=""
        loading="lazy"
        decoding="async"
        onError={hideOnError}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* Ornamen sakura membingkai tepi panel */}
      {DECOR.map(({ file, style }) => (
        <img
          key={file}
          src={asset(file)}
          alt=""
          loading="lazy"
          decoding="async"
          onError={hideOnError}
          style={{ position: "absolute", pointerEvents: "none", ...style }}
        />
      ))}

      {/* Scrim krem — sama dengan CoverSection, mengangkat teks dari flora */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 62% 52% at 50% 46%, rgba(250,247,242,0.66) 0%, rgba(250,247,242,0.32) 45%, rgba(250,247,242,0) 72%)",
        }}
      />

      <FallingFlowers count={14} zIndex={2} />

      {/* Tekstur kertas + bingkai garis tipis khas cover */}
      <div className="paper-overlay" />
      <div style={{ position: "absolute", inset: 24, border: "1px solid var(--border)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 28, border: "1px solid var(--border)", opacity: 0.5, pointerEvents: "none" }} />

      {/* Konten tengah */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "48px 10% 56px",
        }}
      >
        <p
          className="font-label"
          style={{
            fontSize: "clamp(11px, 1vw, 14px)",
            fontWeight: 700,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--gold)",
            marginBottom: 26,
            textShadow: TEXT_GLOW,
          }}
        >
          Undangan Pernikahan
        </p>

        <div className="copper-divider" style={{ marginBottom: 30 }} />

        <h1
          className="font-display"
          style={{
            fontSize: "clamp(48px, 4.6vw, 80px)",
            fontWeight: 400,
            lineHeight: 1.08,
            color: "var(--text)",
            letterSpacing: "-0.01em",
            textShadow: TEXT_GLOW,
          }}
        >
          {groom.name}
          <span
            className="font-display"
            style={{ display: "block", fontSize: "0.42em", fontStyle: "italic", color: "var(--gold)", margin: "6px 0" }}
          >
            &amp;
          </span>
          {bride.name}
        </h1>

        <div className="copper-divider" style={{ marginTop: 30, marginBottom: 24 }} />

        <p
          className="font-body"
          style={{
            fontSize: "clamp(13px, 1.1vw, 16px)",
            fontStyle: "italic",
            color: "var(--text-muted)",
            letterSpacing: "0.04em",
            marginBottom: 36,
            textShadow: TEXT_GLOW,
          }}
        >
          {dateStr}
        </p>

        {/* Blok tamu — panel kertas lembut agar terbaca di atas lukisan */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            padding: "16px 36px 18px",
            background: "rgba(250,247,242,0.72)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-warm)",
          }}
        >
          <p
            className="font-label"
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            Kepada Yth.
          </p>
          <Suspense fallback={null}>
            <p
              className="font-display"
              style={{ fontSize: "clamp(20px, 1.8vw, 28px)", fontStyle: "italic", color: "var(--gold-deep)", lineHeight: 1.2 }}
            >
              <GuestName />
            </p>
          </Suspense>
        </div>
      </div>
    </aside>
  );
}
