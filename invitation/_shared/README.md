# `_shared` — Rimba Invitation Shared Library

Berisi kode yang **dipakai bersama oleh semua tema undangan**. Setiap tema (warm-narrative, sacred-luxe, dll.) mengimport dari sini agar tidak ada duplikasi logika inti.

---

## Struktur

```
_shared/
├── components/
│   ├── MusicPlayer.tsx           # Music player default (waveform bar)
│   ├── InfiniteMenu.tsx          # Gallery 3D WebGL (icosphere)
│   └── InfiniteMenu.css
└── lib/
    ├── config-types.ts           # Tipe data InvitationConfig
    └── css-vars.ts               # Builder CSS variables dari objek tema
```

---

## Cara Pakai di Tema

### 1. Tipe data & config

```ts
import type { InvitationConfig } from "@shared/lib/config-types";
```

Semua `invitation.config.json` di setiap tema harus mengikuti shape `InvitationConfig`. Ini kontrak bersama — jangan ubah tipe ini tanpa memperbarui semua tema yang bergantung padanya.

### 2. Membaca config di Server Component

```tsx
import configJson from "../../../invitation.config.json";
import type { InvitationConfig } from "@/lib/config-types";

const config = configJson as InvitationConfig;
```

`page.tsx` membaca config secara server-side, lalu mengirim bagian data yang dibutuhkan ke section melalui props. Client Component hanya menerima props serializable.

### 3. CSS variables tema

```ts
import { buildCssVars } from "@shared/lib/css-vars";

const cssBlock = buildCssVars(config.theme);
// Output: `:root { --bg: #...; --gold: #...; --font-display: '...'; }`
```

Biasanya dipanggil di `layout.tsx` dan di-inject ke `<style>` tag atau `globals.css`.

### 4. Gallery 3D

```tsx
import InfiniteMenu from "@/components/shared/InfiniteMenu";

<InfiniteMenu items={galleryItems} />
```

`items` bertipe `GalleryItem[]` dari `config-types.ts`.

---

## Override per Tema

Komponen di `_shared` adalah **default generik**. Kalau satu tema butuh tampilan berbeda, buat versi sendiri di `src/components/shared/` tema tersebut — jangan ubah file `_shared`.

| Komponen | Kapan override |
|---|---|
| `MusicPlayer.tsx` | Desain player berbeda (misal: vinyl disk, minimal button) |
| `InfiniteMenu.tsx` | Jarang — hanya kalau butuh perilaku WebGL khusus |

**Contoh**: warm-narrative punya `src/components/shared/MusicPlayer.tsx` sendiri (vinyl disk). Perubahan di `_shared/components/MusicPlayer.tsx` tidak akan mempengaruhi warm-narrative.

---

## Aturan Penting

- **Jangan simpan aset tema** (gambar, font, musik) di sini — taruh di `public/` masing-masing tema
- **Jangan hardcode warna atau font** di komponen `_shared` — gunakan CSS variables (`var(--gold)`, `var(--bg)`) agar otomatis mengikuti tema
- **Perubahan `config-types.ts` bersifat breaking** — update semua `invitation.config.json` dan komponen yang terdampak di setiap tema
- **Jangan menambahkan config context untuk data statis** — gunakan Server Component dan props agar data tidak ikut meng-hydrate seluruh halaman
