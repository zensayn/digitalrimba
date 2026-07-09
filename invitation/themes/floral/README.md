# Kategori Floral

> Undangan digital bertema bunga. Pembeda tier = **kekayaan komponen + animasi**,
> dari yang bersih & ringan sampai yang penuh & interaktif.

Setiap subfolder di bawah ini adalah **tier**. Di dalam tiap tier terdapat
tema-tema desain yang mandiri (masing-masing app Next.js tersendiri).

---

## Tier yang Tersedia

| Folder | Tier | Harga | Level komponen & animasi |
|--------|------|-------|--------------------------|
| `kenangan/` | 1 · Basic | Basic | Komponen standar, animasi minimal |
| `kisah/` | 2 · Standard | Rp300rb | Komponen lebih kaya, animasi sedang |
| `warisan/` | 3 · Premium | Rp700rb | Komponen "wah", animasi premium |

Nama tier mengikuti struktur tema adat: Kenangan → Kisah → Warisan.

---

## Cara Menjalankan Tema

```bash
cd <tier>/<nama-tema>
bun dev
# → http://localhost:3000
```

---

## Panduan Menambah Tema Baru

1. Masuk ke tier yang sesuai: `cd kenangan` (atau `kisah` / `warisan`)
2. Buat folder tema: `mkdir nama-tema`
3. Init Next.js: `cd nama-tema && bun x create-next-app@latest ./`
4. Tambahkan baris baru di tabel "Tema yang Tersedia" pada README tier tersebut
