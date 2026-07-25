# Pavilion Romance — Prompt Generate Aset Gambar

Panduan generate elemen dekoratif untuk template **pavilion-romance** (kategori
floral · tier kenangan · Tier 1). Generate aset lewat GPT Image di website,
lalu konversi hasil PNG ke `.webp` dan upload ke R2.

> **Konsep: Garden Pavilion Storybook.** Undangan floral seperti halaman buku
> cerita pernikahan di taman klasik: kertas ivory, gerbang paviliun, bingkai ukir
> antique, dedaunan sage, bunga dusty rose, burgundy, ivory, dan aksen gold tua.
> Ambil rasa romantis-elegan dari referensi, tetapi jangan meniru komposisi,
> frame, ornamen, atau ilustrasi secara identik.

---

## Aturan Umum

**Format teknis:**
- Untuk ornamen/frame: **background 100% transparan** (alpha).
- Untuk scene/latar: boleh full background, disebut eksplisit di prompt.
- Tidak ada teks, watermark, logo, angka, atau tulisan dekoratif.
- Tidak ada mockup UI, button, browser, HP, atau elemen website.
- Tepi bersih, resolusi tinggi, komposisi rapi, cocok untuk dipotong menjadi
  aset web.
- Setelah generate: konversi ke `.webp` transparan jika asetnya ornament/frame.

**Palet wajib konsisten:**
- Ivory paper: `#F8F2E7`
- Warm parchment: `#EFE4D2`
- Sage leaf: `#7D9274`
- Dusty rose: `#C98F8D`
- Burgundy wine: `#7A2940`
- Antique gold: `#B8955E`
- Ink brown: `#3E3328`

**Bunga utama:**
- garden rose kecil, peony kecil, ranunculus, sweet pea, jasmine, baby's breath,
  wild vine, ivy, fern, eucalyptus, dan daun sage.
- Hindari bunga tropis besar yang terlalu ramai, neon color, dan gold mengilap.

**Gaya global, tempel di awal setiap prompt:**

```text
STYLE: Romantic garden pavilion storybook botanical illustration, elegant but
soft, antique carved pavilion details, ivory parchment paper mood, sage green
foliage, dusty rose and burgundy flowers, small ivory blossoms, subtle antique
gold accents. Delicate realistic watercolor mixed with refined editorial wedding
illustration, softly lit, graceful, layered, premium but not dark. Clean high
resolution asset, no text, no watermark, no logo, no UI, no harsh shadow.
Do not copy any existing website or artwork; create an original garden pavilion
floral design with the same romantic classical mood.
```

> **Penting:** untuk aset non-arsitektur (ikon event, vine, semak, divider, sway
> sprig, petal), **hapus frasa "antique carved pavilion details"** dari blok
> STYLE sebelum dipakai. Frasa itu terbukti membuat model menggambar gazebo/
> paviliun utuh pada aset yang seharusnya ornamen tumbuhan kecil (kasus:
> `EventIconResepsi`, `BottomGardenCluster`, `SideBotanicalVines`).

**Negative prompt, tambahkan bila GPT Image mulai terlalu ramai:**

```text
Avoid: text, letters, numbers, watermark, logo, people, faces, hands, wedding
couple, UI mockup, phone screen, browser frame, harsh black outlines, neon
colors, plastic flowers, overly shiny gold, symmetrical copy-paste artifacts,
flat clipart, SVG icon style, blurry edges, opaque white background.
```

---

## Daftar Aset

Legenda: `*` wajib untuk template awal, `+` opsional setelah layout dasar jadi.

| # | File | Fungsi | Prioritas |
|---|------|--------|-----------|
| 1 | `HeroPavilionFrame.webp` | Bingkai utama cover untuk foto/video pasangan | * |
| 2 | `TopBotanicalCanopy.webp` | Kanopi bunga atas cover/section | * |
| 3 | `BottomGardenCluster.webp` | Semak bunga bawah cover/closing | * |
| 4 | `PavilionArch.webp` | Arch besar untuk countdown / save the date | * |
| 5 | `EventIconAkad.webp` | TIDAK DIPAKAI — fitur Kisah, dilepas saat turun ke tier Kenangan | – |
| 6 | `EventIconResepsi.webp` | TIDAK DIPAKAI — fitur Kisah, dilepas saat turun ke tier Kenangan | – |
| 7 | `StoryFrame.webp` | TIDAK DIPAKAI — fitur Kisah (love story), dilepas saat turun ke tier Kenangan | – |
| 8 | `VideoFrame.webp` | TIDAK DIPAKAI — fitur Kisah (galeri video), dilepas saat turun ke tier Kenangan | – |
| 9 | `GalleryFrame.webp` | Frame foto galeri 25 foto | * |
| 10 | `FloralDividerKisah.webp` | Divider ornamental antar-section | * |
| 11 | `SideBotanicalVines.webp` | Ranting samping kiri/kanan | + |
| 12 | `PetalDrift1.webp` / `2` / `3` | Animasi kelopak ringan | + |
| 13 | `PaperTextureKisah.webp` | Tekstur kertas halus | + |
| 14 | `ClosingGardenPavilion.webp` | Latar closing full scene | * |
| 15 | `WeddingWishFrame.webp` | Frame form Wedding Wish | + |
| 16 | `LatarPavilionGarden.webp` | Background cover / desktop cover | * |
| 17 | `LatarBotanicalBokeh.webp` | Background lembut untuk section story/gallery | * |
| 18 | `LatarParchmentVines.webp` | Background kertas + dedaunan samar | + |
| 19 | `SwayRoseCluster.webp` | Bunga murni untuk loop bergoyang | * |
| 20 | `SwayVineSprig.webp` | Tangkai menjuntai untuk loop bergoyang | * |
| 21 | `SwayLeafBranch.webp` | Daun/ranting samping untuk loop bergoyang | + |
| 22 | `CornerGardenBouquet.webp` | Buket rimbun pojok kiri/kanan bawah | + |
| 23 | `EdgeBloomColumn.webp` | Kolom bunga penuh tepi kiri/kanan | + |
| 24 | `CornerFernSpray.webp` | Semburat pakis pojok bawah (variasi ringan) | + |
| 25 | `EdgePeekSprig.webp` | Tangkai menyembul dari tengah tepi kiri/kanan | + |

> **Konteks aset 22–25:** saat ini tepi kiri/kanan hanya diisi `SwayVineSprig`
> (juntaian tipis dari atas) dan pojok bawah hanya `SwayRoseCluster` kecil yang
> di-mirror di semua section. Empat aset ini khusus mengisi area yang masih
> kosong: pojok kiri/kanan bawah (22, 24) dan badan tepi kiri/kanan (23, 25).
> Prompt-nya sudah menyertakan blok STYLE lengkap (versi tanpa "antique carved
> pavilion details") jadi bisa langsung di-copy tanpa scroll ke atas.

---

## Prompt Per Aset

### 1. `HeroPavilionFrame.webp` — Bingkai utama cover

**Pakai di:** cover opening/hero, membingkai foto atau video pasangan.  
**Rasio:** portrait 3:4 atau 4:5, 1536x2048.  
**Background:** transparan. Tengah harus kosong/transparan untuk konten.

```text
STYLE: <tempel blok STYLE di atas>

Create an ornate vertical garden pavilion frame for a wedding invitation hero.
The frame should look like antique carved wood mixed with carved warm stone,
with delicate botanical reliefs, subtle antique gold highlights, and climbing
sage vines. Around the frame: dusty rose, burgundy ranunculus, tiny ivory
jasmine, baby's breath, and soft fern leaves. The center must be completely
empty and transparent, shaped like a tall arched portrait window for placing a
photo or video. Elegant, romantic, storybook, refined. Fully isolated on a 100%
transparent background with clean alpha edges.
```

---

### 2. `TopBotanicalCanopy.webp` — Kanopi bunga atas

**Pakai di:** bagian atas cover, greeting, closing.  
**Rasio:** generate landscape 1536x1024 (output GPT Image), isi kanopi hanya di
±55% bagian atas dengan sisa kanvas transparan; crop ke band 16:5 saat konversi.  
**Background:** transparan.

```text
STYLE: <tempel blok STYLE di atas>

A wide top botanical canopy for a romantic garden wedding invitation. Hanging
sage vines, soft eucalyptus, small ivory blossoms, dusty rose flowers, a few
deep burgundy accents, and tiny antique-gold botanical details. The composition
is denser at the top edge and softly trails downward, leaving the lower half
mostly transparent for text. Natural asymmetry, graceful, not crowded. Every
flower and leaf must be fully rendered and fully opaque — no faded, washed-out,
or half-erased ghost flowers, especially near the left and right edges. Flowers
and foliage only: no pavilion, no arch, no columns, no architecture. Fully
transparent background.
```

---

### 3. `BottomGardenCluster.webp` — Semak bunga bawah

**Pakai di:** bawah cover, bawah event, closing.  
**Rasio:** generate landscape 1536x1024 (output GPT Image), isi semak hanya di
±60% bagian bawah dengan sisa kanvas transparan; crop ke band 16:6 saat konversi.  
**Background:** transparan.

```text
STYLE: <tempel blok STYLE di atas>

A wide bottom garden floral border rooted along the lower edge, made of flowers
and foliage ONLY. Layered sage foliage, ivy, fern, dusty rose and burgundy
flowers, small ivory blossoms, and subtle antique-gold seed pods. The flowers
rise upward from the bottom like a low garden hedge, with the top half fully
transparent. This is a plant border, not a scene: absolutely no pavilion, no
gate, no arch, no pillars, no stairs, no architecture of any kind. Every sprig
must connect to the main border — no floating cut-off fragments near the edges.
Romantic, elegant, storybook garden mood. Fully transparent background, clean
cutout.
```

---

### 4. `PavilionArch.webp` — Arch event / countdown

**Pakai di:** countdown, save the date, event detail card.  
**Rasio:** portrait 4:5, 1536x1920.  
**Background:** transparan. Tengah kosong.

```text
STYLE: <tempel blok STYLE di atas>

An elegant antique garden pavilion arch, inspired by classical wedding garden
architecture. Carved warm stone pillars with delicate botanical engravings,
subtle antique gold trim, sage vines climbing around the sides, dusty rose and
burgundy florals at the base and upper corners. The center must stay empty and
transparent for placing countdown numbers or event information. Refined and
romantic, not heavy, not dark. Fully transparent background.
```

---

### 5. `EventIconAkad.webp` — Icon custom Akad

**Pakai di:** section akad.  
**Rasio:** square 1024x1024.  
**Background:** transparan.

```text
STYLE: <tempel blok STYLE di atas>

A small custom wedding event ornament for "Akad" without any text. Combine an
elegant open book silhouette, two small wedding rings, sage leaves, ivory
jasmine, dusty rose buds, and a tiny antique-gold accent. It should feel like a
refined botanical icon, still painterly and detailed, not flat vector. Centered
composition, fully transparent background.
```

---

### 6. `EventIconResepsi.webp` — Icon custom Resepsi

**Pakai di:** section resepsi.  
**Rasio:** square 1024x1024.  
**Background:** transparan.

```text
STYLE: <tempel blok STYLE di atas>

A single small wedding event emblem for "Resepsi" without any text: a delicate
pair of toasting glasses tied with a subtle antique-gold ribbon, wrapped by sage
leaves, dusty rose flowers, burgundy accents, and ivory baby's breath. One
compact centered ornament that stays readable at 64 pixels, matching the scale,
density, and painterly style of its companion Akad icon (an open book with two
rings). This is a small emblem, NOT a scene: do not draw a pavilion, gazebo,
garden, stairs, or any architecture, and no misty semi-transparent white
foliage clouds around it. Render the empty upper part of the glasses as plain
translucent watercolor glass — never paint a gray-and-white checkerboard
"transparency" pattern inside them. Painterly refined botanical icon, centered,
fully transparent background.
```

---

### 7. `StoryFrame.webp` — Frame Love Story

**Pakai di:** Love Story timeline/chapter.  
**Rasio:** landscape 4:3, 1600x1200.  
**Background:** transparan. Tengah kosong.

```text
STYLE: <tempel blok STYLE di atas>

A romantic storybook photo frame for a Love Story section. Thin antique carved
paper frame with botanical corners, sage vine details, dusty rose and burgundy
flowers, tiny ivory blossoms. The center must be empty and transparent for a
photo. Add a subtle scrapbook feeling through layered parchment edges, but no
tape, no text, no labels. Elegant and personal, not childish. Fully transparent
background.
```

---

### 8. `VideoFrame.webp` — Frame galeri video

**Pakai di:** satu video highlight.  
**Rasio:** generate landscape 1536x1024 (output GPT Image, 3:2).
**Catatan kode:** `VideoSection.tsx` menempatkan video 16:9 di bukaan antar-pilar
kanvas 3:2 (x ±12–79%, bukaan asimetris — pilar kanan lebih tebal). Kalau frame
di-regenerate, pertahankan proporsi pilar yang serupa, atau ukur ulang bukaannya
dan sesuaikan angka `left`/`width` di `VideoSection.tsx`.  
**Background:** transparan. Tengah kosong.

```text
STYLE: <tempel blok STYLE di atas>

A wide 16:9 botanical frame for a wedding video highlight. Refined antique
garden frame with subtle pavilion motifs on the left and right, floral corners,
sage vines, dusty rose and burgundy blossoms, small ivory flowers, and soft
antique-gold accents. The center must be fully transparent and clean for video.
Keep the frame elegant and not too thick. Fully transparent background.
```

---

### 9. `GalleryFrame.webp` — Frame foto galeri

**Pakai di:** galeri foto 25 foto, bisa dipakai berulang.  
**Rasio:** square 1200x1200.  
**Background:** transparan. Tengah kosong.

```text
STYLE: <tempel blok STYLE di atas>

A square botanical gallery photo frame, light and reusable. Thin ivory parchment
edge with sage vines crossing two corners, dusty rose and burgundy flower
clusters, tiny ivory blossoms, subtle antique-gold line detail. The center must
be empty and transparent for a photo. Balanced, elegant, not too dense. Fully
transparent background.
```

---

### 10. `FloralDividerKisah.webp` — Divider ornamental

**Pakai di:** pemisah section.  
**Rasio:** generate landscape 1536x1024 (output GPT Image), band bunga di tengah
vertikal kanvas; crop ke band 16:4 saat konversi.
**Catatan kode:** `FloralDivider.tsx` meng-crop hardcoded ke band x 0–77,2% /
y 38–58,7% dari kanvas lama. Kalau aset di-regenerate, minta komposisi yang
benar-benar di tengah, lalu sesuaikan angka crop di komponen itu.  
**Background:** transparan.

```text
STYLE: <tempel blok STYLE di atas>

A horizontal floral divider for an elegant wedding invitation. Symmetrical but
natural: a central small burgundy flower, dusty rose buds, ivory blossoms, sage
leaves, thin vines extending left and right, with tiny antique-gold dots. Center
the arrangement exactly at the horizontal and vertical middle of the canvas,
with the thin vines reaching equally close to the left and right edges. Slim,
delicate, more ornamental than a basic divider but not crowded. Lots of empty
transparent space above and below. Fully transparent background.
```

---

### 11. `SideBotanicalVines.webp` — Ranting samping

**Pakai di:** kiri/kanan event, cover, closing; mirror via CSS.  
**Rasio:** generate portrait 1024x1536 (output GPT Image), vine memanjang penuh
secara vertikal; crop sisi kosong kiri/kanan ke ±1:3 saat konversi.  
**Background:** transparan.

```text
STYLE: <tempel blok STYLE di atas>

A tall vertical botanical vine for the side edge of a wedding invitation,
plants ONLY. Trailing sage leaves, ivy, small ivory blossoms, dusty rose
flowers, a few deep burgundy accents, and subtle antique-gold seed pods. The
vine flows downward naturally from top to bottom, with generous transparent
negative space around it. It must stay airy and see-through: not a solid wall
of flowers, and absolutely no pavilion, gazebo, arch, columns, interior scenery,
or opaque painted backdrop behind the vine. Fully transparent background.
```

---

### 12. `PetalDrift1.webp` / `PetalDrift2.webp` / `PetalDrift3.webp`

**Pakai di:** animasi kelopak ringan di cover/closing.  
**Rasio:** square 1024x1024.  
**Background:** transparan. Satu elemen per file.

```text
STYLE: <tempel blok STYLE di atas>

A single small drifting flower petal or tiny blossom, isolated and centered.
Variation 1: dusty rose petal. Variation 2: burgundy small petal. Variation 3:
tiny ivory jasmine blossom. Soft natural detail, no stem, no shadow, fully
transparent background, clean alpha edges.
```

---

### 13. `PaperTextureKisah.webp` — Tekstur kertas

**Pakai di:** background halus seluruh halaman jika CSS saja kurang hidup.  
**Rasio:** portrait 1440x2400 atau tileable 1024x1024.  
**Background:** opaque, bukan transparan.

```text
STYLE: Romantic ivory parchment paper texture, warm ivory and soft beige tones,
very subtle handmade paper grain, faint botanical fibers, elegant wedding
stationery feel. No flowers, no text, no border, no stains, no dark vignette.
Seamless or very softly repeatable, low contrast, suitable as a web page
background. Opaque full background.
```

---

### 14. `ClosingGardenPavilion.webp` — Scene closing

**Pakai di:** closing full background / desktop cover ending.  
**Rasio:** portrait 9:16, 1440x2560.  
**Background:** full scene, bukan transparan.

```text
STYLE: <tempel blok STYLE di atas>

A romantic garden pavilion scene for the closing section of a digital wedding
invitation. A soft ivory garden pavilion in the distance, surrounded by sage
green foliage, dusty rose and burgundy flowers, small ivory blossoms, warm
morning light, gentle depth, elegant storybook atmosphere. Leave a calm bright
empty area in the upper-middle for text overlay. No people, no text, no logo,
no harsh contrast. Full background image, not transparent.
```

---

### 15. `WeddingWishFrame.webp` — Frame form ucapan

**Pakai di:** Wedding Wish form.  
**Rasio:** portrait 4:5, 1536x1920.  
**Background:** transparan. Tengah cukup kosong untuk form.

```text
STYLE: <tempel blok STYLE di atas>

A light botanical frame for a wedding wish form. Thin ivory parchment border,
small floral clusters in the top-left and bottom-right corners, sage leaves,
dusty rose and burgundy blossoms, tiny ivory flowers, subtle antique-gold line
accents. The center must stay mostly empty and transparent for form fields.
Keep the border consistent on all four sides: no large column, pillar, or
drapery fragment floating half-cut on one side of the frame. Elegant, calm,
readable, not busy. Fully transparent background.
```

---

### 16. `LatarPavilionGarden.webp` — Background cover / desktop cover

**Pakai di:** cover utama, desktop cover, opening gate bila ingin lebih immersive.  
**Rasio:** portrait 9:16, 1440x2560.  
**Background:** full scene, bukan transparan.

```text
STYLE: <tempel blok STYLE di atas>

A romantic garden pavilion background for a floral wedding invitation cover.
An elegant ivory pavilion or garden arch in the distance, surrounded by soft
sage trees, climbing vines, dusty rose and burgundy flowers near the edges, and
warm diffused morning light. Leave the center upper area calm and bright for
wedding names and invitation text. The scene should feel like a refined
storybook garden, airy and elegant, not dark, not crowded, no people, no text,
no logo. Full background image, not transparent.
```

---

### 17. `LatarBotanicalBokeh.webp` — Background story/gallery

**Pakai di:** Love Story, gallery, video section.  
**Rasio:** portrait 9:16, 1440x2560.  
**Background:** full scene, bukan transparan.

```text
STYLE: <tempel blok STYLE di atas>

A soft botanical bokeh background for a romantic wedding story section. Ivory
parchment glow, blurred garden foliage, faint dusty rose and burgundy flowers
around the edges, sage green leaves, subtle warm antique-gold light flecks. The
middle area must stay clean and low-contrast for photo cards and text overlay.
Elegant, soft, layered, not busy, no text, no people. Full background image,
not transparent.
```

---

### 18. `LatarParchmentVines.webp` — Background kertas + vines samar

**Pakai di:** greeting, RSVP, wedding wish, gift.  
**Rasio:** portrait 9:16, 1440x2560.  
**Background:** full scene, bukan transparan.

```text
STYLE: <tempel blok STYLE di atas>

A refined ivory parchment background with very subtle botanical vines along the
left and right edges. Warm paper grain, faint sage leaves, tiny dusty rose and
ivory blossoms, very low contrast, lots of empty readable space in the center.
No border frame, no text, no logo, no people. Soft wedding stationery mood,
elegant and calm. Full background image, not transparent.
```

---

### 19. `SwayRoseCluster.webp` — Bunga murni untuk loop angin

**Pakai di:** ambient flower cluster yang diberi animasi CSS `sway` / `swayAlt`.  
**Rasio:** square 1024x1024.  
**Background:** transparan. Anchor visual di bawah/tangkai.

```text
STYLE: <tempel blok STYLE di atas>

A single isolated flower cluster designed to sway gently in a loop, like moved
by a soft breeze. One small dusty rose garden rose, one burgundy ranunculus bud,
tiny ivory jasmine blossoms, and a few sage leaves connected to a slim curved
stem. The base of the stem should sit near the bottom center so it can pivot
naturally from that point in animation. Lots of transparent space around it.
Fully transparent background, clean alpha edges.
```

---

### 20. `SwayVineSprig.webp` — Tangkai menjuntai untuk loop angin

**Pakai di:** top/side vines yang bergoyang halus dari pangkal atas.  
**Rasio:** tall 1:2, 900x1800.  
**Background:** transparan. Anchor visual di atas.

```text
STYLE: <tempel blok STYLE di atas>

A single hanging botanical vine sprig designed for a gentle wind sway loop.
The top of the vine should begin near the top center as the pivot point, then
trail downward in a graceful curve. Sage leaves, small ivy leaves, tiny ivory
flowers, a few dusty rose buds, and one subtle burgundy accent. Airy, not dense,
with transparent space around the vine. Fully transparent background, clean
alpha edges.
```

---

### 21. `SwayLeafBranch.webp` — Ranting daun untuk loop angin

**Pakai di:** aksen samping section, bisa di-mirror kiri/kanan.  
**Rasio:** tall 1:2.5, 900x2250.  
**Background:** transparan. Anchor visual di salah satu ujung.

```text
STYLE: <tempel blok STYLE di atas>

A slender leafy branch for a subtle wind-sway animation. Mostly sage eucalyptus
and fern leaves, with only a few tiny ivory blossoms and small dusty rose buds.
The branch should extend diagonally from one end, with the base clearly near
the lower-left corner so it can pivot naturally. Elegant, airy, restrained.
Fully transparent background, clean alpha edges.
```

---

### 22. `CornerGardenBouquet.webp` — Buket rimbun pojok bawah

**Pakai di:** pojok kiri-bawah section (mirror ke kanan via CSS), sebagai
pengganti/selingan `SwayRoseCluster` di `SectionDecor.tsx` (slot `bl`/`br`)
supaya pojok bawah terasa lebih penuh di section Couple, Greeting, Gift,
DressCode.  
**Rasio:** square 1024x1024. Konten menempel rapat di pojok **kiri-bawah**
kanvas; sisa kanvas transparan.  
**Background:** transparan. Anchor sway di pojok kiri-bawah.

```text
STYLE: Romantic garden pavilion storybook botanical illustration, elegant but
soft, ivory parchment paper mood, sage green foliage, dusty rose and burgundy
flowers, small ivory blossoms, subtle antique gold accents. Delicate realistic
watercolor mixed with refined editorial wedding illustration, softly lit,
graceful, layered, premium but not dark. Clean high resolution asset, no text,
no watermark, no logo, no UI, no harsh shadow. Do not copy any existing website
or artwork; create an original garden floral design with the same romantic
classical mood.

A lush corner garden bouquet for the bottom-left corner of a wedding
invitation, flowers and foliage ONLY. A quarter-fan arrangement anchored
tightly into the bottom-left corner of the canvas: layered sage leaves, ivy,
fern, one focal dusty rose garden rose, one burgundy ranunculus, a small peony
bud, tiny ivory jasmine, baby's breath, and subtle antique-gold seed pods.
Densest exactly at the corner, fanning outward diagonally and thinning into
airy sprig tips toward the canvas center. The upper-right two thirds of the
canvas must stay fully transparent. This is a small isolated botanical
ornament, not a scene: no pavilion, no gazebo, no arch, no columns, no
architecture of any kind. Every sprig must connect to the main bouquet — no
floating cut-off fragments. All elements fully opaque, no faded half-erased
flowers. Fully transparent background, clean alpha edges.
```

---

### 23. `EdgeBloomColumn.webp` — Kolom bunga tepi kiri/kanan

**Pakai di:** tepi kiri/kanan section yang badannya masih kosong (Event, RSVP,
Couple) — bisa dipasang lewat prop `file` di `SideVines.tsx` atau komponen
baru. Berbeda dari `SwayVineSprig` yang hanya menjuntai dari atas, aset ini
mengisi tepi dari atas sampai bawah.  
**Rasio:** generate portrait 1024x1536. Konten menempel di tepi **kiri**
kanvas sepanjang tinggi penuh; ±60% kanvas sisi kanan transparan. Mirror ke
kanan via CSS.  
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

A tall vertical garden border column rooted along the LEFT edge of the canvas,
plants ONLY. Climbing sage vines, ivy, and fern hug the left edge continuously
from top to bottom. Dusty rose and burgundy flowers cluster mainly in the lower
third, small ivory blossoms and baby's breath scatter upward, with subtle
antique-gold seed pods. Density hugs the left edge and fades inward: the right
60% of the canvas must stay fully transparent. Keep it airy and see-through —
not a solid wall of flowers. This is a plant border, not a scene: absolutely no
pavilion, gazebo, arch, columns, interior scenery, or opaque painted backdrop.
All elements fully opaque, no ghost petals near the edges. Fully transparent
background, clean alpha edges.
```

---

### 24. `CornerFernSpray.webp` — Semburat pakis pojok bawah (variasi ringan)

**Pakai di:** pojok bawah section yang butuh dekor tapi tidak boleh berat
(RSVP dekat form, Closing) — dipasangkan silang dengan `CornerGardenBouquet`
(mis. kiri buket, kanan pakis) supaya pojok kiri dan kanan tidak mirror
identik.  
**Rasio:** square 1024x1024. Konten menempel di pojok **kiri-bawah**; mirror
ke kanan via CSS.  
**Background:** transparan. Anchor sway di pangkal batang pojok bawah.

```text
STYLE: Romantic garden pavilion storybook botanical illustration, elegant but
soft, ivory parchment paper mood, sage green foliage, dusty rose and burgundy
flowers, small ivory blossoms, subtle antique gold accents. Delicate realistic
watercolor mixed with refined editorial wedding illustration, softly lit,
graceful, layered, premium but not dark. Clean high resolution asset, no text,
no watermark, no logo, no UI, no harsh shadow. Do not copy any existing website
or artwork; create an original garden floral design with the same romantic
classical mood.

An airy fern and foliage spray for the bottom-left corner of a wedding
invitation, plants ONLY. Mostly sage eucalyptus sprigs, delicate fern fronds,
and small ivy leaves anchored at the bottom-left corner, arcing gracefully
upward and to the right like grass bending in a breeze. Only a few tiny ivory
blossoms, two small dusty rose buds, and one deep burgundy accent — clearly
lighter, greener, and more transparent than a full bouquet. The upper and right
parts of the canvas stay mostly transparent. This is a small isolated botanical
ornament, not a scene: no pavilion, no arch, no architecture. All stems connect
at the corner base so it can pivot naturally in a sway animation. Fully
transparent background, clean alpha edges.
```

---

### 25. `EdgePeekSprig.webp` — Tangkai menyembul dari tengah tepi

**Pakai di:** titik tengah tepi kiri/kanan section panjang (Event, Gallery,
RSVP) — menyembul horizontal ke dalam halaman, mengisi celah vertikal antara
juntaian atas (`SwayVineSprig`) dan dekor pojok bawah. Mirror via CSS,
selang-seling kiri/kanan antar section.  
**Rasio:** generate landscape 1536x1024. Konten hanya di pita **kiri** kanvas
(pangkal tepat di tepi kiri, ujung mencapai ±60% lebar); crop sisi kanan yang
kosong ke ±2:1 saat konversi.  
**Background:** transparan. Anchor sway di pangkal batang tepi kiri.

```text
STYLE: Romantic garden pavilion storybook botanical illustration, elegant but
soft, ivory parchment paper mood, sage green foliage, dusty rose and burgundy
flowers, small ivory blossoms, subtle antique gold accents. Delicate realistic
watercolor mixed with refined editorial wedding illustration, softly lit,
graceful, layered, premium but not dark. Clean high resolution asset, no text,
no watermark, no logo, no UI, no harsh shadow. Do not copy any existing website
or artwork; create an original garden floral design with the same romantic
classical mood.

A single horizontal blooming sprig entering from the LEFT edge of the canvas
at mid-height, like a garden branch peeking into a storybook page. The stem
must start exactly at the left edge (this is the animation pivot point) and
reach inward to about 60% of the canvas width with a graceful, slightly
downward curve. Along the sprig: sage leaves, two dusty rose buds, one small
burgundy flower, tiny ivory blossoms, and one subtle antique-gold seed pod near
the tip. Airy and delicate, generous transparent space above and below. This is
a small isolated botanical ornament, not a scene: no pavilion, no arch, no
architecture, no backdrop. All elements fully opaque. Fully transparent
background, clean alpha edges.
```

---

## Urutan Generate Yang Disarankan

1. `HeroPavilionFrame.webp`
2. `PavilionArch.webp`
3. `TopBotanicalCanopy.webp`
4. `BottomGardenCluster.webp`
5. `FloralDividerKisah.webp`
6. `LatarPavilionGarden.webp`
7. `LatarBotanicalBokeh.webp`
8. `SwayRoseCluster.webp`
9. `SwayVineSprig.webp`
10. `StoryFrame.webp`
11. `VideoFrame.webp`
12. `GalleryFrame.webp`
13. `EventIconAkad.webp` dan `EventIconResepsi.webp`
14. `ClosingGardenPavilion.webp`

Sisanya bisa dibuat setelah layout awal terasa cocok.

Untuk gelombang pengisi tepi & pojok (aset 22–25), urutan yang disarankan:

1. `CornerGardenBouquet.webp` — dampak visual paling besar (pojok bawah semua section)
2. `EdgeBloomColumn.webp` — mengisi badan tepi kiri/kanan
3. `CornerFernSpray.webp` — variasi supaya pojok tidak monoton
4. `EdgePeekSprig.webp` — aksen terakhir untuk section panjang

---

## Naming & Upload

Path R2 produksi:

```bash
npx wrangler r2 object put rimba-themes/floral/kenangan/pavilion-romance/HeroPavilionFrame.webp \
  --file public/images/HeroPavilionFrame.webp --remote
```

Base asset di kode nanti:

```ts
const BASE = `${process.env.NEXT_PUBLIC_THEMES_CDN}/floral/kenangan/pavilion-romance`;
```

Untuk dev lokal, simpan semua file di:

```text
themes/floral/kenangan/pavilion-romance/public/images/
```

---

## Catatan Kurasi

- Jika hasil terlalu mirip referensi, regenerate dengan instruksi:
  "make the pavilion frame more original, less like a carved mirror, more garden
  pavilion architecture, different floral arrangement."
- Jika terlalu ramai, minta:
  "reduce flower density by 40%, more negative space, thinner vines."
- Jika terlalu premium/dark, minta:
  "brighter ivory paper mood, softer gold, less dramatic, more Tier 2 elegant."
- Jika background tidak transparan padahal seharusnya transparan, regenerate
  dengan kalimat pertama:
  "Transparent background PNG cut-out asset, alpha background, no paper backdrop."
- Output GPT Image praktis hanya 1024×1024, 1536×1024, atau 1024×1536.
  Perlakukan rasio pada spesifikasi aset sebagai target crop pasca-generate,
  bukan ukuran output langsung.
- Jika model menggambar gazebo/paviliun utuh pada aset yang seharusnya ornamen
  kecil (ikon, vine, semak, sway sprig), regenerate dengan kalimat pertama:
  "This is a small isolated botanical ornament, not a scene. No architecture."
- Jika ada bunga pudar/setengah terhapus (ghost petals) di tepi aset, minta:
  "all elements fully opaque, remove any faded half-erased flowers."
- Jika model menggambar pola kotak-kotak abu-putih (checkerboard transparansi
  ala Photoshop) di dalam area yang seharusnya bening — gelas, kaca, air —
  minta: "render transparent glass as plain translucent watercolor, do not
  paint a checkerboard pattern inside it."
