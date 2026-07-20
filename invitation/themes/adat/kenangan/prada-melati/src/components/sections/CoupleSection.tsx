"use client";

import KelirScene from "@/components/shared/KelirScene";
import SceneContent from "@/components/shared/SceneContent";
import SectionHeader from "@/components/shared/SectionHeader";
import GebyokCard from "@/components/shared/GebyokCard";
import { kelirFor } from "@/components/shared/sceneKelir";
import type { InvitationConfig, PersonConfig } from "@/lib/config-types";

function Person({
  person,
  label,
  reverse = false,
}: {
  person: PersonConfig;
  label: string;
  reverse?: boolean;
}) {
  return (
    <div className="flex items-center gap-3" style={{ flexDirection: reverse ? "row-reverse" : "row" }}>
      <GebyokCard
        variant="gebyok"
        photo={person.photo}
        alt={person.name}
        aspectRatio="3 / 4"
        corners
        style={{ width: "55%", flexShrink: 0 }}
      />
      {/* Plate lokal (spec §4): tegakkan teks di atas kain & sulur, tanpa blob. */}
      <div className="kelir-plate" style={{ flex: 1, minWidth: 0, textAlign: reverse ? "right" : "left" }}>
        <span className="font-label text-halo" style={{ color: "var(--gold-dim)", fontSize: "clamp(9.5px, 2.5vw, 11px)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          {label}
        </span>
        <h3 className="font-display text-halo" style={{ color: "var(--text)", fontSize: "clamp(18px, 5.4vw, 24px)", lineHeight: 1.1, margin: "5px 0 7px" }}>
          {person.fullName}
        </h3>
        <p className="font-body text-halo" style={{ color: "var(--text-muted)", fontSize: "clamp(10.5px, 2.7vw, 12px)", lineHeight: 1.55 }}>
          {person.parents}
        </p>
        <p className="font-label text-halo" style={{ color: "var(--gold)", fontSize: 11, letterSpacing: "0.05em", marginTop: 6 }}>
          {person.instagram}
        </p>
      </div>
    </div>
  );
}

export default function CoupleSection({ couple }: { couple: InvitationConfig["couple"] }) {
  const preset = kelirFor("couple");

  return (
    <section className="snap-section">
      <KelirScene preset={preset} kain="KainBadan">
        <SceneContent scroll maxWidth={360}>
          <SectionHeader
            eyebrow="Kedua Mempelai"
            title="Mempelai"
            intro="Dua insan, satu kisah baru yang dimulai."
            divider="truntum"
          />
          <div className="mt-6 flex w-full flex-col gap-6">
            <Person person={couple.groom} label="Mempelai Pria" />
            <div className="flex items-center justify-center gap-3">
              <div className="gold-divider" style={{ width: 40, opacity: 0.6 }} />
              <span className="font-display text-halo" style={{ color: "var(--gold)", fontSize: 26 }}>&amp;</span>
              <div className="gold-divider" style={{ width: 40, opacity: 0.6 }} />
            </div>
            <Person person={couple.bride} label="Mempelai Wanita" reverse />
          </div>
          <p
            className="kelir-plate font-body mx-auto mt-7 italic text-[var(--text-muted)]"
            style={{ fontSize: "clamp(12px, 3.2vw, 14px)", lineHeight: 1.8, maxWidth: 300 }}
          >
            &ldquo;{couple.quote}&rdquo;
          </p>
        </SceneContent>
      </KelirScene>
    </section>
  );
}
