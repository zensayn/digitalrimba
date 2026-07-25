"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import FallingFlowers from "@/components/shared/FallingFlowers";
import Butterflies from "@/components/shared/Butterflies";
import SceneBackground from "@/components/shared/SceneBackground";
import FloralDivider from "@/components/shared/FloralDivider";
import FloralTitle from "@/components/shared/FloralTitle";
import FullFrame from "@/components/shared/FullFrame";
import { hideBrokenImage } from "@/lib/image-fallback";
import type { InvitationConfig } from "@/lib/config-types";

export default function ClosingSection({ couple }: { couple: InvitationConfig["couple"] }) {
  // Reveal saat scroll dinonaktifkan — konten tampil langsung.
  const fadeUp = {
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="closing" className="snap-section reveal-scope" style={{ background: "var(--bg)", overflow: "hidden" }}>
      <SceneBackground file="LatarPadang.webp" scrim={0.55} edgeFade />
      <FullFrame opacity={0.95} zIndex={2} />
      <Butterflies count={2} zIndex={4} />

      <FallingFlowers count={10} zIndex={3} />

      <div
        className="relative z-10 flex flex-col items-center text-center w-full max-w-sm mx-auto px-7"
        style={{
          paddingTop: "clamp(48px, 9vh, 84px)",
          paddingBottom: "calc(166px + env(safe-area-inset-bottom))",
          // Sapuan kertas lembut di belakang teks — kutipan tetap terbaca di
          // atas padang bunga tanpa panel kotak yang memotong bingkai penuh.
          background: "radial-gradient(75% 62% at 50% 46%, rgba(253,252,250,0.88), rgba(253,252,250,0.55) 62%, rgba(253,252,250,0) 100%)",
        }}
      >
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          transition={{ delay: 0, duration: 1, ease: "easeOut" }}
          style={{ marginBottom: "clamp(18px, 5vh, 32px)" }}
        >
          <FloralTitle as="p" glow>Terima Kasih</FloralTitle>
        </motion.div>

        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          transition={{ delay: 0.15, duration: 1, ease: "easeOut" }}
          className="font-display leading-tight"
          style={{ fontSize: "clamp(52px, 14.5vw, 88px)", fontWeight: 500, color: "var(--text)" }}
        >
          {couple.groom.name}
          <span className="font-script" style={{ display: "block", fontSize: "0.7em", color: "var(--accent)", margin: "-4px 0" }}>&amp;</span>
          {couple.bride.name}
        </motion.h2>

        <FloralDivider width="76vw" maxWidth={380} style={{ margin: "clamp(20px, 4.5vh, 32px) 0" }} />

        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
          className="font-display"
          style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "clamp(15px, 4vw, 18px)", lineHeight: 1.85, padding: "0 6px" }}
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
          style={{ letterSpacing: "0.2em", marginTop: "clamp(20px, 5vh, 34px)" }}
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
