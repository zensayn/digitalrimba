# Prada Melati — Hem Bervariasi per Section

**Tanggal:** 2026-07-12
**Tema:** `adat/kenangan/prada-melati`
**Status:** desain disetujui; menunggu review spec
**Bersandar pada:** `2026-07-10-prada-melati-design.md` (§4 Kelir, §6c aset hem, §13 risiko monoton)

**Tujuan:** Memecah keseragaman hem. Saat ini `KelirScene` me-render `TumpalBand`
yang identik di hem bawah **setiap** section — spec induk §13 sudah menandai ini
sebagai risiko ("Satu kain berisiko monoton"), dan render nyata
mengonfirmasinya. Hem dibuat **berganti motif per section**, berima dengan motif
aktor section tersebut, sehingga tiap section terbaca sebagai satu set koheren.

---

## 1. Prinsip — hem berima dengan aktor

Kelir tetap satu kain (spec induk §4.1). Yang berubah bukan kainnya, melainkan
**motif hem di tepi bawahnya**, dan motif itu dipilih agar **berima dengan aktor**
section — bukan acak. Section ber-aktor sulur mendapat hem sulur; ber-aktor
melati mendapat hem melati; ber-aktor kawung mendapat hem kawung; section hero
(gunungan, candi bentar, paduraksa, kayon) mempertahankan `TumpalBand` sebagai
hem paling megah.

Ini menjaga tesis "kain" spec induk — hem tetap statis, memeluk tepi bawah,
tidak bergerak — sambil menghapus kesan copy-paste.

## 2. Pemetaan

| Section | Aktor | Hem |
|---|---|---|
| `cover` | Gunungan (hero) | `TumpalBand` |
| `greeting` | CeplokSulur | `HemSulur` |
| `couple` | CeplokMelati | `HemMelati` |
| `lovestory` | CeplokKawung | `HemKawung` |
| `akad` | CandiBentar (hero) | `TumpalBand` |
| `resepsi` | Paduraksa (hero) | `TumpalBand` |
| `dresscode` | CeplokKawung | `HemKawung` |
| `gallery` | MelatiSprig | `HemMelati` |
| `rsvp` | CeplokSulur | `HemSulur` |
| `gift` | CeplokMelati | `HemMelati` |
| `closing` | Kayon (hero) | `TumpalBand` |

Urutan: tumpal · sulur · melati · kawung · **tumpal · tumpal** · kawung · melati
· sulur · melati · tumpal.

- `cover` dan `closing` sama-sama `TumpalBand` — bookend disengaja, sejajar
  bookend gunungan↔kayon spec induk §6f.
- **Satu-satunya kembar berdampingan: `akad` + `resepsi`**, keduanya gapura hero;
  `TumpalBand` cocok untuk keduanya dan tak terbaca sebagai kelalaian.

## 3. Mekanisme

Field opsional `hem?: string` ditambahkan ke `KelirPreset`
(`sceneKelir.ts`), mengikuti pola `actor`/`frame` yang sudah ada:

```ts
export interface KelirPreset {
  // ...field yang sudah ada...
  /** Basename hem band di tepi bawah, mis. "HemSulur". Kosong → "TumpalBand". */
  hem?: string;
}
```

Tujuh section konten menyetel `hem`; empat hero mengosongkannya dan jatuh ke
default `TumpalBand`.

Di `KelirScene.tsx`, satu baris berubah — sumber hem:

```tsx
// sebelum
src={asset("TumpalBand")}
// sesudah
src={asset(preset.hem ?? "TumpalBand")}
```

Posisi, dimensi, `z-index: 4`, `pointer-events: none`, dan `hideOnError` hem
**tidak berubah**. Hem tetap statis.

## 4. Aset baru — 3 hem band

Mengikuti `TumpalBand` persis: **1800×360, transparan, seamless kiri-kanan**,
style bible `SB_GOLD` (spec induk §3.1), klausul latar transparan §3.3. Motif
tumbuh dari tepi bawah; sepertiga atas kanvas kosong agar safe-zone teks tak
tersentuh. Budget masing-masing **< 60KB** (sama seperti `TumpalBand`).

R2 bucket `rimba-themes`, path `adat/kenangan/prada-melati/<file>.webp`, via
`https://assets-themes.rimba.io`. Dev lokal memakai `public/images/<file>.png`
(seperti aset lain). Total aset prada naik dari 16 → **19 berkas**.

**`HemSulur.webp`** — 1800×360, transparan

```text
Javanese keraton wedding ornament in the manner of prada cloth and wayang beber. Flat gold-leaf silhouette: burnished gold #C9A227, fine crackle, visible fabric grain. Uniform line weight, hard-edged contours, no tapering strokes, no gradient shading. Interiors filled with dense isen-isen — cecek dots and sawut hatching. Ceremonial, hieratic, still. No perspective, no cast shadows, no depth, no volumetric light. No people, no text, no lettering, no numbers, no logos. Subject: a horizontal band of sulur — scrolling foliage (lung-lungan) vines running left to right along the bottom edge, tendrils curling upward and interlocking, small buds and leaves along the vine, cecek dots in the gaps. The scroll repeats at a constant interval. Above the vine the canvas is empty. Gold leaf only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow. Wide composition, 1800x360, seamless on the left and right edges: the vine leaving the right edge must meet the vine entering the left without a visible seam.
```

**`HemMelati.webp`** — 1800×360, transparan. Emas, bukan gading — ini hem, bukan
roncean.

```text
Javanese keraton wedding ornament in the manner of prada cloth and wayang beber. Flat gold-leaf silhouette: burnished gold #C9A227, fine crackle, visible fabric grain. Uniform line weight, hard-edged contours, no tapering strokes, no gradient shading. Interiors filled with dense isen-isen — cecek dots and sawut hatching. Ceremonial, hieratic, still. No perspective, no cast shadows, no depth, no volumetric light. No people, no text, no lettering, no numbers, no logos. Subject: a horizontal garland band of melati (jasmine) — a row of identical jasmine blossoms strung along a fine thread running left to right at the bottom edge, small buds and paired leaves between the blossoms, cecek dots in the gaps. The blossoms are evenly spaced, the spacing constant. Above the garland the canvas is empty. Gold leaf only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow. Wide composition, 1800x360, seamless on the left and right edges.
```

**`HemKawung.webp`** — 1800×360, transparan

```text
Javanese keraton wedding ornament in the manner of prada cloth and wayang beber. Flat gold-leaf silhouette: burnished gold #C9A227, fine crackle, visible fabric grain. Uniform line weight, hard-edged contours, no tapering strokes, no gradient shading. Interiors filled with dense isen-isen — cecek dots and sawut hatching. Ceremonial, hieratic, still. No perspective, no cast shadows, no depth, no volumetric light. No people, no text, no lettering, no numbers, no logos. Subject: a horizontal row of kawung medallions — identical kawung roundels (four overlapping ellipses radiating from a center point) sitting along the bottom edge, their bases touching, each ringed by a thin border of cecek dots, sawut hatching filling the gaps between roundels. The medallions are evenly spaced, the spacing constant. Above the row the canvas is empty. Gold leaf only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow. Wide composition, 1800x360, seamless on the left and right edges.
```

Sebelum aset ada, `hideOnError` menyembunyikan hem section itu (tepi bawahnya
sementara polos) — degradasi aman, tak ada ikon broken.

## 5. Berkas tersentuh

| Berkas | Tindakan |
|---|---|
| `src/components/shared/sceneKelir.ts` | tambah `hem?` ke interface; set `hem` pada 7 preset konten |
| `src/components/shared/KelirScene.tsx` | `asset("TumpalBand")` → `asset(preset.hem ?? "TumpalBand")` |
| `scripts/__tests__/scene-kelir.test.mjs` | assert pemetaan hem tiap section |
| `docs/superpowers/specs/2026-07-10-prada-melati-design.md` | rujukan silang di §6c |

## 6. Bukan cakupan

- Kilau pada hem/pinggiran — implementasi Fase 1/2 pun belum memasangnya; gap
  terpisah, bukan tugas ini.
- Perubahan pinggiran kiri/kanan — tetap `PinggiranTile`.
- Generate & unggah 3 aset hem ke R2 (didokumentasikan di §4; eksekusi terpisah).
