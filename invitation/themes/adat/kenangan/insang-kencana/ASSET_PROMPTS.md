# Insang Kencana — Prompt Generate Aset Gambar

Panduan generate elemen dekoratif untuk template **insang-kencana** (kategori adat ·
tier kenangan). Generate di ChatGPT, lalu konversi ke `.webp` dan upload ke R2.

Layout, margin, ritme, dan semua komponen struktural **disalin apa adanya dari
Soft Bloom** — yang berubah total isinya: dari ilustrasi bunga liar pastel →
jadi motif **Corak Insang** (ukiran khas Pontianak) dalam emas di atas hijau tua.

> **Konsep: "Kencana di Balik Insang".** Hangat, megah, bermakna — bukan
> sekadar tempel motif "kelihatan Melayu", tapi spesifik "kelihatan
> Pontianak". Lihat `DESIGN_SPEC.md` untuk detail palet & filosofi.
>
> **Boleh penuh — dan animasinya GRATIS.** Beda dari draf pertama dokumen ini
> (yang sengaja dibatasi ke pinggir), owner mengonfirmasi ornamen boleh
> sebanyak versi Soft Bloom aslinya (revisi 2026-08-06). Karena tema ini
> disalin dari Soft Bloom dan komponennya **belum disentuh sama sekali**,
> semua animasi bawaan (goyang tertiup angin, jatuh, terbang, mengambang)
> sudah aktif di kode — begitu file gambar di bawah ini ada, animasinya
> otomatis jalan tanpa kerja kode tambahan. Yang tetap dijaga: ornamen
> jangan menimpa AREA TEKS UTAMA (supaya kontras tidak rusak seperti kasus
> RSVP kemarin) — tapi di pinggir/sudut/latar, sebanyak-banyaknya boleh.

---

## Apa itu Corak Insang (WAJIB dipahami sebelum generate)

Corak Insang **bukan** motif Melayu generik — itu motif ikonik khas
**Pontianak**, namanya dari pola yang menyerupai sisik/insang ikan. Secara
visual: **kisi-kisi berulang berbentuk belah ketupat (diamond) yang saling
berpotongan diagonal**, membentuk jaring geometris — bukan motif bunga,
bukan lengkung organik. Presisi dan simetris, seperti anyaman/tenunan, bukan
sapuan kuas bebas.

**Sengaja diterjemahkan dari versi tradisionalnya** (biasanya batik
multi-warna cerah — merah, kuning, hijau, ungu) **ke garis emas tunggal di
atas hijau tua** supaya terasa seperti sulaman benang emas di songket istana
— mewah & senyap, bukan ramai turis.

**Kosakata ornamen tema ini** (semua turunan dari dua akar ini, supaya
konsisten meski jumlahnya banyak):
1. **Kisi Insang** — unit belah ketupat berpotongan, dipipihkan jadi garis
   (divider), dirangkai jadi cincin (ring foto/wreath), atau dikelompokkan
   di sudut.
2. **Sulur ukiran istana** — garis lengkung tunggal ala pahatan kayu Melayu
   (scrollwork), dipakai sebagai pendamping kisi insang di sudut & aksen
   kecil, TIDAK PERNAH jadi elemen utama sendirian.

Elemen fauna (burung) memakai gaya **ukiran burung Melayu** (siluet
distilasi, seperti motif burung di songket/pahatan — bukan burung realistis
ala Soft Bloom).

**HINDARI:** motif bunga sebagai elemen utama, gaya batik cerah multi-warna,
kaligrafi Arab/Jawi sungguhan (jangan generate tulisan asli — kalau perlu
elemen "kaligrafis", itu cuma kesan visual di ujung huruf logo, bukan tulisan
beraksara nyata), gaya kartun/turis, burung realistis/foto.

---

## Aturan Umum (berlaku untuk semua aset ornamen)

**Format & teknis:**
- **Background 100% transparan** (alpha) — tidak ada warna kanvas.
- Tidak ada teks, watermark, tidak ada tulisan Arab/Jawi sungguhan.
- Resolusi tinggi, tepi bersih, elemen ter-isolasi.
- Setelah generate (ChatGPT keluar PNG): **konversi ke WebP** (lihat "Konversi & Upload").

**Palet (kunci ke `invitation.config.json`):**
- Dasar gelap: **hijau tua** `#16261B`–`#1E3327` (bukan hitam pekat, bukan hijau terang).
- Aksen utama: **emas kebesaran** `#C9A227`, dengan highlight lebih pucat `#E4C874`.
- Opsional aksen kedua (jangan dominan): **maroon** `#6B2A2A` — pakai sangat tipis,
  mis. titik kecil di tengah tiap belah ketupat, bukan warna utama garis.
- **Semua ornamen: garis emas di atas transparan** — dasarnya nanti panel/card
  hijau tua dari CSS, bukan digambar sebagai bagian dari aset.

**Gaya (tempel di awal tiap prompt):**

> `STYLE: Traditional Pontianak "Corak Insang" motif — a precise geometric
> lattice of interlocking diamond/rhombus shapes (resembling fish-scale or
> fish-gill netting), NOT floral, NOT a loose brush pattern. Rendered as fine
> line-work in muted antique gold (desaturated, like aged gold thread
> embroidery on royal Malay songket cloth or istana wood carving — NOT bright
> neon gold, NOT a cartoonish tourist batik print). Symmetrical, disciplined,
> quiet luxury. Isolated on a fully transparent background (alpha) — no
> backdrop, no canvas color, no frame, no text, no real Arabic/Jawi script.
> High resolution, crisp clean line edges.`

---

## Daftar Aset

Legenda: ★ wajib, ○ boleh nyusul. Nama file **tidak perlu diganti** di kode
nanti — komponennya sama persis dengan Soft Bloom, cuma isi gambarnya beda.
Kolom **Animasi** = apa yang SUDAH jalan otomatis begitu file-nya ada
(tidak perlu sentuh kode).

| # | File | Dipakai di (komponen) | Animasi (sudah otomatis) | Peran |
|---|------|-----------|------|-------|
| 1 | `SudutBunga.webp` | `SectionDecor`, sudut Gallery | Goyang tertiup angin | ★ |
| 2 | `SudutBunga2.webp` | Varian sudut selang-seling | Goyang tertiup angin | ★ |
| 3 | `SudutBawah.webp` | `BottomClusters` (klaster sudut bawah) | Goyang tertiup angin | ★ |
| 4 | `RantingSamping.webp` | `SideVines`, `CardVines` | Goyang tertiup angin | ★ |
| 5 | `BingkaiAtas.webp` | `TopFrame` | Goyang halus | ★ |
| 6 | `BingkaiPenuh.webp` | `FullFrame` | Napas (breathe) | ○ |
| 7 | `PembatasBunga.webp` | `FloralDivider`, `SectionSeam` | Goyang halus | ★ |
| 8 | `GarlandBunga.webp` | `SectionSeam` (jahitan lebih kaya) | Goyang halus | ★ |
| 9 | `BingkaiFoto.webp` | Ring foto pasangan (`CoupleSection`) | Statis | ★ |
| 10 | `WreathInisial.webp` | Ring monogram (`CoverSection`, `DesktopCover`) | Napas (breathe) | ★ |
| 11 | `KartuBunga.webp` | Panel "Salam Hangat" (`BotanicalCard`) | Statis | ★ |
| 12 | `TangkaiKuncup.webp` | Aksen judul (`FloralTitle`), ikon Event, `Meadow` | Statis / goyang | ★ |
| 13 | `Sprig1.webp` | Variasi `Meadow` | Goyang | ○ |
| 14 | `MeadowStrip.webp` | Pita tepi bawah hero (`Meadow`) | Statis | ★ |
| 15 | `BungaJatuh1/2/3.webp` (3 file) | Kepingan emas jatuh (`FallingFlowers`) | Jatuh melayang | ★ |
| 16 | `Burung.webp` | Burung hinggap (`Bird`) | Mengangguk pelan | ○ |
| 17 | `Kupu.webp` | Burung terbang lintas layar (`Butterflies`) | Terbang + kepak sayap | ○ |
| 18 | `AmplopFlapLeft.webp` | Amplop pembuka (`EnvelopeOverlay`) | Buka amplop 3D | ★ |
| 19 | `StempelAmplop.webp` | Segel amplop (`EnvelopeOverlay`) | Statis | ★ |
| 20 | `LatarKertas.webp` | Tekstur dasar (`PaperBackdrop`) | Statis, di-tile | ○ |
| 21 | `LatarPadang.webp` | Latar `CoverSection`, `ClosingSection`, `DesktopCover` | Statis, di-scroll | ★ |
| 22 | `LatarDaun.webp` | Latar `CoupleSection`, `GiftSection` | Statis, di-scroll | ★ |
| 23 | `LatarLangit.webp` | Latar `EventSection` (Akad) | Statis, di-scroll | ★ |
| 24 | `LatarBokeh.webp` | Latar `GallerySection` | Statis, di-scroll | ★ |

---

### 1. ★ `SudutBunga.webp` — Aksen sudut

**Rasio:** 1:1 (1024×1024). Mengisi SATU sudut (kiri-atas sebagai acuan), sisanya transparan.

```
STYLE: Traditional Pontianak "Corak Insang" motif — a precise geometric
lattice of interlocking diamond/rhombus shapes (resembling fish-scale or
fish-gill netting), NOT floral, NOT a loose brush pattern. Rendered as fine
line-work in muted antique gold (desaturated, like aged gold thread
embroidery on royal Malay songket cloth or istana wood carving — NOT bright
neon gold, NOT a cartoonish tourist batik print). Symmetrical, disciplined,
quiet luxury. Isolated on a fully transparent background (alpha) — no
backdrop, no canvas color, no frame, no text, no real Arabic/Jawi script.
High resolution, crisp clean line edges.

A fragment of the Corak Insang diamond-lattice pattern filling ONE corner
(bottom-left), 3–4 rows of interlocking gold rhombus shapes tapering to a
single point as it recedes from the corner. From the same corner, ONE small
sulur (Malay carved vine/tendril motif, like istana wood-carving scrollwork —
NOT a floral bouquet) trails outward as a secondary accent, thinner and
lighter than the lattice. The rest of the canvas is empty and transparent.
Precise, restrained, jewelry-like. Fully transparent background.
```

---

### 2. ★ `SudutBunga2.webp` — Aksen sudut varian

**Rasio:** 1:1. Komposisi sedikit beda dari #1 — lebih ramping/memanjang.

```
STYLE: Traditional Pontianak "Corak Insang" motif — a precise geometric
lattice of interlocking diamond/rhombus shapes (resembling fish-scale or
fish-gill netting), NOT floral, NOT a loose brush pattern. Rendered as fine
line-work in muted antique gold (desaturated, like aged gold thread
embroidery on royal Malay songket cloth or istana wood carving — NOT bright
neon gold, NOT a cartoonish tourist batik print). Symmetrical, disciplined,
quiet luxury. Isolated on a fully transparent background (alpha) — no
backdrop, no canvas color, no frame, no text, no real Arabic/Jawi script.
High resolution, crisp clean line edges.

A different fragment of the Corak Insang diamond-lattice pattern filling ONE
corner (bottom-left) — a narrower diagonal strip of interlocking gold rhombus
shapes, 2 rows instead of 3–4, extending further along one edge than the
other (asymmetric, not a mirror of a typical corner spray). No sulur accent
this time — lattice only, quieter than #1. The rest of the canvas empty and
transparent. Fully transparent background.
```

---

### 3. ★ `SudutBawah.webp` — Klaster akar sudut bawah

**Pakai di:** `BottomClusters` — klaster yang lebih besar & padat, berakar di
tepi bawah kiri/kanan layar (dulu SudutBawah).
**Rasio:** 1:1 atau potret 4:5. Berat di bawah, dua-pertiga atas kosong.

```
STYLE: Traditional Pontianak "Corak Insang" motif — a precise geometric
lattice of interlocking diamond/rhombus shapes (resembling fish-scale or
fish-gill netting), NOT floral, NOT a loose brush pattern. Rendered as fine
line-work in muted antique gold (desaturated, like aged gold thread
embroidery on royal Malay songket cloth or istana wood carving — NOT bright
neon gold, NOT a cartoonish tourist batik print). Symmetrical, disciplined,
quiet luxury. Isolated on a fully transparent background (alpha) — no
backdrop, no canvas color, no frame, no text, no real Arabic/Jawi script.
High resolution, crisp clean line edges.

A denser cluster of the Corak Insang diamond-lattice pattern growing UPWARD
from the BOTTOM edge, as if rooted at the base — 4–5 rows of interlocking
gold rhombuses at the bottom tapering to a single fine line rising toward the
top, with one small sulur tendril curling off to the side. The TOP two-thirds
of the canvas is empty and transparent. Grander and denser than a small
corner accent — this is a statement piece for the bottom of a hero section.
Fully transparent background.
```

---

### 4. ★ `RantingSamping.webp` — Trim tepi vertikal

**Pakai di:** `SideVines` (tepi kiri/kanan section) & `CardVines` (juntaian
sudut kartu). **Rasio:** potret tinggi (512×1536).

```
STYLE: Traditional Pontianak "Corak Insang" motif — a precise geometric
lattice of interlocking diamond/rhombus shapes (resembling fish-scale or
fish-gill netting), NOT floral, NOT a loose brush pattern. Rendered as fine
line-work in muted antique gold (desaturated, like aged gold thread
embroidery on royal Malay songket cloth or istana wood carving — NOT bright
neon gold, NOT a cartoonish tourist batik print). Symmetrical, disciplined,
quiet luxury. Isolated on a fully transparent background (alpha) — no
backdrop, no canvas color, no frame, no text, no real Arabic/Jawi script.
High resolution, crisp clean line edges.

A single vertical COLUMN of the Corak Insang diamond lattice — one column of
small interlocking gold rhombus outlines strung top to bottom like a beaded
trim, hanging from the top edge and tapering to a fine point near the bottom.
Slim, restrained — a thread of pattern along one edge, not a dense vine. Fully
transparent background.
```

---

### 5. ★ `BingkaiAtas.webp` — Bingkai atas section

**Pakai di:** `TopFrame` — lebar mengikuti `--frame-max`. **Komposisi wajib**
(dipakai rumus zona aman `--frame-crown` di kode): padat di DUA sudut atas,
menipis ke tengah, CENTER dan seluruh BAWAH kosong transparan.
**Rasio:** 1024×1024 atau 1280×1024.

```
STYLE: Traditional Pontianak "Corak Insang" motif — a precise geometric
lattice of interlocking diamond/rhombus shapes (resembling fish-scale or
fish-gill netting), NOT floral, NOT a loose brush pattern. Rendered as fine
line-work in muted antique gold (desaturated, like aged gold thread
embroidery on royal Malay songket cloth or istana wood carving — NOT bright
neon gold, NOT a cartoonish tourist batik print). Symmetrical, disciplined,
quiet luxury. Isolated on a fully transparent background (alpha) — no
backdrop, no canvas color, no frame, no text, no real Arabic/Jawi script.
High resolution, crisp clean line edges.

A horizontal band of the Corak Insang diamond-lattice pattern framing the TOP
of a frame — dense interlocking gold rhombus lattice at the two top corners,
thinning to a single fine gold line across the top-center (like the lattice
resolving into a simple horizontal thread as it reaches the middle). The
CENTER and the entire BOTTOM two-thirds are empty and transparent. Reads like
a woven gold trim along the top edge of a ceremonial cloth. Fully transparent
background.
```

---

### 6. ○ `BingkaiPenuh.webp` — Bingkai penuh

**Pakai di:** `FullFrame` — mengelilingi seluruh section seperti jendela
istana. **Rasio:** potret HP (1024×1536). Border tipis di atas+kiri+kanan
(+sedikit bawah), tengah kosong.

```
STYLE: Traditional Pontianak "Corak Insang" motif — a precise geometric
lattice of interlocking diamond/rhombus shapes (resembling fish-scale or
fish-gill netting), NOT floral, NOT a loose brush pattern. Rendered as fine
line-work in muted antique gold (desaturated, like aged gold thread
embroidery on royal Malay songket cloth or istana wood carving — NOT bright
neon gold, NOT a cartoonish tourist batik print). Symmetrical, disciplined,
quiet luxury. Isolated on a fully transparent background (alpha) — no
backdrop, no canvas color, no frame, no text, no real Arabic/Jawi script.
High resolution, crisp clean line edges.

A full rectangular border made of a single thin row of the Corak Insang
diamond-lattice running along the TOP, LEFT and RIGHT edges (lightly across
the bottom too), denser at the four corners, thinning along the straight
edges. The ENTIRE CENTER is empty and transparent — a clean istana-window
frame for content. Fully transparent background.
```

---

### 7. ★ `PembatasBunga.webp` — Divider tipis

**Pakai di:** `FloralDivider`, satu varian `SectionSeam`. **Rasio:** lebar
(1536×256, dipipihkan jadi garis dekoratif). Ruang kosong atas-bawah.

```
STYLE: Traditional Pontianak "Corak Insang" motif — a precise geometric
lattice of interlocking diamond/rhombus shapes (resembling fish-scale or
fish-gill netting), NOT floral, NOT a loose brush pattern. Rendered as fine
line-work in muted antique gold (desaturated, like aged gold thread
embroidery on royal Malay songket cloth or istana wood carving — NOT bright
neon gold, NOT a cartoonish tourist batik print). Symmetrical, disciplined,
quiet luxury. Isolated on a fully transparent background (alpha) — no
backdrop, no canvas color, no frame, no text, no real Arabic/Jawi script.
High resolution, crisp clean line edges.

A single horizontal ROW of the Corak Insang diamond lattice — flattened into
a thin decorative line: one row of small interlocking gold rhombus outlines
strung side by side like a beaded trim, symmetrical, centered. A tiny solid
gold diamond marks the exact center. Very restrained, mostly empty space
above and below the row. Fully transparent background.
```

---

### 8. ★ `GarlandBunga.webp` — Divider besar (jahitan antar-section)

**Pakai di:** `SectionSeam` (varian lebih kaya dari #7). **Rasio:** lebar
(1536×320). Dua baris kisi, bukan satu.

```
STYLE: Traditional Pontianak "Corak Insang" motif — a precise geometric
lattice of interlocking diamond/rhombus shapes (resembling fish-scale or
fish-gill netting), NOT floral, NOT a loose brush pattern. Rendered as fine
line-work in muted antique gold (desaturated, like aged gold thread
embroidery on royal Malay songket cloth or istana wood carving — NOT bright
neon gold, NOT a cartoonish tourist batik print). Symmetrical, disciplined,
quiet luxury. Isolated on a fully transparent background (alpha) — no
backdrop, no canvas color, no frame, no text, no real Arabic/Jawi script.
High resolution, crisp clean line edges.

A wider horizontal band of the Corak Insang lattice — TWO rows of interlocking
gold rhombus shapes stacked (not one), symmetrical from center outward,
thinning to single fine lines at both far ends. Richer than a thin divider
but still a flat trim, not a dense field. Fully transparent background.
```

---

### 9. ★ `BingkaiFoto.webp` — Ring foto pasangan

**Pakai di:** melingkari foto bulat mempelai (CoupleSection). **Penting:**
tengah lingkaran harus kosong/transparan (lubang) supaya foto muncul di
baliknya — ringnya sendiri harus **tipis**. **Rasio:** 1:1 (1024×1024).

```
STYLE: Traditional Pontianak "Corak Insang" motif — a precise geometric
lattice of interlocking diamond/rhombus shapes (resembling fish-scale or
fish-gill netting), NOT floral, NOT a loose brush pattern. Rendered as fine
line-work in muted antique gold (desaturated, like aged gold thread
embroidery on royal Malay songket cloth or istana wood carving — NOT bright
neon gold, NOT a cartoonish tourist batik print). Symmetrical, disciplined,
quiet luxury. Isolated on a fully transparent background (alpha) — no
backdrop, no canvas color, no frame, no text, no real Arabic/Jawi script.
High resolution, crisp clean line edges.

A thin circular ring made from a single continuous row of small Corak Insang
diamond-lattice links (like a fine gold chain of tiny linked rhombuses),
forming a perfect circle. The ring itself is slim — no thick band, no filled
area. The ENTIRE CENTER of the circle is completely empty and transparent so
a photo can show through. Fully transparent background outside and inside
the ring.
```

---

### 10. ★ `WreathInisial.webp` — Ring monogram

**Pakai di:** mengelilingi inisial pasangan di Cover (mis. "R & K"). Mirip
#9 tapi tengahnya untuk teks, bukan foto — boleh sedikit lebih dekoratif
(tambahan sulur kecil di dasar ring).
**Rasio:** 1:1 (1024×1024).

```
STYLE: Traditional Pontianak "Corak Insang" motif — a precise geometric
lattice of interlocking diamond/rhombus shapes (resembling fish-scale or
fish-gill netting), NOT floral, NOT a loose brush pattern. Rendered as fine
line-work in muted antique gold (desaturated, like aged gold thread
embroidery on royal Malay songket cloth or istana wood carving — NOT bright
neon gold, NOT a cartoonish tourist batik print). Symmetrical, disciplined,
quiet luxury. Isolated on a fully transparent background (alpha) — no
backdrop, no canvas color, no frame, no text, no real Arabic/Jawi script.
High resolution, crisp clean line edges.

A thin circular ring made from a single row of small Corak Insang
diamond-lattice links, forming a near-complete circle with one small sulur
tendril flourish at the base where the ring is anchored. The center is
completely empty and transparent for initials to be placed by the website (do
NOT draw any letters or text). Fully transparent background.
```

---

### 11. ★ `KartuBunga.webp` — Border panel kartu

**Pakai di:** panel "Salam Hangat" (`BotanicalCard`). Border tipis
mengelilingi TEPI panel — **tengah panel harus bersih/kosong** untuk teks.
**Rasio:** potret kartu (1024×1280). **Bukan** transparan penuh.

```
STYLE: A soft vertical card panel: a deep antique-green (#1E3327) paper
rectangle with gently rounded corners, bordered along its EDGES by a thin
continuous trim of the Corak Insang gold diamond-lattice (one row of small
linked rhombuses tracing the perimeter, slightly richer at the four corners).
The CENTER of the card is clean, calm, and empty (dark green, no pattern) to
hold ivory text. Outside the card rectangle is fully transparent. Elegant,
restrained — like the gold-trimmed edge of a ceremonial cloth, not a busy
pattern flooding the card. No text.
```

---

### 12. ★ `TangkaiKuncup.webp` — Aksen kecil

**Pakai di:** flanking judul section (`FloralTitle`), ikon kecil di
`EventSection`, salah satu varian `Meadow`. **Rasio:** 1:1, elemen kecil ter-pusat.

```
STYLE: Traditional Pontianak "Corak Insang" motif — a precise geometric
lattice of interlocking diamond/rhombus shapes (resembling fish-scale or
fish-gill netting), NOT floral, NOT a loose brush pattern. Rendered as fine
line-work in muted antique gold (desaturated, like aged gold thread
embroidery on royal Malay songket cloth or istana wood carving — NOT bright
neon gold, NOT a cartoonish tourist batik print). Symmetrical, disciplined,
quiet luxury. Isolated on a fully transparent background (alpha) — no
backdrop, no canvas color, no frame, no text, no real Arabic/Jawi script.
High resolution, crisp clean line edges.

A single small motif: one unit of the Corak Insang diamond (a single gold
rhombus outline) with one tiny sulur curl beside it, centered and small in
frame. Quiet, minimal, jewelry-like. Fully transparent background.
```

---

### 13. ○ `Sprig1.webp` — Variasi aksen kecil

**Pakai di:** variasi baris `Meadow`. **Rasio:** potret ramping (512×1024),
berakar di bawah, ujung di atas.

```
STYLE: Traditional Pontianak "Corak Insang" motif — a precise geometric
lattice of interlocking diamond/rhombus shapes (resembling fish-scale or
fish-gill netting), NOT floral, NOT a loose brush pattern. Rendered as fine
line-work in muted antique gold (desaturated, like aged gold thread
embroidery on royal Malay songket cloth or istana wood carving — NOT bright
neon gold, NOT a cartoonish tourist batik print). Symmetrical, disciplined,
quiet luxury. Isolated on a fully transparent background (alpha) — no
backdrop, no canvas color, no frame, no text, no real Arabic/Jawi script.
High resolution, crisp clean line edges.

A single slender vertical line rooted at the bottom-center, rising with 2–3
small Corak Insang diamond links stacked like beads, topped with one tiny
gold dot. Delicate, minimal, centered, bottom-anchored. Fully transparent
background.
```

---

### 14. ★ `MeadowStrip.webp` — Pita tepi bawah

**Pakai di:** `Meadow` — dasar strip di tepi bawah Cover/Closing, tempat
`TangkaiKuncup`/`Sprig1` bergoyang di atasnya. **Rasio:** sangat lebar
(2048×480).

```
STYLE: Traditional Pontianak "Corak Insang" motif — a precise geometric
lattice of interlocking diamond/rhombus shapes (resembling fish-scale or
fish-gill netting), NOT floral, NOT a loose brush pattern. Rendered as fine
line-work in muted antique gold (desaturated, like aged gold thread
embroidery on royal Malay songket cloth or istana wood carving — NOT bright
neon gold, NOT a cartoonish tourist batik print). Symmetrical, disciplined,
quiet luxury. Isolated on a fully transparent background (alpha) — no
backdrop, no canvas color, no frame, no text, no real Arabic/Jawi script.
High resolution, crisp clean line edges.

A wide horizontal BAND of the Corak Insang diamond lattice running along the
BOTTOM edge — a continuous row of interlocking gold rhombuses forming a solid
ceremonial trim, with a second thinner row just above it that fades to
transparent going upward. Rich but flat, like the woven gold hem of a
ceremonial cloth laid along the bottom of the screen. Fully transparent
background above the trim.
```

---

### 15. ★ `BungaJatuh1.webp` / `2` / `3` — Kepingan emas jatuh

**Pakai di:** `FallingFlowers` — partikel melayang turun (pengganti kelopak
bunga Soft Bloom). **Rasio:** 1:1 (1024×1024), satu keping kecil per gambar,
ter-pusat. Generate **3 kali** dengan orientasi/ukuran beda.

```
STYLE: Traditional Pontianak "Corak Insang" motif — a precise geometric
lattice of interlocking diamond/rhombus shapes (resembling fish-scale or
fish-gill netting), NOT floral, NOT a loose brush pattern. Rendered as fine
line-work in muted antique gold (desaturated, like aged gold thread
embroidery on royal Malay songket cloth or istana wood carving — NOT bright
neon gold, NOT a cartoonish tourist batik print). Symmetrical, disciplined,
quiet luxury. Isolated on a fully transparent background (alpha) — no
backdrop, no canvas color, no frame, no text, no real Arabic/Jawi script.
High resolution, crisp clean line edges.

A SINGLE small falling gold diamond shard — one facet-cut rhombus echoing the
Corak Insang lattice unit, like a loose piece of gold leaf or a sequin from a
songket cloth. Variation #1: a simple flat diamond outline. (For #2 regenerate
slightly smaller and rotated; for #3 as a tiny solid-filled diamond, not just
outline.) Delicate, isolated, centered, soft golden glint. Fully transparent
background.
```

---

### 16. ○ `Burung.webp` — Burung hinggap

**Pakai di:** `Bird` — aksen fauna diam/mengangguk pelan. **Rasio:** 1:1
(1024×1024), satu burung ter-pusat, menghadap ke dalam.

```
STYLE: Traditional Pontianak "Corak Insang" motif — a precise geometric
lattice of interlocking diamond/rhombus shapes (resembling fish-scale or
fish-gill netting), NOT floral, NOT a loose brush pattern. Rendered as fine
line-work in muted antique gold (desaturated, like aged gold thread
embroidery on royal Malay songket cloth or istana wood carving — NOT bright
neon gold, NOT a cartoonish tourist batik print). Symmetrical, disciplined,
quiet luxury. Isolated on a fully transparent background (alpha) — no
backdrop, no canvas color, no frame, no text, no real Arabic/Jawi script.
High resolution, crisp clean line edges.

A single small bird rendered in stylized Malay ukiran (carved ornament)
style — a distilled, symmetrical silhouette like the bird motifs found in
songket weaving or istana wood-carving, NOT a realistic bird illustration.
Made from the same fine gold line-work as the Corak Insang lattice, perched
facing inward, wings folded. Quiet, elegant, ornamental. Fully transparent
background.
```

---

### 17. ○ `Kupu.webp` — Burung terbang

> Nama filenya tetap "Kupu" (sisa dari kupu-kupu Soft Bloom, komponennya
> memanggil nama ini secara literal) — isinya sekarang burung, bukan
> kupu-kupu. Sama seperti noir-vow kemarin: nama file cuma implementasi
> internal, pengunjung situs tidak pernah melihatnya.

**Pakai di:** `Butterflies` — melintas halaman dengan kepakan sayap (pengganti
kupu-kupu Soft Bloom). **Rasio:** 1:1 (1024×1024), sayap terbuka dilihat dari
samping/atas.

```
STYLE: Traditional Pontianak "Corak Insang" motif — a precise geometric
lattice of interlocking diamond/rhombus shapes (resembling fish-scale or
fish-gill netting), NOT floral, NOT a loose brush pattern. Rendered as fine
line-work in muted antique gold (desaturated, like aged gold thread
embroidery on royal Malay songket cloth or istana wood carving — NOT bright
neon gold, NOT a cartoonish tourist batik print). Symmetrical, disciplined,
quiet luxury. Isolated on a fully transparent background (alpha) — no
backdrop, no canvas color, no frame, no text, no real Arabic/Jawi script.
High resolution, crisp clean line edges.

A single small bird in the same stylized Malay ukiran line-art style as the
Burung.webp bird above (#16), but with wings OPEN mid-flight, seen from a three-quarter
angle. Symmetrical, ornamental silhouette — not realistic. Fine gold
line-work matching the Corak Insang lattice. Fully transparent background.
```

---

### 18. ★ `AmplopFlapLeft.webp` — Flap amplop pembuka

**Pakai di:** `EnvelopeOverlay` (satu gambar dipakai 4× dirotasi untuk empat
flap amplop 3D). **Rasio:** mengikuti proporsi asli Soft Bloom (potret).

```
STYLE: A dark antique-green paper envelope flap, triangular, with a subtle
deckle edge and a thin gold Corak Insang lattice trim tracing just inside the
edge (one row of small linked rhombuses, not a dense field). Matte paper
texture, no gloss. Isolated on a fully transparent background — no other
envelope parts.
```

---

### 19. ★ `StempelAmplop.webp` — Segel amplop

**Pakai di:** `EnvelopeOverlay` — pengganti segel lilin Eropa dengan medali
emas ala segel kerajaan Melayu. **Rasio:** 1:1 kecil (mis. 512×512).

```
STYLE: A small circular gold medallion emblem (like a royal Malay ceremonial
seal, NOT a European wax seal), with a minimal engraved Corak Insang diamond
motif in the center — a compact cluster of 3–4 tiny interlocking rhombuses,
NOT letters, NOT initials. Matte antique gold, not shiny/glossy. Isolated,
centered. Fully transparent background.
```

---

### 20. ○ `LatarKertas.webp` — Tekstur dasar

**Pakai di:** `PaperBackdrop` — tekstur halus di belakang seluruh halaman
(opsional, bisa juga tetap warna solid CSS kalau tak mau generate).
**Rasio:** besar, bisa di-tile (1024×1024). Sangat halus & pucat.

```
STYLE: A subtle, seamless dark antique-green textured backdrop (#16261B-ish)
— very faint fibers/grain, with an occasional extremely faint hint of gold
fleck (like flecked handmade paper), low contrast. No pattern motif, no
strong color, no text. Suitable as a quiet background under ivory text.
```

---

## Aset Tambahan — Latar Scene (background foto, BUKAN ornamen transparan)

Beda dari 20 aset di atas: 4 aset ini adalah **latar full-bleed OPAQUE**
(pengganti foto padang bunga asli Soft Bloom), dipakai lewat
`SceneBackground` sebagai `<img>` penuh satu layar dengan scrim gradasi di
atasnya (teks duduk di atas scrim, bukan langsung di atas gambar). Karena
itu:

- **BUKAN transparan** — background harus terisi penuh (opaque), gaya
  lukisan/ilustrasi painterly (bukan foto asli/fotorealistik — supaya tetap
  senada dengan ornamen garis emas, dan aman secara hak cipta/tidak
  menjiplak landmark spesifik).
- **Rasio lanskap lebar** (mis. 1536×1024 atau lebih lebar) — akan di-crop
  `object-fit: cover` di berbagai ukuran layar (HP potret sampai desktop
  lanskap), jadi elemen penting taruh di area tengah, bukan mepet tepi.
- **Kontras rendah/lembut di area atas & tengah** — scrim gradasi CSS akan
  menimpa dari atas (paling gelap) menipis ke bawah, jadi bagian atas gambar
  sebaiknya sudah agak tenang (bukan detail super ramai) supaya teks yang
  duduk di sana tetap terbaca.
- Tidak perlu isi kisi Corak Insang secara literal di sini (itu tugas 20
  aset ornamen di atas) — latar ini cukup **suasana** istana Melayu senja:
  hijau tua & emas, megah, tenang.

### 21. ★ `LatarPadang.webp` — Latar utama (Cover, Closing, panel desktop)

**Pakai di:** `CoverSection`, `ClosingSection`, `DesktopCover` — layar
pembuka & penutup, elemen paling "wah" dari keseluruhan undangan. Versi
Soft Bloom aslinya: padang bukit dengan pita bukit gelap di dasar (tempat
tanggal duduk). Versi ini: siluet istana Melayu di senja, dengan pita gelap
serupa di dasar sebagai tempat duduk teks tanggal.

**Rasio:** lanskap lebar, 1536×1024 atau lebih besar.

```
STYLE: A painterly, atmospheric illustration (not a photograph, not a
recognizable real landmark) of a grand Malay palace ("istana Melayu")
silhouette at dusk — layered rooftop domes and spires with gentle
Corak-Insang-inspired lattice silhouettes, seen from a respectful distance
across still water reflecting warm light. Palette: deep antique green
(#16261B–#1E3327) sky and water, glowing warm gold (#C9A227/#E4C874)
horizon light, soft atmospheric haze. Composition: a darker, calmer band of
silhouette/water along the very bottom third (for text to sit on), with the
most luminous warm glow in the upper-middle third fading to soft dark green
at the very top and edges. Soft painterly brushwork, muted and dignified —
quiet royal luxury, not saturated or cartoonish. No text, no watermark, no
real Arabic/Jawi script, no recognizable specific building/landmark. Fully
opaque background — fills the entire frame edge to edge.
```

### 22. ★ `LatarDaun.webp` — Latar intim (Mempelai, Amplop Kasih)

**Pakai di:** `CoupleSection`, `GiftSection` — section yang lebih dekat/
personal, bukan hero. Versi Soft Bloom aslinya: dedaunan close-up, lembut &
blur. Versi ini: kain songket/tenun close-up, lembut & blur.

**Rasio:** lanskap lebar, 1536×1024 atau lebih besar.

```
STYLE: A soft, extremely out-of-focus close-up of luxurious dark green
songket-style woven fabric with fine antique gold thread lattice
(Corak-Insang-inspired diamond weave), shot shallow-depth-of-field so
individual threads blur into soft glowing gold bokeh dots over a deep green
base. Intimate, warm, quiet — like fabric glimpsed in soft candlelight, not
sharp or documentary. Palette strictly deep antique green (#16261B–#1E3327)
base with muted gold (#C9A227/#E4C874) blurred highlights. Even, soft
lighting overall — no harsh dark corners, no sharp in-focus areas, no text,
no watermark. Fully opaque background — fills the entire frame edge to
edge.
```

### 23. ★ `LatarLangit.webp` — Latar akad (langit senja upacara)

**Pakai di:** `EventSection` untuk akad — bagian paling sakral, butuh
suasana khidmat. Versi Soft Bloom aslinya: langit cerah lembut. Versi ini:
langit senja dengan lentera/pelita hangat.

**Rasio:** lanskap lebar, 1536×1024 atau lebih besar.

```
STYLE: A soft painterly dusk sky in deep antique green
(#16261B–#1E3327), with a few small, gently glowing warm gold
(#C9A227/#E4C874) traditional Malay pelita/lentern lights floating softly
out of focus in the lower half, like distant ceremonial lanterns at
twilight — solemn, warm, quiet, not festive or crowded. Very soft gradient
from slightly lighter warm green-gold near the bottom to deep calm green at
the top. No literal Corak Insang lattice needed here — just mood and light.
No text, no watermark, no real Arabic/Jawi script, no recognizable
buildings or people. Fully opaque background — fills the entire frame edge
to edge.
```

### 24. ★ `LatarBokeh.webp` — Latar galeri (bokeh hangat)

**Pakai di:** `GallerySection` — latar belakang di balik grid foto galeri,
harus sangat tenang & tidak mengganggu foto-foto di depannya. Versi Soft
Bloom aslinya: bokeh cahaya pastel lembut. Versi ini: bokeh cahaya emas
hangat di atas hijau tua.

**Rasio:** lanskap lebar, 1536×1024 atau lebih besar.

```
STYLE: A very soft, softly-blurred abstract bokeh backdrop — warm gold
(#C9A227/#E4C874) circular light bokeh dots of varying size, gently
scattered over a deep antique green (#16261B–#1E3327) base, like warm
lanterns or candlelight seen completely out of focus at night. Extremely
soft, even, low-contrast throughout (this sits behind photos, must stay
calm and not compete for attention). No sharp shapes, no pattern, no
recognizable objects, no text, no watermark. Fully opaque background —
fills the entire frame edge to edge.
```

---

## Konversi & Upload

**1. Konversi PNG → WebP** (jaga alpha untuk ornamen; kualitas tinggi untuk KartuBunga/tekstur):
```bash
cwebp -q 90 -alpha_q 100 SudutBunga.png -o SudutBunga.webp
```

**2. Taruh file untuk dev lokal:**
`themes/adat/kenangan/insang-kencana/public/images/`

**3. Upload ke R2** (path mengikuti `THEME_CDN_PATH` di `theme-meta.ts`):
```bash
npx wrangler r2 object put rimba-themes/adat/kenangan/insang-kencana/SudutBunga.webp \
  --file ./public/images/SudutBunga.webp --content-type image/webp --remote
```

---

## Checklist Generate

**Wajib (★):**
- [ ] `SudutBunga.webp`
- [ ] `SudutBunga2.webp`
- [ ] `SudutBawah.webp`
- [ ] `RantingSamping.webp`
- [ ] `BingkaiAtas.webp`
- [ ] `PembatasBunga.webp`
- [ ] `GarlandBunga.webp`
- [ ] `BingkaiFoto.webp`
- [ ] `WreathInisial.webp`
- [ ] `KartuBunga.webp`
- [ ] `TangkaiKuncup.webp`
- [ ] `MeadowStrip.webp`
- [ ] `BungaJatuh1.webp` / `BungaJatuh2.webp` / `BungaJatuh3.webp`
- [ ] `AmplopFlapLeft.webp`
- [ ] `StempelAmplop.webp`
- [ ] `LatarPadang.webp`
- [ ] `LatarDaun.webp`
- [ ] `LatarLangit.webp`
- [ ] `LatarBokeh.webp`

**Boleh nyusul (○):**
- [ ] `BingkaiPenuh.webp`
- [ ] `Sprig1.webp`
- [ ] `Burung.webp`
- [ ] `Kupu.webp`
- [ ] `LatarKertas.webp`

Setelah beberapa file jadi (tidak perlu tunggu semua), kabari aku — file-nya
tinggal ditaruh di `public/images/` dengan nama persis seperti di atas dan
langsung terbaca oleh komponen yang sudah ada, animasinya langsung jalan.
