"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import SceneBackground from "@/components/shared/SceneBackground";
import FloralDivider from "@/components/shared/FloralDivider";
import FloralTitle from "@/components/shared/FloralTitle";
import { hideBrokenImage } from "@/lib/image-fallback";
import { rhythmVars } from "@/lib/rhythm";
import type { InvitationConfig } from "@/lib/config-types";

export default function ClosingSection({
  couple,
}: {
  couple: InvitationConfig["couple"];
}) {
  // Reveal saat scroll dinonaktifkan — konten tampil langsung.
  const fadeUp = {
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section
      id="closing"
      className="snap-section reveal-scope"
      style={rhythmVars("closing")}
    >
      <SceneBackground scrim={0.6} edgeFade />

      <div className="section-shell">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          transition={{ delay: 0, duration: 1, ease: "easeOut" }}
        >
          <FloralTitle as="p">Terima Kasih</FloralTitle>
        </motion.div>

        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          transition={{ delay: 0.15, duration: 1, ease: "easeOut" }}
          className="type-display"
        >
          {couple.groom.name}
          <span className="amp-stacked">&amp;</span>
          {couple.bride.name}
        </motion.h2>

        <FloralDivider width="76vw" maxWidth={380} />

        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
          className="type-lead"
        >
          Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila
          Bapak / Ibu / Saudara/i berkenan hadir untuk memberikan doa restu.
        </motion.p>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          transition={{ delay: 0.55, duration: 1, ease: "easeOut" }}
          className="type-eyebrow"
        >
          {couple.hashtag}
        </motion.p>
      </div>

      <footer className="closing-brand-footer" aria-label="Dibuat oleh Rimba Digital">
        <span>Dibuat oleh</span>
        <Image src="/icon.png" alt="Rimba Digital" width={34} height={34} loading="lazy" onError={hideBrokenImage} />
      </footer>
    </section>
  );
}
