"use client";

import FloralDivider from "@/components/shared/FloralDivider";
import FloralTitle from "@/components/shared/FloralTitle";
import SceneBackground from "@/components/shared/SceneBackground";
import { hideBrokenImage } from "@/lib/image-fallback";
import { rhythmVars } from "@/lib/rhythm";
import type { InvitationConfig, PersonConfig } from "@/lib/config-types";

function Person({ person }: { person: PersonConfig }) {
  return (
    <div className="flex flex-col items-center">
      {/* Foto dalam wreath bunga liar */}
      <div
        style={{
          position: "relative",
          width: "clamp(198px, 54vw, 260px)",
          height: "clamp(198px, 54vw, 260px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "var(--space-md)",
        }}
      >
        {/* Foto (lingkaran, mengisi penuh bingkai ring di luarnya). Tanpa
            .avatar: tepinya sudah dibingkai ring, garis tipis tambahan akan
            terbaca dobel. Dulu 66% (sisa desain wreath bunga Soft Bloom yang
            butuh ruang untuk rangkaian bunga di sekeliling foto) — sekarang
            ring cuma garis tipis, 66% menyisakan celah kosong lebar di
            sekeliling foto (bug feedback owner 2026-08-01). */}
        <div
          className="photo-well"
          style={{
            position: "absolute",
            inset: 0,
          }}
        >
          <span className="photo-initial">{person.name[0]}</span>
          <img
            src={person.photo}
            alt=""
            onError={hideBrokenImage}
            style={{ position: "relative", width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* Ring tipis di atas foto */}
        <div
          aria-hidden="true"
          className="photo-ring"
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        />
      </div>

      <h2 className="type-heading" style={{ marginBottom: "var(--space-2xs)" }}>
        {person.fullName}
      </h2>
      {/* text-on-scene: section ini berlatar foto LatarDaun, bukan kertas */}
      <p className="type-body text-on-scene">{person.parents}</p>
      <p className="type-meta" style={{ marginTop: "var(--space-xs)" }}>
        {person.instagram}
      </p>
    </div>
  );
}

export default function CoupleSection({
  couple,
}: {
  couple: InvitationConfig["couple"];
}) {
  return (
    <section
      id="couple"
      className="snap-section flow-section reveal-scope"
      style={rhythmVars("couple")}
    >
      <SceneBackground scrim={0.55} edgeFade />

      {/* Mempelai pria & wanita adalah dua KELOMPOK, bukan dua item berurutan —
          jaraknya dinaikkan ke --space-group lewat --shell-gap. */}
      <div className="section-shell" style={{ "--shell-gap": "var(--space-group)" } as React.CSSProperties}>
        <FloralTitle>Mempelai</FloralTitle>

        <Person person={couple.groom} />

        <span className="type-ampersand">&amp;</span>

        <Person person={couple.bride} />

        <FloralDivider width="64vw" maxWidth={320} />

        <p className="type-lead text-on-scene">{couple.quote}</p>
      </div>
    </section>
  );
}
