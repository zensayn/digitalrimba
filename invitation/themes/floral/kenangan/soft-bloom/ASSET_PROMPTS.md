# Soft Bloom (Wildflower Pastel) — Prompt Generate Aset Gambar

Panduan generate elemen dekoratif untuk template **soft-bloom** (kategori floral ·
tier kenangan · Tier 1 Basic). Generate di ChatGPT, lalu konversi ke `.webp`
transparan dan upload ke R2.

> **Konsep: Bunga Liar Pastel (Wildflower).** Ceria, segar, playful — campuran
> bunga liar warna pastel. **Sengaja dibuat beda total dari warm-narrative**
> (yang mawar-putih + emas + blush romantis). Lihat `./DESIGN_SPEC.md`.

---

## Aturan Umum (berlaku untuk SEMUA gambar)

**Format & teknis:**
- **Background 100% transparan** (alpha) — tidak ada warna kanvas, tidak ada bayangan kotak.
- Tidak ada teks, watermark, atau border frame buatan.
- Resolusi tinggi, tepi bersih (clean alpha edges), elemen ter-isolasi & ter-pusat.
- Setelah generate (ChatGPT biasanya keluar PNG): **konversi ke WebP transparan**
  (lihat bagian "Konversi & Upload").

**Palet warna (wajib konsisten di semua aset — INI yang membedakan dari warm-narrative):**
- Bunga: campuran pastel — **lilac/lavender ungu** (`#C9B8DA`), **kuning mentega**
  (`#F0E2A8`), **biru pudar** (`#BCD0DB`), serta **putih** bersih (`#FDFCFA`).
- Dedaunan/tangkai: **hijau padang lembut** (`#9BB08A`).
- Aksen opsional: peach sangat lembut (`#E9C4B4`) — pakai tipis saja.
- **HINDARI:** mawar besar, warna emas/gold, nuansa blush-romantis monokrom.

**Bunga yang dipakai (kosakata wildflower):** daisy, lavender, ranunculus, cosmos,
forget-me-not, tangkai bunga liar kecil campur. **Bukan** mawar sebagai elemen utama.

**Gaya (tempel di awal tiap prompt):**

> `STYLE: Soft, airy, cheerful wildflower botanical illustration in a delicate
> realistic style (soft watercolor meets soft photography). A fresh mixed-pastel
> palette: lilac/lavender purple, butter yellow, powder blue, and clean white
> blooms, with soft meadow-green stems and leaves. Bright, light, playful and
> fresh — NOT romantic, NOT gold, NO large roses. Mixed wildflowers such as
> daisies, lavender, ranunculus, cosmos and forget-me-nots. The element is fully
> isolated on a 100% transparent background (alpha) — no backdrop, no canvas
> color, no frame, no text. High resolution, crisp clean cut-out edges.`

---

## Daftar Aset

Legenda: ★ = wajib, ○ = opsional (jaga tetap minimalis — tier ini Tier-1).

| # | File | Section pemakaian | Prioritas |
|---|------|-------------------|-----------|
| 1 | `SudutBunga.webp` | Cover (sudut atas), Closing | ★ |
| 2 | `BungaJatuh1.webp` / `BungaJatuh2.webp` / `BungaJatuh3.webp` | Cover & Closing (animasi bunga jatuh) | ★ |
| 3 | `PembatasBunga.webp` | Pemisah antar-section | ★ |
| 4 | `BingkaiFoto.webp` | Couple (bingkai foto) | ★ |
| 5 | `TangkaiKuncup.webp` | Penanda section / aksen kecil | ○ |
| 6 | `WreathInisial.webp` | Monogram inisial di Cover | ○ |
| 7 | `Kupu.webp` | Kupu-kupu terbang (animasi, Cover/Couple/Gallery/Closing) | ★ baru |
| 8 | `SudutBawah.webp` | Kluster sudut bawah berakar (efek angin paling kuat) | ★ baru |
| 9 | `MeadowStrip.webp` | Pita padang bunga di tepi bawah Cover/Closing | ★ baru |
| 10 | `Sprig1.webp` / `Sprig2.webp` | Variasi tangkai untuk baris meadow | ○ baru |
| 11 | `SudutBunga2.webp` | Rangkaian sudut varian 2 (selang-seling) | ○ baru |
| 12 | `GarlandBunga.webp` | Pembatas besar / di bawah nama | ○ baru |
| 13 | `RantingSamping.webp` | Ranting menjuntai vertikal, tepi kiri/kanan | ○ baru |
| 14 | `Kupu2.webp` | Kupu-kupu varian 2 (warna beda) | ○ baru |
| 15 | `LatarPadang.webp` | **Latar** lukisan padang bunga (Cover full-bleed) | ★ mewah |
| 16 | `BingkaiAtas.webp` | **Bingkai** lengkung botani atas (membingkai section) | ★ mewah |
| 17 | `BingkaiPenuh.webp` | **Bingkai** taman penuh (atas + sisi) | ○ mewah |
| 18 | `Burung.webp` | Burung pastel (fauna sudut, seperti referensi) | ○ mewah |
| 19 | `LatarKertas.webp` | Tekstur kertas lembut (atau CSS) | ○ mewah |
| 20 | `KartuBunga.webp` | **Panel kartu** bunga (untuk kartu Salam/Ucapan) | ★ baru |
| 21 | `LatarBokeh.webp` | **Latar** bokeh padang bunga (variasi section) | ○ variasi |
| 22 | `LatarLangit.webp` | **Latar** langit pastel berawan (variasi section) | ○ variasi |
| 23 | `LatarDaun.webp` | **Latar** sapuan dedaunan lembut (variasi section) | ○ variasi |

> **Aset baru `Kupu.webp`** memberi nyawa lewat animasi kupu-kupu yang terbang
> menyeberang halaman. Komponen `Butterflies.tsx` sudah memakainya dengan
> **fallback aman** — kalau file belum ada, kupu otomatis disembunyikan (tidak error).
>
> **Aset #8–14** untuk mendekati kepadatan & gerak situs referensi (48 gambar).
> Setelah di-generate & di-upload, bilang — nanti aku **wire ke komponen** (semua
> pakai fallback aman, jadi tidak error walau belum ada). Prompt lengkap di bawah.

> **Ikon fungsional** (pin lokasi, kalender, cincin, amplop hadiah) **tidak**
> di-generate — pakai `lucide-react`: `MapPin`, `CalendarHeart`, `Heart`, `Gift`.
>
> **Background wash pastel** (dulu `SapuanPastel.webp`) juga **tidak di-generate** —
> AI image (gpt-image) sulit membuat awan opacity-rendah dengan tepi alpha yang
> memudar natural. Dibuat via **CSS `radial-gradient`** (lihat "Background Wash —
> CSS, bukan gambar" di bawah).

---

### 1. ★ `SudutBunga.webp` — Rangkaian bunga liar sudut

**Pakai di:** Cover (ornamen sudut atas), bisa di-mirror untuk sudut bawah Closing.
**Rasio:** 1:1 (1024×1024), komposisi mengisi satu sudut (mis. kiri-atas), sisanya transparan.

```
STYLE: <tempel blok STYLE di atas>

A loose, airy corner spray of MIXED PASTEL WILDFLOWERS filling ONE corner
(top-left), the rest of the canvas empty and transparent. White daisies, sprigs
of lavender, a few butter-yellow ranunculus and powder-blue forget-me-nots,
with soft meadow-green stems and small leaves. Light, scattered, lots of negative
space — cheerful and fresh, not dense, no roses. Isolated on a fully transparent
background.
```

---

### 2. ★ `BungaJatuh1.webp` / `2` / `3` — Bunga liar jatuh (3 variasi)

**Pakai di:** animasi bunga kecil melayang turun di Cover & Closing (minim, halus).
**Rasio:** 1:1 (1024×1024), satu bunga kecil per gambar, ter-pusat.
Generate **3 kali** dengan jenis/orientasi berbeda agar animasi bervariasi.

```
STYLE: <tempel blok STYLE di atas>

A SINGLE small wildflower bloom, isolated and centered, seen from the front.
Variation #1: a white daisy with a soft butter-yellow center. (For #2 regenerate
as a small sprig of lilac lavender; for #3 as a single powder-blue cosmos/
forget-me-not.) Delicate, light, soft natural lighting, no harsh shadow. Fully
transparent background.
```

---

### 3. ★ `PembatasBunga.webp` — Pembatas bunga liar horizontal

**Pakai di:** divider tipis antar-section.
**Rasio:** lebar (1536×1024 atau lebih lebar), elemen tipis horizontal di tengah, banyak ruang kosong atas-bawah.

```
STYLE: <tempel blok STYLE di atas>

A slim, symmetrical horizontal wildflower divider: thin sprigs of lavender and
meadow-green foliage extending left and right from a small central white daisy,
with tiny powder-blue and butter-yellow buds. Very light and minimal, lots of
empty space above and below. Cheerful, understated. Fully transparent background.
```

---

### 4. ★ `BingkaiFoto.webp` — Bingkai foto bunga liar (lingkaran)

**Pakai di:** membingkai foto pasangan (foto bulat di tengah).
**Rasio:** 1:1 (1024×1024). **Penting:** bagian TENGAH harus kosong/transparan (lubang lingkaran) supaya foto muncul di belakangnya.

```
STYLE: <tempel blok STYLE di atas>

A delicate circular wreath made of MIXED PASTEL WILDFLOWERS — white daisies,
lilac lavender, butter-yellow ranunculus, powder-blue forget-me-nots and soft
meadow-green leaves — arranged loosely around the edge of a circle. The ENTIRE
CENTER of the circle is completely empty and transparent (a clean hole) so a
photo can show through. Light and airy with gaps between blooms, not dense.
Fully transparent background outside and inside the ring.
```

---

### 5. ○ `TangkaiKuncup.webp` — Tangkai kuncup bunga liar

**Pakai di:** aksen kecil / penanda section (motif khas tier "kenangan").
**Rasio:** 1:1 (1024×1024), elemen kecil ter-pusat.

```
STYLE: <tempel blok STYLE di atas>

A single slender sprig with a small unopened wildflower bud (kuncup) and two
meadow-green leaves — a lilac lavender bud or a soft butter-yellow ranunculus
bud just beginning to open. Minimal, clean, centered, small in frame. Soft light.
Fully transparent background.
```

---

### 7. ★ `Kupu.webp` — Kupu-kupu pastel (untuk animasi terbang)

**Pakai di:** animasi kupu-kupu menyeberang halaman (Cover, Couple, Gallery, Closing).
**Rasio:** 1:1 (1024×1024), satu kupu-kupu ter-pusat, sayap terbuka dilihat dari atas.

```
STYLE: <tempel blok STYLE di atas>

A SINGLE small butterfly seen from above with open wings, isolated and centered.
Soft pastel wings — lilac/lavender and powder-blue with delicate white and
butter-yellow accents and fine dark veining, matching a wildflower-meadow palette.
Light, airy, watercolor-meets-soft-realistic. NO flowers, NO stem, just the
butterfly. Symmetrical, crisp clean edges. Fully transparent background.
```

> Opsional varian: regenerate 1–2 kali dengan warna sayap berbeda (mis. biru-pudar,
> lalu lilac) dan simpan sebagai `Kupu.webp` (pakai yang paling rapi). Komponen saat
> ini memakai satu file `Kupu.webp` untuk semua kupu.

---

## Aset tambahan — untuk tampilan lebih padat & "hidup"

> Semua tetap ikut **Aturan Umum** + blok **STYLE** di atas (pastel wildflower,
> background transparan, tanpa teks/emas/mawar). ★ = paling berdampak, ○ = variasi.

---

### 8. ★ `SudutBawah.webp` — Kluster sudut bawah (berakar di tepi bawah)

**Kenapa penting:** ini yang bikin efek "tertiup angin" paling terasa — kluster
tumbuh dari tepi bawah dan berpivot di **akarnya**, jadi batang diam & ujung bunga
bergoyang (persis teknik `goyang` di situs referensi).
**Pakai di:** sudut bawah kiri & kanan (Cover, Closing, section besar).
**Rasio:** 1:1 (1024×1024) atau potret 4:5. Komposisi **berat di bawah**, bunga
naik ke atas; **dua-pertiga bagian atas kanvas kosong/transparan.**

```
STYLE: <tempel blok STYLE di atas>

A lush cluster of MIXED PASTEL WILDFLOWERS growing UPWARD from the BOTTOM edge of
the frame, as if rooted at the base. White daisies, lavender spikes, butter-yellow
ranunculus, powder-blue forget-me-nots and soft meadow-green stems & leaves — denser
at the bottom and tapering to lighter sprigs at the top. The TOP two-thirds of the
canvas is empty and transparent. Fresh and cheerful, no roses, no gold. Fully
transparent background.
```

---

### 9. ★ `MeadowStrip.webp` — Pita padang bunga (dasar tepi bawah)

**Pakai di:** pita di sepanjang tepi bawah Cover/Closing sebagai "padang bunga" —
dasar yang di atasnya tangkai-tangkai kecil (`MeadowRow`) bergoyang.
**Rasio:** sangat lebar (mis. 1536×512 atau 2048×640). Bunga & rumput **berjajar
sepanjang garis bawah**, makin ke atas makin jarang lalu transparan.

```
STYLE: <tempel blok STYLE di atas>

A wide horizontal BAND of low wildflower meadow along the BOTTOM edge — a row of
small white daisies, lavender, powder-blue and butter-yellow blooms with slender
meadow-green grasses and stems rising from a common baseline. Even, gentle,
repeating rhythm across the full width, thinning to transparent toward the top.
No roses, no gold. Fully transparent background above the meadow line.
```

---

### 10. ○ `Sprig1.webp` / `Sprig2.webp` — Tangkai tegak kecil (variasi meadow)

**Pakai di:** memperkaya baris `MeadowRow` supaya tidak berulang (sekarang meadow
memakai ulang `TangkaiKuncup` + `BungaJatuh`).
**Rasio:** potret ramping (mis. 512×1024), satu tangkai tegak **berakar di bawah**,
bunga di ujung atas, ter-pusat.

```
STYLE: <tempel blok STYLE di atas>

A SINGLE slender upright wildflower stem rooted at the bottom-center, rising
vertically with a small bloom near the top. Sprig1: a white daisy on a thin green
stem with two leaves. (For Sprig2 regenerate as a lavender spike; optional Sprig3
as a butter-yellow ranunculus bud.) Delicate, minimal, centered, bottom-anchored.
Fully transparent background.
```

---

### 11. ○ `SudutBunga2.webp` — Rangkaian sudut varian 2

**Pakai di:** selang-seling dengan `SudutBunga` supaya sudut antar-section beda.
**Rasio:** 1:1 (1024×1024), mengisi satu sudut, komposisi **berbeda** dari SudutBunga
(lebih banyak lavender & daun menjuntai, sedikit memanjang).

```
STYLE: <tempel blok STYLE di atas>

A different corner spray of MIXED PASTEL WILDFLOWERS filling ONE corner, composed
differently from a typical bouquet — more trailing lavender spikes and arching
meadow-green foliage, a couple of white daisies and powder-blue forget-me-nots with
butter-yellow accents. Airy, asymmetric, lots of negative space. No roses, no gold.
Fully transparent background.
```

---

### 12. ○ `GarlandBunga.webp` — Karangan horizontal padat

**Pakai di:** pembatas section besar / di bawah nama (lebih kaya dari `PembatasBunga`).
**Rasio:** lebar (1536×1024). Karangan simetris **lebih padat & penuh**.

```
STYLE: <tempel blok STYLE di atas>

A fuller, symmetrical horizontal wildflower garland — a continuous ribbon of
lavender, white daisies, butter-yellow ranunculus, powder-blue forget-me-nots and
lush meadow-green foliage, spreading left and right from the center. Richer and
denser than a thin divider but still light and elegant. No roses, no gold. Fully
transparent background above and below.
```

---

### 13. ○ `RantingSamping.webp` — Ranting menjuntai vertikal

**Pakai di:** tepi kiri/kanan section (membingkai konten), menjuntai dari atas —
juga bergoyang halus dari pangkal atasnya.
**Rasio:** potret tinggi (mis. 512×1536). Ranting **menggantung dari atas**, bunga &
daun sepanjang batang, ujung meruncing di bawah.

```
STYLE: <tempel blok STYLE di atas>

A slender vertical trailing branch hanging DOWN from the top edge along one side,
with small pastel wildflowers (lavender, white, powder-blue, butter-yellow) and
delicate meadow-green leaves along its length, tapering to a fine tip at the bottom.
The rest of the canvas empty and transparent. No roses, no gold. Fully transparent
background.
```

---

### 14. ○ `Kupu2.webp` — Kupu-kupu varian 2

**Pakai di:** variasi fauna bersama `Kupu.webp`.
**Rasio:** 1:1 (1024×1024), satu kupu-kupu, sayap terbuka dari atas, **warna dominan
biru pudar** (beda dari `Kupu.webp` yang lilac).

```
STYLE: <tempel blok STYLE di atas>

A SINGLE small butterfly seen from above with open wings, isolated and centered.
Powder-blue dominant wings with soft white and lilac accents and fine veining,
matching a wildflower-meadow palette. Light, airy, symmetrical, crisp clean edges.
NO flowers, NO stem, just the butterfly. Fully transparent background.
```

---

## Latar & Bingkai — untuk kesan mewah (seperti referensi)

> Di referensi, kesan "mewah" datang dari **latar lukisan penuh** (lembah/padang
> cat air) + **bingkai botani** yang membingkai tiap section seperti jendela taman.
> Untuk soft-bloom kita pakai versi **pastel wildflower** (bukan emas/Jawa).
>
> **Keterbacaan:** latar dibuat **lembut & pucat**, dan nanti aku pasang lapisan
> **scrim putih transparan** (CSS, mis. `rgba(253,252,250,0.55)`) di atas latar
> supaya teks tetap jelas terbaca. Jadi generate latar dengan **bagian tengah
> terang/lapang** (ruang untuk teks), detail padat hanya di tepi/bawah.

---

### 15. ★ `LatarPadang.webp` — Latar lukisan padang bunga (Cover)

**Pakai di:** latar penuh (full-bleed) di belakang Cover — memberi "dunia" di
belakang nama, seperti lembah di referensi tapi versi padang bunga pastel.
**Rasio:** potret HP (mis. 1024×1536 atau 1080×1920). **Bukan** transparan — ini
latar penuh. Bagian **atas-tengah lapang & terang** (langit lembut), detail padat
hanya di bawah.

```
STYLE: Soft, dreamy pastel watercolor landscape painting — a gentle wildflower
meadow with soft rolling hills fading into a hazy high-key sky in pale lilac,
powder-blue and warm butter tones. Loose clusters of pastel wildflowers (daisies,
lavender, cosmos, forget-me-nots) in the FOREGROUND at the BOTTOM, meadow-green
grasses, soft morning light and misty depth. The UPPER-CENTER is open, bright and
airy (lots of pale sky) to leave room for text. Very soft, low-contrast, desaturated
and delicate — NOT bold, NOT dark, no gold, no roses, no people, no text. Painterly.
```

---

### 16. ★ `BingkaiAtas.webp` — Bingkai lengkung botani (atas)

**Pakai di:** membingkai bagian atas tiap section — bunga & dedaunan melengkung di
atas, menjuntai turun di dua sisi atas, seperti gerbang taman. **Tengah & bawah
transparan** supaya konten muncul di dalamnya.
**Rasio:** lebar / potret (mis. 1024×1024 atau 1280×1024). Padat di dua sudut atas,
menipis ke tengah-atas; **dua-pertiga bawah kosong/transparan.**

```
STYLE: <tempel blok STYLE wildflower di bagian atas dokumen>

A botanical ARCH framing the TOP of a frame — mixed pastel wildflowers (white
daisies, lavender, butter-yellow ranunculus, powder-blue forget-me-nots) and lush
meadow-green foliage arching across the top and trailing DOWN both upper corners
like a garden archway. Denser at the two top corners, lighter and airy across the
top-center. The CENTER and the entire BOTTOM are empty and transparent. No roses,
no gold, no text. Fully transparent background.
```

---

### 17. ○ `BingkaiPenuh.webp` — Bingkai taman penuh (atas + sisi)

**Pakai di:** section "premium" yang dibingkai penuh seperti jendela taman.
**Rasio:** potret HP (mis. 1024×1536). Border bunga mengelilingi **atas + kiri +
kanan** (dan sedikit bawah), **tengah kosong/transparan** untuk konten.

```
STYLE: <tempel blok STYLE wildflower di bagian atas dokumen>

A full rectangular BORDER frame of mixed pastel wildflowers and meadow-green
foliage running along the TOP, LEFT and RIGHT edges (and lightly across the bottom),
thicker and richer at the four corners, thinning along the edges. The ENTIRE CENTER
is empty and transparent — a clean garden-window frame for content. No roses, no
gold, no text. Fully transparent background.
```

---

### 18. ○ `Burung.webp` — Burung pastel (fauna sudut)

**Pakai di:** aksen fauna di sudut/ranting (seperti burung/merak di referensi),
teman bagi kupu-kupu. Bisa dianimasikan sedikit (kepala/goyang halus).
**Rasio:** 1:1 (1024×1024), satu burung ter-pusat, menghadap ke dalam.

```
STYLE: <tempel blok STYLE wildflower di bagian atas dokumen>

A SINGLE small songbird (like a delicate finch or bluebird) perched on a thin
wildflower twig, seen from the side facing inward. Soft pastel plumage — powder-blue,
lilac and cream with fine gentle detail — matching a wildflower-meadow palette.
Watercolor-meets-soft-realistic, light and elegant. NO cage, no text. Fully
transparent background.
```

---

### 19. ○ `LatarKertas.webp` — Tekstur kertas lembut (opsional)

**Pakai di:** dasar section supaya terasa seperti kertas undangan (halus, hangat).
**Alternatif:** bisa juga murni CSS — bilang saja kalau tak mau generate.
**Rasio:** besar & bisa di-tile (mis. 1024×1024), tekstur **sangat halus & pucat.**

```
A subtle, seamless off-white handmade-paper texture — very faint fibers and soft
grain in warm ivory (#FDFCFA / #F7F5F1). Extremely low contrast, no pattern motif,
no color, no text. Light and clean, suitable as a background under text.
```

---

### Background Wash — CSS, bukan gambar

**Pengganti `SapuanPastel.webp`.** Sapuan pastel lembut di background Cover/Closing
dibuat dengan CSS `radial-gradient` — fade mulus, ringan, warna mudah diatur.
**Tidak perlu di-generate.**

```css
/* Soft pastel background wash — pure CSS, no image asset */
.soft-wash {
  background:
    radial-gradient(40% 35% at 18% 12%, rgba(201,184,218,0.22), transparent 70%), /* lilac  */
    radial-gradient(35% 30% at 82% 22%, rgba(240,226,168,0.20), transparent 70%), /* butter */
    radial-gradient(48% 42% at 60% 92%, rgba(188,208,219,0.20), transparent 72%); /* sky    */
}
```

Opsional tambah `filter: blur(8px)` pada layer dekoratif untuk fade ekstra halus.

---

## Panel Kartu & Latar Variasi Section (baru)

> Tujuan: (1) kartu (Salam/Ucapan) tidak lagi kotak polos — pakai **panel bunga**
> `KartuBunga` + rangkaian bunga di tiap sudut (aset `SudutBunga`/`SudutBunga2`
> yang sudah ada, di-wire lewat `BotanicalCard.tsx`); (2) tiap section punya
> **latar berbeda** supaya tidak monoton. Sudah ada versi CSS (tint per-section +
> kertas menerus), tapi untuk kaya seperti referensi bisa pakai latar lukisan ini.

---

### 20. ★ `KartuBunga.webp` — Panel kartu bunga (untuk kartu Salam/Ucapan)

**Pakai di:** latar panel `BotanicalCard` (Salam Hangat, Ucapan/RSVP). Bunga
membingkai **tepi** panel; **tengah panel bersih & terang** untuk teks.
**Rasio:** potret kartu (mis. 1024×1280). **Bukan** transparan penuh — ini panel:
kertas krem lembut sebagai badan kartu, dengan border bunga tipis di sekeliling
tepi, dan sudut sedikit membulat. Sisa kanvas di luar kartu transparan.

```
STYLE: <tempel blok STYLE wildflower di bagian atas dokumen>

A soft vertical INVITATION CARD PANEL: a warm cream/ivory paper rectangle with
gently rounded corners, bordered all around its EDGES by a delicate ribbon of
mixed pastel wildflowers (white daisies, lavender, butter-yellow ranunculus,
powder-blue forget-me-nots) and fine meadow-green foliage — richer at the four
corners, thinning along the edges. The CENTER of the card is clean, bright and
empty (pale cream) to hold text. Outside the card rectangle is fully transparent.
Elegant, airy, printed-invitation feel. No roses, no gold, no text.
```

---

### 21. ○ `LatarBokeh.webp` — Latar bokeh padang bunga

**Pakai di:** latar full-bleed variasi (mis. Galeri/Ucapan) — memberi kedalaman
lembut. **Tengah-atas terang** (ruang teks), detail hanya di tepi bawah.
**Rasio:** potret HP (1024×1536). **Bukan** transparan (latar penuh).

```
STYLE: Soft dreamy pastel photograph-style background — an out-of-focus wildflower
meadow with creamy BOKEH highlights in lilac, powder-blue, butter-yellow and white,
over a pale high-key background. Blurred, gentle, low-contrast, lots of soft empty
space in the UPPER-CENTER for text, slightly denser blurred blooms along the bottom.
Delicate and airy — no sharp subjects, no gold, no roses, no people, no text.
```

---

### 22. ○ `LatarLangit.webp` — Latar langit pastel berawan

**Pakai di:** latar full-bleed variasi (mis. Akad/Resepsi) — kesan lapang & tenang.
**Rasio:** potret HP (1024×1536). **Bukan** transparan.

```
STYLE: A very soft pastel watercolor SKY — pale washes of lilac, powder-blue and
warm butter/cream drifting into gentle, hazy clouds, high-key and luminous. Smooth,
calm, almost empty, with the brightest openness in the UPPER-CENTER for text and a
faint wash of tiny distant wildflowers only along the very bottom edge. Extremely
soft and low-contrast — no gold, no roses, no people, no text.
```

---

### 23. ○ `LatarDaun.webp` — Latar sapuan dedaunan lembut

**Pakai di:** latar full-bleed variasi (mis. Amplop/Gift) — nuansa hijau menyegarkan.
**Rasio:** potret HP (1024×1536). **Bukan** transparan.

```
STYLE: A soft pastel botanical background of gently blurred MEADOW-GREEN foliage and
delicate leaf shapes fading into a pale cream light, with a few faint pastel
wildflower hints (lavender, white, butter-yellow) scattered softly. Airy, low-contrast,
brightest and most open in the UPPER-CENTER for text, foliage concentrated toward the
edges and bottom. Fresh and calm — no gold, no roses, no people, no text.
```

> **Cara pakai latar variasi (#21–23):** sama seperti `LatarPadang` — full-bleed via
> `SceneBackground` + scrim CSS. Setelah di-upload, bilang; aku tinggal tukar
> `file=` per-section (mis. Akad `LatarLangit`, Galeri `LatarBokeh`, Gift `LatarDaun`)
> supaya tiap section beda dunia. Sementara belum ada, tiap section tetap beda lewat
> **tint mood CSS** (lilac/sky/meadow/blush/butter) di atas kertas menerus.

---

### 6. ○ `WreathInisial.webp` — Wreath inisial

**Pakai di:** mengelilingi inisial pasangan (mis. "A & B") di Cover.
**Rasio:** 1:1 (1024×1024), wreath tipis melingkar, tengah kosong (untuk teks inisial).

```
STYLE: <tempel blok STYLE di atas>

A thin, delicate open garland of meadow-green foliage with a few tiny pastel
wildflowers (lilac, butter-yellow, powder-blue, white), forming a light circular
wreath with an open top. The center is empty and transparent for initials to be
placed by the website (do NOT draw any letters or text). Minimal, airy, cheerful.
Fully transparent background.
```

---

## Konversi & Upload

**1. Konversi PNG → WebP transparan** (jaga alpha):

```bash
cwebp -q 90 -alpha_q 100 SudutBunga.png -o SudutBunga.webp
```

Atau via Squoosh (web) / Sharp. Simpan PNG asli sebagai backup lokal.

**2. Taruh file di project** (untuk dev lokal): `themes/floral/kenangan/soft-bloom/public/images/`

**3. Upload ke R2** (path mirror struktur kode):

```bash
npx wrangler r2 object put rimba-themes/floral/kenangan/soft-bloom/SudutBunga.webp \
  --file ./public/images/SudutBunga.webp --content-type image/webp --remote
```

**4. Referensi di komponen** (lewat env CDN, lihat `docs/r2-image-storage.md`):

```tsx
const BASE = `${process.env.NEXT_PUBLIC_THEMES_CDN}/floral/kenangan/soft-bloom`;
<img src={`${BASE}/SudutBunga.webp`} alt="" />
```

---

## Checklist Generate

- [ ] `SudutBunga.webp`
- [ ] `BungaJatuh1.webp`
- [ ] `BungaJatuh2.webp`
- [ ] `BungaJatuh3.webp`
- [ ] `PembatasBunga.webp`
- [ ] `BingkaiFoto.webp`
- [ ] `TangkaiKuncup.webp` (opsional)
- [ ] `WreathInisial.webp` (opsional)
- [ ] `Kupu.webp` ← **baru, untuk animasi kupu-kupu**
- [x] ~~`SapuanPastel.webp`~~ → diganti CSS `radial-gradient` (tidak di-generate)

**Aset tambahan (padat & "hidup"):**

- [ ] `SudutBawah.webp` ★ — kluster sudut bawah berakar (efek angin paling kuat)
- [ ] `MeadowStrip.webp` ★ — pita padang bawah Cover/Closing
- [ ] `Sprig1.webp` / `Sprig2.webp` ○ — variasi tangkai meadow
- [ ] `SudutBunga2.webp` ○ — sudut varian 2
- [ ] `GarlandBunga.webp` ○ — pembatas besar
- [ ] `RantingSamping.webp` ○ — ranting menjuntai tepi
- [ ] `Kupu2.webp` ○ — kupu-kupu varian 2

**Latar & bingkai (kesan mewah):**

- [ ] `LatarPadang.webp` ★ — latar lukisan padang bunga (Cover)
- [ ] `BingkaiAtas.webp` ★ — bingkai lengkung botani atas
- [ ] `BingkaiPenuh.webp` ○ — bingkai taman penuh
- [ ] `Burung.webp` ○ — burung pastel (fauna)
- [ ] `LatarKertas.webp` ○ — tekstur kertas (atau CSS)

**Panel kartu & latar variasi section (baru):**

- [x] `KartuBunga.webp` ★ — panel kartu bunga (kartu Salam) — **wired: BotanicalCard**
- [x] `LatarBokeh.webp` ○ — latar bokeh — **wired: Galeri**
- [x] `LatarLangit.webp` ○ — latar langit pastel — **wired: Akad**
- [x] `LatarDaun.webp` ○ — latar sapuan dedaunan — **wired: Mempelai & Amplop**
