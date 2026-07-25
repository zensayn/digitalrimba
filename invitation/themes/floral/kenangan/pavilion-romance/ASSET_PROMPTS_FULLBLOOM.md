# Pavilion Romance — Prompt Aset Gelombang "Full Bloom & Pilar"

Lanjutan dari `ASSET_PROMPTS.md` (aset 1–25). Gelombang ini (aset 26–33) punya
tiga tujuan:

1. **Tiap section terasa penuh bunga** — bingkai bunga empat sisi, kolom tepi
   yang rimbun, dan hamparan bunga bawah yang lebih tinggi.
2. **Pilar dengan loop naik-turun** — pilar paviliun berdiri sendiri yang
   diberi animasi `floatSlow` (translateY melayang halus).
3. **Bunga yang bagian atasnya bergoyang** — aset dirancang dengan batang tipis
   di bawah sebagai pivot dan massa bunga di atas, sehingga animasi rotasi
   `sway`/`swaySoft` (transform-origin di pangkal) membuat **hanya bagian atas
   yang terlihat bergerak** sementara pangkalnya nyaris diam.

Semua aturan umum, palet, bunga utama, dan negative prompt di `ASSET_PROMPTS.md`
tetap berlaku. File ini punya dua mode pakai:

- **Prompt Batch** (bagian berikutnya): satu blok untuk di-paste **sekali** ke
  ChatGPT/GPT Image — dia akan generate semua 9 gambar berurutan, satu per satu.
- **Prompt Per Aset** (bagian bawah): prompt satuan lengkap, untuk regenerate
  satu aset yang hasilnya gagal tanpa mengulang seluruh batch.

> **Ingat batasan GPT Image:** output praktis hanya 1024×1024, 1536×1024, atau
> 1024×1536. Rasio pada spesifikasi aset adalah target crop pasca-generate.

---

## Daftar Aset Gelombang Ini

Legenda: `*` prioritas utama, `+` opsional setelah yang utama terpasang.

| # | File | Fungsi | Animasi | Prioritas |
|---|------|--------|---------|-----------|
| 26 | `GardenPillar.webp` | Pilar paviliun berdiri, tepi kiri/kanan section | `floatSlow` (naik-turun) | * |
| 27 | `PillarTopBouquet.webp` | Buket di puncak pilar, layer terpisah | `sway` (pivot bawah) | * |
| 28 | `BrokenPillarPlanter.webp` | Pedestal pendek + bunga tumpah, aksen pojok | `floatSlow` | + |
| 29 | `TallSwayBloom1.webp` / `2` | Bunga tangkai tinggi, atasnya bergoyang | `swaySoft` (pivot pangkal batang) | * |
| 30 | `FullBloomBorderFrame.webp` | Bingkai bunga penuh empat sisi section | statis / `breathe` | * |
| 31 | `LushSideGarden.webp` | Kolom bunga rimbun full-height tepi kiri/kanan | `swayFrame` | * |
| 32 | `MeadowBloomBand.webp` | Hamparan bunga bawah, lebih tinggi dari `BottomGardenCluster` | statis + layer sway | + |
| 33 | `HangingBloomChain.webp` | Untaian bunga menjuntai panjang dari atas | `sway` (pivot atas) | + |

**Cara mencapai "atas bunga bergoyang" tanpa memotong aset jadi dua layer:**
animasi rotasi dengan `transform-origin` di pangkal membuat perpindahan
sebanding jarak dari pivot — pangkal diam, puncak bergerak paling jauh. Jadi
kuncinya ada di komposisi aset: **batang/pangkal tipis tepat di bawah-tengah
kanvas, massa bunga terkonsentrasi di atas**. Prompt 29 dan 27 sudah menuntut
komposisi ini. Untuk pilar (26), bunga puncaknya sengaja dipisah ke aset 27
supaya pilar bisa melayang (`floatSlow`) sementara buketnya bergoyang (`sway`)
dengan ritme berbeda — dua gerak berlapis terlihat jauh lebih hidup daripada
satu gambar kaku.

**Rencana pemasangan komponen (garis besar, bukan bagian file ini):**

- `FloatingPillar.tsx` baru: wrapper `floatSlow` berisi `GardenPillar.webp` +
  child `PillarTopBouquet.webp` dengan `sway` dan `transformOrigin: 50% 100%`.
  Dipasang di tepi kiri/kanan Event, Couple, RSVP (mirror via `scaleX(-1)`).
- `TallBlooms.tsx` baru: barisan 2–3 `TallSwayBloom` di pinggir bawah section,
  masing-masing beda durasi/delay (pola `DUR` di `SectionDecor.tsx`).
- `FullBloomBorderFrame.webp` dipasang seperti `TopFrame.tsx` (absolute inset 0,
  `objectFit: cover` atau `contain` per section).
- Amplitudo `floatSlow` sekarang hanya -7px; untuk pilar besar pertimbangkan
  keyframe baru `pillarFloat` (±12–16px, durasi 7–9 dtk) supaya gerak terbaca.

---

## Prompt Batch — Sekali Paste, Generate Semua

Copy seluruh blok di bawah ini dan paste sekali ke ChatGPT (GPT Image). Dia
akan generate **9 gambar** berurutan sesuai manifest. Catatan pemakaian:

- GPT Image tetap menghasilkan **satu gambar per giliran** — blok ini membuat
  ChatGPT mengantri sendiri dan lanjut ke aset berikutnya. Kalau dia berhenti
  di tengah, cukup ketik: `continue with the next asset`.
- Kalau satu hasil gagal (pivot meleset, ada gazebo, dsb.), jangan ulang batch —
  pakai prompt satuan di bagian **Prompt Per Aset** plus catatan kurasi.
- Simpan tiap hasil sesuai nama file pada manifest, lalu konversi ke `.webp`.

```text
You are generating a batch of decorative image assets for a romantic garden
wedding invitation theme. There are 9 assets in the manifest below. Generate
them ONE IMAGE AT A TIME, in order, starting with asset 1. Before each image,
state the asset filename. After each image, immediately continue with the next
asset until all 9 are done. Never combine two assets into one image. Every
asset must follow the GLOBAL RULES and its assigned STYLE block exactly.

=== GLOBAL RULES (apply to every asset) ===
- 100% transparent background (alpha), clean alpha edges, clean cutout.
- No text, letters, numbers, watermark, logo, UI, browser, phone, or people.
- All elements fully opaque and fully rendered — no faded, washed-out, or
  half-erased ghost flowers, especially near canvas edges.
- Every sprig must connect to the main arrangement — no floating cut-off
  fragments.
- Keep the exact same palette, lighting, and painting style across all 9
  assets so they look like one matching set:
  ivory paper #F8F2E7, warm parchment #EFE4D2, sage leaf #7D9274, dusty rose
  #C98F8D, burgundy wine #7A2940, antique gold #B8955E, ink brown #3E3328.
- Flowers allowed: small garden roses, small peonies, ranunculus, sweet pea,
  jasmine, baby's breath, wild vine, ivy, fern, eucalyptus, sage leaves.
  No big tropical flowers, no neon colors, no shiny gold.

=== STYLE A (floral-only assets) ===
Romantic garden storybook botanical illustration, elegant but soft, ivory
parchment paper mood, sage green foliage, dusty rose and burgundy flowers,
small ivory blossoms, subtle antique gold accents. Delicate realistic
watercolor mixed with refined editorial wedding illustration, softly lit,
graceful, layered, premium but not dark. Original design, do not copy any
existing artwork. STRICT: flowers and foliage ONLY — absolutely no pavilion,
gazebo, arch, columns, architecture, ground, sky, or painted backdrop.

=== STYLE B (architecture assets) ===
Same as STYLE A, but the subject IS a piece of classical garden pavilion
architecture: antique carved warm ivory stone with delicate botanical
engravings and subtle antique-gold trim. Still softly lit, romantic,
storybook, not dark, not ruined. No background scenery behind it.

=== ASSET MANIFEST ===

ASSET 1 — GardenPillar.png — canvas 1024x1536 portrait — STYLE B
One single free-standing classical garden pillar, centered vertically, about
30% of canvas width, full height. Sage vines and small ivy wrap the shaft
naturally with a few dusty rose buds and tiny ivory blossoms, but the pillar
stays clearly readable as architecture. The top capital is simple, FLAT and
completely BARE — no flowers on top (a separate bouquet asset will be layered
there). Classic carved pedestal base. One pillar only: no pair, no arch, no
roof, no gazebo.

ASSET 2 — PillarTopBouquet.png — canvas 1024x1024 square — STYLE A
A lush overflowing bouquet designed to sit on top of the pillar from ASSET 1,
and matching its width: the bouquet base should look natural sitting on that
pillar's flat capital. The arrangement gathers into a narrow compact base
EXACTLY at the bottom center of the canvas (animation pivot point), then
blooms outward and upward like an urn arrangement: dusty rose garden roses,
one burgundy ranunculus, small peony buds, tiny ivory jasmine, baby's breath,
trailing sage vines spilling slightly down left and right. Top-heavy
silhouette, dense crown, narrow base. No pillar, urn, or vase in the image —
plants only.

ASSET 3 — BrokenPillarPlanter.png — canvas 1024x1024 square — STYLE B
A low broken classical column, about one third the height of a full pillar,
used as a romantic garden planter. Softly weathered but elegant, not gloomy.
It sits in the lower 60% of the canvas. From its top, an abundant arrangement
spills over the edges: sage foliage, ivy trailing down the sides, dusty rose
and burgundy flowers, small ivory blossoms, baby's breath. One single pedestal
only, no ground scenery.

ASSET 4 — TallSwayBloom1.png — canvas 1024x1536 portrait — STYLE A
One single tall garden flower stalk built for a wind-sway animation where only
the top moves. One slim graceful stem starts EXACTLY at the bottom center of
the canvas (animation pivot point) and rises nearly the full height with a
gentle natural curve. ALL flowers concentrated in the TOP THIRD: a spire of
dusty rose garden roses and buds like a hollyhock. Lower stem thin and mostly
bare, only sparse sage leaves. Generous transparent space on both sides.

ASSET 5 — TallSwayBloom2.png — canvas 1024x1536 portrait — STYLE A
Same construction as ASSET 4 (slim stem from exact bottom center, flowers only
in the top third, thin bare lower stem), but this variation blooms with deep
burgundy ranunculus and small peony buds instead of dusty rose, so the two
stalks read as sisters, not duplicates.

ASSET 6 — FullBloomBorderFrame.png — canvas 1024x1536 portrait — STYLE A
A full-page floral border frame covering ALL FOUR edges of the canvas like a
lush garden window. Dense sage foliage, ivy and fern run continuously along
the entire outer edge — corners richest, edges slightly lighter. Dusty rose
and burgundy flowers cluster at the four corners and bottom edge; small ivory
blossoms and baby's breath along the sides and top; subtle antique-gold seed
pods. The border must stay within the OUTER 15–20% of each side — the large
center area must be completely empty and transparent for text.

ASSET 7 — LushSideGarden.png — canvas 1024x1536 portrait — STYLE A
A lush tall wall of flowers rooted along the LEFT edge, running continuously
from top to bottom of the canvas. Densely layered sage foliage, ivy, fern and
eucalyptus form the body, with generous clusters of dusty rose garden roses,
burgundy ranunculus, small peonies, ivory jasmine and baby's breath along the
full height — richest in the lower half. Density hugs the left edge and
feathers into airy sprig tips toward the center; the RIGHT 55% of the canvas
must stay fully transparent. Full and abundant but each flower individually
readable — not a mushy blended mass.

ASSET 8 — MeadowBloomBand.png — canvas 1536x1024 landscape — STYLE A
A tall wide flowering meadow band rooted along the bottom edge. Multiple depth
layers like a storybook garden bed: a low dense hedge of sage foliage and ivy
at the very bottom; a middle layer of dusty rose and burgundy flowers with
small peonies and ranunculus; a top layer of taller thin stems with ivory
blossoms and baby's breath reaching upward with airy gaps. Flowers fill
roughly the LOWER 70% of the canvas with an irregular natural top edge (not a
straight line); the upper canvas stays fully transparent.

ASSET 9 — HangingBloomChain.png — canvas 1024x1536 portrait — STYLE A
One long hanging flower garland chain for a gentle pendulum sway. The garland
begins EXACTLY at the top center of the canvas (animation pivot point) and
trails downward in one graceful continuous curve to about 85% of canvas
height. Spine of sage leaves and small ivy, with alternating clusters of dusty
rose buds, one or two burgundy accents, tiny ivory jasmine and delicate
antique-gold seed pods — richer near the middle, tapering to a fine airy tip.
Airy and see-through, generous transparent space on both sides.

Now begin with ASSET 1.
```

---

## Prompt Per Aset (untuk regenerate satuan)

### 26. `GardenPillar.webp` — Pilar paviliun melayang

**Pakai di:** tepi kiri/kanan section (Event, Couple, RSVP), mirror via CSS.
Diberi loop `floatSlow`/`pillarFloat` (naik-turun halus) pada wrapper-nya.
**Rasio:** generate portrait 1024x1536. Pilar berdiri vertikal penuh di tengah
kanvas, ±30% lebar; sisa kanvas kiri/kanan transparan.
**Background:** transparan.
**Catatan penting:** puncak pilar dibuat **datar dan polos** — buket bunganya
adalah aset terpisah (27) yang ditumpuk via CSS supaya bisa bergoyang sendiri.

```text
STYLE: Romantic garden pavilion storybook botanical illustration, elegant but
soft, antique carved pavilion details, ivory parchment paper mood, sage green
foliage, dusty rose and burgundy flowers, small ivory blossoms, subtle antique
gold accents. Delicate realistic watercolor mixed with refined editorial wedding
illustration, softly lit, graceful, layered, premium but not dark. Clean high
resolution asset, no text, no watermark, no logo, no UI, no harsh shadow.
Do not copy any existing website or artwork; create an original garden pavilion
floral design with the same romantic classical mood.

A single free-standing classical garden pavilion pillar, isolated and centered
vertically on the canvas. Carved warm ivory stone with delicate botanical
engravings and subtle antique-gold trim lines. Sage vines and small ivy climb
and wrap around the shaft naturally, with a few dusty rose buds and tiny ivory
blossoms tucked into the vines — but keep the pillar clearly readable as
architecture, not buried in flowers. The top of the pillar is a simple flat
carved capital with NO flowers on top (a separate bouquet asset will be layered
there). The base is a classic carved pedestal. One complete pillar only: no
pair, no arch, no roof, no gazebo, no background scenery. Fully transparent
background, clean alpha edges.
```

---

### 27. `PillarTopBouquet.webp` — Buket puncak pilar

**Pakai di:** ditumpuk di atas capital `GardenPillar.webp`. Loop `sway` dengan
`transformOrigin: 50% 100%` — pangkal diam menempel pilar, mahkota bunga di
atas yang bergoyang.
**Rasio:** square 1024x1024. Pangkal buket rapat di **bawah-tengah** kanvas,
mekar melebar ke atas dan samping; sepertiga bawah kiri/kanan transparan.
**Background:** transparan.

```text
STYLE: Romantic garden pavilion storybook botanical illustration, elegant but
soft, ivory parchment paper mood, sage green foliage, dusty rose and burgundy
flowers, small ivory blossoms, subtle antique gold accents. Delicate realistic
watercolor mixed with refined editorial wedding illustration, softly lit,
graceful, layered, premium but not dark. Clean high resolution asset, no text,
no watermark, no logo, no UI, no harsh shadow. Do not copy any existing website
or artwork; create an original garden floral design with the same romantic
classical mood.

A lush overflowing flower bouquet designed to sit on top of a classical garden
pillar, flowers and foliage ONLY. The arrangement gathers into a narrow compact
base exactly at the bottom center of the canvas (this is the animation pivot),
then blooms outward and upward like an urn arrangement: dusty rose garden
roses, one burgundy ranunculus, small peony buds, tiny ivory jasmine, baby's
breath, trailing sage vines and ivy spilling slightly down the left and right
sides. Top-heavy silhouette, dense crown, narrow base. This is an isolated
botanical ornament, not a scene: no pillar, no urn, no vase, no architecture —
plants only. Every sprig connects to the main bouquet, all elements fully
opaque, no ghost petals. Fully transparent background, clean alpha edges.
```

---

### 28. `BrokenPillarPlanter.webp` — Pedestal pendek + bunga tumpah

**Pakai di:** aksen pojok bawah section yang lapang (Greeting, Gift, Closing);
mirror via CSS. Loop `floatSlow` pelan, atau statis dengan `breathe`.
**Rasio:** square 1024x1024. Konten duduk di ±60% bagian bawah kanvas.
**Background:** transparan.

```text
STYLE: Romantic garden pavilion storybook botanical illustration, elegant but
soft, antique carved pavilion details, ivory parchment paper mood, sage green
foliage, dusty rose and burgundy flowers, small ivory blossoms, subtle antique
gold accents. Delicate realistic watercolor mixed with refined editorial wedding
illustration, softly lit, graceful, layered, premium but not dark. Clean high
resolution asset, no text, no watermark, no logo, no UI, no harsh shadow.
Do not copy any existing website or artwork; create an original garden pavilion
floral design with the same romantic classical mood.

A short antique garden pedestal — a low broken classical column about one third
the height of a full pillar — used as a romantic planter. Carved warm ivory
stone with subtle antique-gold trim, softly weathered but elegant, not ruined
or gloomy. From its top, an abundant garden arrangement spills over the edges:
sage foliage, ivy trailing down the sides, dusty rose and burgundy flowers,
small ivory blossoms, baby's breath. The pedestal sits in the lower part of the
canvas with the flowers rising above it. One single pedestal only: no pair, no
arch, no gazebo, no ground scenery, no backdrop. Fully transparent background,
clean alpha edges.
```

---

### 29. `TallSwayBloom1.webp` / `TallSwayBloom2.webp` — Bunga tangkai tinggi

**Pakai di:** pinggir bawah section, berdiri dari tepi bawah seperti bunga
taman tinggi. Loop `swaySoft` dengan `transformOrigin: 50% 100%` — batang bawah
nyaris diam, mahkota bunga di atas bergoyang jelas. Pasang 2–3 batang dengan
durasi/delay berbeda supaya tidak serempak.
**Rasio:** generate portrait 1024x1536. Batang mulai tepat di **bawah-tengah**
kanvas (pivot), bunga terkonsentrasi di **sepertiga atas**; sisi kiri/kanan
sebagian besar transparan.
**Background:** transparan. Satu batang per file.

```text
STYLE: Romantic garden pavilion storybook botanical illustration, elegant but
soft, ivory parchment paper mood, sage green foliage, dusty rose and burgundy
flowers, small ivory blossoms, subtle antique gold accents. Delicate realistic
watercolor mixed with refined editorial wedding illustration, softly lit,
graceful, layered, premium but not dark. Clean high resolution asset, no text,
no watermark, no logo, no UI, no harsh shadow. Do not copy any existing website
or artwork; create an original garden floral design with the same romantic
classical mood.

A single tall garden flower stalk designed for a wind-sway loop where only the
top moves. One slim graceful stem starts exactly at the bottom center of the
canvas (this is the animation pivot) and rises nearly the full height with a
gentle natural curve. The flowers are concentrated in the TOP third of the
stalk — variation 1: a spire of dusty rose garden roses and buds like a
hollyhock; variation 2: deep burgundy ranunculus and small peony buds. Along
the stem: sparse sage leaves and one or two tiny ivory blossoms, airy and
delicate. Top-heavy bloom, thin bare lower stem, generous transparent space on
both sides. This is a small isolated botanical ornament, not a scene: no
pavilion, no architecture, no ground, no backdrop. All elements fully opaque.
Fully transparent background, clean alpha edges.
```

---

### 30. `FullBloomBorderFrame.webp` — Bingkai bunga penuh section

**Pakai di:** overlay `absolute inset-0` satu section penuh (Couple, Event,
RSVP) supaya section langsung terasa dikelilingi bunga; konten teks di tengah.
Bisa statis, atau `breathe` sangat pelan.
**Rasio:** generate portrait 1024x1536 (dipakai stretch/contain ke tinggi
section; kalau perlu versi mobile-tall, generate ulang dan crop).
**Background:** transparan. **Tengah harus benar-benar kosong dan lega.**

```text
STYLE: Romantic garden pavilion storybook botanical illustration, elegant but
soft, ivory parchment paper mood, sage green foliage, dusty rose and burgundy
flowers, small ivory blossoms, subtle antique gold accents. Delicate realistic
watercolor mixed with refined editorial wedding illustration, softly lit,
graceful, layered, premium but not dark. Clean high resolution asset, no text,
no watermark, no logo, no UI, no harsh shadow. Do not copy any existing website
or artwork; create an original garden floral design with the same romantic
classical mood.

A full-page floral border frame for a wedding invitation section, flowers and
foliage ONLY, covering all four edges of the canvas like a lush garden window.
Dense sage foliage, ivy and fern hug the entire outer edge continuously —
corners richest, edges slightly lighter. Dusty rose and burgundy flowers
cluster at the four corners and the bottom edge, small ivory blossoms and
baby's breath scatter along the sides and top, with subtle antique-gold seed
pods. The border occupies only the outer 15–20% on each side; the large center
area must stay completely empty and transparent for text. This is a plant
border, not a scene: no pavilion, no arch, no columns, no backdrop. Every sprig
connects to the border — no floating fragments. All elements fully opaque, no
ghost petals. Fully transparent background, clean alpha edges.
```

---

### 31. `LushSideGarden.webp` — Kolom bunga rimbun full-height

**Pakai di:** tepi kiri/kanan section yang ingin terasa "penuh bunga" tapi
tanpa bingkai empat sisi (Gallery, Greeting, DressCode); mirror via CSS.
Versi jauh lebih padat dari `EdgeBloomColumn` (aset 23) — kalau 23 "airy",
yang ini "rimbun". Loop `swayFrame` (±1°) supaya massa besar tetap hidup
tanpa terlihat lebay.
**Rasio:** generate portrait 1024x1536. Konten menempel tepi **kiri** kanvas
full-height, mengisi ±45% lebar; sisanya transparan.
**Background:** transparan.

```text
STYLE: Romantic garden pavilion storybook botanical illustration, elegant but
soft, ivory parchment paper mood, sage green foliage, dusty rose and burgundy
flowers, small ivory blossoms, subtle antique gold accents. Delicate realistic
watercolor mixed with refined editorial wedding illustration, softly lit,
graceful, layered, premium but not dark. Clean high resolution asset, no text,
no watermark, no logo, no UI, no harsh shadow. Do not copy any existing website
or artwork; create an original garden floral design with the same romantic
classical mood.

A lush tall garden wall of flowers rooted along the LEFT edge of the canvas,
plants ONLY, running continuously from top to bottom. Densely layered sage
foliage, ivy, fern and eucalyptus form the body, with generous clusters of
dusty rose garden roses, burgundy ranunculus, small peonies, ivory jasmine and
baby's breath distributed along the full height — richest in the lower half.
Subtle antique-gold seed pods as accents. Density hugs the left edge and
feathers into airy sprig tips toward the center; the right 55% of the canvas
must stay fully transparent. Full and abundant, but every flower fully rendered
and opaque — no mushy blended mass, no ghost petals. This is a plant border,
not a scene: absolutely no pavilion, gazebo, arch, columns, or painted backdrop.
Fully transparent background, clean alpha edges.
```

---

### 32. `MeadowBloomBand.webp` — Hamparan bunga bawah tinggi

**Pakai di:** dasar section pengganti/pelapis `BottomGardenCluster` di section
yang butuh kesan taman penuh (Cover, Closing, Event). Layer belakang statis;
di depannya bisa ditanam beberapa `TallSwayBloom` yang bergoyang supaya
hamparannya ikut terasa hidup.
**Rasio:** generate landscape 1536x1024. Isi bunga di ±70% bagian bawah
(lebih tinggi dari `BottomGardenCluster` yang hanya 60%); crop ke band 16:7
saat konversi.
**Background:** transparan.

```text
STYLE: Romantic garden pavilion storybook botanical illustration, elegant but
soft, ivory parchment paper mood, sage green foliage, dusty rose and burgundy
flowers, small ivory blossoms, subtle antique gold accents. Delicate realistic
watercolor mixed with refined editorial wedding illustration, softly lit,
graceful, layered, premium but not dark. Clean high resolution asset, no text,
no watermark, no logo, no UI, no harsh shadow. Do not copy any existing website
or artwork; create an original garden floral design with the same romantic
classical mood.

A tall wide flowering meadow band rooted along the bottom edge of the canvas,
flowers and foliage ONLY. Multiple depth layers like a storybook garden bed:
a low dense hedge of sage foliage and ivy at the very bottom, a middle layer of
dusty rose and burgundy flowers with small peonies and ranunculus, and a top
layer of taller thin stems with ivory blossoms and baby's breath reaching
upward with airy gaps between them. The flowers fill roughly the lower 70% of
the canvas, and the top edge of the meadow must be irregular and natural, not a
straight line. The upper part of the canvas stays fully transparent. This is a
plant border, not a scene: no pavilion, no gate, no arch, no pillars, no
architecture, no sky, no backdrop. Every sprig connects to the meadow — no
floating fragments. All elements fully opaque. Fully transparent background,
clean cutout.
```

---

### 33. `HangingBloomChain.webp` — Untaian bunga menjuntai panjang

**Pakai di:** menjuntai dari tepi atas section tinggi (Gallery, Event) sebagai
pasangan vertikal `TopBotanicalCanopy` — lebih panjang dan lebih berbunga dari
`SwayVineSprig`. Loop `sway` dengan `transformOrigin: 50% 0%` — gantungan atas
diam, ujung bawah berayun paling lebar.
**Rasio:** generate portrait 1024x1536. Untaian mulai tepat di **atas-tengah**
kanvas (pivot) dan menjuntai hingga ±85% tinggi; sisi kiri/kanan transparan.
**Background:** transparan.

```text
STYLE: Romantic garden pavilion storybook botanical illustration, elegant but
soft, ivory parchment paper mood, sage green foliage, dusty rose and burgundy
flowers, small ivory blossoms, subtle antique gold accents. Delicate realistic
watercolor mixed with refined editorial wedding illustration, softly lit,
graceful, layered, premium but not dark. Clean high resolution asset, no text,
no watermark, no logo, no UI, no harsh shadow. Do not copy any existing website
or artwork; create an original garden floral design with the same romantic
classical mood.

A long hanging flower garland chain designed for a gentle pendulum sway loop.
The garland begins exactly at the top center of the canvas (this is the
animation pivot) and trails downward in one graceful continuous curve to about
85% of the canvas height. Along the chain: sage leaves and small ivy as the
spine, with alternating clusters of dusty rose buds, one or two burgundy
accents, tiny ivory jasmine, and delicate antique-gold seed pods — richer near
the middle, tapering to a fine airy tip at the bottom. Airy and see-through,
generous transparent space on both sides. This is a small isolated botanical
ornament, not a scene: no pavilion, no arch, no architecture, no backdrop. All
elements fully opaque. Fully transparent background, clean alpha edges.
```

---

## Urutan Generate Yang Disarankan

Kalau memakai **Prompt Batch**, urutan sudah diatur di manifest (pilar dan
buketnya berurutan supaya skalanya nyambung) — bagian ini hanya untuk mode
generate satuan:

1. `GardenPillar.webp` + `PillarTopBouquet.webp` — generate berurutan dan
   pastikan skala/gaya keduanya cocok sebelum lanjut (pasangan wajib).
2. `TallSwayBloom1.webp` / `TallSwayBloom2.webp` — efek "atas bergoyang"
   paling terlihat.
3. `FullBloomBorderFrame.webp` — dampak "section penuh bunga" paling instan.
4. `LushSideGarden.webp`
5. `MeadowBloomBand.webp`
6. `BrokenPillarPlanter.webp` dan `HangingBloomChain.webp` — pemanis terakhir.

---

## Naming & Upload

Sama seperti gelombang sebelumnya:

```bash
npx wrangler r2 object put rimba-themes/floral/kenangan/pavilion-romance/GardenPillar.webp \
  --file public/images/GardenPillar.webp --remote
```

Simpan salinan dev lokal di:

```text
themes/floral/kenangan/pavilion-romance/public/images/
```

---

## Catatan Kurasi Khusus Gelombang Ini

Semua catatan kurasi `ASSET_PROMPTS.md` tetap berlaku (ghost petals,
checkerboard, gazebo tak diminta, dsb.). Tambahan:

- **Pilar (26, 28):** kalau model menambahkan bunga di puncak `GardenPillar`,
  regenerate dengan: "the top capital must be completely flat and bare, no
  flowers on top of the pillar." Buket puncak memang aset terpisah.
- **Pasangan 26+27:** setelah keduanya jadi, tumpuk cepat di editor gambar
  untuk cek proporsi — lebar pangkal buket idealnya ±80–110% lebar capital
  pilar. Kalau meleset jauh, regenerate buketnya, bukan pilarnya.
- **Pivot meleset:** aset sway hanya berfungsi kalau pangkalnya benar-benar di
  titik yang dijanjikan (bawah-tengah untuk 27/29, atas-tengah untuk 33).
  Kalau pangkal geser ke samping, regenerate dengan: "the stem base must start
  exactly at the bottom center of the canvas."
- **Bunga terlalu merata (29):** kalau bunga tersebar di sepanjang batang,
  minta: "concentrate all flowers in the top third, keep the lower stem thin
  and mostly bare."
- **Frame 30 makan area teks:** kalau border melebar ke tengah, minta:
  "keep the border within the outer 15% of each edge, enlarge the empty
  transparent center."
- **Massa rimbun jadi bubur (31, 32):** kalau bunga melebur jadi tekstur tak
  jelas, minta: "reduce density by 30%, each flower individually readable,
  crisp petal edges."

---

# Gelombang Kanopi Desktop — Aset 34–35

Masalah yang diselesaikan: di **cover desktop** (layar lebar), kanopi
`TopFrame` hanya menggantung di tengah (maxWidth 760px) sehingga pojok
kiri-kanan atas kosong — bentukannya tidak full kiri-kanan dan sisinya tidak
turun menyambung ke bawah.

| # | File | Fungsi | Animasi | Prioritas |
|---|------|--------|---------|-----------|
| 34 | `WideCanopyGarland.webp` | Kanopi bunga SELEBAR layar untuk cover desktop — padat sampai menyentuh kedua tepi kanvas | statis + juntaian `sway` terpisah | * |
| 35 | `CanopySideCascade.webp` | Kaskade sudut: massa bunga dari pojok atas mengalir turun sepanjang tepi (dipakai kiri, mirror kanan) — menyambungkan kanopi ke bawah | `swayFrame` (pivot tepi atas) | * |

**Rencana pemasangan (`DesktopCover.tsx`):** `WideCanopyGarland` menggantikan
`TopFrame` di panel desktop saja (absolute top 0, width 100%,
`objectFit: cover`, `objectPosition: top`); sepasang `CanopySideCascade`
absolute di pojok kiri/kanan atas (`top: 0`, `width: clamp(200px, 18vw,
340px)`, kanan `scaleX(-1)`), turun ±55–70vh di belakang konten (z di bawah
teks). `TopFrame` lama tetap dipakai di kolom mobile.

## Prompt Batch Kanopi — Sekali Paste, Generate Keduanya

```text
You are generating a batch of decorative image assets for a romantic garden
wedding invitation theme. There are 2 assets in the manifest below. Generate
them ONE IMAGE AT A TIME, in order, starting with asset 1. Before each image,
state the asset filename. Never combine two assets into one image. Every
asset must follow the GLOBAL RULES and STYLE exactly.

=== GLOBAL RULES (apply to every asset) ===
- 100% transparent background (alpha), clean alpha edges, clean cutout.
- No text, letters, numbers, watermark, logo, UI, browser, phone, or people.
- All elements fully opaque and fully rendered — no faded, washed-out, or
  half-erased ghost flowers, especially near canvas edges.
- Every sprig must connect to the main arrangement — no floating cut-off
  fragments.
- Palette and painting style must match one existing set:
  ivory paper #F8F2E7, warm parchment #EFE4D2, sage leaf #7D9274, dusty rose
  #C98F8D, burgundy wine #7A2940, antique gold #B8955E, ink brown #3E3328.
- Flowers allowed: small garden roses, small peonies, ranunculus, sweet pea,
  jasmine, baby's breath, wild vine, ivy, fern, eucalyptus, sage leaves.
  No big tropical flowers, no neon colors, no shiny gold.

=== STYLE (floral-only) ===
Romantic garden storybook botanical illustration, elegant but soft, ivory
parchment paper mood, sage green foliage, dusty rose and burgundy flowers,
small ivory blossoms, subtle antique gold accents. Delicate realistic
watercolor mixed with refined editorial wedding illustration, softly lit,
graceful, layered, premium but not dark. Original design, do not copy any
existing artwork. STRICT: flowers and foliage ONLY — absolutely no pavilion,
gazebo, arch, columns, architecture, ground, sky, or painted backdrop.

=== ASSET MANIFEST ===

ASSET 1 — WideCanopyGarland.png — canvas 1536x1024 landscape
A wide hanging flower canopy designed to span the FULL width of a widescreen
wedding cover. A continuous lush garland runs along the ENTIRE top edge and
must stay dense all the way into BOTH top corners — the arrangement BLEEDS OFF
the left and right edges of the canvas (cut by the canvas edge, not tapering
before it; this is critical, no empty gap may remain at either end). Dusty
rose garden roses, small peonies, burgundy ranunculus, ivory jasmine and
baby's breath sit in the top 40%, slightly denser at the center and at both
corners. From the garland, trailing sage vines, ivy and wisteria-like sweet
pea strands hang DOWN at irregular, varied lengths reaching 60–75% of the
canvas height. The bottom 25% of the canvas stays fully transparent.

ASSET 2 — CanopySideCascade.png — canvas 1024x1536 portrait
A corner cascade that connects a top flower canopy down the side of the
screen. A dense mass of sage foliage, dusty rose roses, burgundy ranunculus
and ivory blossoms fills the TOP-LEFT corner and hugs the full LEFT edge,
flowing downward in a graceful tapering waterfall: richest in the top third,
thinning into airy ivy and baby's-breath sprig tips that end around 85% of
the canvas height. Density hugs the top and left edges and BLEEDS OFF both
(cut by the canvas edge, not floating). The RIGHT 55% and the bottom 15% of
the canvas must stay fully transparent. Built to be mirrored for the right
side of the screen.
```

## Catatan Kurasi Kanopi

- **Ujung garland menipis sebelum tepi (34):** justru kebalikan yang diminta —
  regenerate dengan: "the garland must be cut off by the left and right canvas
  edges at full density, no tapering, no gap at either end."
- **Kaskade melayang lepas dari sudut (35):** minta: "the arrangement must be
  attached to the top-left corner and bleed off the top and left edges."
- Setelah jadi: rename ke `.webp`, upload ke R2
  `rimba-themes/floral/kenangan/pavilion-romance/` (via
  `npx wrangler r2 object put ... --remote`), lalu minta pemasangan di
  `DesktopCover.tsx`.
