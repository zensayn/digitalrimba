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
          width: "clamp(168px, 46vw, 214px)",
          height: "clamp(168px, 46vw, 214px)",
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
            width: "64%",
            height: "64%",
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
            style={{ position: "absolute", color: "var(--accent-soft)", fontSize: "clamp(28px, 8vw, 38px)", fontWeight: 500 }}
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
      <SceneBackground file="LatarDaun.webp" scrim={0.5} edgeFade />
      <TopFrame maxWidth={520} opacity={0.92} zIndex={1} />
      <SectionDecor corners={["bl", "br"]} size="clamp(104px, 28vw, 190px)" opacity={0.9} />
      <Bird size="clamp(66px, 18vw, 104px)" style={{ top: "13%", left: "5%" }} zIndex={3} />
      <Butterflies count={1} zIndex={3} />

      <div className="relative z-10 flex flex-col items-center text-center px-8 w-full max-w-sm mx-auto">
        <FloralTitle style={{ marginBottom: "clamp(20px, 5vh, 36px)" }}>
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
            color: "var(--text-muted)",
            fontStyle: "italic",
            fontSize: "clamp(12px, 3.2vw, 15px)",
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
