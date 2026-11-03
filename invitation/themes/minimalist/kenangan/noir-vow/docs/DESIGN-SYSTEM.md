# Soft Bloom — Sistem Desain

Dokumen masuk. Baca ini dulu sebelum mengubah apa pun yang terlihat.

Aturan tunggalnya: **satu keputusan, satu tempat.** Kalau kamu mengubah sesuatu
dan harus mengubahnya lagi di berkas kedua supaya konsisten, berarti berkas
kedua itu salah — bukan berkas pertama yang kurang.

---

## Peta: mau ubah apa, ke mana?

| Mau ubah… | Ke sini | Contoh |
|---|---|---|
| Warna tema | `invitation.config.json` → `theme.colors` | `accent`, `bg`, `text`, `wash1–5` |
| Font | `invitation.config.json` → `theme.typography` **dan** `src/app/layout.tsx` | keduanya wajib cocok, dijaga tes |
| Turunan warna, bayangan, halo, blur, durasi | `src/app/globals.css` → blok `WARNA TURUNAN & EFEK` | `--accent-tint`, `--shadow-card`, `--halo-paper`, `--dur-base` |
| Ukuran/berat/warna sebuah **peran teks** | `src/app/globals.css` → `.type-*` | "semua sub-judul lebih besar" = satu baris |
| Rupa kartu, tombol, pil, swatch | `src/app/globals.css` → kelas peran | `.card`, `.btn-choice`, `.chip` |
| Margin atas/bawah, gutter, lebar kolom | `src/app/globals.css` → blok `RUANG` | `--gutter`, `--section-pad-bottom` |
| Ruang/ornamen khusus **satu** section | `src/lib/rhythm.ts` → tabel `RITME` | `frameMax`, `frameBreath`, `padBottom` |
| Warna benda (piringan hitam, lilin segel) | `src/app/globals.css` → blok `WARNA BENDA` | `--vinyl-groove`, `--seal-shadow` |

Kalau jawabanmu "di dalam `style={{}}` sebuah section" — hampir pasti keliru.
Ada tes yang akan menolaknya.

---

## Tiga lapis, dan batas di antaranya

```
invitation.config.json          PRIMITIF   — "tema ini warnanya apa"
        │  buildCssVars()
        ▼
globals.css :root               TURUNAN    — "warna itu dipakai jadi apa"
  · WARNA BENDA                              (+ efek: blur, easing, durasi)
  · WARNA TURUNAN & EFEK
  · RUANG
        ▼
globals.css kelas peran         RUPA       — .type-*, .card, .btn-*, .section-shell
        ▼
komponen                        GEOMETRI   — posisi, ukuran, flex, z-index saja
```

**Kenapa turunan tidak ikut di config.** `rgba(126, 105, 150, 0.08)` tidak ikut
berubah saat `accent` diganti. Dulu ada 30 literal semacam itu di `globals.css`
dan 30 lagi di komponen, jadi mengganti palet meninggalkan ungu tema lama di
tombol terpilih, garis input, coretan chip, dan bayangan kartu. Sekarang
semuanya `color-mix()` dari primitif — ganti satu hex di config, seluruh
turunannya ikut.

`border` dan `shadows` **sengaja dikeluarkan dari config** karena keduanya murni
turunan (`accent` 22%, `text` 5%). Dulu TEMPLATE.md harus menulis instruksi
"kalau accent diganti, setel ulang border manual" — instruksi itu tak diperlukan
lagi.

---

## Empat kontrak, empat suite tes

Semua di `scripts/__tests__/`. Jalankan `bun run test`.

| Kontrak | Menjaga |
|---|---|
| `token-contract` | Palet hanya punya SATU sumber (config), tak ada token yatim, turunan tak dikembalikan ke config |
| `color-contract` | Tak ada literal warna di mana pun kecuali blok warna benda; tiap token turunan benar-benar `color-mix` dari palet, bukan nilai jadi |
| `spacing-contract` | Section tak mengarang ruang vertikal/gutter/lebar kolom sendiri; rumus zona aman ada di `.section-shell` |
| `style-contract` | Tak ada properti visual di `style` inline section; kelas peran tak ditambal inline; tak ada kelas yatim |
| `class-contract`, `theme-contract` | Nama kelas lama tak kembali; identitas tema (slug/host/CDN) sepakat di 4 berkas |

Tes-tes ini bukan formalitas. Tiga cacat di bawah **tidak menghasilkan error
apa pun** — hanya halaman yang terlihat agak salah:

1. `--frame-safe-top` ditaruh di `:root` → `var(--frame-max)` membeku jadi nilai
   `:root`, sepuluh section kehilangan zona amannya, judul masuk ke dalam bunga.
2. `className="type-label" style={{ color: … }}` → peran terlihat seragam di JSX
   padahal tidak, duplikasi tumbuh diam-diam.
3. `rgba(126,105,150,0.08)` → tema turunan membawa ungu tema lama selamanya.

---

## Aturan menulis style

```
sifat VISUAL  (font, warna, tepi, radius, bayangan)   → kelas peran di globals.css
GEOMETRI      (posisi, ukuran, flex, gap, z-index)    → boleh inline / Tailwind
NILAI DATA    (mis. warna swatch dari config)         → custom property, --swatch
KEADAAN       (terpilih, tersalin, nonaktif)          → atribut + selektor CSS
```

Rupa adalah peran yang dibagi banyak tempat; geometri milik satu instans.

**Keadaan bukan ternary.** Bukan `style={{ color: aktif ? … : … }}`, melainkan
`aria-pressed` / `data-copied` / `:disabled` / `:not(:first-child)` — sehingga
atribut makna dan tampilannya tak bisa berbeda.

**Dikecualikan dari kontrak:** komponen ornamen murni (`TopFrame`, `SideVines`,
`SectionDecor`, `Butterflies`, `Bird`, `FallingFlowers`, `Meadow`,
`BottomClusters`, `CardVines`, `SectionSeam`, `PaperBackdrop`,
`SceneBackground`, `FullFrame`, `FloralDivider`). Isinya hanya geometri
per-instans lewat props — tak ada peran visual yang bisa dibagi.

---

## Kontras: yang wajib diperiksa saat mengganti palet

Ambangnya WCAG: teks ≥ 4.5:1, objek grafis ≥ 3:1 — **di atas ketiga permukaan**
(`bg`, `surface`, `surface2`), bukan hanya `bg`.

Yang mudah terlewat: teks yang duduk di atas latar **foto** (`SceneBackground`),
bukan kertas. `--text-muted` aman di atas kertas (4.94:1) tapi jatuh ke
**2.37:1** di atas rumpun daun gelap `LatarDaun` — itulah yang membuat kutipan
Mempelai "kurang terlihat warnanya" (laporan pemilik 2026-07-27). Obatnya kelas
`.text-on-scene` (naik ke `--text` + halo kertas → 5.33:1 di titik tergelap),
dipasang berdampingan dengan peran teksnya:

```jsx
<p className="type-lead text-on-scene">{couple.quote}</p>
```

Section berlatar foto saat ini: `couple` & `gift` (LatarDaun, paling gelap),
`akad` (LatarLangit), `gallery` (LatarBokeh), `closing` (LatarPadang, sudah
memakai `.text-scrim`).

> **Belum ada `contrast-contract`.** Palet Soft Bloom sendiri masih belum lolos
> di atas `surface2`: `textMuted` 4.26:1, `accent` 4.06:1, `textDim` 2.85:1,
> `leaf` 2.76:1. Perbaikannya menunggu peninjauan pemilik. Sampai itu beres,
> periksa manual.

---

## Bacaan lanjutan

| Dokumen | Isi |
|---|---|
| `superpowers/specs/2026-07-27-soft-bloom-design-token-ruang.md` | Kenapa ruang atas pakai persentase, bukan `vh`; tabel `RITME` & pengecualiannya |
| `superpowers/specs/2026-07-27-soft-bloom-kontrak-cara-menulis-style.md` | Inventaris duplikasi sebelum-sesudah; daftar lengkap peran |
| `../TEMPLATE.md` | Langkah menyalin tema ini jadi tema baru |
| `../DESIGN_SPEC.md` | Arah visual & suasana Soft Bloom |
