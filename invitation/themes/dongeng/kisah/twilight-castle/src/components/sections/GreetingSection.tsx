import * as motion from "framer-motion/client";
import { Suspense } from "react";
import TwilightTitle from "@/components/shared/TwilightTitle";
import GuestName from "@/components/shared/GuestName";
import SectionCastleDecor from "@/components/shared/SectionCastleDecor";
import SceneBackground from "@/components/shared/SceneBackground";
import Stardust from "@/components/shared/Stardust";
import SkyMagic from "@/components/shared/SkyMagic";
import BotanicalCard from "@/components/shared/BotanicalCard";
import type { InvitationConfig } from "@/lib/config-types";

interface GreetingSectionProps {
  couple: InvitationConfig["couple"];
}

export default function GreetingSection({ couple }: GreetingSectionProps) {
  // Reveal saat scroll dinonaktifkan — konten tampil langsung.
  const fade = (_delay?: number) => ({
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 },
  });

  return (
    <section
      id="greeting"
      className="snap-section flow-section reveal-scope"
      style={{
        paddingTop: "clamp(120px, 20vh, 180px)",
        paddingBottom: "clamp(48px, 12vh, 96px)",
      }}
    >
      {/* Latar dunia twilight + taburan fairy dust + ornamen sudut emas */}
      <SceneBackground scrim={0.35} edgeFade />
      <Stardust count={22} />
      <SkyMagic lanterns={4} stars={2} zIndex={1} />
      <SectionCastleDecor banners />

      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-md px-8">
        <motion.div
          variants={fade(0)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="flex flex-col items-center"
          style={{ marginBottom: 14 }}
        >
          <TwilightTitle>Salam Hangat</TwilightTitle>
        </motion.div>

        {/* Pembatas emas tipis */}
        <div
          style={{
            width: "min(78vw, 360px)",
            height: 1,
            background: "linear-gradient(90deg, transparent, var(--accent), transparent)",
            opacity: 0.7,
            marginBottom: 10,
          }}
        />

        {/* Kartu salam — panel gelap twilight */}
        <motion.div
          variants={fade(0.2)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          style={{ width: "100%" }}
        >
          <BotanicalCard>
            <p className="type-label" style={{ marginBottom: 8 }}>
              Kepada Yth.
            </p>
            <p className="font-script" style={{ fontSize: "clamp(36px, 10vw, 50px)", color: "var(--gold-light)", lineHeight: 1.1, marginBottom: 20 }}>
              <Suspense fallback="Tamu Undangan">
                <GuestName />
              </Suspense>
            </p>

            <div style={{ width: 30, height: 1, background: "var(--accent)", opacity: 0.5, margin: "0 auto 18px" }} />

            <p className="font-body" style={{ fontSize: "clamp(14px, 3.6vw, 17px)", color: "var(--text-muted)", lineHeight: 1.9, fontWeight: 300 }}>
              Dengan penuh sukacita, kami mengundang Bapak / Ibu / Saudara/i untuk hadir
              dan turut berbahagia di hari pernikahan kami. Sebuah hari yang kami nanti,
              akan terasa lebih indah dengan kehadiran serta doa Anda.
            </p>

            <p className="font-display" style={{ marginTop: 24, fontSize: "clamp(20px, 5.2vw, 26px)", fontStyle: "italic", color: "var(--text)" }}>
              {couple.groom.name} <span className="font-script" style={{ color: "var(--gold-light)", fontStyle: "normal" }}>&amp;</span> {couple.bride.name}
            </p>
          </BotanicalCard>
        </motion.div>
      </div>
    </section>
  );
}
