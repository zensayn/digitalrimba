"use client";

import SectionDecor from "@/components/shared/SectionDecor";
import SideVines from "@/components/shared/SideVines";
import FloralDivider from "@/components/shared/FloralDivider";
import FloralTitle from "@/components/shared/FloralTitle";
import TopFrame from "@/components/shared/TopFrame";
import SceneBackground from "@/components/shared/SceneBackground";
import { hideBrokenImage } from "@/lib/image-fallback";
import { invitationPhoto } from "@/lib/invitation-media";
import type { InvitationConfig, PersonConfig } from "@/lib/config-types";

function Person({ person }: { person: PersonConfig }) {
  return (
    <div className="flex flex-col items-center">
      {/* Potret mempelai memakai crop portrait sederhana. GalleryFrame khusus
          untuk foto galeri persegi, sehingga tidak dipaksakan menjadi wreath. */}
      <div
        style={{
          position: "relative",
          width: "clamp(158px, 43vw, 202px)",
          aspectRatio: "4 / 5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "clamp(10px, 2.5vh, 18px)",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "48% 48% 5px 5px / 34% 34% 5px 5px",
            overflow: "hidden",
            background: "var(--surface-2)",
            border: "1px solid rgba(184,149,94,0.55)",
            boxShadow: "0 10px 24px rgba(62,51,40,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            className="font-display"
            style={{ position: "absolute", color: "var(--accent-soft)", fontSize: "clamp(28px, 8vw, 38px)", fontWeight: 500 }}
          >
            {person.name[0]}
          </span>
          <img
            src={invitationPhoto(person.photo)}
            alt=""
            onError={hideBrokenImage}
            loading="lazy"
            decoding="async"
            style={{ position: "relative", width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

      </div>

      <h2
        className="font-display"
        style={{ color: "var(--text)", fontWeight: 500, fontStyle: "italic", fontSize: "clamp(18px, 5.2vw, 24px)", marginBottom: 4 }}
      >
        {person.fullName}
      </h2>
      <p
        className="font-body"
        style={{ color: "var(--text-muted)", fontSize: "clamp(11px, 2.8vw, 13px)", lineHeight: 1.6, fontWeight: 300 }}
      >
        {person.parents}
      </p>
      <p
        className="font-label"
        style={{ color: "var(--accent)", fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em", marginTop: 6 }}
      >
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
      style={{ justifyContent: "flex-start", paddingTop: "clamp(140px, 22vh, 190px)", paddingBottom: "clamp(40px, 9vh, 72px)" }}
    >
      <SceneBackground file="LatarParchmentVines.webp" scrim={0.5} edgeFade />
      <TopFrame maxWidth={520} opacity={0.92} zIndex={1} />
      {/* Garland lebat membingkai kartu mempelai dari kedua tepi; dibatasi
          52vh (menggantung dari atas) supaya sudut bawah tetap milik
          SectionDecor tanpa dobel ornamen */}
      <SideVines sides={["left", "right"]} height="min(52vh, 440px)" opacity={0.45} zIndex={1} />
      <SectionDecor corners={["bl", "br"]} size="clamp(104px, 28vw, 190px)" opacity={0.9} />

      <div className="relative z-10 flex flex-col items-center text-center px-8 w-full max-w-sm mx-auto">
        <FloralTitle plate style={{ marginBottom: "clamp(20px, 5vh, 36px)" }}>
          Mempelai
        </FloralTitle>

        <Person person={couple.groom} />

        <span
          className="font-script"
          style={{ color: "var(--accent)", fontSize: "clamp(40px, 11vw, 56px)", lineHeight: 1, margin: "clamp(10px, 3vh, 22px) 0" }}
        >
          &amp;
        </span>

        <Person person={couple.bride} />

        <FloralDivider width="58vw" maxWidth={260} style={{ marginTop: "clamp(24px, 6vh, 40px)" }} />

        <p
          className="font-display"
          style={{
            color: "var(--text)",
            fontStyle: "italic",
            fontSize: "clamp(13px, 3.6vw, 16px)",
            lineHeight: 1.85,
            marginTop: "clamp(16px, 4vh, 26px)",
            // Halo kertas → kutipan tetap terbaca di atas dedaunan (dulu nyaris
            // tak terlihat karena text-muted kecil di atas flora ramai).
            textShadow:
              "0 1px 3px rgba(248,242,231,0.96), 0 0 16px rgba(248,242,231,0.92), 0 0 30px rgba(248,242,231,0.85)",
          }}
        >
          {couple.quote}
        </p>
      </div>
    </section>
  );
}
