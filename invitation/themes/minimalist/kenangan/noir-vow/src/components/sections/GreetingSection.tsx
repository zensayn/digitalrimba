import * as motion from "framer-motion/client";
import { Suspense } from "react";
import FloralDivider from "@/components/shared/FloralDivider";
import FloralTitle from "@/components/shared/FloralTitle";
import GuestName from "@/components/shared/GuestName";
import SceneBackground from "@/components/shared/SceneBackground";
import BotanicalCard from "@/components/shared/BotanicalCard";
import { rhythmVars } from "@/lib/rhythm";
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
      style={rhythmVars("greeting")}
    >
      <SceneBackground scrim={0.58} edgeFade />

      <div className="section-shell">
        <motion.div
          variants={fade(0)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="flex flex-col items-center"
        >
          <FloralTitle>Salam Hangat</FloralTitle>
        </motion.div>

        <FloralDivider width="78vw" maxWidth={360} />

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
            <p className="type-script" style={{ marginBottom: "var(--space-lg)" }}>
              <Suspense fallback="Tamu Undangan">
                <GuestName />
              </Suspense>
            </p>

            <div className="divider" style={{ margin: "0 auto var(--space-lg)" }} />

            <p className="type-body">
              Dengan penuh sukacita, kami mengundang Bapak / Ibu / Saudara/i untuk hadir
              dan turut berbahagia di hari pernikahan kami. Sebuah hari yang kami nanti,
              akan terasa lebih indah dengan kehadiran serta doa Anda.
            </p>

            <p className="type-heading" style={{ marginTop: "var(--space-xl)" }}>
              {couple.groom.name} <span className="amp-inline">&amp;</span> {couple.bride.name}
            </p>
          </BotanicalCard>
        </motion.div>
      </div>
    </section>
  );
}
