"use client";

import { motion } from "framer-motion";
import TopFrame from "@/components/shared/TopFrame";
import FloralTitle from "@/components/shared/FloralTitle";
import FloralDivider from "@/components/shared/FloralDivider";
import SceneBackground from "@/components/shared/SceneBackground";
import SideVines from "@/components/shared/SideVines";
import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";
import { invitationPhoto } from "@/lib/invitation-media";
import type { InvitationConfig } from "@/lib/config-types";

// Kemiringan sangat ringan menjaga ritme editorial tanpa membuat frame tampak
// seperti tumpukan stiker.
const TILTS = [-0.5, 0.8, -0.8, 0.6, -0.6, 0.5];

export default function GallerySection({ gallery }: { gallery: InvitationConfig["gallery"] }) {
  return (
    <section
      id="gallery"
      className="snap-section flow-section reveal-scope"
      style={{ justifyContent: "flex-start", paddingTop: "clamp(124px, 22vh, 188px)", paddingBottom: "clamp(40px, 9vh, 72px)" }}
    >
      <SceneBackground file="LatarBotanicalBokeh.webp" scrim={0.5} edgeFade />
      <TopFrame maxWidth={408} opacity={0.85} zIndex={1} />
      {/* Untaian bunga panjang menjuntai di kedua tepi section tinggi ini —
          berayun pendulum dari gantungan atasnya. Kanvas HangingBloomChain
          sama 2:3 dengan band konten x 34–67%, jadi geseran SideVines pas. */}
      <SideVines file="HangingBloomChain.webp" sides={["left", "right"]} height="min(58vh, 500px)" opacity={0.8} zIndex={1} />
      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-6" style={{ gap: "clamp(14px, 3vh, 24px)" }}>
        <p className="type-eyebrow title-plate" style={{ fontSize: "clamp(13px, 3.4vw, 15px)", letterSpacing: "0.22em" }}>
          Galeri
        </p>

        <FloralTitle serif plate style={{ marginBottom: 4 }}>
          Kenangan Kami
        </FloralTitle>

        <FloralDivider width="60vw" maxWidth={280} style={{ marginBottom: 6 }} />

        <div className="grid grid-cols-2 w-full" style={{ gap: "clamp(13px, 3.6vw, 18px)", maxWidth: 350 }}>
          {gallery.map((item, i) => {
            // Bento berirama: foto pembuka (dan penutup bila jumlah genap) melebar
            // dua kolom, sisanya persegi seragam → baris selalu rata, tanpa lubang.
            const isWide = i === 0 || (gallery.length % 2 === 0 && i === gallery.length - 1);
            const tilt = TILTS[i % TILTS.length] * (isWide ? 0.55 : 1);
            return (
              <motion.div
                key={i}
                initial={false}
                whileInView={{ opacity: 1, scale: 1, rotate: tilt }}
                whileHover={{ rotate: 0, scale: 1.02 }}
                viewport={{ once: true, margin: "-8%" }}
                transition={{ duration: 0.8, ease: [0.34, 1.45, 0.5, 1], delay: Math.min(i * 0.09, 0.36) }}
                style={{ position: "relative", gridColumn: isWide ? "1 / -1" : undefined }}
              >
                {/* GalleryFrame berbentuk persegi: dipakai hanya pada foto
                    persegi. Foto pembuka/penutup yang lebar dibiarkan bernapas
                    tanpa frame yang akan terdistorsi. */}
                <div
                  style={{
                    position: "relative",
                    aspectRatio: isWide ? "16 / 10" : "1 / 1",
                    overflow: "hidden",
                    borderRadius: isWide ? 4 : 0,
                    background: "var(--surface-2)",
                    border: isWide ? "1px solid var(--border)" : undefined,
                    boxShadow: "0 10px 26px rgba(58,58,54,0.10)",
                  }}
                >
                  <img
                    src={invitationPhoto(item.src)}
                    alt={item.alt}
                    loading="lazy"
                    decoding="async"
                    style={{ position: "absolute", inset: isWide ? 0 : "6%", width: isWide ? "100%" : "88%", height: isWide ? "100%" : "88%", objectFit: "cover", display: "block" }}
                  />
                  {!isWide && (
                    <img
                      src={asset("GalleryFrame.webp")}
                      alt=""
                      onError={hideBrokenImage}
                      aria-hidden="true"
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none", zIndex: 1 }}
                    />
                  )}
                </div>
                <p className="font-script" style={{ textAlign: "center", fontSize: isWide ? "clamp(19px, 5vw, 23px)" : "clamp(16px, 4.4vw, 19px)", color: "var(--accent)", padding: "7px 4px 0", lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.alt}
                </p>
              </motion.div>
            );
          })}
        </div>

        <p className="type-caption" style={{ maxWidth: 280, marginTop: 4 }}>
          {gallery.length} foto pilihan untuk merangkum perjalanan sebelum hari bahagia.
        </p>

        {/* Penutup grid — pembatas bunga dibalik, menggemakan pembuka */}
        <FloralDivider width="60vw" maxWidth={280} style={{ marginTop: 6, transform: "scaleY(-1)" }} />
      </div>
    </section>
  );
}
