# Pavilion Romance — Jahitan Antar-Section (SectionSeam)

**Tanggal:** 2026-07-13
**Status:** Disetujui owner (opsi "Kabut CSS + bunga")

## Masalah

Batas antar-section di Pavilion Romance masih terlihat "putus": tiap section
memakai background painterly berbeda (`LatarParchmentVines`,
`LatarBotanicalBokeh`, dll.) yang hanya dilarutkan `edgeFade` dari dalam
section masing-masing. Tidak ada elemen yang menyambung melintasi garis batas,
dan semua dekor di dalam section terklip `overflow: hidden`.

## Solusi

Port pola `SectionSeam` dari soft-bloom, disesuaikan untuk Pavilion Romance.
Komponen baru dirender **di antara** section di `InvitationExperience.tsx`
(div tinggi-0 sibling section, di luar `overflow: hidden`), berisi dua lapis
yang menumpuk tepat di garis batas via `translateY(-50%)`:

1. **Awan transparan (CSS murni, tanpa asset baru).** Pita feather gradient
   warna kertas (`#F8F2E7` = `rgb(248,242,231)`, mengikuti `--bg` Pavilion —
   BUKAN `rgb(253,252,250)` milik soft-bloom) — pekat di garis batas, memudar
   ke dua arah — dilapis dua sapuan `radial-gradient` offset kiri/kanan supaya
   tepinya berombak seperti awan, bukan pita lurus.
2. **Band bunga menumpuk di batas.** `FloralDividerKisah.webp` selebar kolom
   penuh, memakai teknik crop yang sudah ada di `FloralDivider.tsx`
   (aspect `1536/297`, `marginTop -22.5%`). Variasi bergiliran per seam
   (mirror + durasi sway berbeda) supaya batas tidak seragam. Animasi ambient
   `swayFrame` (±1°; aman terhadap crop — margin lunak 2% > displacement
   rotasi) + entrance `data-enter="soft"`.

## Detail teknis

- Wrapper seam: `className="reveal-scope"`, `position: relative`, `height: 0`,
  `zIndex: 6`, `pointerEvents: none`. `.snap-section` ber-`z-index: 1`, jadi
  seam menumpuk di atas kedua section tetangga di sekitar garis batas.
- `RevealController` sudah mengamati semua `.reveal-scope` dengan
  `threshold: 0` — bekerja untuk elemen tinggi-0 tanpa perubahan.
- Pemasangan di `InvitationExperience.tsx`: loop `sectionIds.map` dibungkus
  `Fragment`, seam disisipkan di antara section (tidak setelah section
  terakhir), `index={i}` untuk rotasi varian.
- `edgeFade` pada `SceneBackground` dibiarkan — melengkapi seam dari dalam.
- Fallback aman: `hideBrokenImage` menyembunyikan band bunga jika gagal
  dimuat; pita awan CSS tetap melarutkan batas.

## File yang berubah

- `src/components/shared/SectionSeam.tsx` (baru)
- `src/components/shared/InvitationExperience.tsx` (sisipkan seam)

## Alternatif yang ditolak

- Mempertebal `edgeFade` per-section: batas tetap terasa karena tidak ada
  elemen yang menyambung melintasi garis.
- Generate asset garland/awan baru: paling mirip referensi, tapi butuh
  generate + upload R2 (ditolak owner — pakai asset yang sudah ada).
