"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useInView, useReducedMotion } from "framer-motion";

import { asset, hideOnError } from "@/lib/assets";
import { useScrollContainer } from "./scroll-context";
import { SceneProgressContext } from "./scene-progress";
import GiltSweep from "./GiltSweep";
import PojokKelir from "./PojokKelir";
import type { KelirPreset } from "./sceneKelir";

/** Lebar pinggiran kiri/kanan. Dipakai bersama: lebar gambar PinggiranTile DAN
 *  batas clip hem, supaya hem selalu berhenti pas di tepi dalam pinggiran dan
 *  keduanya tak pernah terlihat bertumpuk di sudut bawah — di lebar layar mana
 *  pun. Sengaja konstanta di file ini (bukan CSS var lintas-file): `width` yang
 *  gagal resolve akan jatuh ke `auto` dan gambar melar ke ukuran intrinsiknya. */
const PINGGIRAN_W = "clamp(18px, 4vw, 32px)";

/** Tinggi TINTA pita hem sebagai rasio terhadap LEBAR scene — bukan tinggi
 *  kotak gambarnya. Aset hem punya ruang transparan cukup besar di atas motif
 *  (HemSulur 67% kosong, HemMelati 65%, HemKawung 47%, TumpalBand 13%), jadi
 *  memakai tinggi kotak akan mendorong ornamen lain jauh ke atas dan menyisakan
 *  celah kosong. Nilai = (naturalHeight − barisTintaPertama) / naturalWidth,
 *  diukur dari alpha channel tiap aset.
 *  Kalau aset hem diganti, ukur ulang: baris pertama dengan alpha > 12. */
const HEM_INK_RATIO: Record<string, number> = {
  TumpalBand: (495 - 66) / 2467,  // 0.1739
  HemSulur:   (724 - 488) / 2172, // 0.1087
  HemMelati:  (724 - 470) / 2172, // 0.1169
  HemKawung:  (724 - 343) / 2172, // 0.1754
};
const DEFAULT_HEM = "TumpalBand";

/** Garis atas motif hem dalam `cqw` (1cqw = 1% lebar container query). Scene
 *  memasang `container-type: inline-size`, jadi satuan ini ikut lebar scene di
 *  layar mana pun — termasuk kolom desktop yang dibatasi max-width. Perlu cqw,
 *  bukan %, karena inset bawah `clip-path` mengacu TINGGI kotak sedangkan hem
 *  tingginya turunan LEBAR. */
const hemBandH = (hem: string | undefined) =>
  `${((HEM_INK_RATIO[hem ?? DEFAULT_HEM] ?? HEM_INK_RATIO[DEFAULT_HEM]) * 100).toFixed(3)}cqw`;

export default function KelirScene({
  preset,
  kain,
  heroSvh = 56,
  children,
}: {
  preset: KelirPreset;
  /** Nama berkas KainBadan; kosong → latar --bg rata (Fase 1). */
  kain?: string;
  /** Tinggi aktor hero (svh). Default 56. Cover desktop mengecilkannya agar ada
   *  pita gelap cukup di bawah gunungan untuk kicker + nama + tamu. */
  heroSvh?: number;
  children?: ReactNode;
}) {
  const container = useScrollContainer();
  const reduced = useReducedMotion() ?? false;

  const sceneRef = useRef<HTMLDivElement>(null);
  const actorRef = useRef<HTMLDivElement>(null);
  const actorIn = useInView(actorRef, { once: true, margin: "-10% 0px -10% 0px" });

  // Progres section terhadap kontainer scroll nyata (spec §5.1).
  const { scrollYProgress } = useScroll({
    container: container ?? undefined,
    target: sceneRef,
    offset: ["start end", "end start"],
  });

  const isHero = preset.actorScale === undefined || preset.actorScale >= 1;

  // Menancap (spec §5.2): turun ke sumbu, overshoot miring, redam. Reduced → fade.
  const rest = reduced ? { opacity: 1 } : { opacity: 1, y: "0%", rotate: 0 };
  const start = reduced ? { opacity: 0 } : { opacity: 0, y: "-8%", rotate: 3 };

  return (
    <div
      ref={sceneRef}
      className="relative w-full overflow-hidden"
      style={{
        flex: "1 0 auto",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        // Jadi container query supaya ornamen di dalamnya bisa memotong diri
        // pakai `cqw` (= % lebar scene). Hanya inline-size: tinggi tetap bebas
        // tumbuh mengikuti konten, dan scene sudah `position: relative` jadi
        // containing block untuk anak absolut tidak berubah.
        containerType: "inline-size",
      }}
    >
      {/* 1 — KainBadan (diam, tanpa kilau). Kosong → --bg rata. */}
      {kain ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={asset(kain)}
          alt=""
          aria-hidden="true"
          onError={hideOnError}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
        />
      ) : (
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "var(--bg)", zIndex: 0 }} />
      )}

      {/* 2 — Blencong (berkedip): pendar hangat menembus tenunan. Nol byte. */}
      <motion.div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
          background: `radial-gradient(60% 45% at 50% ${preset.blencongY}, rgba(227,199,102,${0.22 * preset.blencongBright}) 0%, rgba(201,162,39,${0.10 * preset.blencongBright}) 35%, transparent 70%)`,
        }}
        // Kedip pelita minyak: keyframe tak simetris, bukan napas sinus (spec gerak §2.2).
        animate={reduced ? undefined : { opacity: [0.9, 1, 0.86, 0.97, 0.88, 1], scale: [1, 1.03, 1.01, 1.04, 1, 1.02] }}
        transition={
          reduced
            ? undefined
            : { duration: 5, ease: "easeInOut", repeat: Infinity, repeatType: "mirror", times: [0, 0.15, 0.4, 0.6, 0.82, 1] }
        }
      />

      {/* 3 — Aktor (menancap + kilau). gallery pakai sprig 4-sudut; sisanya satu aktor. */}
      {preset.actor && !preset.actorCorners && (
        <motion.div
          ref={actorRef}
          initial={start}
          animate={actorIn ? rest : start}
          transition={reduced ? { duration: 0.3 } : { type: "spring", stiffness: 120, damping: 14 }}
          style={{
            position: "absolute",
            left: "50%",
            x: "-50%",
            zIndex: 2,
            pointerEvents: "none",
            // Aktor duduk di zona ATAS (spec §4): hero besar di sumbu, ceplok di
            // actorY. Safe-zone teks ada di bawahnya, diatur oleh section.
            // Ukuran/anchor aktor pakai svh (viewport), bukan % section — supaya
            // di section yang tumbuh panjang aktor tetap di zona atas & tak membesar.
            ...(isHero
              ? { top: preset.actorFromTop ? "0svh" : "5svh", height: `${heroSvh}svh`, aspectRatio: "2 / 3" }
              : { top: preset.actorY, width: `${(preset.actorScale ?? 0.6) * 100}%`, aspectRatio: "1 / 1" }),
          }}
        >
          <GiltSweep
            src={asset(preset.actor)}
            progress={scrollYProgress}
            style={{ width: "100%", height: "100%" }}
            // Aset ter-generate lebih jenuh dari palet prada (#C9A227). Redam
            // sedikit ke arah sogan-emas tanpa membunuh crackle — bukan bayangan.
            imgStyle={{ filter: "saturate(0.82) brightness(0.92)" }}
          />
        </motion.div>
      )}

      {/* 3b — Aktor sudut (gallery): sprig kecil dikilau di empat sudut, bukan
             satu aktor tengah (spec §6f: MelatiSprig ×4 sudut). Logika mirror
             SAMA dengan PojokKelir: satu aset (kiri-atas) dicermin ke sudut lain
             via scaleX/scaleY — kanan = flip H, bawah = flip V. Gampang disetel
             per sudut tanpa memutar aset. Urut: kiri-atas → kanan-atas →
             kanan-bawah → kiri-bawah. 404 tersembunyi. */}
      {preset.actor && preset.actorCorners && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            pointerEvents: "none",
            // Sprig sudut berhenti di tepi dalam pinggiran & garis atas hem,
            // jadi tak menyelinap di bawah dua ornamen itu (sama seperti pojok).
            clipPath: `inset(0 ${PINGGIRAN_W} ${hemBandH(preset.hem)} ${PINGGIRAN_W})`,
          }}
        >
          {(
            [
              { pos: { top: 0, left: 0 },  transform: "scaleY(-1)" },
              { pos: { top: 0, right: 0 }, transform: "scaleX(-1) scaleY(-1)" },
              // Sudut bawah: garis dasarnya atas hem, bukan dasar scene —
              // `bottom: 0` membuat sprig (±94px) tenggelam utuh di pita hem.
              { pos: { bottom: hemBandH(preset.hem), right: 0 }, transform: "scaleX(-1)" },
              { pos: { bottom: hemBandH(preset.hem), left: 0 },  transform: undefined },
            ] as const
          ).map(({ pos, transform }, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                ...pos,
                width: `${(preset.actorScale ?? 0.4) * 100}%`,
                aspectRatio: "1 / 1",
                transform,
              }}
            >
              <GiltSweep
                src={asset(preset.actor!)}
                progress={scrollYProgress}
                style={{ width: "100%", height: "100%" }}
                // Selaras dengan aktor tengah: redam sedikit ke sogan-emas.
                // Opacity rendah → sprig sudut jadi aksen halus, tak merebut foto.
                imgStyle={{ filter: "saturate(0.82) brightness(0.92)", opacity: 0.55 }}
              />
            </div>
          ))}
        </div>
      )}

      {/* 3c — Pojok ambient (sulur/praba) dicermin 4 sudut, di bawah pinggiran.
             `bottomInset` memotongnya di garis atas hem: sudut bawah tak lagi
             beradu pola dengan pita hem (hem tetap utuh sebagai pembatas). */}
      {preset.pojok && (
        <PojokKelir
          variant={preset.pojok}
          progress={scrollYProgress}
          skipTop={preset.pojokSkipTop}
          bottomInset={hemBandH(preset.hem)}
        />
      )}

      {/* 3d — Flank: sepasang ornamen tegak mengapit aktor di zona atas (kembar
             mayang). Kanan dicermin scaleX(-1). Duduk di svh viewport (bukan %
             section) agar tetap di zona atas walau section tumbuh panjang. */}
      {preset.flank &&
        (["left", "right"] as const).map((side) => (
          <div
            key={side}
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "1svh",
              // Jarak diukur dari tepi DALAM pinggiran, bukan tepi scene — dulu
              // "6%" (≈23px di 390) cuma menyisakan ~5px dari selvedge dan ikut
              // menyempit di layar kecil. Sekarang jaraknya selalu 8px bersih.
              [side]: `calc(${PINGGIRAN_W} + 8px)`,
              width: "22%",
              aspectRatio: "2 / 3",
              zIndex: 2,
              pointerEvents: "none",
              transform: side === "right" ? "scaleX(-1)" : undefined,
            }}
          >
            <GiltSweep
              src={asset(preset.flank!)}
              progress={scrollYProgress}
              style={{ width: "100%", height: "100%" }}
              imgStyle={{ filter: "saturate(0.82) brightness(0.92)", opacity: 0.9 }}
            />
          </div>
        ))}

      {/* 4 — Pinggiran kiri & kanan (diam). Sisi kanan diputar 180°, bukan flip
             (spec §6a) — melestarikan arah lereng parang. 404 tersembunyi. */}
      {(["left", "right"] as const).map((side) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={side}
          src={asset("PinggiranTile")}
          alt=""
          aria-hidden="true"
          onError={hideOnError}
          style={{
            position: "absolute",
            top: 0,
            [side]: 0,
            // Ramping (dulu 6vw/56px lalu 5vw/40px masih gemuk — sisa jarak ke teks
            // cuma ~16px di kolom 420px). Padding konten SceneContent selalu
            // melewatinya dengan ~24px jarak bersih ke ornamen.
            width: PINGGIRAN_W,
            height: "100%",
            zIndex: 4,
            pointerEvents: "none",
            objectFit: "cover",
            transform: side === "right" ? "rotate(180deg)" : undefined,
          }}
        />
      ))}

      {/* 5 — Hem (tumpal/sulur/melati/kawung per preset, diam). Hem digambar
             sesudah pinggiran pada zIndex sama → ia yang di depan, jadi ia yang
             dipotong: clip inset selebar PINGGIRAN_W di kiri & kanan membuatnya
             berhenti pas di tepi dalam pinggiran (skala pita tetap, ujungnya
             saja yang hilang). Menggantikan nudge manual `left: 18` yang cuma
             menambal sisi kiri. 404 tersembunyi. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset(preset.hem ?? "TumpalBand")}
        alt=""
        aria-hidden="true"
        onError={hideOnError}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          zIndex: 4,
          pointerEvents: "none",
          clipPath: `inset(0 ${PINGGIRAN_W} 0 ${PINGGIRAN_W})`,
        }}
      />

      {/* 6 — Konten section. Flex kolom penuh: section menaruh kontennya di
             zona bawah (mis. marginTop:auto) supaya tidak menimpa aktor. */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          flex: "1 0 auto",
          // Zona aman atas (spec tata-letak §2.2): dorong konten turun ke bawah
          // aktor solid. Ceplok/medallion mengisi svh dari preset; hero-arch &
          // section bottom-align pakai fallback kecil → align yang menegakkan.
          ["--kelir-safe-top" as string]: preset.safeTopSvh
            ? `${preset.safeTopSvh}svh`
            : "clamp(20px, 5svh, 40px)",
        }}
      >
        <SceneProgressContext.Provider value={scrollYProgress}>
          {children}
        </SceneProgressContext.Provider>
      </div>
    </div>
  );
}
