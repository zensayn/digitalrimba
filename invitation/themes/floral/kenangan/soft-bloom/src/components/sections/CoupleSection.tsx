"use client";

import SectionDecor from "@/components/shared/SectionDecor";
import Butterflies from "@/components/shared/Butterflies";
import FloralDivider from "@/components/shared/FloralDivider";
import FloralTitle from "@/components/shared/FloralTitle";
import TopFrame from "@/components/shared/TopFrame";
import SceneBackground from "@/components/shared/SceneBackground";
import Bird from "@/components/shared/Bird";
import { asset } from "@/lib/assets";
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
        {/* Foto (lingkaran di tengah wreath). Tanpa .avatar: tepinya sudah
            dibingkai wreath, garis tipis tambahan akan terbaca dobel. */}
        <div
          className="photo-well"
          style={{
            position: "absolute",
            width: "66%",
            height: "66%",
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

        {/* Wreath di atas foto */}
        <img
          src={asset("BingkaiFoto.webp")}
          alt=""
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }}
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

export default function CoupleSection({ couple }: { couple: InvitationConfig["couple"] }) {
  return (
    <section
      id="couple"
      className="snap-section flow-section reveal-scope"
      style={rhythmVars("couple")}
    >
      <SceneBackground file="LatarDaun.webp" scrim={0.5} edgeFade />
      <TopFrame opacity={0.92} zIndex={1} />
      <SectionDecor corners={["bl", "br"]} size="clamp(124px, 32vw, 220px)" opacity={0.9} />
      <Bird size="clamp(78px, 21vw, 124px)" style={{ top: "13%", left: "5%" }} zIndex={3} />
      <Butterflies count={1} zIndex={3} />

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
