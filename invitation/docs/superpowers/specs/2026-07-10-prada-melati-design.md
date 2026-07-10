# Prada Melati — Design Doc

**Tanggal:** 2026-07-10
**Tema:** `adat/kenangan/prada-melati` (belum di-scaffold)
**Status:** disetujui (desain), belum diimplementasikan
**Branch:** `feat/prada-melati-design`
**Bersandar pada:** `2026-07-10-adat-kenangan-tier-spec-design.md`

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

Total aset baru: 9 (kit) + 11 (L0) + 4 (L1) = **24 gambar**.

### 5c. Dimensi & budget

Mengikuti sakura suite §4c.

- L0: 1080×2340, webp quality ~82, target **< 180KB**
- Layer transparan: webp alpha, target **< 120KB**
- R2 bucket `rimba-themes`, path `adat/kenangan/prada-melati/...`
- Disajikan lewat `https://assets-themes.rimba.io`

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

- komposisi tiap scene satu per satu (prompt siap-copy per section);
- angka kontras aksesibilitas dan penyesuaian token yang mengikutinya;
- scaffold app Next.js dan implementasi komponen;
- pemindahan doc ini ke `themes/adat/kenangan/prada-melati/docs/` setelah
  folder tema berdiri;
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
