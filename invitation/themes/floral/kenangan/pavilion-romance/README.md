# Pavilion Romance

> **Kategori Floral · Tier Kenangan (Tier 1)**
> Konsep: **Garden Pavilion Storybook** — paviliun taman, parchment ivory,
> botanical arch, dusty rose, sage, burgundy, dan antique gold.

Template Next.js mandiri untuk undangan floral tier Kenangan. Dibangun dari
fondasi Soft Bloom dengan section: cover, salam, pasangan, Akad/Resepsi,
dress code, galeri foto, RSVP, wedding wish, amplop digital, dan closing.
(Semula dirancang sebagai tier Kisah — love story, galeri video, dan ikon
event custom sudah dilepas saat turun tier, Juli 2026.)

## Menjalankan

```bash
npm install
npm run cf-typegen
npm run dev
# http://localhost:3000
```

Coba nama tamu personal: `http://localhost:3000/?to=Nama%20Tamu`

## RSVP

Form RSVP bersifat kosmetik: submit hanya menampilkan layar "Terima Kasih" tanpa
menyimpan data ke mana pun (tim memutuskan tidak jadi memakai Cloudflare D1).
Selaras dengan perilaku soft-bloom satu tier.

Panduan lengkap deployment ada di [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Aset Gambar

Media dibagi menjadi dua domain R2:

- Asset dekoratif tema: `<NEXT_PUBLIC_THEMES_CDN>/floral/kenangan/pavilion-romance`
  melalui `src/lib/assets.ts`. Fallback dev: `https://assets-themes.rimba.io`.
- Foto customer dan social image: `<NEXT_PUBLIC_PHOTOS_CDN>/<path>`
  melalui `src/lib/invitation-media.ts`. Fallback dev:
  `https://assets-invitations.rimba.io`.

`invitation.config.json` menyimpan path relatif media customer, misalnya
`pavilion-romance/couple/groom.webp`; URL HTTP(S) absolut tetap didukung untuk
preview sementara. Untuk produksi, gunakan nama file versioned/content-hashed
dan metadata R2 `Cache-Control: public, max-age=31536000, immutable`. Jangan
memakai cache immutable untuk nama file yang akan ditimpa.

Asset utama: `HeroPavilionFrame`, `TopBotanicalCanopy`, `PavilionArch`,
`GalleryFrame`, `WeddingWishFrame`, `ClosingGardenPavilion`, dan asset bunga
loop `SwayRoseCluster`, `SwayVineSprig`, `SwayLeafBranch`.

## Sections

`cover` · `greeting` · `couple` · `akad` · `resepsi` ·
`dresscode` · `gallery` · `rsvp` · `gift` · `closing`

Urutan dan aktif/nonaktif section diatur melalui `invitation.config.json`.

## Konten

Semua data undangan ada di `invitation.config.json`: pasangan, acara, galeri,
rekening, dress code, palet warna, metadata media, dan section.

Tipografi Cormorant Garamond, Jost, dan Imperial Script adalah identitas tetap
Pavilion Romance dan dimuat melalui `next/font` di `src/app/layout.tsx`.
`theme.typography` di config bersifat metadata deskriptif; mengubah nilainya tidak
mengganti file font yang dimuat. Warna tema tetap dikonfigurasi melalui
`theme.colors`.
