# Twilight Castle — Design Spec

**Tanggal:** 2026-07-23
**Nama tema:** `twilight-castle`
**Kategori (baru):** `dongeng/`
**Tier:** `kisah` (Standard · Rp300rb)
**Path folder:** `invitation/themes/dongeng/kisah/twilight-castle/`
**Subdomain:** `twilight-castle.rimba.io`
**Path CDN (R2 `rimba-themes`):** `dongeng/kisah/twilight-castle/<file>`
**Estetika:** Twilight Royal — istana dongeng senja berbintang, aksen emas.

---

## 1. Konsep

Undangan digital bertema **istana dongeng**. Alur pengalaman:

1. Tamu mendarat di layar **amplop** (`EnvelopeOverlay`, pola yang sudah ada) → klik "Buka Undangan".
2. Amplop terangkat → muncul **gerbang kerajaan**: portal bulat berbingkai emas ornamen, di baliknya siluet istana & langit senja berbintang, dengan nama mempelai.
3. Saat tamu **scroll**, gerbang itu **membesar/zoom sampai memenuhi layar** — sensasi "menembus masuk ke dalam kerajaan" (referensi: efek GSAP ScrollTrigger image-zoom, di sini diimplementasikan dengan Framer Motion).
4. Setelah tembus, **section-section undangan** (mempelai, kisah cinta, acara, galeri, RSVP, hadiah, dst.) tersaji "di dalam" dunia dongeng itu.

Efek gerbang zoom = **jantung/pembeda tema**. Sisanya mengikuti fondasi yang sudah matang di tema lain.

### Kenapa tier `kisah` (bukan `kenangan`)

Floral `README.md` mendefinisikan tier via **kekayaan komponen + animasi**, bukan pola scroll. Twilight-castle naik ke `kisah` karena efek pinned scroll-zoom + ornamen dongeng + motion lebih kaya dari dua tema kenangan penulis (pavilion-romance, soft-bloom).

**Divergensi disengaja:** spec kisah terdahulu (`sinema-kisah`, adat) memakai *horizontal page-turn*. Twilight-castle **tetap vertical scroll** karena metafora zoom-menembus-gerbang menuntutnya. "Kisah" di sini = level kekayaan, bukan sumbu scroll horizontal. Ini bukan pelanggaran tier, hanya interpretasi berbeda dalam kategori berbeda.

---

## 2. Fondasi kode

**Basis: klon arsitektur `soft-bloom`** (studio-integrated), bukan pavilion. Alasan: tema ini dijual & dipersonalisasi lewat dashboard studio, jadi butuh model config longgar + `resolveConfig` + `/preview`. Tier `kisah` diekspresikan di **lapisan visual/animasi** yang dibangun di atas plumbing ini, bukan di plumbing-nya.

Yang **dipakai ulang apa adanya** (port dari soft-bloom, sesuaikan path/CDN):
- `lib/resolve-config.ts` — `demoConfig`, `EDITABLE_KEYS`, `overlayConfig`, `resolveConfig(slug)` (fetch Go API via `API_URL`, fallback demo, host-guard anti-spoof di `page.tsx`).
- `lib/config-types.ts` — config longgar `sections.order[]` / `sections.enabled{}`, plus `loveStory?`/`rundown?`/`turutMengundang?` opsional (draft studio lama toleran `undefined`).
- `lib/assets.ts` — `ASSET_BASE` = `${NEXT_PUBLIC_THEMES_CDN}/dongeng/kisah/twilight-castle` (fallback `/images` untuk dev).
- `lib/image-fallback.ts`, `lib/invitation-media.ts`, `lib/css-vars.ts`.
- `app/page.tsx` (host-guard + slug + `resolveConfig`), `app/preview/page.tsx` (postMessage studio), `app/layout.tsx`.
- `components/shared/InvitationExperience.tsx` — **termasuk invariant seam-safe**: `KNOWN_SECTIONS` + filter `hasContent` di `sectionIds` (bukan `null` di `renderSection`) supaya section tanpa data tidak meninggalkan seam dobel.
- `components/shared/EnvelopeOverlay.tsx`, `SectionSeam.tsx`, `MusicPlayer.tsx` (versi terbaru: tanpa tonearm, disc 52px), `GuestName.tsx`, `RevealController.tsx`.

Yang **diganti/baru** (lapisan dongeng):
- `globals.css` — token warna Twilight Royal + utility (lihat §5).
- Komponen shared botani (`SideVines`, `Meadow`, `Butterflies`, `CardVines`, `FloralTitle`, dll.) **diganti** dengan ornamen dongeng (lihat §4 & §6).
- Komponen baru **`RoyalGate`** (efek gerbang, §3).
- Semua `components/sections/*` di-*restyle* ke bahasa visual twilight (struktur/props sama, kulit beda).

---

## 3. `RoyalGate` — efek gerbang (spesifikasi teknis)

Komponen client full-viewport yang menggantikan `CoverSection` sebagai section pertama (id `cover`).

**Pendekatan: dua lapis foto (meniru mekanisme referensi), BUKAN clip-path.** Efek
"menembus gerbang" dibangun dari dua gambar fotografis (lihat §8):
- **Lapisan belakang** `DuniaIstana` — pemandangan istana dongeng senja/golden-hour
  (latar penuh, dilihat lewat lubang gerbang).
- **Lapisan depan** `GerbangDepan` — aula/ruang istana gelap dengan **jendela bulat
  ornamen emas, tengahnya lubang transparan** (alpha). Duduk di atas lapisan belakang.

**Mekanisme (Framer Motion, konsisten codebase — TANPA GSAP):**
- Bungkus dalam **spacer tinggi** (`height: ~220vh`) sebagai "runway" scroll; hero-nya `position: sticky; top: 0; height: 100dvh; overflow: hidden`.
- `useScroll({ target: spacerRef, offset: ["start start", "end start"] })` → `scrollYProgress` 0→1.
- `useTransform` memetakan progress ke:
  - **Lapisan belakang** (`DuniaIstana`): `scale` ~1 → ~2.4, sedikit `brightness`/`opacity`
    naik — dunia mendekat.
  - **Lapisan depan** (`GerbangDepan`): `scale` ~1 → ~4.5 (**lebih cepat** dari belakang)
    sehingga lubang jendela membesar melewati tepi layar & ruang gelap "terbang keluar",
    lalu `opacity` 1 → 0 di ~15% progress terakhir → lapisan depan lenyap, tinggal dunia istana.
  - **Nama mempelai + isyarat scroll**: `opacity` 1 → 0 di paruh awal.
- Selisih laju scale depan>belakang = ilusi *terbang menembus jendela masuk ke dunia*.
- Di progress 1: layar penuh `DuniaIstana`; section berikutnya (`greeting`) mengalir normal di bawah spacer.

**Integrasi & guard:**
- **`prefers-reduced-motion`**: lewati scrub — render langsung state "sudah masuk"
  (`GerbangDepan` hilang, `DuniaIstana` tampil), spacer dipendekkan ke `100dvh`.
  Gunakan `useReducedMotion()` Framer.
- **Scroll-snap**: region gerbang **tidak** ikut `scroll-snap` (spacer bebas-snap). Snapping section lanjut setelah spacer. Uji tidak ada "magnet" seperti bug scroller RSVP soft-bloom dulu.
- **Amplop dulu**: `EnvelopeOverlay` tetap pembuka; setelah dibuka, tamu berada di puncak `RoyalGate`. Reuse mekanisme pre-hidrasi hanya bila perlu; default: gerbang mulai dari progress 0.
- **Performa**: animasikan hanya `transform`/`opacity`/`filter` (compositable). Kedua gambar
  di-`priority`/preload (dua foto senja bisa berat — kompres agresif, sajikan dari CDN R2).
  Uji di Worker Cloudflare (OpenNext, `next build --webpack`) — tidak ada `ChunkLoadError`.

---

## 4. Sistem visual & motion

- **Reveal antar-section**: boleh **diaktifkan halus** (fade+rise ringan via `RevealController`) sebagai penanda tier kisah — beda dari kenangan yang reveal-nya dinonaktifkan. Jaga subtil; "wah" utama tetap di gerbang.
- **Fairy dust / bintang**: partikel via **CSS/Framer** (titik emas berkelip, drift lambat) — **bukan** gambar. Komponen `Stardust`/`Fireflies`.
- **Gaya keseluruhan: fotografis sinematik** (keputusan owner) — gerbang & dunia istana
  berupa foto-render AI, dan **section dalam memakai latar foto senja** (`LatarSenja`, dsb.)
  agar tak bentrok gaya dengan gerbang. Aksen **ornamen emas transparan** (sudut, pembatas,
  bingkai foto, siluet menara) ditumpuk di atas foto sebagai sentuhan istana.
- **Ornamen emas**: dari aset webp transparan (lihat ASSET_PROMPTS) dengan **fallback aman**
  (sembunyikan bila file belum ada, tak error).
- **Latar section**: foto senja full-bleed dari R2 + **scrim** gelap-transparan (CSS) agar teks
  terbaca; gradien twilight CSS sebagai fallback sebelum foto di-generate/di-upload.

---

## 5. Palet & token (Twilight Royal)

CSS custom properties di `globals.css` (nilai final boleh disetel saat implementasi):

| Token | Nilai | Nama |
|-------|-------|------|
| `--bg` | `#141024` | Twilight Deep |
| `--bg-2` | `#1f1838` | Dusk Violet |
| `--surface` | `#241c42` | Nebula Panel |
| `--gold` | `#d4af37` | Royal Gold |
| `--gold-light` | `#e8c874` | Candlelight |
| `--gold-dim` | `#8a6d3a` | Antique Gold |
| `--glow` | `#c97b84` | Horizon Blush |
| `--star` | `#f0ead6` | Starlight |
| `--text` | `#f4ead8` | Cream |
| `--text-muted` | `#b6a9c9` | Muted Lilac |
| `--border` | `rgba(212,175,55,0.22)` | Gold Border |
| `--shadow-card` | `0 6px 28px rgba(0,0,0,0.45)` | Card shadow |

**Tipografi** (via `next/font/google`): display serif elegan (mis. **Cormorant Garamond** / **Cinzel** untuk kesan royal) + body serif lembut (mis. **EB Garamond**) + label sans tracked (mis. **Jost**). Alias `.font-display` / `.font-body` / `.font-label`.

---

## 6. Section (set 13, sama seperti soft-bloom)

Urutan default `sections.order`:
`["cover","greeting","couple","lovestory","akad","resepsi","dresscode","gallery","rsvp","gift","rundown","turut","closing"]`

| id | Komponen | Catatan twilight |
|----|----------|------------------|
| cover | `RoyalGate` | **Gerbang zoom** (§3), ganti CoverSection |
| greeting | `GreetingSection` | Salam pembuka, ornamen menara |
| couple | `CoupleSection` | Foto dalam bingkai cincin emas |
| lovestory | `LoveStorySection` | Kronologi "kisah" bergaya bab dongeng |
| akad | `EventSection` | Kartu acara, aksen emas |
| resepsi | `EventSection` | idem |
| dresscode | `DressCodeSection` | Swatch warna |
| gallery | `GallerySection` | Galeri foto |
| rsvp | `RSVPSection` | **Tampilan-saja, tanpa D1** (§7) |
| gift | `GiftSection` | Amplop digital / rekening |
| rundown | `RundownSection` | Susunan acara |
| turut | `TurutMengundangSection` | Turut mengundang |
| closing | `ClosingSection` | Penutup + watermark (bilah penuh, pola terbaru) |

Watermark & `MusicPlayer` mengikuti revisi terbaru (tanpa tonearm, disc 52px, bilah "Dibuat oleh Rimba Digital").

---

## 7. RSVP — tanpa D1 (tampilan-saja)

Ikuti persis pola `soft-bloom/RSVPSection.tsx`: form lokal (`useState`), `handleSubmit` menunda ~1.2s lalu tampilkan state "Terima Kasih". **Tidak ada** `/api/rsvp`, **tidak ada** binding D1 di `wrangler.jsonc`, **tidak ada** `lib/rsvp.ts`.

> **Peningkatan opsional (di luar scope):** bila nanti perlu persistensi kehadiran, port pola D1 dari pavilion-romance (`/api/rsvp` + `lib/rsvp.ts` + binding `DB` + `migrations/`). Dicatat sebagai future work, bukan bagian rilis ini.

---

## 8. Aset & `ASSET_PROMPTS.md`

Buat `twilight-castle/ASSET_PROMPTS.md` mengikuti format tema lain (aturan umum + blok STYLE + tabel + prompt per-aset + konversi/upload + checklist). Estetika: **fotografis sinematik twilight royal** — gerbang (ruang gelap berjendela bulat) + dunia istana golden-hour, plus ornamen emas transparan.

**Gaya render: fotografis sinematik, di-generate AI** (gpt-image/Midjourney). Referensi cara kerja gerbang = dua file yang di-drop owner di folder tema (`…_main home.webp` = lapisan depan berlubang; `photo-…jpg` gunung = contoh lapisan belakang). **Kedua file itu hanya referensi, jangan ikut di-ship** (pindahkan ke `/references` atau hapus sebelum build).

**Prinsip pembagian:**
- **Di-generate (foto-render):** `GerbangDepan` (aula gelap + jendela bulat ornamen, tengah **lubang transparan**), `DuniaIstana` (istana dongeng senja/golden-hour, latar penuh), `LatarSenja` (latar section variasi).
- **Di-generate (ornamen emas transparan webp):** sudut emas, pembatas, bingkai foto cincin, siluet menara — sebagai aksen di atas foto.
- **CSS/partikel (BUKAN gambar):** fairy dust/bintang berkelip, gradien twilight fallback, glow horizon, scrim keterbacaan. AI sulit bikin partikel alpha halus; CSS lebih ringan.
- **Ikon fungsional:** `lucide-react` (`MapPin`, `CalendarHeart`, `Heart`, `Gift`, dll.) — tidak di-generate.

Dua aset **paling kritis**: `GerbangDepan` + `DuniaIstana` (tanpa keduanya efek gerbang tak jalan).

Semua aset webp di-wire dengan **fallback aman** (sembunyikan bila belum ada). File di-host di R2 `rimba-themes` path `dongeng/kisah/twilight-castle/` (via wrangler `--remote`), dev lokal fallback `/images`. **Jangan** pakai URL `pub-*.r2.dev` (diblok Kominfo) — selalu lewat `assets-themes.rimba.io`.

Daftar aset lengkap + prompt ada di `ASSET_PROMPTS.md` (dibuat bersamaan spec ini).

---

## 9. Config & integrasi studio

- `invitation.config.json` demo: data lengkap 13 section (couple, events, weddingDate, gallery, bankAccounts, loveStory, rundown, turutMengundang, dressCode, sections, music, theme). Foto demo boleh URL absolut (mis. Unsplash) atau path CDN undangan — `invitationPhoto()` melewatkan URL absolut apa adanya.
- `EDITABLE_KEYS` sama seperti soft-bloom (11 kunci) supaya studio/`/preview` otomatis mengenali section baru.
- `theme` (warna/tipografi) tetap dari demo config bundel — milik template, bukan user.

---

## 10. Uji & deploy

Ikuti `invitation/CLOUDFLARE_DEPLOYMENT.md`:
1. `bun install`
2. `bun dev` — cek visual (amplop → gerbang zoom → 13 section).
3. `bun run lint` — 0 error (warning `no-img-element` = pola rumah, boleh).
4. `bun run preview` — **worker lokal wajib**; smoke test: HTTP 200, gerbang & semua section muncul, 0 `ChunkLoadError`, `/preview` 200.
5. `bun run deploy` — simpan **Version ID** di catatan/commit.

Pendukung:
- Buat kategori baru: `dongeng/README.md` (tiru `floral/README.md`) + `dongeng/kisah/` (tier).
- `wrangler.jsonc`: `name: rimba-twilight-castle`, route custom domain `twilight-castle.rimba.io`, `vars` `NEXT_PUBLIC_THEMES_CDN` + `API_URL` (**tanpa** D1).
- `build` tetap `next build --webpack` (Turbopack + OpenNext + Windows = `ChunkLoadError`).
- Upload aset webp ke R2 `rimba-themes` (wrangler `--remote`).

---

## 11. Batasan & prinsip

- Framer Motion untuk semua animasi (termasuk gerbang) — **tanpa** GSAP/dependency baru.
- TypeScript strict, hindari `any`; komentar kode & dokumen **berbahasa Indonesia**.
- Semua gambar via config/CDN — tanpa path hardcoded; semua aset webp ber-fallback aman.
- Hormati `prefers-reduced-motion` (gerbang & reveal).
- Tooling Windows: `./node_modules/.bin/tsc.exe`, `./node_modules/.bin/eslint` (bukan `npx tsc`).
- **prada-melati tidak disentuh.**

---

## 12. Risiko & catatan

- **Gerbang × scroll-snap**: kombinasi sticky-spacer + `useScroll` dengan scroll-snap butuh pengujian cermat di iOS Safari (dvh + snap kadang rewel). Rencana mitigasi: region gerbang bebas-snap, uji di preview worker + perangkat nyata.
- **Kategori baru `dongeng/`**: pastikan router wildcard multi-tenant & konvensi path CDN mendukung kategori di luar floral/adat (cek `resolveConfig` + doc deploy). Bila ada asumsi hardcoded kategori, sesuaikan.
- **Aset belum ada saat build**: semua webp ber-fallback aman; tema tetap tayang (gradien + partikel CSS) sebelum aset di-generate/di-upload.
- **Belum di-commit**: seperti tema penulis lainnya, pastikan hasil masuk commit yang bisa ditelusuri sebelum deploy agar Version ID bisa dipetakan balik.
