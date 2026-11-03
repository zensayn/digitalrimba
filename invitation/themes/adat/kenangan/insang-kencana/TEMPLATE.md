# Menyalin Soft Bloom Menjadi Tema Baru

Soft Bloom adalah tema acuan. Struktur, kontrak config, dan suite tesnya dibuat
untuk disalin apa adanya — yang berganti hanyalah identitas, palet, aset, dan
komponen ornamen.

> Baca `docs/DESIGN-SYSTEM.md` lebih dulu: di sana ada peta "mau ubah apa, ke
> mana" untuk seluruh sistem (warna, rupa, ruang, efek). Berkas ini hanya
> membahas langkah menyalinnya.

```bash
cp -r invitation/themes/floral/kenangan/soft-bloom \
      invitation/themes/<kategori>/<tier>/<slug-baru>
cd invitation/themes/<kategori>/<tier>/<slug-baru>
rm -rf node_modules .next .open-next
bun install
```

---

## 1. Identitas — WAJIB, dijaga tes

Empat berkas harus sepakat. `bun run test` akan gagal kalau tidak.

| Berkas | Yang diganti |
|---|---|
| `src/lib/theme-meta.ts` | `THEME_SLUG`, `THEME_HOST`, `THEME_CDN_PATH` |
| `wrangler.jsonc` | `name` → `rimba-<slug>`, `routes[0].pattern` → `<slug>.rimba.io` |
| `package.json` | `name` → `<kategori>-<tier>-<slug>` |
| `src/app/layout.tsx` | import `next/font`, `metadata.title`, `metadata.description` |

Aturannya: `THEME_HOST` = `<slug>.rimba.io`, `THEME_CDN_PATH` = `<kategori>/<tier>/<slug>`,
`package.json#name` = `THEME_CDN_PATH` dengan `/` diganti `-`.

Di dalam `src/`, nama tema HANYA boleh ada di `theme-meta.ts`. `src/lib/assets.ts`
dan `src/app/page.tsx` membacanya dari sana — jangan menulis ulang literalnya.

## 2. Palet & tipografi — di `invitation.config.json`

Seluruh token visual ada di `theme`. `globals.css` **tidak** mendefinisikan token
apa pun kecuali `--vinyl-disc` (warna benda, bukan warna tema).

Config hanya memuat **primitif** — 14 warna + nama font. Semua turunannya
(garis tepi, bayangan, permukaan tembus pandang, tint aksen, halo) dihitung
`globals.css` dari primitif ini lewat `color-mix`, jadi ganti satu hex di sini
dan seluruh turunannya ikut.

- `theme.colors.bg` / `surface` / `surface2` — tiga permukaan
- `theme.colors.accent` / `accentSoft` / `leaf` — aksen
- `theme.colors.text` / `textMuted` / `textDim` — teks
- `theme.colors.wash1`–`wash5` — lima warna wash untuk `.mood-*` dan `.soft-wash`
- `theme.typography` — nama font; harus cocok dengan yang di-import `src/app/layout.tsx`

> **Jangan kembalikan `border` atau `shadows` ke config.** Keduanya dulu di sini
> dan harus disetel ulang manual tiap kali palet berubah — sekali terlupa, garis
> tepi seluruh tema masih memakai aksen tema lama. Sekarang `--border` =
> `accent` 22% dan `--shadow-card` = `text` 5%, dihitung di `globals.css`.
> Ada tes yang menahannya.

### Turunan & efek — `globals.css` blok `WARNA TURUNAN & EFEK`

Yang disetel di sini, bukan di config: `--surface-*` (kartu tembus pandang),
`--paper-*` (kabut kertas), `--accent-tint/line/strike/strong/glow`, `--border`,
`--shadow-*`, `--drop-*`, `--halo-*`, dan efek `--blur-*` `--ease-soft`
`--dur-*`. Semuanya `color-mix` dari primitif — **jangan tulis nilai jadi**,
ikatannya ke palet akan putus (dijaga `color-contract`).

Warna BENDA (`--vinyl-*`, `--flap-shadow`, `--seal-shadow`) ada di blok
terpisah dan memang SENGAJA tidak ikut berubah bersama palet.

### Kontras — periksa manual dulu

Palet wajib memenuhi WCAG di atas **ketiga** permukaan, bukan hanya `bg`:
teks minimal 4.5:1, objek grafis (ikon, garis, placeholder) minimal 3:1.

> **Belum dijaga tes.** Suite `contrast-contract` belum dibuat. Palet Soft Bloom
> sendiri saat ini **belum lolos** di atas `surface2` — `textMuted` 4.26:1,
> `accent` 4.06:1, `textDim` 2.85:1, `leaf` 2.76:1. Perbaikannya sudah disiapkan
> tapi ditunda menunggu peninjauan visual pemilik. Sampai itu beres, periksa
> kontras tema barumu secara manual.

## 2b. Ruang (margin, gutter, ritme) — token di `globals.css` + `src/lib/rhythm.ts`

Sama seperti warna, angka jarak punya **satu** sumber. Section tidak boleh
menyetel padding vertikal atau lebar kolomnya sendiri; semuanya lewat kelas
`.section-shell` + tabel `RITME`. Dijaga `scripts/__tests__/spacing-contract.test.mjs`.
Rasionalnya di `docs/superpowers/specs/2026-07-27-soft-bloom-design-token-ruang.md`.

Yang **wajib disetel ulang** saat ornamen tema berganti:

| Token / kolom | Di mana | Artinya |
|---|---|---|
| `--frame-crown` | `globals.css` | Seberapa jauh puncak lengkung ornamen atas turun, **sebagai pecahan lebar gambarnya**. Soft Bloom `0.34` karena `BingkaiAtas.webp` persegi dengan pita bunga rapat di ±1/3 teratas. Ornamen baru dengan proporsi lain → ukur ulang. |
| `RITME[<id>].frameMax` | `src/lib/rhythm.ts` | Lebar ornamen atas per section. Dibaca `<TopFrame>` **dan** rumus zona aman, jadi cukup diubah di sini. |
| `--section-pad-bottom` | `globals.css` | Harus melewati ornamen jahitan antar-section. Soft Bloom: garland `SectionSeam` menjulur 131px ke atas melewati batas. Ornamen jahitan lain → ukur ulang julurannya. |

Yang boleh dipakai apa adanya: `--space-*`, `--gutter`, `--content-max`.

> **Jangan pindahkan rumus `--frame-safe-top` ke `:root`.** `var()` disubstitusi
> di elemen tempat properti dideklarasikan, jadi `var(--frame-max)` di dalamnya
> akan membeku jadi nilai `:root` dan zona aman tiap section hilang diam-diam —
> tanpa error, tanpa tes merah, hanya judul yang terbenam di ornamen. Ada tes
> khusus yang menahannya.

## 3. Aset — `public/images`

Ganti isinya dengan ornamen tema baru, lalu unggah ke R2 di
`assets-themes/<THEME_CDN_PATH>/`. Nama berkas dirujuk dari komponen lewat
`asset("NamaBerkas.webp")`.

Konversi gambar baru ke `.webp` sebelum dipakai.

## 4. Cara menulis style — SATU aturan

Dijaga `scripts/__tests__/style-contract.test.mjs`. Rasionalnya di
`docs/superpowers/specs/2026-07-27-soft-bloom-kontrak-cara-menulis-style.md`.

```
sifat VISUAL  (font, warna, tepi, radius, bayangan)   → kelas peran di globals.css
GEOMETRI      (posisi, ukuran, flex, gap, z-index)    → boleh inline / utilitas Tailwind
NILAI DATA    (mis. warna swatch dari config)         → custom property, mis. --swatch
KEADAAN       (terpilih, tersalin, nonaktif)          → atribut + selektor CSS
```

Rupa adalah peran yang dibagi banyak tempat; geometri milik satu instans. Karena
itu **jangan pernah** menulis `fontSize`, `color`, `border`, `background`,
`boxShadow`, `letterSpacing`, dan sejenisnya di `style={{}}` sebuah section —
beri nama perannya. Jangan pula memakai kelas peran lalu menambal satu sifatnya
inline (`className="type-label" style={{ color: … }}`): itu menyembunyikan
duplikasi, perannya terlihat seragam padahal tidak.

Keadaan pun bukan ternary di JSX. `aria-pressed`, `data-copied`, `:disabled`,
`:not(:first-child)` — CSS yang memutuskan rupanya, sehingga atribut makna dan
tampilan tak bisa berbeda.

**Dikecualikan:** komponen ornamen murni (`TopFrame`, `SideVines`,
`SectionDecor`, `Butterflies`, `Bird`, `FallingFlowers`, `Meadow`,
`BottomClusters`, `CardVines`, `SectionSeam`, `PaperBackdrop`,
`SceneBackground`, `FullFrame`, `FloralDivider`) — isinya hanya geometri
per-instans lewat props, tak ada peran visual yang bisa dibagi.

**Peran UI — pakai apa adanya, jangan di-rename:**

- Teks: `.type-eyebrow` `.type-label` `.type-label-accent` `.type-title`
  `.type-display` `.type-heading` `.type-name` `.type-lead` `.type-numeral`
  `.type-figure` `.type-account` `.type-meta` `.type-script` `.type-ampersand`
  `.type-photo-caption` `.type-body` `.type-body-sm` `.type-caption`
  `.type-list` · `.text-halo` `.text-halo-strong`
- Permukaan: `.card` `.card-solid` `.panel` `.polaroid` `.polaroid-photo`
  `.avatar` `.icon-badge` `.icon-badge-accent` `.chip` `.chip-struck`
  `.swatch` `.divider` `.rule-fade` `.rule-fade-flip`
- Kontrol: `.btn-primary` `.btn-choice` `.btn-round` `.btn-icon`
  `.btn-icon-round` `.input-field` `.map-frame` `.map-sheet` `.map-sheet-bar`
- Kerangka: `.snap-section` `.flow-section` `.section-shell` `.section-opaque`
  `.app-shell` `.content-scroll` `.desktop-cover`

Ganti NILAI-nya untuk tema baru (ukuran, warna, radius) — jangan ganti namanya,
dan jangan menambah peran baru untuk sesuatu yang sudah punya nama.

**Sistem reveal — pakai apa adanya:**
`[data-enter="top|bottom|left|right|tl|tr|bl|br|drop|frame|soft|grow"]`
di dalam `.reveal-scope[data-inview]`

**Identitas tema — ganti gaya visualnya, boleh ganti nama:**
`.soft-wash`, `.mood-*`, `.botanical-card`

## 5. Komponen

`src/components/shared/` berisi ornamen khas Soft Bloom (`FloralTitle`,
`FloralDivider`, `Meadow`, `Butterflies`, `Bird`, `CardVines`, `SideVines`,
`FallingFlowers`, `BottomClusters`). Ganti dengan ornamen tema baru.

**Jangan diubah strukturnya** — ini kerangka yang membuat tema bisa dipakai studio:
`InvitationExperience.tsx`, `RevealController.tsx`, `src/lib/resolve-config.ts`,
`src/app/page.tsx`, `src/app/preview/page.tsx`, `src/lib/config-types.ts`,
`src/lib/css-vars.ts`, `src/lib/invitation-media.ts`, `src/lib/image-fallback.ts`.

`src/lib/rhythm.ts` **strukturnya** juga jangan diubah — yang diganti hanya
isinya (lihat §2b): satu baris per section, pengecualian wajib berkomentar alasan.

## 6. Dokumen

Tulis ulang `README.md`, `DESIGN_SPEC.md`, dan `ASSET_PROMPTS.md` untuk tema baru.
Salin `TEMPLATE.md` ini apa adanya.

---

## Checklist akhir

```bash
bun run test        # suite kontrak wajib hijau
bun run typecheck
bun run lint
bun run build
bun dev             # periksa mata di lebar HP dan ≥1024px
```
