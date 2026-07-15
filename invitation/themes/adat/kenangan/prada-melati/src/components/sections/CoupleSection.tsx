"use client";

import KelirScene from "@/components/shared/KelirScene";
import SceneContent from "@/components/shared/SceneContent";
import GiltDivider from "@/components/shared/GiltDivider";
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
      {/* Foto sebagai background-image, bukan <img>: kalau URL 404 (mis. foto
          belum diisi) kotaknya cuma menampilkan warna surface — tanpa ikon
          broken-image yang tak bisa ditangkap onError pra-hidrasi. */}
      <div
        role="img"
        aria-label={person.name}
        style={{
          width: "42%",
          flexShrink: 0,
          aspectRatio: "3 / 4",
          border: "1px solid var(--border)",
          background: "var(--surface)",
          backgroundImage: `url("${person.photo}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div style={{ flex: 1, minWidth: 0, textAlign: reverse ? "right" : "left" }}>
        <span className="font-label" style={{ color: "var(--gold-dim)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          {label}
        </span>
        <h3 className="font-display" style={{ color: "var(--text)", fontSize: "clamp(18px, 5.4vw, 24px)", lineHeight: 1.1, margin: "5px 0 7px" }}>
          {person.fullName}
        </h3>
        <p className="font-body" style={{ color: "var(--text-muted)", fontSize: "clamp(10.5px, 2.7vw, 12px)", lineHeight: 1.55 }}>
          {person.parents}
        </p>
        <p className="font-label" style={{ color: "var(--gold)", fontSize: 11, letterSpacing: "0.05em", marginTop: 6 }}>
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
          <p className="font-label text-xs uppercase tracking-[0.3em] text-[var(--gold)]">Kedua Mempelai</p>
          <GiltDivider className="my-4" variant="truntum" />
          <div className="flex w-full flex-col gap-6">
            <Person person={couple.groom} label="Mempelai Pria" />
            <div className="flex items-center justify-center gap-3">
              <div className="gold-divider" style={{ width: 40, opacity: 0.6 }} />
              <span className="font-display" style={{ color: "var(--gold)", fontSize: 26 }}>&amp;</span>
              <div className="gold-divider" style={{ width: 40, opacity: 0.6 }} />
            </div>
            <Person person={couple.bride} label="Mempelai Wanita" reverse />
          </div>
          <p
            className="font-body mx-auto mt-7 italic text-[var(--text-muted)]"
            style={{ fontSize: "clamp(12px, 3.2vw, 14px)", lineHeight: 1.8, maxWidth: 300 }}
          >
            &ldquo;{couple.quote}&rdquo;
          </p>
        </SceneContent>
      </KelirScene>
    </section>
  );
}
