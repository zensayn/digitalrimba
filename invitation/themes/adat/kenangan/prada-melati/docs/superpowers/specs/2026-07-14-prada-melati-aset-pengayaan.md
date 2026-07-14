# Prada Melati — Strategi Aset Pengayaan (Fase 2, Track A)

> Tanggal: 2026-07-14 · Branch kerja: `feat/prada-melati-impl`
> Lanjutan §6 pada `2026-07-10-prada-melati-design.md`. Nomor §-spec di sini
> merujuk dokumen ini; rujukan ke spec induk ditulis eksplisit ("spec induk §…").

## 0. Kenapa dokumen ini ada

Sebelas section berdiri, tapi ritmenya seragam: satu kolom teks di tengah, satu
aktor emas di belakang, pinggiran-hem mengapit. Benar secara tata bahasa, tapi
datar — tiap layar terasa saudara kembar layar sebelumnya. Soft-bloom tidak
datar karena ia **melapis dekor bervariasi** di tiap section: judul berhias,
pembatas bergambar, ornamen sudut yang bergoyang, jahitan bunga antar-section,
serangga yang sesekali melintas. Track A Fase 2 memindahkan mekanisme itu ke
kosakata Kelir — bukan bunga liar, melainkan **ragam hias keraton Jawa**.

Aturan medium **tidak berubah** dari spec induk §3. Setiap prompt tetap memakai
salah satu dari dua bible utuh dan salah satu klausul latar transparan. Yang
bertambah hanyalah **perbendaharaan motif** dan **peran komponennya**.

- `SB_GOLD` (spec induk §3.1) — semua aset emas. Emas #C9A227, retak daun emas,
  serat kain, garis rata tanpa meruncing, isen-isen padat (cecek & sawut), hierat.
- `SB_IVORY` (spec induk §3.2) — melati/roncean. Gading #F3E9D2, **no gold**.
- Klausul latar (spec induk §3.3) menutup **setiap** prompt; tak ada yang menyebut
  sogan kecuali `KainBadan` (opaque, bukan bagian dokumen ini).

Perajin, bukan pelukis (spec induk §3.4): tak ada arah cahaya, tak ada kedalaman.
Yang disebut adalah **nama motif** (truntum, semen, modang, praba, padma, sawat),
**sumbu simetri**, dan **kerapatan isen**.

> **Catatan siluet vs garis.** Bila sebuah Subject menyebut sulur "menyempit ke
> ujung" (fine point/tip), itu **bentuk siluet** yang menyempit — bukan
> pelanggaran `no tapering strokes`. Berat garis kontur tetap rata; yang mengecil
> adalah lebar bentuknya, seperti ujung daun. Hindari kata `taper` di Subject agar
> tak rancu dengan aturan bible.

## 1. Kit — aset baru (13) + yang sudah ada (reuse)

Semua transparan (PNG alpha → webp), kecuali disebut lain.

| Berkas | Dim | Material | Komponen konsumen | Budget webp |
|---|---|---|---|---|
| `PembatasLung.webp` | 1200×200 | gold | GiltDivider | < 40KB |
| `PembatasTruntum.webp` | 1200×200 | gold | GiltDivider (varian) | < 40KB |
| `PembatasModang.webp` | 1200×200 | gold | GiltDivider (varian) | < 40KB |
| `LungTitel.webp` | 600×180 | gold | GiltTitle (pengapit) | < 30KB |
| `PojokSulur.webp` | 800×800 | gold | PojokKelir | < 60KB |
| `PojokPraba.webp` | 800×800 | gold | PojokKelir (varian) | < 60KB |
| `BingkaiPraba.webp` | 900×1200 | gold | GebyokCard (potret) | < 90KB |
| `KaranganMelati.webp` | 1600×360 | ivory | TumpalSeam | < 90KB |
| `PitaSemen.webp` | 1600×300 | gold | TumpalSeam (varian) | < 80KB |
| `KupuEmas.webp` | 500×500 | gold | KupuAmbient | < 30KB |
| `CeplokTruntum.webp` | 900×900 | gold | anti-repetisi aktor · pusat divider | < 70KB |
| `CeplokPadma.webp` | 900×900 | gold | anti-repetisi aktor | < 70KB |
| `RonceanSudut.webp` | 600×600 | ivory | GebyokCard (sudut) | < 50KB |

**Reuse (tak digen ulang):** `SerpihEmas` (motes — **perlu konversi ke webp**),
`RonceanMelatiL/R` (foreground), `BingkaiGebyok`/`BingkaiTumpal` (kartu),
`MelatiSprig`, sebelas aktor/ceplok/hem yang sudah ada.

## 2. Anti-repetisi — varian dirotasi

Kekuatan soft-bloom: `SectionSeam` dan `SectionDecor` **mengganti komposisi tiap
giliran** sehingga batas antar-section tak seragam. Dokumen ini menyediakan bahan
rotasi itu:

- **GiltDivider** memilih di antara `PembatasLung` → `PembatasTruntum` →
  `PembatasModang` berdasarkan `index % 3` section (atau makna: truntum untuk
  couple/lovestory, modang untuk akad/resepsi yang lebih hierat).
- **PojokKelir** berganti `PojokSulur`/`PojokPraba` per section, dicermin ke empat
  sudut lewat CSS `scaleX/scaleY` (bukan aset terpisah).
- **TumpalSeam** berganti `KaranganMelati` (gading) ↔ `PitaSemen` (emas) per
  jahitan, seperti tiga varian `SectionSeam`.

Pengulangan **satu** motif di banyak tempat adalah cacat yang justru kita hindari
(bandingkan spec induk §6b). Truntum dan padma juga menambah ragam **ceplok**
supaya tak setiap section jatuh ke tiga ceplok lama.

---

## 3. Prompt — Pembatas (GiltDivider)

**`PembatasLung.webp`** — 1200×200, transparan. Sulur berpasangan dari pusat.

```text
Javanese keraton wedding ornament in the manner of prada cloth and wayang beber. Flat gold-leaf silhouette: burnished gold #C9A227, fine crackle, visible fabric grain. Uniform line weight, hard-edged contours, no tapering strokes, no gradient shading. Interiors filled with dense isen-isen — cecek dots and sawut hatching. Ceremonial, hieratic, still. No perspective, no cast shadows, no depth, no volumetric light. No people, no text, no lettering, no numbers, no logos. Subject: a horizontal divider ornament — a small central rosette from which two lung-lungan sulur tendrils of scrolling foliage extend outward to left and right, each curling into an ukel spiral and narrowing to a fine point near the edge, a trail of cecek dots following each arm. Strict bilateral symmetry about the vertical axis. The upper and lower margins are empty. Gold leaf only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow. Horizontal composition, 1200x200.
```

**`PembatasTruntum.webp`** — 1200×200, transparan. Truntum = cinta yang tumbuh
kembali; motif penganten Surakarta. Varian untuk section bermuatan cinta.

```text
Javanese keraton wedding ornament in the manner of prada cloth and wayang beber. Flat gold-leaf silhouette: burnished gold #C9A227, fine crackle, visible fabric grain. Uniform line weight, hard-edged contours, no tapering strokes, no gradient shading. Interiors filled with dense isen-isen — cecek dots and sawut hatching. Ceremonial, hieratic, still. No perspective, no cast shadows, no depth, no volumetric light. No people, no text, no lettering, no numbers, no logos. Subject: a horizontal row of truntum — small eight-petalled star-flowers strung evenly along a single line, each blossom ringed by a halo of cecek dots, the flower at the center largest and the rest diminishing toward the two ends, tiny buds filling the gaps between them. Strict bilateral symmetry about the vertical axis. Gold leaf only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow. Horizontal composition, 1200x200.
```

**`PembatasModang.webp`** — 1200×200, transparan. Modang lidah-api, tepi kain
keraton; varian paling hierat untuk akad/resepsi.

```text
Javanese keraton wedding ornament in the manner of prada cloth and wayang beber. Flat gold-leaf silhouette: burnished gold #C9A227, fine crackle, visible fabric grain. Uniform line weight, hard-edged contours, no tapering strokes, no gradient shading. Interiors filled with dense isen-isen — cecek dots and sawut hatching. Ceremonial, hieratic, still. No perspective, no cast shadows, no depth, no volumetric light. No people, no text, no lettering, no numbers, no logos. Subject: a horizontal modang band — a row of lidah-api flame tongues, pointed and interlocking, alternating one pointing up then one pointing down along the strip, each tongue filled with sawut hatching and rimmed with cecek dots. Strict bilateral symmetry about the vertical axis. Gold leaf only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow. Horizontal composition, 1200x200.
```

## 4. Prompt — Judul (GiltTitle)

**`LungTitel.webp`** — 600×180, transparan. Dipasang di kiri judul; sisi kanan
adalah komponen ini di-`scaleX(-1)`.

```text
Javanese keraton wedding ornament in the manner of prada cloth and wayang beber. Flat gold-leaf silhouette: burnished gold #C9A227, fine crackle, visible fabric grain. Uniform line weight, hard-edged contours, no tapering strokes, no gradient shading. Interiors filled with dense isen-isen — cecek dots and sawut hatching. Ceremonial, hieratic, still. No perspective, no cast shadows, no depth, no volumetric light. No people, no text, no lettering, no numbers, no logos. Subject: a slender horizontal lung-lungan tendril entering from the left edge and curling gently toward the right, ending in one small jasmine blossom near the center-right, with a single ukel spiral along its length; the tendril rests on the vertical midline and the right portion of the canvas is empty. Gold leaf only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow. Horizontal composition, 600x180.
```

## 5. Prompt — Pojok (PojokKelir)

**`PojokSulur.webp`** — 800×800, transparan. Komposisi sudut kiri-atas; komponen
mencerminkannya ke empat sudut.

```text
Javanese keraton wedding ornament in the manner of prada cloth and wayang beber. Flat gold-leaf silhouette: burnished gold #C9A227, fine crackle, visible fabric grain. Uniform line weight, hard-edged contours, no tapering strokes, no gradient shading. Interiors filled with dense isen-isen — cecek dots and sawut hatching. Ceremonial, hieratic, still. No perspective, no cast shadows, no depth, no volumetric light. No people, no text, no lettering, no numbers, no logos. Subject: a right-angle corner flourish of lung-lungan sulur foliage hugging the top edge and the left edge, densest in the very top-left corner and unfurling in ukel spirals as it thins toward the center, ending in a single melati blossom; the bottom-right two-thirds of the canvas is empty. Gold leaf only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow. Square composition, 800x800.
```

**`PojokPraba.webp`** — 800×800, transparan. Praba = sinar aureole di belakang
tokoh wayang; varian sudut yang lebih "memancar".

```text
Javanese keraton wedding ornament in the manner of prada cloth and wayang beber. Flat gold-leaf silhouette: burnished gold #C9A227, fine crackle, visible fabric grain. Uniform line weight, hard-edged contours, no tapering strokes, no gradient shading. Interiors filled with dense isen-isen — cecek dots and sawut hatching. Ceremonial, hieratic, still. No perspective, no cast shadows, no depth, no volumetric light. No people, no text, no lettering, no numbers, no logos. Subject: a quarter-fan of praba radiance spreading from the top-left corner — a nested arc of flame-tongue rays fanning out in a ninety-degree sweep, each ray tipped with a small ukel spiral and rimmed with cecek dots, tightest at the corner and widening outward; the bottom-right of the canvas is empty. Gold leaf only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow. Square composition, 800x800.
```

## 6. Prompt — Bingkai kartu (GebyokCard)

**`BingkaiPraba.webp`** — 900×1200, transparan. Bingkai potret bermahkota praba;
untuk foto mempelai (lebih megah dari `BingkaiGebyok`). Bukaan **kosong**.

```text
Javanese keraton wedding ornament in the manner of prada cloth and wayang beber. Flat gold-leaf silhouette: burnished gold #C9A227, fine crackle, visible fabric grain. Uniform line weight, hard-edged contours, no tapering strokes, no gradient shading. Interiors filled with dense isen-isen — cecek dots and sawut hatching. Ceremonial, hieratic, still. No perspective, no cast shadows, no depth, no volumetric light. No people, no text, no lettering, no numbers, no logos. Subject: an upright oval portrait frame crowned across its top half with a praba aureole of flame-tongue rays, its lower half a plain beaded ogee arch of cecek dots; the oval opening in the middle is completely empty. Strict bilateral symmetry about the vertical axis. Only the frame is drawn; the opening and everything outside the frame are fully transparent. Gold leaf only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow, no photograph. Vertical composition, 900x1200, the opening fully transparent.
```

## 7. Prompt — Jahitan & Karangan (TumpalSeam)

**`KaranganMelati.webp`** — 1600×360, transparan, **gading**. Karangan melati
melintas batas dua section.

```text
Javanese wedding jasmine ornament. Flat graphic silhouette in ivory white #F3E9D2, subtle fabric grain, uniform line weight, hard-edged contours, no gradient shading. No gold. Ceremonial, hieratic, still. No perspective, no cast shadows, no depth, no volumetric light. No people, no text, no lettering, no numbers, no logos. Subject: a horizontal jasmine garland (roncean melati) draped across the full width, hanging from the top edge in a shallow catenary curve, blossoms strung on a fine thread, densest at the center and thinning toward both ends, a few loose buds falling below the line. Strict bilateral symmetry about the vertical axis. Ivory only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow. Wide composition, 1600x360.
```

**`PitaSemen.webp`** — 1600×300, transparan, **emas**. Varian jahitan emas; semen
= lung-lungan bersambung dengan meru dan sawat.

```text
Javanese keraton wedding ornament in the manner of prada cloth and wayang beber. Flat gold-leaf silhouette: burnished gold #C9A227, fine crackle, visible fabric grain. Uniform line weight, hard-edged contours, no tapering strokes, no gradient shading. Interiors filled with dense isen-isen — cecek dots and sawut hatching. Ceremonial, hieratic, still. No perspective, no cast shadows, no depth, no volumetric light. No people, no text, no lettering, no numbers, no logos. Subject: a horizontal running band of semen ornament spanning the full width — a continuous lung-lungan vine along a central axis, punctuated at even intervals by small meru mountain peaks rising above it and paired sawat wing motifs flanking each peak, cecek dots filling the field. Strict bilateral symmetry about the vertical axis. Gold leaf only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow. Wide composition, 1600x300.
```

## 8. Prompt — Ambient

**`KupuEmas.webp`** — 500×500, transparan. Kupu emas yang sesekali melintas
(padanan Butterflies soft-bloom). Dipakai tunggal, bergerak lambat.

```text
Javanese keraton wedding ornament in the manner of prada cloth and wayang beber. Flat gold-leaf silhouette: burnished gold #C9A227, fine crackle, visible fabric grain. Uniform line weight, hard-edged contours, no tapering strokes, no gradient shading. Interiors filled with dense isen-isen — cecek dots and sawut hatching. Ceremonial, hieratic, still. No perspective, no cast shadows, no depth, no volumetric light. No people, no text, no lettering, no numbers, no logos. Subject: a single kupu butterfly seen from directly above with wings fully outspread, the upper wings broad and the lower wings tailed, both filled with cecek dots and sawut hatching and rimmed with a fine beaded border. Strict bilateral symmetry about the vertical axis. Gold leaf only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow. Square composition, 500x500.
```

> `SerpihEmas` (serpih daun emas untuk GiltMotes) **sudah ada** sebagai PNG —
> tinggal konversi ke webp lewat skill `convert-to-webp`. Tak perlu prompt baru.

## 9. Prompt — Ceplok tambahan (anti-repetisi aktor)

**`CeplokTruntum.webp`** — 900×900, transparan. Motif penganten par excellence.

```text
Javanese keraton wedding ornament in the manner of prada cloth and wayang beber. Flat gold-leaf silhouette: burnished gold #C9A227, fine crackle, visible fabric grain. Uniform line weight, hard-edged contours, no tapering strokes, no gradient shading. Interiors filled with dense isen-isen — cecek dots and sawut hatching. Ceremonial, hieratic, still. No perspective, no cast shadows, no depth, no volumetric light. No people, no text, no lettering, no numbers, no logos. Subject: a single ceplok medallion of truntum — a central eight-petalled star-flower encircled by eight smaller truntum blossoms scattered evenly in the field, the whole ringed by a thin circular border of cecek dots. Eightfold rotational symmetry. Compact and centered, occupying the middle sixty percent of the canvas. Gold leaf only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow. Square composition, 900x900.
```

**`CeplokPadma.webp`** — 900×900, transparan. Padma (teratai) — kesucian.

```text
Javanese keraton wedding ornament in the manner of prada cloth and wayang beber. Flat gold-leaf silhouette: burnished gold #C9A227, fine crackle, visible fabric grain. Uniform line weight, hard-edged contours, no tapering strokes, no gradient shading. Interiors filled with dense isen-isen — cecek dots and sawut hatching. Ceremonial, hieratic, still. No perspective, no cast shadows, no depth, no volumetric light. No people, no text, no lettering, no numbers, no logos. Subject: a single ceplok medallion of padma — a lotus seen from directly above, eight pointed petals radiating from a round seed-pod center with a second inner ring of shorter petals between them, the whole ringed by a thin circular border of cecek dots. Eightfold rotational symmetry. Compact and centered, occupying the middle sixty percent of the canvas. Gold leaf only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow. Square composition, 900x900.
```

## 10. Prompt — Sudut kartu (GebyokCard)

**`RonceanSudut.webp`** — 600×600, transparan, **gading**. Untaian pendek
menjuntai di sudut kartu (padanan CardVines soft-bloom); pakai bila `MelatiSprig`
kurang terasa "menggantung".

```text
Javanese wedding jasmine ornament. Flat graphic silhouette in ivory white #F3E9D2, subtle fabric grain, uniform line weight, hard-edged contours, no gradient shading. No gold. Ceremonial, hieratic, still. No perspective, no cast shadows, no depth, no volumetric light. No people, no text, no lettering, no numbers, no logos. Subject: a short jasmine strand hanging straight down from the top-left corner, three or four melati blossoms and a small bud strung on a fine thread; the rest of the canvas is empty. Ivory only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow. Square composition, 600x600.
```

---

## 11. Pemetaan komponen → aset

| Komponen (Track A) | Aset | Catatan |
|---|---|---|
| **RevealController** | — | murni CSS `[data-enter]` + IntersectionObserver |
| **GiltTitle** | `LungTitel` (×2 cermin) | opsional pusat `CeplokTruntum` mini |
| **GiltDivider** | `PembatasLung` · `PembatasTruntum` · `PembatasModang` | rotasi per section |
| **PojokKelir** | `PojokSulur` · `PojokPraba` | dicermin ke 4 sudut via CSS |
| **GebyokCard** | `BingkaiGebyok`/`BingkaiPraba`/`BingkaiTumpal` + `RonceanSudut` | frame reuse + sudut baru |
| **TumpalSeam** | `KaranganMelati` (gading) · `PitaSemen` (emas) | rotasi per jahitan |
| **KupuAmbient** | `KupuEmas` | tunggal, lintasan lambat |
| **GiltMotes** | `SerpihEmas` (reuse, → webp) | — |
| **RonceanForeground** | `RonceanMelatiL/R` (reuse) | — |
| anti-repetisi ceplok | `CeplokTruntum` · `CeplokPadma` | menambah ragam aktor §6f |

## 12. Dimensi, budget, fallback

- Semua aset transparan → webp alpha, quality ~82; budget per baris di §1.
- Aset yang belum digen **wajib** disembunyikan `hideOnError` (pola spec induk
  §6) supaya skeleton komponen tetap berdiri sebelum aset lengkap.
- **Reduced-motion** (spec induk §5.5): kilau pada divider/title/pojok membeku di
  45%; sway pojok & kupu berhenti; reveal langsung tampil penuh (tanpa animasi).
  Seluruh konten tetap terlihat.
- Kilau menyentuh aset **emas** (divider, title, pojok, pita, kupu) lewat mekanisme
  `GiltSweep` yang sama; aset **gading** (`KaranganMelati`, `RonceanSudut`) **tidak**
  kena kilau — konsisten spec induk §5.1 (roncean tak berkilau).
- Prompt sengaja **tanpa** klausul `seamless`: semua ornamen berdiri sendiri,
  bukan tile. (Kontras dengan `PinggiranTile`/`TumpalBand` di spec induk.)

## 13. Bukan cakupan dokumen ini

- Implementasi komponen (RevealController dst.) — spec/plan tersendiri per komponen.
- Produksionisasi (unggah R2, kilau mode-tile, pendaftaran tema, deploy) — Track B.
- `KainBadan` & aset §6 spec induk — sudah digen, di luar dokumen ini.
