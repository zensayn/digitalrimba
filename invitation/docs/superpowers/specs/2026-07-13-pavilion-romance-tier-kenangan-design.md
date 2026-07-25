# Pavilion Romance — Pindah Tier Kisah → Kenangan

**Tanggal:** 2026-07-13
**Status:** Disetujui owner (opsi "Pindah penuh")

## Latar

Konsep visual Pavilion Romance dipertahankan, tapi template dipasarkan sebagai
paket **Kenangan** (Rp150.000, Tier 1) seperti soft-bloom — bukan Kisah.
Mengacu `themes/floral/Spesifikasi-Fitur-Rimba-Digital.md`, fitur kisah-only
yang harus hilang dari template: Love Story, Galeri Video, dan Icon Event
custom. Gallery/dresscode/gift/akad+resepsi tetap ada — soft-bloom (acuan
kenangan yang sudah rilis) juga memilikinya.

## Perubahan

### 1. Lokasi & penamaan

- `git mv themes/floral/kisah/pavilion-romance themes/floral/kenangan/pavilion-romance`
- `src/lib/assets.ts`: `THEME_ASSET_BASE` → `${THEME_CDN}/floral/kenangan/pavilion-romance`
- `package.json`: name → `floral-kenangan-pavilion-romance` (+ `bun install`
  untuk sinkron `bun.lock`)
- README.md, DESIGN_SPEC.md, ASSET_PROMPTS.md: Tier Kisah → Tier Kenangan
  (Tier 1) + path R2 baru; entri asset kisah-only (EventIconAkad/Resepsi,
  StoryFrame, VideoFrame) dihapus dari daftar.
- TIDAK berubah: worker name `rimba-pavilion-romance`, D1 database, domain
  `pavilion-romance.rimba.io` — tidak mengandung tier.
- Nama file asset (mis. `FloralDividerKisah.webp`, `PaperTextureKisah.webp`)
  TIDAK di-rename — rename berarti regenerate/re-upload tanpa manfaat visual.

### 2. Hapus fitur kisah-only

- Hapus `LoveStorySection.tsx` dan `VideoSection.tsx`.
- `InvitationExperience.tsx`: hapus import + case `love-story` & `video`.
- `config-types.ts`: hapus `"love-story"`/`"video"` dari `SectionId`, field
  `loveStory`/`video`, interface `LoveStoryItem`/`VideoGallery`.
- `invitation-config.ts`: hapus dari `SECTION_IDS`.
- `invitation.config.json`: hapus data `loveStory` & `video` + entri di
  `sections.order`/`sections.enabled`.
- `data/invitation.ts`: hapus export `loveStory` & `video`.
- `EventSection.tsx`: hapus `<img EventIconAkad/Resepsi>` — heading cukup
  `FloralTitle`, persis pola soft-bloom.

### 3. Pemindahan R2 (sudah dieksekusi, 2026-07-13)

23 object dipindah dari `rimba-themes/floral/kisah/pavilion-romance/` ke
`floral/kenangan/pavilion-romance/` via `wrangler r2 object get/put/delete
--remote` (atas izin owner): 18 asset yang direferensikan kode + 5 asset
kisah-only/unused (EventIconAkad/Resepsi, StoryFrame, VideoFrame,
SideBotanicalVines) ikut dipindah supaya tidak hilang. Semua diverifikasi
HTTP 200 di CDN path baru sebelum object lama dihapus.

## Verifikasi

`bunx tsc --noEmit`, eslint file berubah, dan `bun run build` dari lokasi baru.
