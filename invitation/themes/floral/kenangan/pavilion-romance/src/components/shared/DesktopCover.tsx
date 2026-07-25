"use client";

// Panel cover dekoratif untuk layar lebar (PC/laptop) — sisi kiri layout split.
// Hanya tampil di >= 1024px (dikontrol CSS .desktop-cover). Di HP tidak dirender.

import { Suspense } from "react";
import SceneBackground from "./SceneBackground";
import TopFrame from "./TopFrame";
import Meadow from "./Meadow";
import EdgeGarden from "./EdgeGarden";
import FloralTitle from "./FloralTitle";
import GuestName from "./GuestName";
import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";
import type { InvitationConfig } from "@/lib/config-types";

export default function DesktopCover({
  couple,
  weddingDate,
}: {
  couple: InvitationConfig["couple"];
  weddingDate: string;
}) {
  const { groom, bride } = couple;
  const dateStr = new Date(weddingDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    // reveal-scope: dekorasi ber-[data-enter] di panel ini (bingkai, padang,
    // kluster) butuh pemicu entrance sendiri — tanpa ini mereka tertahan
    // transparan selamanya karena berada di luar section mana pun.
    <aside className="desktop-cover reveal-scope">
      <SceneBackground file="LatarPavilionGarden.webp" scrim={0.42} priority />
      {/* Bingkai dari potongan tepi (tidak diregangkan) → tak penyok di panel lebar */}
      <TopFrame maxWidth={760} zIndex={2} />
      {/* Dinding bunga rimbun sepanjang kedua tepi panel — mengisi pojok
          kiri/kanan atas yang kosong karena kanopi TopFrame hanya menggantung
          di tengah (maxWidth 760). Solusi sementara sampai aset kanopi desktop
          (WideCanopyGarland + CanopySideCascade, aset 34–35) di-generate. */}
      <EdgeGarden sides={["left", "right"]} width="clamp(140px, 12vw, 230px)" opacity={0.7} zIndex={1} />
      {/* Semak alami di kaki cover: beberapa rumpun MeadowBloomBand UTUH
          (tanpa crop) dijajarkan bertumpang tindih, selang-seling dicermin —
          siluet atasnya tetap bergelombang seperti semak sungguhan. Versi
          sebelumnya meng-crop band via objectFit cover → tepi atas jadi garis
          lurus seperti pita persegi (revisi owner: "biarkan natural semak"). */}
      {/* Alas strip padat di belakang rumpun: siluet bawah band bergelombang,
          jadi translateY saja selalu menyisakan celah kertas di titik daun
          yang berakhir lebih tinggi. Garis lurus crop strip ini tersembunyi
          di balik semak alami di depannya. */}
      <div aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "clamp(70px, 9vh, 110px)", overflow: "hidden", zIndex: 1, pointerEvents: "none" }}>
        <img
          src={asset("MeadowBloomBand.webp")}
          alt=""
          onError={hideBrokenImage}
          loading="lazy"
          decoding="async"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 62%" }}
        />
      </div>
      <div aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 0, zIndex: 1, pointerEvents: "none" }}>
        {([
          { left: "-5%", width: "34%", flip: false },
          { left: "20%", width: "31%", flip: true },
          { left: "44%", width: "34%", flip: false },
          { left: "70%", width: "35%", flip: true },
        ]).map((c) => (
          <img
            key={c.left}
            src={asset("MeadowBloomBand.webp")}
            alt=""
            onError={hideBrokenImage}
            loading="lazy"
            decoding="async"
            style={{
              position: "absolute",
              bottom: 0,
              left: c.left,
              width: c.width,
              height: "auto",
              // translateY: 3,2% menutup baris transparan di dasar kanvas band;
              // sisanya menenggelamkan rumpun ke bawah (revisi owner: semak
              // terlalu tinggi, hampir menyentuh panel tamu) — kelebihannya
              // terpotong overflow:hidden .desktop-cover.
              transform: `${c.flip ? "scaleX(-1) " : ""}translateY(12%)`,
            }}
          />
        ))}
      </div>
      {/* Sprig bergoyang DI DEPAN semak (z2 > z1) — gerak hidupnya dari sini,
          semak padatnya tetap diam. */}
      <Meadow sprigs={9} zIndex={2} />

      <div
        style={{
          position: "relative",
          zIndex: 4,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          textAlign: "center",
          // Jarak atas mengikuti kedalaman kanopi SEBENARNYA: lebar kanopi =
          // min(lebar panel, 760px maxWidth TopFrame), kanvas 3:2 dengan bunga
          // ±55% tinggi + juntaian → kedalaman ≈ 40% lebar kanopi. Cap 28vh
          // untuk laptop pendek; sisa tumpang-tindih ditangani sapuan kertas
          // di belakang blok judul (temuan owner: judul tenggelam di bunga).
          padding: "min(calc(min(100vw - clamp(420px, 33vw, 500px), 760px) * 0.4), 28vh) 9% 0",
        }}
      >
        {/* Blok judul + nama dibungkus sapuan kertas radial (pola Closing):
            di laptop pendek cap 28vh masih menaruh judul di ujung juntaian
            kanopi — glow huruf saja tidak cukup melawan bunga serapat itu. */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              // Dipertebal (0.9→0.97) dan pusatnya digeser ke 34% — judul
              // "Pavilion Romance" duduk di TEPI ATAS blok ini, tepat di ujung
              // juntaian kanopi; dengan pusat di tengah blok, bagian judul
              // kebagian ekor gradien yang paling lemah.
              // Radius vertikal 42% = jarak pusat (42%) ke tepi atas box, jadi
              // gradien mencapai nol TEPAT di tepi — tidak ada potongan kotak
              // pucat yang tercetak di kanopi.
              inset: "-56px -100px",
              background: "radial-gradient(54% 42% at 50% 42%, rgba(248,242,231,0.96), rgba(248,242,231,0.75) 55%, rgba(248,242,231,0) 100%)",
              pointerEvents: "none",
            }}
          />
          <FloralTitle as="p" glow size="clamp(24px, 2.4vw, 32px)" flowerSize="clamp(16px, 1.6vw, 22px)" style={{ marginBottom: 12, position: "relative" }}>
            Pavilion Romance
          </FloralTitle>

          <h1 className="font-display" style={{ position: "relative", fontSize: "clamp(52px, 5vw, 86px)", fontWeight: 400, lineHeight: 1.03, color: "var(--text)", letterSpacing: "-0.01em" }}>
            {groom.name}
            <span className="font-script" style={{ display: "block", fontSize: "0.6em", color: "var(--accent)", margin: "-6px 0" }}>
              &amp;
            </span>
            {bride.name}
          </h1>
        </div>

        <div className="leaf-divider" style={{ margin: "20px 0 16px" }} />

        {/* Blok tanggal + tamu duduk di atas padang bunga terpadat → panel kertas
            (glow teks saja tidak cukup melawan flora serapat itu). */}
        <div
          className="bloom-panel"
          style={{ width: "auto", padding: "14px 32px 16px", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
        >
          <p className="font-body" style={{ fontSize: 14, color: "var(--text-muted)", letterSpacing: "0.04em", marginBottom: 8 }}>
            {dateStr}
          </p>
          <p className="type-label" style={{ marginBottom: 2 }}>
            Kepada Yth.
          </p>
          <Suspense fallback={null}>
            <p className="font-script" style={{ fontSize: "clamp(26px, 2.6vw, 40px)", color: "var(--accent)", lineHeight: 1.1 }}>
              <GuestName />
            </p>
          </Suspense>
        </div>
      </div>
    </aside>
  );
}
