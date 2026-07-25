"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Stardust from "@/components/shared/Stardust";
import SkyMagic from "@/components/shared/SkyMagic";
import SectionCastleDecor from "@/components/shared/SectionCastleDecor";
import SceneBackground from "@/components/shared/SceneBackground";
import { asset } from "@/lib/assets";
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
      {/* Kembali ke dunia istana sebagai penutup */}
      <SceneBackground file="DuniaIstana.webp" scrim={0.55} edgeFade />
      <Stardust count={30} />
      {/* Lentera terbang naik + bintang jatuh */}
      <SkyMagic lanterns={6} stars={3} zIndex={2} />
      {/* Lentera gantung + panji (tanpa sudut emas — kaki halaman diisi siluet) */}
      <SectionCastleDecor banners corners={false} />

      {/* Siluet skyline istana di kaki halaman (di atas watermark) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset("SiluetIstana.webp")}
        alt=""
        aria-hidden="true"
        onError={hideBrokenImage}
        style={{ position: "absolute", left: 0, right: 0, bottom: 54, width: "100%", height: "auto", zIndex: 2, pointerEvents: "none", opacity: 0.9 }}
      />

      <div
        className="relative z-10 flex flex-col items-center text-center w-full max-w-sm mx-auto px-7"
        style={{
          paddingTop: "clamp(48px, 9vh, 84px)",
          paddingBottom: "calc(166px + env(safe-area-inset-bottom))",
          // Sapuan gelap lembut di belakang teks → kutipan tetap terbaca di atas
          // dunia istana tanpa panel kotak.
          background: "radial-gradient(75% 62% at 50% 46%, rgba(20,16,36,0.82), rgba(20,16,36,0.5) 62%, rgba(20,16,36,0) 100%)",
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
          <p
            className="font-display"
            style={{ color: "var(--gold-light)", fontStyle: "italic", fontSize: "clamp(22px, 6vw, 30px)", fontWeight: 500 }}
          >
            Terima Kasih
          </p>
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
          <span className="font-script" style={{ display: "block", fontSize: "0.7em", color: "var(--gold-light)", margin: "-4px 0" }}>&amp;</span>
          {couple.bride.name}
        </motion.h2>

        {/* Pembatas emas */}
        <div style={{ width: "min(76vw, 380px)", height: 1, background: "linear-gradient(90deg, transparent, var(--accent), transparent)", opacity: 0.7, margin: "clamp(20px, 4.5vh, 32px) 0" }} />

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
