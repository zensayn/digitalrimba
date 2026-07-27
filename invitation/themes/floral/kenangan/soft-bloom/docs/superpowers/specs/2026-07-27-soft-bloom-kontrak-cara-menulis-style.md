# Soft Bloom — Kontrak Cara Menulis Style

> Tanggal: 2026-07-27 · Branch kerja: `perfecting-soft-bloom`
> Dipicu oleh: permintaan pemilik — "konsistenkan cara ubah style-nya, agar
> kalau mau sesuaikan juga mudah dan 1 style".
> Lanjutan dari `2026-07-27-soft-bloom-design-token-ruang.md` (yang menangani
> RUANG); dokumen ini menangani RUPA.

## 0. Apa yang rusak

Style ditulis dengan **tiga cara yang bercampur** — kelas CSS, utilitas
Tailwind, dan `style={{}}` inline — tanpa aturan mana dipakai kapan. Akibatnya
satu peran visual punya banyak nama, jadi tak ada satu tempat untuk mengubahnya.

| Peran | Ditulis berapa cara | Bukti |
|---|---|---|
| Sub-judul serif italic | **4** | `clamp(22,6vw,30)` Couple · `clamp(22,5.8vw,28)` RSVP · `clamp(20,5.4vw,27)` Event · `clamp(20,5.2vw,26)` Greeting |
| Lead/kutipan italic | **3** | `clamp(15,4vw,18)` Closing · `clamp(15,3.8vw,18)` Couple · `clamp(16,4vw,20)` Event |
| Nama item daftar | 2 (identik) | LoveStory & Turut menulis `clamp(19,5vw,23)` masing-masing |
| Kartu kertas | **2 jalur** | kelas `.card`/`.panel` **vs** ditulis tangan di Event, Gift, Rundown |
| Body kecil | **4** | `13px` · `14px` · `15px` · `17px` |

Angka mentahnya: **35 nilai `fontSize` inline yang berbeda**, 49 `color`,
35 `background`, 24 `borderRadius`, 21 `border`. Kelas `.type-*` sudah ada tapi
hanya dipakai untuk teks kecil — apa pun yang lebih besar dari label ditulis
inline, dan beberapa dipakai separuh (`className="type-label"` lalu ditambal
`style={{ color: "var(--accent)" }}`).

Konsekuensi nyata: "perbesar semua sub-judul section" berarti berburu di empat
berkas dan berharap tak ada yang terlewat.

## 1. Aturannya

```
sifat VISUAL  (font, warna, tepi, radius, bayangan)   → kelas peran di globals.css
GEOMETRI      (posisi, ukuran, flex, gap, z-index)    → boleh inline / utilitas Tailwind
NILAI DATA    (warna swatch dari config)              → custom property, mis. --swatch
KEADAAN       (terpilih, tersalin, nonaktif)          → atribut + selektor CSS
```

Alasan pembagiannya: **rupa itu peran yang dibagi banyak tempat, geometri itu
milik satu instans.** Dua paragraf boleh punya posisi berbeda, tapi kalau
keduanya "narasi pengantar" ukurannya tak boleh berbeda. Sebaliknya, memaksa
posisi absolut sebuah ornamen jadi kelas cuma memindahkan angka satu-satuan ke
berkas lain tanpa ada yang bisa dibagikan.

### 1.1 Keadaan lewat atribut, bukan ternary

Sebelumnya keadaan terpilih tombol RSVP berupa **tiga ekspresi ternary** di
dalam `style` (border, color, background) — logika tampilan tercecer di JSX, dan
`aria-pressed` bisa saja tak sinkron dengan rupanya. Sekarang JSX cukup menyetel
atribut yang memang wajib untuk aksesibilitas:

```jsx
<button aria-pressed={attendance === opt} className="btn-choice">
```
```css
.btn-choice[aria-pressed="true"] { border-color: var(--accent); … }
```

Rupa dan makna jadi tak bisa berbeda. Pola sama dipakai untuk `data-copied`
(tombol salin Gift), `:disabled` (tombol kirim), dan `:not(:first-child)`
(garis pemisah baris Rundown & aksi Event).

### 1.2 Data lewat custom property

Warna kelopak Dress Code datang dari `invitation.config.json` — itu **data**,
bukan keputusan gaya, jadi ia tak boleh dipaksa jadi kelas. Masuk sebagai token:

```jsx
<div className="swatch" style={{ "--swatch": color.hex }} />
```
```css
.swatch { --swatch: var(--surface-2);   /* bawaan bila hex kosong */
          background: var(--swatch);
          box-shadow: …, 0 5px 14px color-mix(in srgb, var(--swatch) 33%, transparent); }
```

Satu nilai masuk, dua sifat visual diturunkan darinya — dulu hex-nya ditulis dua
kali di JSX (`background` dan interpolasi `${color.hex}55` di `boxShadow`).

## 2. Peran yang ada sekarang

**Teks** — `type-eyebrow` `type-label` `type-label-accent` `type-title`
`type-display` `type-heading` `type-name` `type-lead` `type-numeral`
`type-figure` `type-account` `type-meta` `type-script` `type-ampersand`
`type-photo-caption` `type-body` `type-body-sm` `type-caption` `type-list`
· utilitas `text-halo` `text-halo-strong`

**Permukaan** — `card` `card-solid` `panel` `botanical-card` `polaroid`
`polaroid-photo` `avatar` `photo-well` `icon-badge` `icon-badge-accent`
`chip` `chip-struck` `swatch` `divider` `rule-fade` `rule-fade-flip`
`text-scrim` `edge-dissolve` `scroll-hint-line`

**Kontrol** — `btn-primary` `btn-choice` `btn-round` `btn-icon` `btn-icon-round`
`input-field` `map-frame` `map-sheet` `map-sheet-bar`

**Komposisi khas section** — `cover-date` `amp-stacked` `amp-inline`
`photo-initial` `event-date-tail` `venue-card` `venue-card-time`
`event-action-link` `rundown-card` `rundown-row` `rundown-time` `bank-card`
`section-opaque`

## 3. Yang dikecualikan, dan kenapa

**Komponen ornamen murni** (`TopFrame`, `SideVines`, `SectionDecor`,
`Butterflies`, `Bird`, `FallingFlowers`, `Meadow`, `BottomClusters`,
`CardVines`, `SectionSeam`, `PaperBackdrop`, `SceneBackground`, `FullFrame`,
`FloralDivider`) tetap menulis inline. Isinya hanya geometri per-instans —
`position`, `inset`, `width`, `opacity`, `transform`, `animation` — dan
semuanya sudah datang lewat props. Tak ada peran visual yang bisa dibagi di
sana; memaksanya jadi kelas hanya memindahkan angka, tak mengurangi duplikasi.

## 4. Perubahan rupa yang disengaja

Menyatukan peran berarti memilih satu nilai. Yang bergeser:

| Elemen | Sebelum | Sesudah | Catatan |
|---|---|---|---|
| Nama mempelai cover | `clamp(46,13vw,82)` berat 400 | `.type-display` `clamp(48,13.5vw,84)` berat 500 | cover & closing dulu beda ukuran & berat tanpa alasan tertulis |
| Nama mempelai closing | `clamp(52,14.5vw,88)` berat 500 | idem | |
| 4 sub-judul serif | 4 clamp berbeda | `.type-heading` `clamp(20,5.6vw,28)` | |
| Caption polaroid | 2 ukuran (lebar vs persegi) | `.type-photo-caption` satu ukuran | |
| Kartu venue Event | `rgba(255,255,255,0.8)` tanpa blur | `.card` (0.86 + blur 3px) | ikut kartu lain |
| Label swatch & "Mohon Hindari" | `12px` | `.type-label` `11px` | |

Semua diperiksa lewat screenshot 13 section di 390×844.

### 4.1 Satu penyederhanaan yang salah, dan dikembalikan

Garis pengapit ornamen Event sempat disatukan jadi satu gradien **simetris**
(`transparent → accent-soft → transparent`) dengan alasan "satu kelas untuk kiri
dan kanan". Salah: aslinya tiap garis paling pekat **tepat di sisi ornamen**
lalu memudar ke tepi kolom, sehingga mata tertarik ke tengah. Versi simetris
membuat garis justru paling pucat di titik pertemuannya dengan ornamen dan
motifnya nyaris hilang. Dikembalikan jadi dua arah (`.rule-fade` +
`.rule-fade-flip`). Ketahuan dari screenshot, bukan dari tes.

## 5. Dijaga tes — `scripts/__tests__/style-contract.test.mjs`

1. Tak ada properti visual di dalam `style` inline section (23 nama properti).
2. Kelas peran tak ditambal inline — gejala "kelas dipakai separuh" yang justru
   menyembunyikan duplikasi.
3. Setiap kelas tema yang dipakai section benar-benar terdefinisi di
   `globals.css` (salah ketik nama kelas tak menghasilkan error apa pun).
4. Tak ada kelas peran yatim — kelas tak terpakai ikut tersalin ke tema turunan
   dan menyesatkan orang berikutnya.

Nudge optik beberapa piksel (mis. `paddingBottom: 6` pada glif script cover)
tetap boleh: itu geometri, bukan peran.

## 6. Di luar cakupan

- Komponen bersama non-ornamen (`FloralTitle`, `MusicPlayer`, `EnvelopeOverlay`,
  `DesktopCover`, `BotanicalCard`) belum ikut kontrak — masih menulis sebagian
  sifat visual inline. Perannya lebih sedikit terduplikasi, tapi idealnya ikut.
- Utilitas `gap-*`/`flex` Tailwind untuk tata letak sengaja dibiarkan; itu
  geometri, bukan rupa.
