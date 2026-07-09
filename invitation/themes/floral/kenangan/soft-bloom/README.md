# Soft Bloom

> **Kategori Floral · Tier Kenangan (Tier 1 — Basic)**
> Konsep: **Wildflower Pastel** — bunga liar pastel (daisy, lavender, ranunculus,
> cosmos, forget-me-not) di atas latar terang yang lapang.

Undangan Next.js mandiri. Sengaja dibuat **berbeda total** dari `warm-narrative`
(adat) yang bernuansa mawar-emas-blush. Lihat `DESIGN_SPEC.md` & `ASSET_PROMPTS.md`.

---

## Menjalankan

```bash
bun install
bun dev
# → http://localhost:3000
```

Coba nama tamu personal: `http://localhost:3000/?to=Nama%20Tamu`

---

## Aset gambar

Ornamen wildflower `.webp` transparan. Sumbernya diatur di `src/lib/assets.ts`:

- **Dev lokal:** otomatis ambil dari `public/images/` (env CDN tidak diset) —
  `bun dev` langsung tampil tanpa akses jaringan ke R2.
- **Produksi:** set `NEXT_PUBLIC_THEMES_CDN` saat build → aset diambil dari R2
  (`<CDN>/floral/kenangan/soft-bloom/<file>`).

Aset yang dipakai: `SudutBunga`, `BungaJatuh1–3`, `PembatasBunga`, `BingkaiFoto`,
`TangkaiKuncup`, `WreathInisial`. Background wash = CSS `radial-gradient`
(`.soft-wash`), bukan gambar.

---

## Sections (10 — tier kenangan)

`cover` · `greeting` · `couple` · `akad` · `resepsi` · `dresscode` · `gallery` · `rsvp` · `gift` · `closing`

Atur urutan & aktif/nonaktif di `invitation.config.json` → `sections`.

---

## Konten

Semua teks/data undangan ada di `invitation.config.json` (pasangan, acara, galeri,
rekening, palet warna, font). Tidak perlu sentuh komponen untuk ganti isi.
