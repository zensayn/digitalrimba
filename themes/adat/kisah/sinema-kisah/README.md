# Rimba Digital — Boilerplate Template Undangan

> Fondasi untuk semua template undangan digital Rimba Digital.
> Berisi core layer yang **tidak perlu diubah** antar tema + shell yang **wajib dikustomisasi** per tema.

---

## Struktur File

```
_boilerplate/
│
│  ← KONFIGURASI (isi ulang per klien/tema)
├── invitation.config.json
│
│  ← FIXED CORE (copy as-is, jangan diubah)
├── src/lib/
│   ├── config-types.ts       Kontrak TypeScript semua data
│   ├── css-vars.ts           Theme → CSS custom properties
│
├── src/data/
│   └── invitation.ts         Typed re-export dari config.json
│
├── src/components/
│   ├── RimbaConfigProvider.tsx   Context + Rimba Studio sync
│   ├── MusicPlayer.tsx           Floating music player
│   └── sections/                 ← KOSONG — isi per tema
│       └── .gitkeep              (baca instruksi di dalamnya)
│
│  ← TEMPLATE SHELL (edit sesuai tema)
├── src/app/
│   ├── layout.tsx            Metadata otomatis dari config
│   ├── page.tsx              Section registry (uncomment per section)
│   └── globals.css           CSS tokens + utility classes
│
│  ← TOOLCHAIN (fixed)
├── package.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
└── eslint.config.mjs
```

---

## Cara Membuat Tema Baru

### 1. Copy folder boilerplate

```bash
# Contoh: membuat tema "kisah-adat" di Timber Series
cp -r _boilerplate kategori-adat/kisah-series-tier/kisah-adat
cd kategori-adat/kisah-series-tier/kisah-adat
bun install
```

### 2. Ganti nama di `package.json`

```json
{ "name": "kisah-series-kisah-adat" }
```

### 3. Tentukan palet & font di `globals.css`

Cari semua token `REPLACE_*` dan isi sesuai tier:

| Tier | Style | Display Font | Body Font | Bg |
|---|---|---|---|---|
| Kenangan (1) | Minimalist | Poppins | Poppins | #FFFFFF |
| Kisah (2) | Elegant | Playfair Display | Source Sans Pro | #FAFAF8 |
| Warisan (3) | Luxe Dark | Cormorant Garamond | Inter | #0A0A08 |

### 4. Salin nilai yang sama ke `invitation.config.json → theme`

Token di `globals.css` dan `invitation.config.json → theme.colors` **harus identik** — karena `css-vars.ts` akan meng-override CSS vars dari config saat live preview di Studio.

### 5. Buat section components di `src/components/sections/`

Baca konvensi di `sections/.gitkeep`. Setiap section:
- `"use client"`
- Gunakan `useInvitationConfig()` untuk data
- Root element: `<section id="NAMA" className="snap-section">`

### 6. Uncomment section di `src/app/page.tsx`

```tsx
// Sebelum:
// case "cover": return <CoverSection key="cover" />;

// Sesudah (setelah CoverSection.tsx dibuat):
case "cover": return <CoverSection key="cover" />;
```

### 7. Ganti lagu di `MusicPlayer.tsx`

```ts
const MUSIC_SRC   = "/music/NAMA_FILE.mp3";
const SONG_TITLE  = "Judul Lagu";
const SONG_ARTIST = "Nama Artis";
```

Taruh file MP3 di `public/music/`.

---

## Cara Membuat Instance Klien Baru (dari tema yang sudah ada)

Jika tema sudah jadi dan ada klien baru yang memesan tema yang sama:

1. Copy folder tema: `cp -r sacred-luxe sacred-luxe-budi-ani`
2. Edit `invitation.config.json` — ganti semua data pasangan, event, galeri
3. Ganti foto di `public/images/`
4. Ganti lagu di `public/music/` (opsional)
5. `bun dev` untuk preview

---

## Alur Data (untuk dipahami sebelum mulai coding)

```
invitation.config.json
       │
       ├─→ src/data/invitation.ts          (typed re-export, static)
       │         └─→ layout.tsx            (ambil theme untuk CSS vars awal)
       │
       └─→ RimbaConfigProvider             (runtime config)
                 ├─→ mode iframe           listen postMessage dari Rimba Studio
                 └─→ mode standalone       fetch dari localhost:3100
                           │
                           └─→ useInvitationConfig()
                                     └─→ semua section components
```

---

## File yang TIDAK PERNAH perlu diubah

- `src/lib/config-types.ts`
- `src/lib/css-vars.ts`
- `src/data/invitation.ts`
- `src/components/RimbaConfigProvider.tsx`
- `tsconfig.json`
- `postcss.config.mjs`
- `eslint.config.mjs`

---

## FAQ

**Q: Kenapa ada dua tempat untuk theme colors (globals.css dan invitation.config.json)?**
A: `globals.css` adalah nilai awal saat halaman pertama dirender (SSR). `invitation.config.json → theme` dipakai oleh `css-vars.ts` untuk update live saat di Rimba Studio. Keduanya harus identik.

**Q: Kapan perlu tambah dependency baru ke `package.json`?**
A: Hanya jika tema butuh library spesifik (misal: `gsap` untuk animasi kompleks di Warisan tier, `gl-matrix` untuk efek WebGL). Jangan tambah jika tidak perlu — jaga bundle size.

**Q: Bagaimana cara Rimba Studio tahu template sudah siap?**
A: `RimbaConfigProvider` otomatis dispatch `postMessage({ type: "RIMBA_TEMPLATE_READY" })` ke parent window saat mount. Studio menunggu event ini sebelum mengirim config.
