# Twilight Castle (Istana Dongeng Senja) — Prompt Generate Aset Gambar

Panduan generate aset untuk template **twilight-castle** (kategori **dongeng** · tier
**kisah** · Tier 2 Standard). Gaya: **fotografis sinematik** (keputusan owner), di-generate
via **AI** (gpt-image / Midjourney), lalu diproses & di-upload ke R2 `rimba-themes`.

> **Konsep: Istana Dongeng Senja (Twilight Royal).** Tamu "menembus" gerbang kerajaan
> masuk ke dunia istana golden-hour. Efek gerbang = **dua lapis foto** (referensi:
> file yang di-drop owner di folder ini — `…_main home.webp` = lapisan **depan** ruang
> gelap berjendela bulat berlubang; `photo-…jpg` gunung = **contoh** lapisan belakang).
> Spec: `docs/superpowers/specs/2026-07-23-twilight-castle-theme-design.md`.

> ⚠️ **Dua file referensi itu HANYA contoh — jangan di-ship.** Pindahkan ke `/references`
> atau hapus sebelum build (mereka bukan aset twilight-castle final).

---

## Aturan Umum

**Palet (WAJIB konsisten di semua aset):**
- Langit/suasana senja: **indigo-ungu gelap** (`#141024` → `#1F1838` → `#241C42`).
- Emas: **royal gold** (`#D4AF37`) & **candlelight** (`#E8C874`).
- Semburat horizon: **rose blush hangat** (`#C97B84`).
- Cahaya/bintang: **starlight** krem (`#F0EAD6`).
- **HINDARI:** siang cerah, hijau daun dominan, bunga pastel, warna primer mencolok, teks,
  wajah/orang yang menonjol.

Ada **dua register gaya**, dan **teks STYLE-nya sudah ditempel penuh di tiap prompt di bawah**
(tinggal salin seluruh isi blok kode) — **Foto sinematik** untuk gerbang/dunia/latar, dan
**Ornamen emas transparan** untuk aksen di atas foto.

---

## Daftar Aset

Legenda: ★★ = inti (tanpa ini efek gerbang mati), ★ = wajib, ○ = opsional.

| # | File | Peran | Transparan? | Prioritas |
|---|------|-------|-------------|-----------|
| 1 | `GerbangDepan.webp` | Lapisan **depan** gerbang (ruang + jendela bulat berlubang) | **Ya (lubang tengah)** | ★★ |
| 2 | `DuniaIstana.webp` | Lapisan **belakang** (istana golden-hour) | Tidak (latar penuh) | ★★ |
| 3 | `LatarSenja.webp` | Latar foto section (variasi) | Tidak | ★ |
| 4 | `SudutEmas.webp` | Ornamen sudut emas | Ya | ★ |
| 5 | `BingkaiFoto.webp` | Cincin emas pembingkai foto (Couple) | Ya (tengah lubang) | ★ |
| 6 | `PembatasEmas.webp` | Divider ornamen emas | Ya | ★ |
| 7 | `SiluetIstana.webp` | Siluet skyline istana (kaki halaman) | Ya | ○ |
| 8 | `MenaraSisi.webp` | Siluet menara tepi kiri/kanan | Ya | ○ |
| 9 | `Bulan.webp` | Bulan sabit keemasan | Ya | ○ |
| 10 | `BingkaiAtas.webp` | Bingkai lengkung ornamen atas | Ya | ○ |

> **Partikel/gradien TIDAK di-generate** (CSS/Framer): fairy dust & bintang berkelip
> (`Stardust`/`Fireflies`), gradien twilight fallback, glow horizon, scrim keterbacaan.
> **Ikon fungsional** → `lucide-react`.

---

### 1. ★★ `GerbangDepan.webp` — Lapisan depan gerbang (INTI)

**Pakai di:** `RoyalGate` sebagai lapisan **paling depan**. Saat scroll, ia mem-*scale*
lebih cepat dari lapisan belakang lalu memudar → tamu "terbang menembus jendela".
**Rasio:** potret HP (mis. 1080×1920), jendela bulat **ter-pusat**.
**Kunci:** ruang istana **gelap** mengelilingi sebuah **jendela/gapura bulat berornamen emas**;
**tengah jendela harus jadi lubang transparan** (alpha) supaya lapisan belakang tampak.

```
STYLE: Cinematic, photorealistic 3D-render look. A luxurious fairytale TWILIGHT
atmosphere — deep indigo-violet dusk (#141024–#241C42), warm golden light and a rose
horizon glow (#C97B84), soft volumetric haze and gentle film grain. Elegant, magical,
high-end wedding mood. No people, no text, no logos.

Interior of a grand, dim fairytale palace hall at dusk, viewed straight-on. In the center
of the wall is a large ORNATE ROUND WINDOW / circular archway framed with intricate gold
molding and filigree, softly lit by warm golden light. The room around it is dark indigo
shadow with subtle gilded detailing. The CENTER of the round window is a clean bright opening
(to be knocked out to full transparency in post). Symmetrical, cinematic, elegant, magical.
No people, no text.
```

> **Pasca-proses WAJIB:** gpt-image tak keluar alpha bersih. Setelah generate, **potong
> bagian dalam lingkaran jendela jadi transparan** (mask/alpha) di editor (Photoshop/Photopea/
> GIMP), sisakan bingkai emas + ruang gelap tetap opaque. Ekspor WebP **beralpha**.

---

### 2. ★★ `DuniaIstana.webp` — Lapisan belakang (dunia istana)

**Pakai di:** `RoyalGate` sebagai lapisan **belakang** (terlihat lewat lubang, lalu memenuhi
layar). **Latar penuh, BUKAN transparan.**
**Rasio:** potret HP (1080×1920). Komposisi berpusat supaya pas dilihat lewat lingkaran.

```
STYLE: Cinematic, photorealistic 3D-render look. A luxurious fairytale TWILIGHT
atmosphere — deep indigo-violet dusk (#141024–#241C42), warm golden light and a rose
horizon glow (#C97B84), soft volumetric haze and gentle film grain. Elegant, magical,
high-end wedding mood. No people, no text, no logos.

A breathtaking fairytale CASTLE with many slender spires on a distant hill, glowing in warm
golden-hour / early-twilight light, under a deep indigo-violet sky with a soft rose glow on
the horizon and faint golden stars appearing. Gentle mist in the valley, luminous and dreamy,
storybook grandeur. Centered composition, cinematic depth. No people, no text.
```

---

### 3. ★ `LatarSenja.webp` — Latar foto section (variasi)

**Pakai di:** latar full-bleed section (Akad/Resepsi/Galeri/Gift) via `SceneBackground` + scrim,
supaya tiap section terasa "di dalam dunia" & tak monoton. **Latar penuh, BUKAN transparan.**
**Rasio:** potret HP (1080×1920). **Atas-tengah lapang & lebih terang** (ruang teks).

```
STYLE: Cinematic, photorealistic 3D-render look. A luxurious fairytale TWILIGHT
atmosphere — deep indigo-violet dusk (#141024–#241C42), warm golden light and a rose
horizon glow (#C97B84), soft volumetric haze and gentle film grain. Elegant, magical,
high-end wedding mood. No people, no text, no logos.

A soft, atmospheric TWILIGHT sky and dreamy palace surroundings — deep indigo and violet
fading to a warm rose glow low on the horizon, faint golden stars, gentle haze, and only a
suggestion of distant golden spires along the very bottom. Calm and luminous, brightest and
most OPEN in the UPPER-CENTER to leave room for text. Low-contrast, elegant. No people, no text.
```

> Boleh generate 2–3 variasi (mis. `LatarSenja2`, `LatarSenja3`) untuk section berbeda.

---

### 4. ★ `SudutEmas.webp` — Ornamen sudut emas

**Pakai di:** sudut atas section (Cover/Greeting/Closing), bisa di-mirror.
**Rasio:** 1:1 (1024×1024), ornamen mengisi **satu sudut**, sisanya transparan.

```
STYLE: Ornate GOLD filigree ornament (royal gold #D4AF37 / candlelight #E8C874),
elegant fairytale line-art/silhouette, fully isolated on a 100% transparent background
(alpha) — no backdrop, no canvas color, no box, no text. Crisp clean cut-out edges.

An ornate gold corner flourish filling ONE corner (top-left) — royal scrollwork, fine
filigree curls, a small spire motif and delicate star accents, tapering toward the center.
The rest of the canvas empty and transparent.
```

---

### 5. ★ `BingkaiFoto.webp` — Cincin emas pembingkai foto

**Pakai di:** membingkai foto pasangan (foto bulat di tengah).
**Rasio:** 1:1 (1024×1024). **Tengah kosong/transparan** (lubang) untuk foto.

```
STYLE: Ornate GOLD filigree ornament (royal gold #D4AF37 / candlelight #E8C874),
elegant fairytale line-art/silhouette, fully isolated on a 100% transparent background
(alpha) — no backdrop, no canvas color, no box, no text. Crisp clean cut-out edges.

A delicate circular photo frame of ornate gold filigree with small star and spire accents,
like a gilded fairytale locket. The ENTIRE CENTER is completely empty and transparent (clean
round hole) for a photo to show through. Transparent inside and outside the ring.
```

---

### 6. ★ `PembatasEmas.webp` — Divider ornamen emas

**Pakai di:** pembatas tipis antar-section / di bawah nama.
**Rasio:** lebar (1536×512), elemen tipis di tengah, banyak ruang kosong.

```
STYLE: Ornate GOLD filigree ornament (royal gold #D4AF37 / candlelight #E8C874),
elegant fairytale line-art/silhouette, fully isolated on a 100% transparent background
(alpha) — no backdrop, no canvas color, no box, no text. Crisp clean cut-out edges.

A slim symmetrical horizontal gold divider — a fine filigree flourish extending left and
right from a small central star/diamond motif, curls tapering to points. Light and elegant,
lots of empty space above and below.
```

---

### 7. ○ `SiluetIstana.webp` — Siluet skyline istana

**Pakai di:** kaki `RoyalGate`/`Closing`. **Rasio:** lebar (2048×768), siluet di garis bawah,
dua-pertiga atas transparan.

```
STYLE: Ornate GOLD filigree ornament (royal gold #D4AF37 / candlelight #E8C874),
elegant fairytale line-art/silhouette, fully isolated on a 100% transparent background
(alpha) — no backdrop, no canvas color, no box, no text. Crisp clean cut-out edges.

A wide elegant SILHOUETTE of a fairytale castle skyline — many towers, spires, pennants and
turrets of varying heights along the BOTTOM edge, clean gold-edged silhouette. The top two-
thirds of the canvas empty and transparent.
```

---

### 8. ○ `MenaraSisi.webp` — Siluet menara tepi

**Pakai di:** tepi kiri/kanan section. **Rasio:** potret tinggi (512×1536), menara dari bawah
di satu sisi, sisanya transparan.

```
STYLE: Ornate GOLD filigree ornament (royal gold #D4AF37 / candlelight #E8C874),
elegant fairytale line-art/silhouette, fully isolated on a 100% transparent background
(alpha) — no backdrop, no canvas color, no box, no text. Crisp clean cut-out edges.

A slender fairytale TOWER silhouette rising from the bottom along ONE side, with a pointed
spire and a small pennant, gold-edged. The rest of the canvas empty and transparent.
```

---

### 9. ○ `Bulan.webp` — Bulan sabit keemasan

**Pakai di:** aksen langit (Cover/Closing), bisa glow halus. **Rasio:** 1:1 (1024×1024), ter-pusat.

```
STYLE: Ornate GOLD filigree ornament (royal gold #D4AF37 / candlelight #E8C874),
elegant fairytale line-art/silhouette, fully isolated on a 100% transparent background
(alpha) — no backdrop, no canvas color, no box, no text. Crisp clean cut-out edges.

A single elegant CRESCENT MOON in soft glowing gold (#E8C874) with a gentle luminous halo and
a few tiny stars nearby. Isolated and centered, transparent background.
```

---

### 10. ○ `BingkaiAtas.webp` — Bingkai lengkung ornamen atas

**Pakai di:** membingkai atas section seperti gapura. **Tengah & bawah transparan.**
**Rasio:** lebar/potret (1280×1024), padat di dua sudut atas, dua-pertiga bawah kosong.

```
STYLE: Ornate GOLD filigree ornament (royal gold #D4AF37 / candlelight #E8C874),
elegant fairytale line-art/silhouette, fully isolated on a 100% transparent background
(alpha) — no backdrop, no canvas color, no box, no text. Crisp clean cut-out edges.

An ornate gold ARCH framing the TOP — royal filigree and small spires arching across the top
and trailing DOWN both upper corners like a castle gateway. Denser at the corners, lighter at
top-center. The CENTER and entire BOTTOM empty and transparent.
```

---

## Partikel & Gradien — CSS, bukan gambar

```css
/* Gradien langit senja (fallback / dasar section) */
.twilight-sky {
  background:
    radial-gradient(70% 40% at 50% 100%, rgba(201,123,132,0.28), transparent 72%), /* horizon */
    linear-gradient(to bottom, #141024 0%, #1f1838 60%, #241c42 100%);
}
/* Scrim keterbacaan di atas foto */
.readability-scrim { background: linear-gradient(to bottom, rgba(20,16,36,0.15), rgba(20,16,36,0.55)); }
```

Fairy dust/bintang: titik kecil `--gold`/`--star` di-animasikan opacity/translate lambat via
Framer Motion (komponen `Stardust`/`Fireflies`; `prefers-reduced-motion` → statis).

---

## Aset ambient beranimasi — ornamen kastil (goyang/berkelip/melayang)

> Bikin undangan terasa **hidup** (seperti referensi: elemen bergerak loop). Tema
> **kastil**, TANPA daun/sulur/bunga (itu ciri soft-bloom/pavilion). Semua ornamen
> emas berkilau, **background transparan (alpha)**. Animasi loop di-wire di komponen
> (`CastleAmbient`, `SkyMagic`) dengan fallback aman.

**STYLE (tempel di tiap prompt di bagian ini):**
> `STYLE: A single ornate GOLD royal castle object, gilded metalwork with warm
> candlelight glow, luxurious fairytale TWILIGHT mood (deep indigo shadows, royal
> gold #D4AF37 / candlelight #E8C874, warm flame glow). Fully isolated on a 100%
> transparent background (alpha) — no backdrop, no scene, NO leaves, NO vines, NO
> flowers, no text. Crisp clean cut-out edges, high resolution.`

| # | File | Peran | Gerak (di komponen) |
|---|------|-------|---------------------|
| A1 | `LenteraGantung.webp` | Lentera gantung berantai, nyala api | ayun (sway) dari pangkal atas |
| A2 | `OborDinding.webp` | Obor dinding, lidah api | api berkedip (flicker) |
| A3 | `PanjiKerajaan.webp` | Panji panjang berlambang, tiang emas | berkibar (flutter) |
| A4 | `BenderaSegitiga.webp` | Untaian bendera segitiga (bunting) | berayun (sway) |
| A5 | `LenteraTerbang.webp` | Lentera langit menyala (Tangled) | melayang naik |
| A6 | `BintangJatuh.webp` | Bintang jatuh berekor cahaya | melesat diagonal |
| A7 | `Mahkota.webp` | Mahkota/lambang kerajaan berjewel | mengambang + kilau |

### A1. `LenteraGantung.webp` — Lentera gantung (potret, ~768×1024; rantai di tengah-atas)
```
STYLE: <tempel STYLE bagian ini>

An ornate golden hanging LANTERN suspended from a thin chain at the TOP-CENTER, with
warm glowing candle flame inside its glass panes. The chain reaches the top edge so it
appears to hang. Symmetrical, gilded, softly glowing. Nothing else in frame.
```

### A2. `OborDinding.webp` — Obor dinding (potret, ~640×1024; api di atas)
```
STYLE: <tempel STYLE bagian ini>

A golden WALL-MOUNTED TORCH bracket with a live, bright flame burning at the TOP. Ornate
gilded holder fixed to an unseen wall. Warm orange-gold flame glow. Nothing else in frame.
```

### A3. `PanjiKerajaan.webp` — Panji kerajaan (potret, ~640×1280; tiang di atas)
```
STYLE: <tempel STYLE bagian ini>

A long royal PENNANT BANNER hanging DOWN from a short horizontal gold pole at the TOP,
tapering to a pointed or swallow-tail bottom, bearing a small ornate crest emblem. Deep
indigo/velvet cloth with gold trim and tassel. Nothing else in frame.
```

### A4. `BenderaSegitiga.webp` — Bunting bendera segitiga (lebar, ~1536×512; tali di atas)
```
STYLE: <tempel STYLE bagian ini>

A horizontal string of small TRIANGULAR PENNANT FLAGS (bunting) hung on a thin gold cord
that droops gently, spanning left to right near the TOP. Alternating deep indigo, rose and
gold flags with fine gold trim. The lower half of the canvas empty and transparent.
```

### A5. `LenteraTerbang.webp` — Lentera terbang (1:1, ~1024×1024, ter-pusat)
```
STYLE: <tempel STYLE bagian ini>

A single glowing floating SKY LANTERN (ornate paper-and-gold lantern) lit warmly from
within, drifting in the air, seen slightly from below. Soft luminous halo. Nothing else
in frame.
```

### A6. `BintangJatuh.webp` — Bintang jatuh (diagonal, ~1024×512)
```
STYLE: <tempel STYLE bagian ini>

A SHOOTING STAR: a small bright golden star at the head with a long tapering trail of
light streaking diagonally from upper-right to lower-left, fading out. Luminous, delicate.
Nothing else in frame.
```

### A7. `Mahkota.webp` — Mahkota kerajaan (1:1, ~1024×1024, ter-pusat)
```
STYLE: <tempel STYLE bagian ini>

An ornate golden royal CROWN with a few jeweled accents (deep indigo & rose gems), viewed
from the front, glowing softly. Symmetrical, regal, gilded. Nothing else in frame.
```

---

## Konversi & Upload

**Ornamen (jaga alpha):**
```bash
cwebp -q 90 -alpha_q 100 SudutEmas.png -o SudutEmas.webp
```
**Foto latar (non-alpha, kompres lebih):** `cwebp -q 80 DuniaIstana.png -o DuniaIstana.webp`
**GerbangDepan (alpha, foto):** pastikan lubang transparan → `cwebp -q 86 -alpha_q 100 GerbangDepan.png -o GerbangDepan.webp`

Dev lokal: `themes/dongeng/kisah/twilight-castle/public/images/`

Upload R2 (wrangler `--remote`, **jangan** `pub-*.r2.dev` — diblok Kominfo; selalu
`assets-themes.rimba.io`):
```bash
npx wrangler r2 object put rimba-themes/dongeng/kisah/twilight-castle/GerbangDepan.webp \
  --file ./public/images/GerbangDepan.webp --content-type image/webp --remote
```

Referensi di komponen:
```tsx
import { asset } from "@/lib/assets"; // = ${NEXT_PUBLIC_THEMES_CDN}/dongeng/kisah/twilight-castle
<img src={asset("GerbangDepan.webp")} alt="" />
```

---

## Checklist Generate

**Inti gerbang (wajib):**
- [ ] `GerbangDepan.webp` ★★ — ruang gelap + jendela bulat, **lubang tengah transparan** (pasca-proses!)
- [ ] `DuniaIstana.webp` ★★ — istana golden-hour (latar)

**Wajib:**
- [ ] `LatarSenja.webp` ★ — latar section (boleh 2–3 variasi)
- [ ] `SudutEmas.webp` ★
- [ ] `BingkaiFoto.webp` ★
- [ ] `PembatasEmas.webp` ★

**Opsional:**
- [ ] `SiluetIstana.webp` ○
- [ ] `MenaraSisi.webp` ○
- [ ] `Bulan.webp` ○
- [ ] `BingkaiAtas.webp` ○

**CSS/Framer (tidak di-generate):**
- [x] Fairy dust/bintang → `Stardust`/`Fireflies`
- [x] Gradien twilight & glow horizon & scrim → CSS
- [x] Ikon fungsional → `lucide-react`

**Bersih-bersih:**
- [ ] Pindahkan/hapus 2 file referensi (`…_main home.webp`, `photo-…jpg`) sebelum build
