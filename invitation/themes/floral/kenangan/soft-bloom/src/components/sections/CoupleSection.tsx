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
          marginBottom: "clamp(10px, 2.5vh, 18px)",
        }}
      >
        {/* Foto (lingkaran di tengah wreath) */}
        <div
          style={{
            position: "absolute",
            width: "66%",
            height: "66%",
            borderRadius: "50%",
            overflow: "hidden",
            background: "var(--surface-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            className="font-display"
            style={{ position: "absolute", color: "var(--accent-soft)", fontSize: "clamp(34px, 9vw, 46px)", fontWeight: 500 }}
          >
            {person.name[0]}
          </span>
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

      <h2
        className="font-display"
        style={{ color: "var(--text)", fontWeight: 500, fontStyle: "italic", fontSize: "clamp(22px, 6vw, 30px)", marginBottom: 5 }}
      >
        {person.fullName}
      </h2>
      <p
        className="font-body"
        style={{ color: "var(--text-muted)", fontSize: "clamp(14px, 3.6vw, 17px)", lineHeight: 1.75, fontWeight: 300 }}
      >
        {person.parents}
      </p>
      <p
        className="font-label"
        style={{ color: "var(--accent)", fontSize: "14px", fontWeight: 500, letterSpacing: "0.08em", marginTop: 7 }}
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
      <SceneBackground file="LatarDaun.webp" scrim={0.5} edgeFade />
      <TopFrame maxWidth={580} opacity={0.92} zIndex={1} />
      <SectionDecor corners={["bl", "br"]} size="clamp(124px, 32vw, 220px)" opacity={0.9} />
      <Bird size="clamp(78px, 21vw, 124px)" style={{ top: "13%", left: "5%" }} zIndex={3} />
      <Butterflies count={1} zIndex={3} />

      <div className="relative z-10 flex flex-col items-center text-center px-8 w-full max-w-md mx-auto">
        <FloralTitle style={{ marginBottom: "clamp(20px, 5vh, 36px)" }}>
          Mempelai
        </FloralTitle>

        <Person person={couple.groom} />

        <span
          className="font-script"
          style={{ color: "var(--accent)", fontSize: "clamp(50px, 13vw, 68px)", lineHeight: 1, margin: "clamp(12px, 3.4vh, 24px) 0" }}
        >
          &amp;
        </span>

        <Person person={couple.bride} />

        <FloralDivider width="64vw" maxWidth={320} style={{ marginTop: "clamp(28px, 6vh, 44px)" }} />

        <p
          className="font-display"
          style={{
            color: "var(--text-muted)",
            fontStyle: "italic",
            fontSize: "clamp(15px, 3.8vw, 18px)",
            lineHeight: 1.8,
            marginTop: "clamp(16px, 4vh, 26px)",
          }}
        >
          {couple.quote}
        </p>
      </div>
    </section>
  );
}
