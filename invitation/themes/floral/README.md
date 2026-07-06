# Kategori Floral

> Undangan digital bertema bunga. Pembeda tier = **kekayaan komponen + animasi**,
> dari yang bersih & ringan sampai yang penuh & interaktif.

Setiap subfolder di bawah ini adalah **tier**. Di dalam tiap tier terdapat
tema-tema desain yang mandiri (masing-masing app Next.js tersendiri).

---

## Tier yang Tersedia

| Folder | Tier | Harga | Level komponen & animasi |
|--------|------|-------|--------------------------|
| `kuncup/` | 1 · Basic | Basic | Komponen standar, animasi minimal |
| `mekar/` | 2 · Standard | Rp300rb | Komponen lebih kaya, animasi sedang |
| `puspa/` | 3 · Premium | Rp700rb | Komponen "wah", animasi premium |

Metafora: **makin mekar, makin kaya** — Kuncup (tunas) → Mekar (merekah penuh) →
Puspa (bunga agung).

---

## Cara Menjalankan Tema

```bash
cd <tier>/<nama-tema>
bun dev
# → http://localhost:3000
```

---

## Panduan Menambah Tema Baru

1. Masuk ke tier yang sesuai: `cd kuncup` (atau `mekar` / `puspa`)
2. Buat folder tema: `mkdir nama-tema`
3. Init Next.js: `cd nama-tema && bun x create-next-app@latest ./`
4. Tambahkan baris baru di tabel "Tema yang Tersedia" pada README tier tersebut
