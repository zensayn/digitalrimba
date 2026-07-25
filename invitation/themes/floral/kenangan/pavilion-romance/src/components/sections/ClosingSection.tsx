"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import FallingFlowers from "@/components/shared/FallingFlowers";
import Meadow from "@/components/shared/Meadow";
import TallBlooms from "@/components/shared/TallBlooms";
import SceneBackground from "@/components/shared/SceneBackground";
import FloralDivider from "@/components/shared/FloralDivider";
import FloralTitle from "@/components/shared/FloralTitle";
import { hideBrokenImage } from "@/lib/image-fallback";
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
      {/* Scene gazebo taman sebagai latar. Lantai taman kini semak penuh
          (BottomGardenCluster hasil regenerate Jul 2026 — dulu asetnya cacat
          berisi gerbang, diganti taburan Meadow); beberapa sprig Meadow tetap
          bergoyang di depannya supaya kaki section terasa hidup. Kanvas semak
          1536×1024 dengan bunga di 71% bagian bawah — top transparan, aman
          menumpuk di belakang teks yang sudah diberi sapuan kertas. */}
      <SceneBackground file="ClosingGardenPavilion.webp" scrim={0.5} edgeFade />
      <img
        src={asset("BottomGardenCluster.webp")}
        alt=""
        aria-hidden="true"
        onError={hideBrokenImage}
        loading="lazy"
        decoding="async"
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "100%",
          height: "auto",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      <Meadow sprigs={3} zIndex={2} />
      {/* Bunga tangkai tinggi menjulang dari semak di kedua tepi — mahkotanya
          bergoyang pelan di depan semak statis, kaki section terasa bernapas. */}
      <TallBlooms sides={["left", "right"]} width="clamp(84px, 23vw, 124px)" zIndex={2} />

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

        <FloralDivider
          width="38vw"
          maxWidth={190}
          style={{ marginBottom: "clamp(10px, 3vh, 18px)", opacity: 0.9 }}
        />

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

      {/* Watermark: bilah penuh di kaki section (gaya soft-bloom), bukan pil
          mengambang — styling di .closing-brand-footer globals.css. */}
      <footer className="closing-brand-footer" aria-label="Dibuat oleh Rimba Digital">
        <span>Dibuat oleh</span>
        <Image src="/icon.png" alt="Rimba Digital" width={34} height={34} loading="lazy" onError={hideBrokenImage} />
      </footer>
    </section>
  );
}
