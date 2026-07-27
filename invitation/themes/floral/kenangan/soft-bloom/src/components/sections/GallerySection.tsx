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
import { rhythmVars } from "@/lib/rhythm";
import type { InvitationConfig } from "@/lib/config-types";

// Kemiringan polaroid selang-seling → terasa scrapbook tertempel, bukan grid kaku.
const TILTS = [-1.2, 2.1, -2.3, 1.7, -1.9, 1.4, -2.1, 1.8];

export default function GallerySection({ gallery }: { gallery: InvitationConfig["gallery"] }) {
  return (
    <section
      id="gallery"
      className="snap-section flow-section reveal-scope"
      style={rhythmVars("gallery")}
    >
      <SceneBackground file="LatarBokeh.webp" scrim={0.5} edgeFade />
      <TopFrame opacity={0.85} zIndex={1} />
      <Butterflies count={2} zIndex={2} />
      <FallingFlowers count={6} zIndex={3} />

      <div className="section-shell">
        <p className="type-eyebrow">
          Galeri
        </p>

        <FloralTitle serif>
          Kenangan Kami
        </FloralTitle>

        <FloralDivider width="66vw" maxWidth={340} />

        {/* Grid polaroid — gutter-nya --space-md supaya sama dengan jarak
            antar-kartu di section lain; lebarnya boleh melebihi --content-max
            (lihat width:"wide" di rhythm.ts) karena ini grid, bukan kolom teks. */}
        <div className="grid w-full grid-cols-2" style={{ gap: "var(--space-md)" }}>
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
                {/* Polaroid: pigura putih + caption script di strip bawah.
                    Caption dulu punya dua ukuran (lebar vs persegi) — satu
                    ukuran saja, sesuai peran, supaya semua strip terbaca sama. */}
                <div className="polaroid">
                  <div className="polaroid-photo" style={{ aspectRatio: isWide ? "16 / 10" : "1 / 1" }}>
                    <img
                      src={item.src}
                      alt={item.alt}
                      loading="lazy"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </div>
                  <p className="type-photo-caption">{item.alt}</p>
                </div>

                {/* Bingkai bunga di ujung foto — mekar dari kecil lalu bergoyang halus.
                    Wrapper pegang entrance (tl/tr); <img> pegang goyangan ambient. */}
                <div
                  aria-hidden="true"
                  data-enter={onLeft ? "tl" : "tr"}
                  style={{
                    position: "absolute",
                    ...corner.pos,
                    width: "clamp(48px, 13vw, 68px)",
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
                      filter: "var(--drop-sm)",
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
                    width: "clamp(28px, 8vw, 38px)",
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
                      filter: "var(--drop-sm)",
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Penutup grid — pembatas bunga dibalik, menggemakan pembuka */}
        <FloralDivider width="66vw" maxWidth={340} style={{ transform: "scaleY(-1)" }} />
      </div>
    </section>
  );
}
