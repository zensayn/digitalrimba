"use client";

import type { CSSProperties, ReactNode } from "react";

import GiltTitle from "./GiltTitle";
import GiltDivider from "./GiltDivider";
import type { GiltDividerVariant } from "./GiltDivider";

// Header section seragam (spec tata-letak §3): eyebrow → judul display →
// (divider) → intro. Menyatukan tiga treatment judul ad-hoc (Cover <h1>, Couple
// GiltTitle+kicker, Event <p>) jadi satu hierarki. Membungkus GiltTitle &
// GiltDivider yang sudah ada — tak menggantinya.
//
// Ukuran & jarak di sini final (spec §3.2), bukan saran: judul dijaga ≤ 38px
// supaya numeral khusus (mis. tanggal Event) tetap boleh jadi elemen terbesar.

const HALO = "0 1px 6px rgba(20,12,6,0.7), 0 0 3px rgba(20,12,6,0.6)";

export default function SectionHeader({
  eyebrow,
  title,
  intro,
  divider = "lung",
  flanked = true,
  titleGradient = false,
  align = "center",
  className,
  style,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  divider?: GiltDividerVariant | false;
  flanked?: boolean;
  titleGradient?: boolean;
  align?: "center" | "left" | "right";
  className?: string;
  style?: CSSProperties;
}) {
  const alignItems = align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center";
  const textAlign = align;

  const titleNode = (
    <h2
      className={titleGradient ? "font-display text-gold-gradient" : "font-display"}
      style={{
        color: titleGradient ? undefined : "var(--text)",
        fontSize: "clamp(26px, 7.5vw, 38px)",
        lineHeight: 1.12,
        margin: 0,
        textShadow: titleGradient ? undefined : HALO,
      }}
    >
      {title}
    </h2>
  );

  return (
    <div
      className={className}
      style={{ display: "flex", flexDirection: "column", alignItems, textAlign, width: "100%", ...style }}
    >
      {eyebrow && (
        <span
          className="font-label"
          style={{
            color: "var(--gold-dim)",
            fontSize: "clamp(9.5px, 2.6vw, 11px)",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            textShadow: HALO,
          }}
        >
          {eyebrow}
        </span>
      )}

      <div style={{ marginTop: eyebrow ? 8 : 0 }}>
        {flanked ? <GiltTitle>{titleNode}</GiltTitle> : titleNode}
      </div>

      {divider && <GiltDivider variant={divider} width={100} style={{ marginTop: 14, marginBottom: intro ? 10 : 0 }} />}

      {intro && (
        <p
          className="font-body"
          style={{
            color: "var(--text-muted)",
            fontStyle: "italic",
            fontSize: "clamp(12px, 3.2vw, 14px)",
            lineHeight: 1.7,
            maxWidth: 300,
            marginTop: divider ? 0 : 10,
            textShadow: HALO,
          }}
        >
          {intro}
        </p>
      )}
    </div>
  );
}
