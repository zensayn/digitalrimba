# Warm Narrative — Panduan Template Undangan

Dokumen referensi tunggal untuk template undangan **`adat/kenangan/warm-narrative`**. Ditujukan agar developer atau AI agent bisa langsung memahami arsitektur, konvensi, dan cara memodifikasi template tanpa menebak-nebak.

> Dokumen desain aset floral (prompt generate + manifest) ada terpisah di
> [`docs/superpowers/specs/2026-06-30-painterly-sakura-suite-design.md`](./superpowers/specs/2026-06-30-painterly-sakura-suite-design.md).

---

## 1. Identitas & konsep

- **Nama tema:** warm-narrative (kategori `adat/kenangan`).
- **Rasa:** editorial, painterly, hangat, romantis, **premium**. Metafora "kisah / lembaran / bab".
- **Palette:** krem hangat + aksen tembaga (copper). Bunga utama **sakura** (peach/blush/cream).
- **Motif visual:** tiap section punya *scene* painterly (background + bingkai sakura berlapis) yang bergerak **parallax** saat scroll, dengan kelopak sakura jatuh sebagai benang merah.
- **Prinsip utama:** teks selalu di *safe-zone* tengah; ornamen di tepi; semua harus tetap terbaca & terasa mahal.

---

## 2. Tech stack & perintah

| Hal | Detail |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Bahasa | TypeScript 5 |
| Styling | Tailwind CSS v4 + `globals.css` (design tokens + helpers) |
| Animasi | framer-motion 12 |
| Deploy | `@opennextjs/cloudflare` → Cloudflare Workers |
| Package manager | **bun** |
| Aset | Cloudflare **R2** (bucket `rimba-themes`) via CDN `https://assets-themes.rimba.io` |

**Perintah penting** (jalankan dari root theme):
```bash
bun install
bun dev                       # dev server
./node_modules/.bin/tsc --noEmit   # typecheck (WAJIB sebelum selesai; jangan pakai `npx tsc`)
bun run deploy                # opennextjs-cloudflare build && deploy
```

CDN dipakai lewat env `NEXT_PUBLIC_THEMES_CDN` (= `https://assets-themes.rimba.io`). Semua path aset: `${NEXT_PUBLIC_THEMES_CDN}/adat/kenangan/warm-narrative/<Nama>.webp`.

---

## 3. Struktur direktori

```
src/
  app/
    page.tsx           # merangkai section sesuai config.sections.order
    layout.tsx
    globals.css        # design tokens (:root), helper class, keyframes
  components/
    sections/          # 1 file per section (lihat §8)
    shared/
      SnapContainer.tsx     # scroll container + ParallaxContext provider
      ParallaxScene.tsx     # mesin parallax berlapis (INTI — §6)
      parallax-context.ts   # context ref scroll container
      FallingFlowers.tsx    # kelopak sakura jatuh (BungaJatuh1–6)
      MusicPlayer.tsx
      GuestName.tsx         # nama tamu dari query param (?to=)
  lib/
    config-types.ts    # tipe InvitationConfig
invitation.config.json # SEMUA data undangan (§9)
docs/                  # dokumen ini + spec desain aset
wrangler.jsonc         # config Worker (name, route, vars)
```

`page.tsx` merender `<SnapContainer>` lalu memetakan `config.sections.order` (yang `enabled`) ke komponen section.

---

## 4. Design tokens & helper (`globals.css`)

### 4a. Warna (`:root`)
| Token | Nilai | Pakai untuk |
|---|---|---|
| `--bg` | `#FAF7F2` | krem dasar |
| `--surface` / `--surface-2` | `#F2EDE4` / `#E8E0D4` | panel |
| `--gold` | `#99511A` | judul/aksen copper (kontras di atas scene) |
| `--gold-light` | `#C0823A` | aksen terang |
| `--gold-dim` | `#836237` | eyebrow/label kecil |
| `--text` | `#261E14` | teks utama |
| `--text-muted` | `#574A39` | body italic |
| `--text-dim` | `#836237` | label paling redup |
| `--border` | `rgba(153,81,26,0.28)` | garis tipis |
| `--shadow-warm` / `--shadow-card` | — | bayangan foto/kartu |

> Warna aksen sengaja **dalam** agar kontras di atas background painterly. Kalau menambah teks di atas scene, tambahkan **halo krem** (`textShadow: "0 1px 6px rgba(250,247,242,0.9)"`).

### 4b. Font (helper class)
| Class | Font | Peran |
|---|---|---|
| `.font-display` | Playfair Display | judul/nama (sering `italic`) |
| `.font-body` | Source Serif 4 | body |
| `.font-garamond` | EB Garamond | quote/aksen italic |
| `.font-label` | Inter | eyebrow/label uppercase |

### 4c. Helper class lain
`.text-copper-gradient` (teks gradient tembaga) · `.copper-divider` / `.copper-divider-full` / `.dot-divider` (garis) · `.corner-ornament` + `.tl/.tr/.bl/.br` (sudut siku foto) · `.paper-overlay` (tekstur kertas multiply) · `.input-warm` / `.btn-warm` (form RSVP) · `.event-action-link`.

### 4d. Keyframes
`fadeInUp`, `fadeIn`, `float`, `sway`, `sway-soft`, `vinyl-spin`. Semua dimatikan di `@media (prefers-reduced-motion: reduce)`.

---

## 5. Model layout & scroll

- **`.snap-container`** (dirender oleh `SnapContainer`): scroll vertikal (`overflow-y:auto`, `height:100svh`), background gradient krem konstan. Ini elemen scroll yang jadi acuan parallax.
- **`.snap-section`**: `min-height:100svh`, `position:relative`, flex center. Tiap section membungkus: `<ParallaxScene>` (background, z0) → `.paper-overlay` (tekstur) → konten (`z-10`).
- **Desktop frame:** di layar lebar, `.snap-container` dibingkai jadi kolom ala-mobile (lihat media query di `globals.css`).

**Urutan layer standar dalam satu section:**
```
<section class="snap-section" style="background:transparent">
  <ParallaxScene layers={[...]} />      // scene painterly (z0) + edge-fade
  <div class="paper-overlay" />          // tekstur kertas (z0)
  ...glow/watermark opsional...          // z0–2
  <div class="relative z-10">...konten...</div>
</section>
```

---

## 6. ParallaxScene — mesin visual (INTI)

`src/components/shared/ParallaxScene.tsx`. Merender **layer bergambar** di belakang konten section, tiap layer bergerak beda kecepatan saat scroll. Sumber kebenaran untuk semua background + bingkai floral.

### 6a. Pemakaian
```tsx
<ParallaxScene
  fadeTop={12}      // % feather tepi atas (default 12) — heroes sering 0 / 6
  fadeBottom={12}
  layers={[
    { src: `${BASE}/CoverBg.webp`, depth: 0.03, priority: true, zIndex: 0 },
    { src: `${BASE}/SakuraColumnL.webp`, depth: 0.08, opacity: 0.8, zIndex: 1,
      box: { top: "-1%", left: "-14%", height: "102svh", enterY: 0 } },
    { src: `${BASE}/SakuraCornerL.webp`, depth: 0.13, opacity: 0.9, zIndex: 2,
      box: { bottom: "-2%", left: "-7%", width: "44%" } },
  ]}
/>
```

### 6b. Tipe `ParallaxLayer`
| Field | Arti |
|---|---|
| `src` | URL gambar (CDN) |
| `depth` | 0..1, fraksi tinggi viewport yang ditempuh layer. Makin besar = makin "dekat/cepat". |
| `opacity`, `zIndex`, `priority` | transparansi, urutan dalam scene, preload (khusus Cover) |
| `enterDuration` | durasi animasi masuk (box only), default 1.1s |
| `objectFit`, `objectPosition` | untuk **cover mode** |
| `box` | jika ada → **element mode** (piece terposisi): `{ width?, height?, top?, bottom?, left?, right?, flipX?, rotate?, enterX?, enterY? }` |

**Dua mode layer:**
- **Cover mode** (tanpa `box`): full-bleed `object-fit:cover`, di-oversize + di-offset agar parallax tak buka tepi kosong. Untuk `*Bg` (L0) & arch/canopy full-kanvas 9:19.5.
- **Element mode** (ada `box`): piece terposisi (sudut/kolom/drape). Jika `box.height` diisi tanpa `width` → **height-driven** (kolom sisi full-height; pakai `height:"102svh"` agar tidak ke-stretch di section tinggi).

### 6c. Perilaku otomatis
- **Mount gating:** layer di-mount saat section ±300px dari viewport (lazy network).
- **Entrance per-piece:** tiap piece `box` beranimasi masuk **dari tepi anchor-nya** (kiri→dari kiri, dst; override via `enterX/enterY`) saat **piece itu sendiri** masuk view (`margin -12%`), dengan **stagger**. Diulang tiap re-enter (bukan sekali).
- **Edge-fade:** hanya layer **cover** yang di-*mask* memudar ke krem di tepi atas/bawah (`fadeTop/fadeBottom`) → antar-section mulus, tak ada jahitan keras. Layer `box` TIDAK ikut di-mask (biar tampil penuh di sudut).
- **Reduced-motion:** parallax + entrance mati, layer statis.

### 6d. Nilai `depth` acuan
`Bg` 0.03 · `Arch/Canopy` 0.07–0.08 · kolom sisi 0.08 · sudut/drape 0.09–0.14 (makin depan makin besar).

---

## 7. Sistem aset

### 7a. Kategori & penamaan (PascalCase, `.webp`)
- **Scene background (opaque, 9:19.5):** `CoverBg`, `GreetingBg`, `CoupleBg`, `LoveStoryBg`, `AkadBg`, `ResepsiBg`, `DressCodeBg`, `GalleryBg`, `RSVPBg`, `GiftBg`, `ClosingBg`.
- **Layer fokus hero (transparan, 9:19.5):** `CoverArch`, `AkadArch`, `ResepsiArch`, `ClosingCanopy`.
- **Sakura Kit (transparan, reusable):** `SakuraCornerL/R` (+ varian `…L2/R2`), `SakuraTopL/R`, `SakuraColumnL/R`, `SakuraDrapeTop`, `SakuraBranchSide`, `SakuraSprigSmall` (+ `…2/3`).
- **Frame foto (transparan, rencana):** `PhotoFramePortrait` (3:4), `PhotoFrameLandscape` (4:3).
- **Global:** `TeksturKertas` (paper-overlay), `BungaJatuh1–6` (FallingFlowers).
- **Legacy yang masih dipakai:** `Surat` (Greeting), `Sparkle` (LoveStory), `CincinEmas`/`TempatPernikahan` (ikon Event), `LocationPin`, `Calendar`.

### 7b. Pipeline optimasi → upload
1. Generate PNG (prompt di spec desain) → taruh di `public/images/`.
2. Optimasi ke webp (downscale ke ukuran tampil, target: Bg <180KB, transparan <120–240KB):
   - via PIL: `Image.open(..).convert("RGBA").resize(..,LANCZOS).save(out,"WEBP",quality=70–82,method=6)`.
3. Upload R2:
   ```bash
   ./node_modules/.bin/wrangler.exe r2 object put \
     rimba-themes/adat/kenangan/warm-narrative/<Nama>.webp \
     --file=<Nama>.webp --content-type=image/webp \
     --cache-control="public, max-age=31536000, immutable" --remote
   ```
4. Verifikasi: `curl -I https://assets-themes.rimba.io/adat/kenangan/warm-narrative/<Nama>.webp` → `200 image/webp`.

### 7c. Strategi anti-repetisi
Aset kit dipakai ulang lintas section → dibedakan via **flip/rotate/scale/opacity/posisi** + background unik + **varian** (`…2/3`) untuk piece yang paling sering muncul (sudut bawah, sprig Gallery). Detail: spec §5d.

---

## 8. Referensi per section

Urutan: `cover → greeting → couple → lovestory → akad → resepsi → dresscode → gallery → rsvp → gift → closing`.

| Section | File | Data (config) | Layout & catatan |
|---|---|---|---|
| **cover** | CoverSection | couple, weddingDate | Hero: nama besar + countdown + scroll hint. Scene: CoverBg+CoverArch+kolom+sudut. Ada scrim krem + halo teks. `"use client"`. |
| **greeting** | GreetingSection | couple | Bismillah + kartu `Surat` (nama tamu via `GuestName`). Server component (`motion/client`). |
| **couple** | CoupleSection | couple | **Editorial overlap**: foto + nama besar mirror (groom kiri / bride kanan), reveal berjenjang. Server component. |
| **lovestory** | LoveStorySection | loveStory[] | **Timeline** garis kiri, chapter zig-zag, node tembaga, foto + `Sparkle`, nomor Romawi + tahun. `"use client"` (scroll timeline). |
| **akad** / **resepsi** | EventSection | events.akad / .resepsi | Satu komponen, `index`/`sectionId` beda. Tanggal copper besar, kartu venue, **map iframe** (tap-to-interact), link Maps/Kalender. Arch + sudut. `"use client"`. |
| **dresscode** | DressCodeSection | dressCode | Tema + deskripsi + swatch warna + "Hindari". Server component. |
| **gallery** | GallerySection | gallery[] | Grid foto (hero 4:3 + 1:1), 4 sprig sudut (varian). `"use client"`. |
| **rsvp** | RSVPSection | — (form lokal) | Form konfirmasi (`.input-warm`/`.btn-warm`), kit **kiri saja**. `"use client"`. |
| **gift** | GiftSection | bankAccounts[] | Kartu rekening + copy-to-clipboard. `"use client"`. |
| **closing** | ClosingSection | couple | Nama copper besar, ayat, hashtag, footer brand. Cincin + kanopi + sudut. `"use client"`. |

> Server vs client: section yang butuh hook (`useScroll`, `useState`, dll) pakai `"use client"`; sisanya server component dengan `import * as motion from "framer-motion/client"`. `ParallaxScene` (client) boleh diimpor ke server component sebagai child.

---

## 9. Skema `invitation.config.json`

```jsonc
{
  "couple": {
    "groom": { "name", "fullName", "parents", "instagram", "photo" },
    "bride": { ...sama },
    "quote": "…",            // pakai em-dash "—" (U+2014)
    "hashtag": "#…"
  },
  "weddingDate": "ISO string",
  "events": {
    "akad":    { "title","day","date","time","venue","address","mapsUrl","embedUrl","startISO","endISO" },
    "resepsi": { ...sama }
  },
  "loveStory": [ { "year","chapter","description","image" } ],
  "dressCode": { "theme","description","colors":[{"name","hex"}], "avoid":[ "…" ] },
  "gallery":   [ { "src","alt" } ],
  "bankAccounts": [ { "bank","name","number" } ],
  "theme": { "colors", "typography" },
  "sections": { "order": [ … ], "enabled": { "<id>": true|false } }
}
```
Tipe lengkap: `src/lib/config-types.ts`.

---

## 10. Konvensi & resep

**Menambah scene ke section baru:** render `<ParallaxScene layers=[{ src: XxxBg, depth:0.03, zIndex:0 }, …kit]/>` sebagai anak pertama section, lalu `.paper-overlay`, lalu konten `z-10`. Ikuti pola bingkai: kolom sisi (`height:"102svh"`, offset `-13~-18%`) + sudut atas (`TopL/R`) + sudut bawah (`CornerL/R`, selang-seling varian).

**Menambah piece kit:** tambahkan objek `box` ke array `layers`. Sudut atas → anchor `top`+`left/right`; sudut bawah → `bottom`+`left/right`; kolom → `height`+`left/right` (+`enterY:0`); drape → `top`+`left:"0"`+`width:"100%"`+`enterX:0`. Offset negatif kecil (`-5~-8%` sudut, `-13~-18%` kolom) supaya nge-hug tepi tanpa nutup konten.

**Keterbacaan teks di atas scene:** warna aksen `--gold`/`--text`, ukuran cukup, tambah `textShadow` halo krem. Untuk area padat, boleh scrim radial krem (lihat Cover).

**Ganti palette:** ubah token di `:root` `globals.css` (bukan hardcode per file). Catatan: beberapa dekorasi masih pakai `rgba(192,120,48,…)` literal (glow/watermark) — aman dibiarkan.

**Orientasi sakura:** sudut atas → menjuntai turun (`SakuraTopL/R` atau `rotate:180`); sudut bawah → tumbuh naik (default). Kolom sisi = `Column`, bukan `BranchSide` tipis.

**Selalu** jalankan `./node_modules/.bin/tsc --noEmit` sebelum menyatakan selesai.

---

## 11. Build & deploy

- Branch kerja saat ini: `feat/warm-narrative-sakura-suite`.
- Deploy Worker: `bun run deploy` (butuh auth Cloudflare / wrangler). Config Worker di `wrangler.jsonc` (name `rimba-warm-narrative`, route `warm-narrative.rimba.io`, var `NEXT_PUBLIC_THEMES_CDN`).
- Aset **tidak** ikut bundle — di-serve dari R2/CDN, jadi upload aset (§7b) adalah langkah terpisah dari deploy kode.

---

## 12. Dokumen terkait
- **Spec desain aset floral (prompt generate + manifest):** `docs/superpowers/specs/2026-06-30-painterly-sakura-suite-design.md` — sumber prompt untuk generate scene, Sakura Kit, varian, frame foto.
