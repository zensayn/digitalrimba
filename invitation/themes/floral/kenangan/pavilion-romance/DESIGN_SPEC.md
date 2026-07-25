# Pavilion Romance · Tema Floral · Tier Kenangan

## Design Specification

> **Tier 1 — Kenangan** · Kategori Floral
> "Cerita cinta di bawah teduh paviliun taman."

## Konsep

**Garden Pavilion Storybook**: undangan terasa seperti halaman buku cerita
romantis yang dibuka di taman. Visual utamanya adalah paviliun, arch botani,
tekstur parchment ivory, dan rangkaian bunga yang bergerak halus seperti tertiup
angin. Nuansanya elegan dan personal. (Semula dirancang sebagai tier Kisah;
diturunkan ke Kenangan Juli 2026 — love story, video, dan icon event custom
dilepas, sisanya dipertahankan.)

## Color Tokens

| Token | Hex | Peran |
| --- | --- | --- |
| `--bg` | `#F8F2E7` | parchment ivory |
| `--surface` | `#FFF9EF` | panel kertas hangat |
| `--surface-2` | `#EFE4D2` | depth lembut |
| `--accent` | `#7A2940` | burgundy romantis |
| `--accent-soft` | `#C98F8D` | dusty rose |
| `--leaf` | `#7D9274` | sage garden |
| `--gold` | `#B8955E` | antique gold |
| `--text` | `#3E3328` | brown ink |

## Typography

| Element | Font | Karakter |
| --- | --- | --- |
| Nama & judul | Cormorant Garamond | klasik, editorial |
| Nama tamu & ampersand | Imperial Script | romantis |
| Body & label | Jost | bersih dan terbaca |

## Sections

1. Cover — pavilion garden, monogram frame, tanggal, countdown.
2. Greeting — sapaan tamu personal di panel parchment.
3. Couple — profil mempelai dengan frame floral.
4. Akad — event terpisah, maps, add to calendar.
5. Resepsi — event terpisah, maps, add to calendar.
6. Dress Code — tema busana dan swatch warna.
7. Gallery — foto dengan `GalleryFrame`.
8. RSVP / Wedding Wish — konfirmasi kehadiran dan ucapan.
9. Gift — amplop digital.
10. Closing — `ClosingGardenPavilion`, ucapan penutup, hashtag.

## Motion

- Bunga loop memakai `transform` rotate dengan `transform-origin` di pangkal.
- UI press state memakai scale `0.97`.
- Entrance section menggunakan opacity/translate/scale ringan.
- Reduced motion mematikan gerak dekoratif dan menjaga konten tetap terlihat.

## Asset Set

Asset prompt dan daftar file lengkap ada di `ASSET_PROMPTS.md`. Asset produksi
diambil dari R2 path `rimba-themes/floral/kenangan/pavilion-romance/`.

## Status

| Item | Status |
| --- | --- |
| Konsep & palet | Final |
| Asset prompt | Final |
| Asset R2 | Uploaded by user |
| Scaffold app + komponen | Implemented |
