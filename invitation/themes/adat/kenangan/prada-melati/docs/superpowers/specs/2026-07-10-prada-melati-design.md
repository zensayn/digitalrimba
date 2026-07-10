# Prada Melati — Design Doc

**Tanggal:** 2026-07-10
**Tema:** `adat/kenangan/prada-melati`
**Status:** desain disetujui; Fase 1 sedang dikerjakan
**Plan:** `invitation/docs/superpowers/plans/2026-07-10-prada-melati.md`
**Bersandar pada:** `invitation/docs/superpowers/specs/2026-07-10-adat-kenangan-tier-spec-design.md`

**Tujuan:** Menjadi tema adat pertama yang benar-benar adat di repo ini —
keraton Jawa, gelap, dengan motif prada emas dan roncean melati — dan berdiri
cukup jauh dari `warm-narrative` agar keduanya terbaca sebagai dua pilihan,
bukan dua bersaudara.

---

## 1. Latar Belakang

### 1.1 Kategori `adat` belum berisi adat

Motif utama `warm-narrative` adalah **sakura**. Style bible-nya
(`warm-narrative/docs/superpowers/specs/2026-06-30-painterly-sakura-suite-design.md`
§2) berbunyi "Primary flower: cherry blossom (sakura); occasional blush peony
and garden rose". Tipografinya Playfair Display dan Source Serif 4 — editorial
Barat. Nusantara hanya tersisa pada nama berkas aset lama seperti `GapuraBunga`,
yang justru sudah digantikan suite sakura.

Prada Melati mengisi janji yang selama ini kosong.

### 1.2 Bahaya tertukar dengan warm-narrative

`warm-narrative` memakai `--bg #FAF7F2` (parchment nyaris putih) dengan aksen
copper `#C07830`, digambar cat air gouache painterly. Sogan keraton juga coklat
hangat keemasan. Sogan di atas latar krem akan berdampingan dengan
`warm-narrative` di `TemplateSelector` seperti dua bersaudara.

Pembeda tidak datang dari motif. Dari thumbnail, orang melihat **terang atau
gelap** dan **terbuat dari apa** jauh sebelum ia melihat parang atau sakura.
Karena itu Prada Melati berbeda pada dua sumbu sekaligus: nilai (gelap) dan
material (emas pipih, bukan sapuan kuas).

### 1.3 Pelajaran dari sacred-luxe

`sacred-luxe` juga gelap dan emas (obsidian `#0A0A08` + champagne gold), dan
dihapus karena jelek. Kegagalannya bukan pada gelapnya, melainkan pada
kekosongan motif: ornamennya `◆` dan corner SVG generik yang bisa dipakai brand
parfum mana pun.

Prada Melati berakar pada gunungan, parang rusak, kawung, sulur, dan melati.
Kalau ia gagal, ia gagal karena alasan lain.

---

## 2. Keputusan Desain (terkunci)

| Aspek | Keputusan |
|---|---|
| **Kategori · tier** | `adat/kenangan/prada-melati` |
| **Palet** | Sogan pekat, prada emas, gading. Gelap — kebalikan nilai `warm-narrative` |
| **Medium** | Prada gold-leaf: siluet emas pipih bertekstur daun emas, tanpa perspektif |
| **Benang merah** | `RonceanMelati` — untaian melati gading menjuntai, bergoyang pelan |
| **Kedalaman** | Parallax berlapis, bukan bayangan |
| **Section** | Sebelas id, identik dengan `warm-narrative` |
| **Aksesibilitas** | `prefers-reduced-motion: reduce` → parallax dan sway mati |

### 2.1 Kenapa medium prada, bukan ukiran atau batik

**Ukiran jati tersinari lilin** ditolak: relief kayu yang di-generate cenderung
tampak seperti render 3D murahan, dan konsistensinya sulit dijaga lintas sebelas
scene.

**Batik canting** ditolak: batik adalah pola berulang yang menutupi seluruh
bidang, sehingga melawan *safe-zone* teks di tengah yang dituntut tata bahasa
berlapis.

**Cat air gouache di atas latar gelap** ditolak: medium yang sama dengan
`warm-narrative`. Mata mengenali sapuan kuas sebelum ia mengenali motif, jadi
pembeda gelap-terang saja tidak akan menahannya.

### 2.2 Risiko medium prada, dan penawarnya

Siluet emas pipih dapat terasa datar seperti stiker. Kedalamannya tidak boleh
datang dari bayangan — itu akan mengingkari mediumnya. Ia datang dari:

1. **Parallax berlapis.** Emas pipih yang bergerak beda kecepatan terbaca
   sebagai ruang.
2. **Tekstur.** Retak halus daun emas (*crackle*) dan serat kain di bawahnya.

---

## 3. Style Bible

Fondasi yang ditanam ke setiap prompt aset, agar sebelas scene dan kit terasa
satu set.

> Javanese keraton wedding ornament, flat gold-leaf silhouette in the style of
> *prada* cloth and *wayang beber*. Motifs: gunungan/kayon, parang rusak,
> kawung, sulur (scrolling foliage), and strands of jasmine (*roncean melati*).
> Rendered as burnished gold leaf with fine crackle and visible fabric grain,
> laid on deep sogan brown. No perspective, no cast shadows, no depth — flat
> graphic silhouette only. Warm, dark, ceremonial, expensive mood. No people, no
> text, no lettering, no numbers, no logos, no rectangular frame.

Larangan `no perspective, no cast shadows, no depth` wajib ada di setiap prompt.
Tanpanya model mengembalikan relief tiga dimensi — persis kegagalan yang
membuat opsi ukiran jati ditolak pada §2.1.

---

## 4. Tata Bahasa Komposisi (berlapis)

Struktur sama untuk tiap section; teks konten selalu di *safe-zone* tengah.
`depth` = fraksi tinggi viewport yang ditempuh layer sepanjang section
masuk→keluar. Makin besar makin "dekat".

| Layer | Isi | `depth` | Format |
|---|---|---|---|
| **L0 — Kain** | Latar sogan + tile `kawung` samar | `0.04` | webp opaque |
| **L1 — Fokus** | Gunungan, gapura, atau kayon — hanya sebagian section | `0.12` | webp transparan |
| **L2 — Foreground** | Sulur prada di sudut, dari Prada Kit | `0.22` | webp transparan |
| **Global** | `RonceanMelati` menjuntai dari tepi atas | — | komponen |

Angka `depth` mengikuti sakura suite §3 yang sudah terbukti di produksi.

---

## 5. Strategi Aset

**Prinsip:** tiap section dapat L0 unik, tetapi foreground memakai ulang Prada
Kit. Unik, kohesif, jumlah generate terkendali.

### 5a. Prada Kit (generate sekali, pakai ulang)

| Berkas | Deskripsi | Dimensi (px) |
|---|---|---|
| `PradaGunungan.webp` | Gunungan/kayon, siluet tengah | 1200×1800 |
| `PradaSuluranCornerL.webp` | Sulur dari sudut kiri-bawah | 1200×1200 |
| `PradaSuluranCornerR.webp` | Sulur dari sudut kanan-bawah (digenerate terpisah, bukan flip) | 1200×1200 |
| `PradaSuluranTop.webp` | Sulur menggantung dari tepi atas | 1800×900 |
| `PradaParangBand.webp` | Pita parang rusak diagonal, pemisah section | 1800×400 |
| `PradaKawungTile.webp` | Tile kawung seamless untuk L0 | 512×512 |
| `RonceanMelatiL.webp` | Untaian melati menjuntai, sisi kiri | 600×1800 |
| `RonceanMelatiR.webp` | Untaian melati menjuntai, sisi kanan | 600×1800 |
| `MelatiSprig.webp` | Sprig melati kecil, aksen sudut galeri | 700×700 |

Sembilan berkas.

### 5b. Background per section

| Section | L0 (opaque) | L1 (transparan) | L2 (dari Kit) | Parallax |
|---|---|---|---|---|
| `cover` | `CoverBg` | `CoverGunungan` | SuluranCornerL + R | 3 layer (hero) |
| `greeting` | `GreetingBg` | — | SuluranTop | 2 layer |
| `couple` | `CoupleBg` | — | SuluranTop + CornerL/R | 2–3 layer |
| `lovestory` | `LoveStoryBg` | — | SuluranCornerR | 2 layer |
| `akad` | `AkadBg` | `AkadGapura` | SuluranCornerL + R | 3 layer (hero) |
| `resepsi` | `ResepsiBg` | `ResepsiGapura` | SuluranCornerL + R | 3 layer (hero) |
| `dresscode` | `DressCodeBg` | — | SuluranCornerL + R (kecil) | 2 layer |
| `gallery` | `GalleryBg` | — | MelatiSprig ×4 sudut | 2 layer |
| `rsvp` | `RSVPBg` | — | SuluranCornerR | 2 layer |
| `gift` | `GiftBg` | — | SuluranCornerL | 2 layer |
| `closing` | `ClosingBg` | `ClosingKayon` | SuluranCornerL + R (penuh) | 3 layer (hero) |

Total aset inti: 9 (kit) + 11 (L0) + 4 (L1) = **24 gambar**. Varian anti-repetisi
(§5f) dan frame foto (§5g) menambah empat lagi, sehingga **28**.

### 5c. Dimensi & budget

Mengikuti sakura suite §4c.

- L0: 1080×2340, webp quality ~82, target **< 180KB**
- Layer transparan: webp alpha, target **< 120KB**
- R2 bucket `rimba-themes`, path `adat/kenangan/prada-melati/...`
- Disajikan lewat `https://assets-themes.rimba.io`

---

### 5d. Prompt siap-copy — Prada Kit

Mengikuti pola sakura suite §5. **Setiap prompt berdiri sendiri**: style bible §3
sudah tertanam di dalamnya, jadi tidak perlu menempel apa pun lagi. Salin, tempel,
generate.

Tiga larangan wajib ada di setiap prompt: `no perspective`, `no cast shadows`,
`no depth`. Tanpanya model mengembalikan relief tiga dimensi — kegagalan yang
membuat opsi ukiran jati ditolak pada §2.1.

**`PradaGunungan.webp`** — 1200×1800, transparan

```text
Javanese keraton wedding ornament, flat gold-leaf silhouette in the style of prada cloth and wayang beber. Subject: a single centered gunungan (kayon) — the mountain-shaped shadow-puppet motif — filled with intricate sulur scrolling foliage and small kawung circles. Rendered as burnished gold leaf with fine crackle and visible fabric grain, on deep sogan brown #2A1D12. No perspective, no cast shadows, no depth — flat graphic silhouette only. Warm, dark, ceremonial, expensive mood. No people, no text, no lettering, no numbers, no logos, no rectangular frame. Vertical composition, 1200x1800, transparent background.
```

**`PradaSuluranCornerL.webp`** — 1200×1200, transparan

```text
Javanese keraton wedding ornament, flat gold-leaf silhouette in the style of prada cloth and wayang beber. Subject: sulur scrolling foliage growing from the bottom-left corner inward and upward, leaving the center empty. Rendered as burnished gold leaf with fine crackle and visible fabric grain, on deep sogan brown #2A1D12. No perspective, no cast shadows, no depth — flat graphic silhouette only. Warm, dark, ceremonial. No people, no text, no lettering, no numbers, no logos, no rectangular frame. Square composition, 1200x1200, transparent background.
```

**`PradaSuluranCornerR.webp`** — 1200×1200, transparan.
Digenerate terpisah, **bukan hasil flip** `CornerL`. Sakura suite §4a mencatat
alasannya: hasil flip terbaca tidak natural.

```text
Javanese keraton wedding ornament, flat gold-leaf silhouette in the style of prada cloth and wayang beber. Subject: sulur scrolling foliage growing from the bottom-right corner inward and upward, leaving the center empty. The curl of the vines differs from its left-hand counterpart. Rendered as burnished gold leaf with fine crackle and visible fabric grain, on deep sogan brown #2A1D12. No perspective, no cast shadows, no depth — flat graphic silhouette only. Warm, dark, ceremonial. No people, no text, no lettering, no numbers, no logos, no rectangular frame. Square composition, 1200x1200, transparent background.
```

**`PradaSuluranTop.webp`** — 1800×900, transparan

```text
Javanese keraton wedding ornament, flat gold-leaf silhouette in the style of prada cloth and wayang beber. Subject: sulur scrolling foliage hanging down from the top edge, denser at the left and right corners, sparse and open across the middle. Rendered as burnished gold leaf with fine crackle and visible fabric grain, on deep sogan brown #2A1D12. No perspective, no cast shadows, no depth — flat graphic silhouette only. Warm, dark, ceremonial. No people, no text, no lettering, no numbers, no logos, no rectangular frame. Wide composition, 1800x900, transparent background.
```

**`PradaParangBand.webp`** — 1800×400, transparan

```text
Javanese keraton ornament, flat gold-leaf silhouette in the style of prada cloth. Subject: a horizontal band of parang rusak motif — repeating diagonal S-curved blades marching left to right, a classic Javanese batik pattern. Rendered as burnished gold leaf with fine crackle and visible fabric grain, on deep sogan brown #2A1D12. No perspective, no cast shadows, no depth — flat graphic silhouette only. Warm, dark, ceremonial. No people, no text, no lettering, no numbers, no logos, no rectangular frame. Wide banner composition, 1800x400, transparent background, seamless on the left and right edges.
```

**`PradaKawungTile.webp`** — 512×512, opaque, **seamless**

```text
Seamless tileable Javanese kawung batik pattern: rows of four overlapping ellipses forming a subtle lattice. Very low contrast — gold #C9A227 at roughly eight percent opacity over deep sogan brown #2A1D12, like light catching woven cloth. Flat, no perspective, no cast shadows, no depth. Visible fabric grain. No people, no text, no lettering, no numbers, no logos. Perfectly seamless tile, 512x512, edges must repeat without a visible seam.
```

**`RonceanMelatiL.webp`** — 600×1800, transparan.
Gading, **bukan emas**. Ini benang merah tema, dan ia harus kontras terhadap
seluruh ornamen prada di sekitarnya.

```text
Strands of jasmine garland (roncean melati) hanging down from the top edge, Javanese wedding style. Flat graphic silhouette, ivory white #F3E9D2 blossoms strung on fine thread, with subtle fabric grain texture. No gold. No perspective, no cast shadows, no depth. Deep sogan brown background #2A1D12. Vertical strands along the left side, leaving the center empty. No people, no text, no lettering, no numbers, no logos, no rectangular frame. Tall composition, 600x1800, transparent background.
```

**`RonceanMelatiR.webp`** — 600×1800, transparan. Digenerate terpisah.

```text
Strands of jasmine garland (roncean melati) hanging down from the top edge, Javanese wedding style. Flat graphic silhouette, ivory white #F3E9D2 blossoms strung on fine thread, with subtle fabric grain texture. The strands hang at different lengths from their left-hand counterpart. No gold. No perspective, no cast shadows, no depth. Deep sogan brown background #2A1D12. Vertical strands along the right side, leaving the center empty. No people, no text, no lettering, no numbers, no logos, no rectangular frame. Tall composition, 600x1800, transparent background.
```

**`MelatiSprig.webp`** — 700×700, transparan

```text
A small sprig of jasmine (melati) blossoms with two leaves, Javanese wedding style. Flat graphic silhouette, ivory white #F3E9D2, subtle fabric grain texture. No gold. No perspective, no cast shadows, no depth. Deep sogan brown background #2A1D12. Corner accent composition, occupying one corner only. No people, no text, no lettering, no numbers, no logos, no rectangular frame. Square, 700x700, transparent background.
```

---

### 5e. Prompt siap-copy — Background per section

**L0 (opaque, 1080×2340).** Semua L0 memakai fondasi yang sama; yang berubah hanya
kalimat `Subject:`. Fondasinya:

```text
Deep sogan brown #2A1D12 fabric field, faint kawung batik lattice woven into the cloth at very low contrast. Visible fabric grain and the soft irregularity of hand-dyed cloth. Subject: {SUBJECT}. Flat, no perspective, no cast shadows, no depth. Warm, dark, ceremonial, expensive mood. Text will sit in the vertical center — keep the middle third quiet and uncluttered. No people, no text, no lettering, no numbers, no logos, no rectangular frame. Vertical composition, 1080x2340.
```

| Berkas | `{SUBJECT}` |
|---|---|
| `CoverBg.webp` | a faint radial glow of gold behind the center, as if a candle burns behind the cloth |
| `GreetingBg.webp` | the cloth almost bare, a single thin gold parang band low near the bottom edge |
| `CoupleBg.webp` | two very faint gold ovals side by side in the upper third, like the ghosts of portrait frames |
| `LoveStoryBg.webp` | a single vertical gold thread running down the right side, like the spine of a scroll |
| `AkadBg.webp` | a faint gold arch outline in the upper half, like a distant candi bentar gateway |
| `ResepsiBg.webp` | a faint gold arch outline in the upper half, wider and lower than its akad counterpart |
| `DressCodeBg.webp` | four faint gold circles in a row across the lower third, like colour swatches waiting |
| `GalleryBg.webp` | the cloth almost bare, kawung lattice slightly more visible than elsewhere |
| `RSVPBg.webp` | a faint gold parang band running diagonally across the upper right corner |
| `GiftBg.webp` | a faint gold rectangle outline centered low, like an envelope resting on cloth |
| `ClosingBg.webp` | a deep gold glow rising from the bottom edge, as if dawn breaks beneath the cloth |

**L1 (transparan).** Hanya empat scene hero. Fondasinya sama dengan Prada Kit §5d.

**`CoverGunungan.webp`** — 1200×1800

```text
Javanese keraton wedding ornament, flat gold-leaf silhouette in the style of prada cloth and wayang beber. Subject: a gunungan (kayon) rising from the bottom center, its tip reaching the upper third, its interior filled with sulur foliage. The lower half is open so text can rest inside it. Rendered as burnished gold leaf with fine crackle and visible fabric grain, on deep sogan brown #2A1D12. No perspective, no cast shadows, no depth — flat graphic silhouette only. No people, no text, no lettering, no numbers, no logos, no rectangular frame. Vertical, 1200x1800, transparent background.
```

**`AkadGapura.webp`** — 1200×1800

```text
Javanese keraton wedding ornament, flat gold-leaf silhouette in the style of prada cloth and wayang beber. Subject: a candi bentar split gateway — two mirrored stepped pylons framing an open passage in the middle. The passage is empty. Rendered as burnished gold leaf with fine crackle and visible fabric grain, on deep sogan brown #2A1D12. No perspective, no cast shadows, no depth — flat graphic silhouette only. No people, no text, no lettering, no numbers, no logos, no rectangular frame. Vertical, 1200x1800, transparent background.
```

**`ResepsiGapura.webp`** — 1200×1800

```text
Javanese keraton wedding ornament, flat gold-leaf silhouette in the style of prada cloth and wayang beber. Subject: a paduraksa gateway — a roofed ceremonial arch, its lintel crowned with kala ornament, framing an open passage in the middle. The passage is empty. Distinct from a split candi bentar. Rendered as burnished gold leaf with fine crackle and visible fabric grain, on deep sogan brown #2A1D12. No perspective, no cast shadows, no depth — flat graphic silhouette only. No people, no text, no lettering, no numbers, no logos, no rectangular frame. Vertical, 1200x1800, transparent background.
```

**`ClosingKayon.webp`** — 1200×1800

```text
Javanese keraton wedding ornament, flat gold-leaf silhouette in the style of prada cloth and wayang beber. Subject: an inverted kayon canopy descending from the top edge, its foliage spreading wide across the upper half like a tree seen from beneath. The lower half is empty. Rendered as burnished gold leaf with fine crackle and visible fabric grain, on deep sogan brown #2A1D12. No perspective, no cast shadows, no depth — flat graphic silhouette only. No people, no text, no lettering, no numbers, no logos, no rectangular frame. Vertical, 1200x1800, transparent background.
```

---

### 5f. Varian anti-repetisi

Sebelas section memakai ulang empat berkas kit yang sama. Tanpa penawar, mata akan
mengenali sulur yang persis sama di sudut sepuluh kali berturut-turut.

Sakura suite §5d memakai strategi **Hybrid**: sebagian variasi digenerate, sebagian
lagi dihasilkan lewat transformasi CSS yang murah. Kita ikuti, dengan satu larangan
tambahan.

| Cara | Boleh dipakai? | Catatan |
|---|---|---|
| `scale()` antara 0.82 dan 1.0 | ✅ | Perbedaan ukuran paling murah dan paling tidak terdeteksi |
| `rotate()` maksimal ±4° | ✅ | Lebih dari itu, sulurnya tampak jatuh |
| `opacity` antara 0.7 dan 1.0 | ✅ | Sulur yang lebih pudar terbaca sebagai lebih jauh |
| `scaleX(-1)` (flip horizontal) | ❌ | Sulur punya arah lengkung; flip membuatnya terbaca janggal |
| Generate varian kedua | ✅ | Hanya untuk `PradaSuluranCornerL/R`, dipakai bergantian |

Cukup dua varian tergenerate untuk tiap sudut. Sisanya diurus `scale`, `rotate`,
dan `opacity`.

---

### 5g. Frame border foto

Section `couple` dan `gallery` menampilkan foto pelanggan. Foto berwarna apa pun di
atas sogan pekat akan terlihat seperti tempelan, kecuali ia dibingkai.

**`PradaFrameOval.webp`** — 900×1200, transparan. Untuk `couple`.

```text
Javanese keraton ornament, flat gold-leaf silhouette in the style of prada cloth. Subject: an oval portrait frame, its border woven from thin sulur foliage, the oval interior completely empty and transparent. Rendered as burnished gold leaf with fine crackle and visible fabric grain, on deep sogan brown #2A1D12. No perspective, no cast shadows, no depth — flat graphic silhouette only. No people, no text, no lettering, no numbers, no logos. Vertical, 900x1200, transparent background, the oval opening fully transparent.
```

**`PradaFrameCorner.webp`** — 400×400, transparan. Untuk sudut foto galeri.

```text
Javanese keraton ornament, flat gold-leaf silhouette in the style of prada cloth. Subject: a single right-angle corner bracket woven from thin sulur foliage, meant to be placed at the corner of a photograph. Rendered as burnished gold leaf with fine crackle and visible fabric grain, on deep sogan brown #2A1D12. No perspective, no cast shadows, no depth — flat graphic silhouette only. No people, no text, no lettering, no numbers, no logos. Square, 400x400, transparent background.
```

Empat sudut galeri memakai berkas yang sama, diputar `0°`, `90°`, `180°`, `270°`.
Rotasi tepat sembilan puluh derajat aman — larangan flip pada §5f tidak berlaku di
sini, sebab bracket sudut simetris terhadap diagonalnya.

**Total aset akhir:** 9 (kit §5d) + 11 (L0) + 4 (L1) + 2 varian sudut (§5f) +
2 frame (§5g) = **28 gambar**.

---

## 6. Token Warna

Mengikuti kontrak dua lapis pada `warm-narrative/DESIGN_SPEC.md`: sembilan token
di bawah ini ditimpa runtime oleh `buildCssVars` dari `theme.colors` pada
`invitation.config.json`. Deklarasi `:root` di `globals.css` hanya fallback.

| Token | Nilai | Nama |
|---|---|---|
| `--bg` | `#2A1D12` | Sogan Pekat |
| `--surface` | `#3A2A1B` | Kayu Jati |
| `--surface-2` | `#4A3524` | Sogan Terang |
| `--gold` | `#C9A227` | Prada |
| `--gold-light` | `#E3C766` | Prada Kilau |
| `--gold-dim` | `#A68430` | Prada Tua |
| `--text` | `#F3E9D2` | Gading |
| `--text-muted` | `#C9BCA1` | Gading Redup |
| `--text-dim` | `#B3AA9D` | Debu |

`--border` menyusul sebagai token statik, tidak ditimpa runtime.

**Kontras terverifikasi** terhadap `DESIGN_SYSTEM.md` §9, dan dijaga oleh
`scripts/__tests__/contrast-contract.test.mjs`. Dua nilai yang diusulkan mula-mula
gagal dan sudah dikoreksi:

| Token | Usul awal | Terburuk | Nilai terpakai | Terburuk |
|---|---|---|---|---|
| `--text-dim` | `#8C8070` | 2.98:1 ❌ | `#B3AA9D` | 5.01:1 ✅ |
| `--gold-dim` | `#8A6E28` | 2.38:1 ❌ | `#A68430` | 3.27:1 ✅ |

Ambang: token teks 4.5:1, `--gold-dim` 3:1 karena ia dekoratif. "Terburuk"
diukur di atas `--surface-2`, permukaan paling terang.

---

## 7. Tipografi

Playfair Display dihindari karena itu suara `warm-narrative`. Cormorant Garamond
dihindari karena itu suara `sacred-luxe`.

| Element | Font | Alasan |
|---|---|---|
| Display | Marcellus | Kontras rendah, berkarakter pahatan — cocok untuk emas terukir |
| Body | Lora | Serif hangat, terbaca panjang, jelas bukan Source Serif |
| Label | Inter | Fungsional, sudah dipakai lintas tema |

`--font-display` dan `--font-body` ditimpa runtime dari `theme.typography`.

---

## 8. Benang Merah — `RonceanMelati`

Komponen baru, **bukan** `FallingFlowers` yang diganti asetnya.

| | `FallingFlowers` (warm-narrative) | `RonceanMelati` (prada-melati) |
|---|---|---|
| Objek | kelopak sakura | untaian melati |
| Gerak | jatuh, lintasan acak | menjuntai dari tepi atas, bergoyang |
| Amplitudo | — | kecil, periode lambat |
| Warna | blush/peach | gading `#F3E9D2` |

Perbedaan gerak inilah yang menjaga dua tema tidak terasa bersaudara meski
sama-sama memakai elemen bunga. Sakura **jatuh**; melati **menjuntai**.

---

## 9. Section

Sebelas id, identik dengan `RenderSection.tsx` milik `warm-narrative`:

`cover` · `greeting` · `couple` · `lovestory` · `akad` · `resepsi` ·
`dresscode` · `gallery` · `rsvp` · `gift` · `closing`

Delapan di antaranya adalah entitlement Kenangan. `lovestory` dan `gallery`
milik Kisah, `dresscode` milik Warisan; ketiganya dimatikan lewat
`sections.enabled` saat undangan dijual sebagai Kenangan. Wedding Wish tidak
punya id sendiri — ia field "Ucapan (opsional)" di dalam `RSVPSection.tsx`.

Lihat `2026-07-10-adat-kenangan-tier-spec-design.md` §2.1.

---

## 10. Pendaftaran Tema

Tema baru harus didaftarkan di lima tempat. Daftar ini diturunkan dari
pembersihan `sacred-luxe`, yang meninggalkan tujuh referensi menggantung.

| Tempat | Isi |
|---|---|
| `scripts/sync-shared.ts` | entri pada `THEMES` (`hasSrc: true`, `hasInfiniteMenu: false`) |
| `router/src/index.ts` | `Env`, `themeFor()`, `RESERVED_SUBDOMAINS` |
| `router/wrangler.jsonc` | service binding `THEME_PRADA_MELATI` → `rimba-prada-melati` |
| `digital/backend/internal/handlers/invitation.go` | `reservedSlugs` |
| `digital/frontend/components/invitation/TemplateSelector.tsx` | entri `templates` |

Subdomain demo: `prada-melati.rimba.io`.

---

## 11. Bukan Cakupan

- implementasi komponen dan pengkabelan section ke scene — lihat plan Fase 1 dan 2;
- generate aset dan unggah ke R2;
- pendaftaran tema di lima tempat (§10);
- tier Kisah dan Warisan untuk tema ini.

---

## 12. Yang Masih Terbuka

- **Tekstur retak daun emas belum teruji.** Kalau hasil generate tampak seperti
  stiker datar, penawarnya adalah menaikkan `depth` L2 atau menambah tile serat
  kain pada L0 — bukan menambahkan bayangan.
- **Marcellus belum diuji pada nama panjang.** Font pahatan berkontras rendah
  bisa terasa berat pada hero dua baris.
- **Restrukturisasi folder `2026-07-09` §4** akan mengeluarkan `kenangan/` dari
  path tema ini.
