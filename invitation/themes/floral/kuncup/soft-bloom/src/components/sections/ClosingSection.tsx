"use client";

import { motion } from "framer-motion";
import FallingFlowers from "@/components/shared/FallingFlowers";
import Butterflies from "@/components/shared/Butterflies";
import SceneBackground from "@/components/shared/SceneBackground";
import FloralDivider from "@/components/shared/FloralDivider";
import FloralTitle from "@/components/shared/FloralTitle";
import FullFrame from "@/components/shared/FullFrame";
import { asset } from "@/lib/assets";
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
        className="relative z-10 flex flex-col items-center text-center w-full max-w-xs mx-auto px-6"
        style={{
          paddingTop: "clamp(40px, 8vh, 72px)",
          paddingBottom: "calc(150px + env(safe-area-inset-bottom))",
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
          style={{ fontSize: "clamp(44px, 13vw, 74px)", fontWeight: 500, color: "var(--text)" }}
        >
          {couple.groom.name}
          <span className="font-script" style={{ display: "block", fontSize: "0.7em", color: "var(--accent)", margin: "-4px 0" }}>&amp;</span>
          {couple.bride.name}
        </motion.h2>

        <FloralDivider width="70vw" maxWidth={320} style={{ margin: "clamp(18px, 4vh, 28px) 0" }} />

        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
          className="font-display"
          style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "clamp(13px, 3.5vw, 15px)", lineHeight: 1.85, padding: "0 6px" }}
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

      {/* Footer brand — logo Rimba dari R2 (floral/kuncup/soft-bloom/LogoRimba.webp).
          Aset aslinya persegi dengan latar hutan gelap penuh (tidak transparan),
          jadi di-crop ke band tengah (tempat wordmark) dan ditampilkan sebagai
          badge kecil membulat agar tidak jadi kotak gelap besar di atas pastel. */}
      <div className="absolute left-0 right-0 flex flex-col items-center z-10" style={{ bottom: "calc(30px + env(safe-area-inset-bottom))" }}>
        <div
          style={{
            width: 148,
            aspectRatio: "16 / 7",
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 6px 18px rgba(58,58,54,0.2)",
          }}
        >
          <img
            src={asset("LogoRimba.webp")}
            alt="Rimba Digital"
            loading="lazy"
            onError={(e) => {
              const wrap = e.currentTarget.parentElement;
              if (wrap) wrap.style.display = "none";
            }}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
      </div>
    </section>
  );
}
