"use client";

import { motion } from "framer-motion";
import TopFrame from "@/components/shared/TopFrame";
import FloralTitle from "@/components/shared/FloralTitle";
import Butterflies from "@/components/shared/Butterflies";
import FallingFlowers from "@/components/shared/FallingFlowers";
import FloralDivider from "@/components/shared/FloralDivider";
import SceneBackground from "@/components/shared/SceneBackground";
import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";
import type { InvitationConfig } from "@/lib/config-types";

// Kemiringan polaroid selang-seling → terasa scrapbook tertempel, bukan grid kaku.
const TILTS = [-1.2, 2.1, -2.3, 1.7, -1.9, 1.4, -2.1, 1.8];

export default function GallerySection({ gallery }: { gallery: InvitationConfig["gallery"] }) {
  return (
    <section
      id="gallery"
      className="snap-section flow-section reveal-scope"
      style={{ justifyContent: "flex-start", paddingTop: "clamp(124px, 22vh, 188px)", paddingBottom: "clamp(40px, 9vh, 72px)" }}
    >
      <SceneBackground file="LatarBokeh.webp" scrim={0.5} edgeFade />
      <TopFrame maxWidth={408} opacity={0.85} zIndex={1} />
      <Butterflies count={2} zIndex={2} />
      <FallingFlowers count={6} zIndex={3} />

      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-6" style={{ gap: "clamp(14px, 3vh, 24px)" }}>
        <p className="type-eyebrow">
          Galeri
        </p>

        <FloralTitle serif style={{ marginBottom: 4 }}>
          Kenangan Kami
        </FloralTitle>

        <FloralDivider width="60vw" maxWidth={280} style={{ marginBottom: 6 }} />

        <div className="grid grid-cols-2 w-full" style={{ gap: "clamp(13px, 3.6vw, 18px)", maxWidth: 350 }}>
          {gallery.map((item, i) => {
            // Bento berirama: foto pembuka (dan penutup bila jumlah genap) melebar
            // dua kolom, sisanya persegi seragam → baris selalu rata, tanpa lubang.
            const isWide = i === 0 || (gallery.length % 2 === 0 && i === gallery.length - 1);
            // Bunga sudut mengikuti kolom foto (kiri → sudut kiri, kanan → sudut
            // kanan) supaya ornamen selalu di tepi LUAR, tak bertabrakan di gutter.
            const onLeft = isWide ? i === 0 : (i - 1) % 2 === 0;
            const corner = onLeft
              ? { file: "SudutBunga.webp", pos: { top: -12, left: -12 }, flip: false, origin: "0% 0%" }
              : { file: "SudutBunga2.webp", pos: { top: -12, right: -12 }, flip: true, origin: "100% 0%" };
            const tilt = TILTS[i % TILTS.length] * (isWide ? 0.55 : 1);
            const accent = `BungaJatuh${(i % 3) + 1}.webp`;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.72, rotate: 0 }}
                whileInView={{ opacity: 1, scale: 1, rotate: tilt }}
                whileHover={{ rotate: 0, scale: 1.02 }}
                viewport={{ once: true, margin: "-8%" }}
                transition={{ duration: 0.8, ease: [0.34, 1.45, 0.5, 1], delay: Math.min(i * 0.09, 0.36) }}
                style={{ position: "relative", gridColumn: isWide ? "1 / -1" : undefined }}
              >
                {/* Polaroid: pigura putih + caption script di strip bawah */}
                <div
                  style={{
                    background: "rgba(255,255,255,0.94)",
                    padding: "7px 7px 4px",
                    borderRadius: 3,
                    border: "1px solid var(--border)",
                    boxShadow: "0 10px 26px rgba(58,58,54,0.10)",
                  }}
                >
                  <div style={{ aspectRatio: isWide ? "16 / 10" : "1 / 1", overflow: "hidden", borderRadius: 2, background: "var(--surface)" }}>
                    <img
                      src={item.src}
                      alt={item.alt}
                      loading="lazy"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </div>
                  <p
                    className="font-script"
                    style={{
                      textAlign: "center",
                      fontSize: isWide ? "clamp(19px, 5vw, 23px)" : "clamp(16px, 4.4vw, 19px)",
                      color: "var(--accent)",
                      padding: "8px 4px 4px",
                      lineHeight: 1,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.alt}
                  </p>
                </div>

                {/* Bingkai bunga di ujung foto — mekar dari kecil lalu bergoyang halus.
                    Wrapper pegang entrance (tl/tr); <img> pegang goyangan ambient. */}
                <div
                  aria-hidden="true"
                  data-enter={onLeft ? "tl" : "tr"}
                  style={{
                    position: "absolute",
                    ...corner.pos,
                    width: "clamp(38px, 11vw, 54px)",
                    pointerEvents: "none",
                    zIndex: 2,
                  }}
                >
                  <img
                    src={asset(corner.file)}
                    alt=""
                    onError={hideBrokenImage}
                    className="ambient-anim"
                    style={{
                      display: "block",
                      width: "100%",
                      height: "auto",
                      transform: corner.flip ? "scaleX(-1)" : "none",
                      transformOrigin: corner.origin,
                      animation: `${onLeft ? "sway" : "swayAlt"} ${(5 + (i % 3)).toFixed(1)}s ease-in-out infinite alternate`,
                      filter: "drop-shadow(0 4px 9px rgba(58,58,54,0.08))",
                    }}
                  />
                </div>

                {/* Aksen bunga kecil di sudut bawah-luar — penyeimbang bunga sudut atas */}
                <div
                  aria-hidden="true"
                  data-enter={onLeft ? "bl" : "br"}
                  style={{
                    position: "absolute",
                    bottom: -8,
                    ...(onLeft ? { left: -10 } : { right: -10 }),
                    width: "clamp(22px, 6.5vw, 30px)",
                    pointerEvents: "none",
                    zIndex: 2,
                  }}
                >
                  <img
                    src={asset(accent)}
                    alt=""
                    onError={hideBrokenImage}
                    className="ambient-anim"
                    style={{
                      display: "block",
                      width: "100%",
                      height: "auto",
                      animation: `floatSlow ${(4.5 + (i % 3)).toFixed(1)}s ease-in-out ${(i * 0.4).toFixed(1)}s infinite alternate`,
                      filter: "drop-shadow(0 3px 6px rgba(58,58,54,0.10))",
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Penutup grid — pembatas bunga dibalik, menggemakan pembuka */}
        <FloralDivider width="60vw" maxWidth={280} style={{ marginTop: 6, transform: "scaleY(-1)" }} />
      </div>
    </section>
  );
}
