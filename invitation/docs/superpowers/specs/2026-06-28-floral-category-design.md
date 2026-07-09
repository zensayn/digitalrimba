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
| `kenangan/` | 1 · Basic | Basic | Komponen standar, layout bersih, animasi minimal (fade / scroll reveal) |
| `kisah/` | 2 · Standard | Rp300rb | Komponen lebih kaya, animasi sedang (parallax, stagger, transisi antar-section) |
| `warisan/` | 3 · Premium | Rp700rb | Komponen "wah" + animasi premium (interaktif, petal-fall/partikel, motion kompleks) |

Nama tier mengikuti struktur tema adat:
- **Kenangan** — Tier 1 · Basic.
- **Kisah** — Tier 2 · Standard.
- **Warisan** — Tier 3 · Premium.

## Struktur Folder

```text
themes/floral/
├── README.md              ← indeks kategori (improvement; adat tidak punya ini)
├── kenangan/
│   ├── README.md          ← Tier 1 · Basic
│   └── soft-bloom/
│       └── README.md      ← Soft Bloom
├── kisah/
│   └── README.md          ← Tier 2 · Standard · Rp300rb
└── warisan/
    └── README.md          ← Tier 3 · Premium · Rp700rb
```

Tier folder berisi README tier dan dapat berisi folder tema mandiri. Saat ini
`kenangan/soft-bloom/` sudah menjadi app Next.js floral pertama; tier lain dapat
menyusul dengan pola struktur yang sama.

## Format README Tier

Mengikuti format README tier adat: judul + tagline, badge tier/harga, deskripsi
level komponen & animasi, tabel "Tema yang Tersedia" (awalnya kosong), cara
menjalankan (`cd <tema> && bun dev`), dan panduan menambah tema baru.

## Di Luar Scope

- Tidak membuat app Next.js / komponen apa pun di tahap ini.
- Tidak mengubah `themes/adat` atau tooling root.
