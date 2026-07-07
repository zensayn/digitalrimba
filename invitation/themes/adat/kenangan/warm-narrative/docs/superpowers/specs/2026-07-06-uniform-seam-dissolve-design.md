# Uniform Seam Dissolve — Warm Narrative

**Tanggal:** 2026-07-06
**Status:** Disetujui

## Masalah

Batas antar section terlihat berbeda-beda, sehingga halaman tidak terbaca
sebagai satu gulungan kontinu. Dua penyebab:

1. **Band fade dihitung sebagai `%` tinggi section.** Mask ParallaxScene
   (`fadeTop`/`fadeBottom`) memakai persen dari tinggi scene. Section pendek
   (Gallery, ~1 viewport) mendapat kabut tipis; section panjang (LoveStory,
   ~3 viewport) mendapat kabut raksasa. Tebal dissolve tiap seam jadi acak.
2. **Nilai fade tidak konsisten antar section:** Cover `0/14`, Event `6/12`,
   Closing `14/0`, sisanya default `12/12`.

## Solusi

Seragamkan perlakuan dissolve di semua seam — tanpa menyentuh asset lukisan,
garland overhang, maupun arsitektur clipping scene.

### 1. Satuan mask: `%` → `svh` tetap (`ParallaxScene.tsx`)

```
linear-gradient(to bottom, transparent 0, #000 ${fadeTop}svh,
                #000 calc(100% - ${fadeBottom}svh), transparent 100%)
```

Band fade selalu setebal sama di semua section, berapa pun tinggi
sectionnya — hanya section multi-viewport yang terkoreksi dibanding
perilaku lama.

### 2. Nilai fade seragam (semua seam interior = 6svh)

Default `fadeTop`/`fadeBottom` di ParallaxScene = **6svh** — satu-satunya
tempat tebal seam diatur. Awalnya dicoba 12svh, tapi zona pucat gabungan
(12 + 12 = ~24svh) membuat lukisan antar section terasa berjauhan; 6svh
per sisi (~12svh total) terasa rapat tapi tetap lembut.

Section hanya meng-override untuk tepi terluar halaman (tanpa seam):

| Section  | Override                         |
| -------- | -------------------------------- |
| Cover    | `fadeTop={0}` (atas halaman)     |
| Closing  | `fadeBottom={0}` (bawah halaman) |
| Lainnya  | — (pakai default 6/6)            |

## Di luar cakupan

- Cross-fade antar lukisan background (opsi ditolak — struktural, berat).
- Edit tone asset background.
- Perubahan garland overhang (sudah menjembatani seam dengan baik).

## Verifikasi

`npm run build` hijau; cek visual di dev: semua seam punya tebal kabut sama
dan larut ke warna kertas yang sama.
