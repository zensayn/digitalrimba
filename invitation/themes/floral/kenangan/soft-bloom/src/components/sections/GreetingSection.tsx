import * as motion from "framer-motion/client";
import { Suspense } from "react";
import FloralDivider from "@/components/shared/FloralDivider";
import FloralTitle from "@/components/shared/FloralTitle";
import GuestName from "@/components/shared/GuestName";
import SectionDecor from "@/components/shared/SectionDecor";
import TopFrame from "@/components/shared/TopFrame";
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
      className="snap-section flow-section mood-mist reveal-scope"
      style={{
        // Ruang atas menyesuaikan tinggi bingkai (gambar persegi — dalamnya
        // ±40% lebar) supaya salam tidak pernah terkubur di bawah bunga.
        paddingTop: "clamp(150px, 24vh, 200px)",
        paddingBottom: "clamp(48px, 12vh, 96px)",
      }}
    >
      <div className="soft-wash" />
      {/* Bingkai DI BELAKANG konten (dulu zIndex 11 > konten → teks salam
          tertimpa bunga dan tak terbaca — temuan QA). */}
      <TopFrame maxWidth={560} opacity={0.9} zIndex={1} />
      <SectionDecor corners={["bl", "br"]} size="clamp(124px, 32vw, 220px)" opacity={0.9} />

      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-md px-8">
        <motion.div
          variants={fade(0)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="flex flex-col items-center"
          style={{ marginBottom: 14 }}
        >
          <FloralTitle>Salam Hangat</FloralTitle>
        </motion.div>

        <FloralDivider width="78vw" maxWidth={360} style={{ marginBottom: 10 }} />

        {/* Kartu salam — panel kertas dikelilingi rangkaian bunga di tiap sudut */}
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
            <p className="font-script" style={{ fontSize: "clamp(36px, 10vw, 50px)", color: "var(--accent)", lineHeight: 1.1, marginBottom: 20 }}>
              <Suspense fallback="Tamu Undangan">
                <GuestName />
              </Suspense>
            </p>

            <div style={{ width: 30, height: 1, background: "var(--leaf)", opacity: 0.5, margin: "0 auto 18px" }} />

            <p className="font-body" style={{ fontSize: "clamp(14px, 3.6vw, 17px)", color: "var(--text-muted)", lineHeight: 1.9, fontWeight: 300 }}>
              Dengan penuh sukacita, kami mengundang Bapak / Ibu / Saudara/i untuk hadir
              dan turut berbahagia di hari pernikahan kami. Sebuah hari yang kami nanti,
              akan terasa lebih indah dengan kehadiran serta doa Anda.
            </p>

            <p className="font-display" style={{ marginTop: 24, fontSize: "clamp(20px, 5.2vw, 26px)", fontStyle: "italic", color: "var(--text)" }}>
              {couple.groom.name} <span className="font-script" style={{ color: "var(--accent)", fontStyle: "normal" }}>&amp;</span> {couple.bride.name}
            </p>
          </BotanicalCard>
        </motion.div>
      </div>
    </section>
  );
}
