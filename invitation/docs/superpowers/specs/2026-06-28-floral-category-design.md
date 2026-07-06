# Kategori `floral` — Design Doc

> Tanggal: 2026-06-28
> Status: Disetujui untuk scaffold

## Tujuan

Menambah **kategori tema baru `themes/floral`** dengan struktur dan model kerja
yang sama seperti `themes/adat`: tiga lapis **kategori → tier → tema**, di mana
setiap tema adalah aplikasi Next.js mandiri yang dijalankan dengan `bun dev`.

## Pembeda Tier

Berbeda dengan adat yang tier-nya dibedakan oleh estetika/palet, tier `floral`
dibedakan oleh **kekayaan komponen + animasi** (komponen dibuat menyusul):

| Folder | Tier | Harga | Level komponen & animasi |
|--------|------|-------|--------------------------|
| `kuncup/` | 1 · Basic | Basic | Komponen standar, layout bersih, animasi minimal (fade / scroll reveal) |
| `mekar/` | 2 · Standard | Rp300rb | Komponen lebih kaya, animasi sedang (parallax, stagger, transisi antar-section) |
| `puspa/` | 3 · Premium | Rp700rb | Komponen "wah" + animasi premium (interaktif, petal-fall/partikel, motion kompleks) |

Nama tier (Set A — Indonesia puitis) mengikuti metafora "makin mekar = makin kaya":
- **Kuncup** — tunas yang baru merekah.
- **Mekar** — bunga merekah penuh.
- **Puspa** — bunga agung (klasik/Sansekerta), mahakarya.

## Struktur Folder

```
themes/floral/
├── README.md              ← indeks kategori (improvement; adat tidak punya ini)
├── kuncup/
│   └── README.md          ← Tier 1 · Basic
├── mekar/
│   └── README.md          ← Tier 2 · Standard · Rp300rb
└── puspa/
    └── README.md          ← Tier 3 · Premium · Rp700rb
```

Tier folder hanya berisi `README.md` dulu. Folder tema (app Next.js) menyusul saat
komponen dibuat — persis seperti `adat/kisah/` & `adat/warisan/` yang saat ini baru
mencantumkan tema berstatus 🔜 Planned.

## Format README Tier

Mengikuti format README tier adat: judul + tagline, badge tier/harga, deskripsi
level komponen & animasi, tabel "Tema yang Tersedia" (awalnya kosong), cara
menjalankan (`cd <tema> && bun dev`), dan panduan menambah tema baru.

## Di Luar Scope

- Tidak membuat app Next.js / komponen apa pun di tahap ini.
- Tidak mengubah `themes/adat` atau tooling root.
