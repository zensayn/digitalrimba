# Noir Vow — Prompt Generate Aset

Panduan generate aset untuk template **noir-vow** (kategori minimalist · tier
kenangan). Latar belakang **video milik pelanggan sendiri**, ornamen **CSS**.
Tidak ada satu pun gambar yang perlu digenerate di ChatGPT untuk tema ini.

Layout, margin, ritme, dan semua komponen struktural **disalin apa adanya dari
Soft Bloom** — yang berubah total isinya: dari ilustrasi bunga pastel penuh
warna → jadi video sinematik gelap + garis putih tipis di atasnya.

> **Konsep: "Quiet Ink".** Gelap, tenang, sedikit misterius — seperti film
> low-key lighting. Bukan gelap yang murung, tapi mewah dan intim.
>
> **Palet: hitam & putih saja.** Tidak ada warna lain, termasuk gold —
> `bg`/`surface` gradasi hitam-charcoal, `text`/`accent` putih. Sudah dikunci
> di `invitation.config.json`:
> `bg #0A0A0A · surface #141414 · surface2 #1F1F1F · accent #FFFFFF ·
> text #F2F2F2 · textMuted #A8A8A8 · textDim #7A7A7A`.
>
> **Elegant minimalist — tanpa elemen bunga/organik.** Ornamen murni garis &
> bentuk geometris (garis lurus, lengkung tipis, lingkaran, titik, belah
> ketupat), warna putih di atas latar gelap. Tidak ada daun, ranting, kelopak,
> atau siluet hewan.

---

## Video latar itu KONTEN PELANGGAN, bukan aset tema

Beda dari semua tema lain (Soft Bloom dkk yang asetnya sama untuk semua
pengguna tema), video Cover/Closing/Couple/Gallery/Akad/Gift di sini diisi
**video prewedding pelanggan sendiri** — beda per pasangan, diunggah lewat
studio. Ini sudah dibangun di kode:

- `invitation.config.json` → field `coverVideo: { file?, src? }` (pola sama
  persis dengan `music`: `src` = URL hasil unggah studio, menang atas `file`
  katalog; keduanya kosong = fallback).
- `EDITABLE_KEYS` di `resolve-config.ts` sudah memuat `coverVideo` — studio
  bisa menimpa field ini per-invitation.
- `invitationVideo()` di `invitation-media.ts` — resolver URL, pola sama
  dengan `invitationMusic()`.
- `SceneBackground.tsx` menerima prop `video` dan meneruskannya dari
  `coverVideo` lewat setiap section yang menampilkan latar.
- **Filter grayscale otomatis** (`filter: grayscale(1) contrast(1.05)
  brightness(0.85)`) dipasang di `<video>` — apa pun warna asli video
  pelanggan, tampil di layar SELALU monokrom hitam-putih sesuai tema. Pelanggan
  tidak perlu mengedit videonya sendiri.
- Kalau pelanggan belum unggah apa-apa (`coverVideo` kosong): fallback ke aset
  tema `AmbientLoop.mp4` (lihat di bawah) — supaya demo/preview tetap terasa
  hidup sebelum pelanggan mengisi datanya sendiri.

**Catatan bisnis yang masih perlu diputuskan:** di `DESIGN_SYSTEM.md`, "video"
adalah fitur tier **Kisah** (Rp300rb), bukan **Kenangan** (tier dasar tempat
noir-vow ini berada sekarang). Kalau video prewed jadi elemen sentral tema,
kemungkinan besar tema ini perlu naik tier — ini keputusan bisnis, bukan
teknis, jadi belum aku ubah.

---

## Syarat video yang perlu disampaikan ke pelanggan

| Aspek | Rekomendasi |
|---|---|
| Format | `.mp4` (H.264) — paling kompatibel di semua browser/HP |
| Rasio | Potret 9:16 (mis. 1080×1920) — situs mobile-first |
| Durasi | 15–40 detik idealnya kalau mau loop halus. Video panjang tetap bisa, browser otomatis loop dari awal setelah selesai (belum ada trim window seperti musik) |
| Ukuran file | Usahakan di bawah ±15MB — diputar otomatis di background, jangan bikin halaman berat di HP/koneksi lambat |
| Audio | Boleh ada suara di file asli — video background **selalu di-mute** otomatis (kebijakan autoplay browser), jadi tak akan terdengar |
| Warna asli | Bebas — filter grayscale di kode yang menyesuaikan ke hitam-putih, bukan pelanggan |

---

## Fallback tema — `AmbientLoop.mp4` (opsional, untuk demo/preview)

**Dipakai kalau `coverVideo` kosong** — supaya halaman demo & preview studio
(sebelum pelanggan unggah videonya) tetap terasa hidup, bukan latar polos.

**Prompt untuk tool video-gen** (Sora / Runway / Pika — bukan ChatGPT):
```
A slow, quiet, looping ambient video in extreme low-key cinematic lighting:
deep charcoal-black near-darkness with soft grayscale tones only — no color,
no warm tint, pure black-and-white/monochrome mood. A single soft light
source at the edge of frame (like fading window light or distant light
through fog). Subtle, very slow movement only — gentle drifting dust/embers
of white light, soft out-of-focus silhouette, or slow water ripple. No
visible faces, no fast motion, no color, no text. Calm, intimate, premium
mood. Seamlessly loopable.
```

Spesifikasi teknis sama seperti tabel di atas (mp4, potret, <15MB). Taruh di
`public/images/AmbientLoop.mp4` untuk dev lokal (nama foldernya `images`,
tapi `asset()` cuma menempel nama file — tipe file apa saja boleh).

---

## Ornamen — CSS (belum dikerjakan, masih rencana)

Semua ornamen garis/lingkaran/titik dibangun di CSS/komponen, warna putih
(`var(--accent)`), bukan gambar — cuma `SceneBackground` (video) yang sudah
selesai, sisanya menyusul:

| File lama (Soft Bloom) | Komponen | Jadi apa |
|---|---|---|
| `SudutBunga.webp` / `SudutBunga2.webp` | `SectionDecor`, `CardVines`, sudut Gallery | Lengkung tipis + titik putih di satu sudut |
| `SudutBawah.webp` | `BottomClusters` | Beberapa garis vertikal tinggi berbeda |
| `PembatasBunga.webp` | `FloralDivider`, `SectionSeam` | Garis tipis + diamond tengah |
| `GarlandBunga.webp` | `SectionSeam` | Garis lebih lebar + 2 titik tambahan |
| `RantingSamping.webp` | `SideVines`, `CardVines` | Garis vertikal + tick horizontal |
| `TangkaiKuncup.webp` | `FloralTitle`, ikon `EventSection`, `Meadow` | Garis pendek + lingkaran kecil |
| `Sprig1.webp` | `Meadow` | Sama, variasi tinggi |
| `BingkaiFoto.webp` | `CoupleSection` | `border` putih melingkar di foto |
| `WreathInisial.webp` | `CoverSection`, `DesktopCover` | Ring terbuka putih dengan celah |
| `Kupu.webp` | `Butterflies` | Titik cahaya putih lembut (`radial-gradient`), animasi sama seperti sekarang |
| `Burung.webp` | `Bird` | Lengkung tipis + tick pendek |
| `MeadowStrip.webp` | `Meadow` | Garis horizontal + tick berjarak |
| `BingkaiAtas.webp` | `TopFrame` | Lengkung tipis di atas frame |
| `BingkaiPenuh.webp` | `FullFrame` | Border tiga sisi + titik sudut |
| `KartuBunga.webp` | `BotanicalCard` | Panel `surface` + border putih, tanpa gambar |
| `AmplopFlapLeft.webp` | `EnvelopeOverlay` | Bentuk segitiga `clip-path` + border tipis |
| `StempelAmplop.webp` | `EnvelopeOverlay` | Lingkaran kecil + tanda garis/titik tengah |
| `LatarKertas.webp` | `PaperBackdrop` | Warna solid `var(--bg)` |

---

## Konversi & Upload (kalau nanti perlu gambar lain)

**Upload aset tema ke R2** (path mengikuti `THEME_CDN_PATH` di `theme-meta.ts`):
```bash
npx wrangler r2 object put rimba-themes/minimalist/kenangan/noir-vow/AmbientLoop.mp4 \
  --file ./public/images/AmbientLoop.mp4 --content-type video/mp4 --remote
```

Video pelanggan **tidak** lewat jalur ini — itu diunggah lewat studio ke bucket
`rimba-invitations`, bukan `rimba-themes`.

---

## Checklist

- [ ] Putuskan: tetap tier Kenangan atau naik ke Kisah (video = fitur berbayar)
- [x] `AmbientLoop.mp4` — fallback tema, sudah terpasang di `public/images/`
- [ ] 18 ornamen CSS — lihat tabel di atas, `SceneBackground` sudah selesai, sisanya menyusul
