# Kenangan · Kategori Floral

> **Tier 1 — Basic**
> Tier pembuka yang bersih, ringan, mudah dibaca, dan tetap terasa selesai.

Setiap subfolder di bawah ini adalah tema desain mandiri. Untuk template baru,
`soft-bloom/` menjadi tolok ukur kualitas tier Kenangan: struktur, polish,
aksesibilitas, aset R2, dan pengalaman opening gate minimal harus setara.

---

## Standar Tier

Kenangan adalah tier Basic, tetapi bukan template kosong. Template baru di tier
ini wajib punya:

- opening gate dengan sapaan tamu dan tombol buka undangan;
- layout mobile-first dan desktop split cover seperti Soft Bloom;
- section utama lengkap: cover, greeting, couple, akad, resepsi, dress code,
  gallery, RSVP, gift, closing;
- dekorasi floral yang menyambung antar-section;
- aset `.webp` dari R2 dengan fallback lokal;
- konten terpusat di `invitation.config.json`;
- aksesibilitas dasar untuk gate dan gambar dekoratif.

Fitur berat seperti WebGL, partikel padat, parallax kompleks, QR check-in,
multi-bahasa, dan narasi sinematik tetap untuk tier Kisah atau Warisan.

---

## Tema yang Tersedia

| Folder | Tema | Aesthetic | Status |
|--------|------|-----------|--------|
| `soft-bloom/` | Soft Bloom | Wildflower Pastel — lilac · butter · powder-blue | ✅ Benchmark tier |
| `pavilion-romance/` | Pavilion Romance | Garden Pavilion Storybook — parchment ivory · dusty rose · sage · burgundy | ✅ Turun tier dari Kisah (Jul 2026) |

---

## Cara Menjalankan Tema

```bash
cd <nama-tema>
bun install
bun dev
# → http://localhost:3000
```

Coba personalisasi tamu:

```text
http://localhost:3000/?to=Nama%20Tamu
```

---

## Panduan Menambah Tema Baru

1. Buat folder baru: `mkdir nama-tema`
2. Gunakan `soft-bloom/` sebagai referensi struktur dan standar UX.
3. Buat `DESIGN_SPEC.md` dan `ASSET_PROMPTS.md` untuk tema tersebut.
4. Simpan aset lokal di `public/images/`.
5. Upload aset produksi ke `rimba-themes/floral/kenangan/<nama-tema>/`.
6. Pastikan `src/lib/assets.ts` menunjuk `<CDN>/floral/kenangan/<nama-tema>`.
7. Jalankan `bun run lint` dan `bun run build`.
8. Tambahkan baris baru di tabel "Tema yang Tersedia".
