# Rimba Studio — PRD
**Tanggal:** 2026-05-28
**Status:** v3 — element-level editing
**Scope:** Developer tool (internal)
**Base:** Custom studio (config-driven), bukan Puck

---

## 1. Problem Statement

Membangun dan mengiterasi template undangan di Rimba Digital mengharuskan edit kode Tailwind + TypeScript manual. Lambat dan sulit untuk developer tanpa background desain. Kebutuhan editing terbagi 3 level:

1. **Konten** — nama, tanggal, venue, foto (✅ sudah bisa)
2. **Tema** — warna, font (✅ sudah bisa)
3. **Posisi elemen** — pindah/atur tiap elemen di dalam section (← fokus dokumen ini)

---

## 2. Status: Yang Sudah Dibangun

Studio hidup di `sacred-luxe-copied/src/app/studio/` sebagai custom React app (bukan Puck — lihat Decision Log §7).

| Fitur | Status |
|---|---|
| `invitation.config.json` sebagai source of truth | ✅ |
| `src/lib/config-types.ts` typed schema | ✅ |
| `invitation.ts` baca dari config | ✅ |
| API route `GET/POST /api/config` | ✅ |
| Edit konten per section (form fields) | ✅ |
| Edit tema (9 warna + 2 font) via CSS variables | ✅ |
| Reorder **section** (drag native HTML5) | ✅ |
| Undo/redo (Ctrl+Z / Ctrl+Shift+Z) | ✅ |
| Auto-save + live preview (iframe refresh) | ✅ |

**Yang BELUM ada dan diminta:** editing di level **elemen individual** (heading, foto, tombol), bukan hanya section.

---

## 3. Goal Baru: Element-Level Editing

Klik elemen apa pun di preview → pilih → ubah propertinya (posisi, urutan, alignment, warna, ukuran teks, spacing) → langsung kelihatan + tersimpan.

---

## 4. Batasan yang HARUS Dipahami Dulu

Ini menentukan seluruh desain, jadi dibaca dulu.

### "Pindah lokasi elemen" di web ≠ di Figma

Figma pakai **absolute positioning** (taruh elemen di koordinat X,Y bebas). Web undangan harus **responsive** — 80%+ tamu buka dari HP. Kalau elemen ditaruh di koordinat pixel absolut, tampilan hancur di layar ukuran lain.

Maka "pindah lokasi elemen" diterjemahkan jadi **3 operasi yang responsive-safe:**

| Operasi | Contoh | Aman responsive? |
|---|---|---|
| **Reorder** dalam parent | Pindah quote ke atas nama | ✅ |
| **Alignment** | Foto rata kiri/tengah/kanan | ✅ |
| **Spacing** | Jarak antar elemen, padding | ✅ |
| ❌ Free pixel X/Y drag | Taruh elemen di (320px, 540px) | ❌ Rusak di mobile |

> **Keputusan:** Studio mendukung reorder + alignment + spacing per elemen. TIDAK mendukung free pixel positioning. Ini bukan keterbatasan tool, tapi keterbatasan web responsive — Figma bisa karena canvas-nya fixed-size, undangan tidak.

---

## 5. Desain Teknis

Pendekatan: **selection overlay + per-element override store**. TIDAK pakai Craft.js (lihat §7), kode undangan tetap utuh — hanya ditambah atribut ID dan satu pembacaan override map.

### 5.1 Identifikasi Elemen

Tiap elemen yang ingin bisa diedit diberi ID logis yang stabil (bukan posisi source code):

```tsx
// Sebelum
<h1 className="font-display text-gold-shimmer">{couple.groom.name}</h1>

// Sesudah — tambah data-edit-id
<h1 data-edit-id="cover.groomName" className="font-display text-gold-shimmer">
  {couple.groom.name}
</h1>
```

ID logis (`cover.groomName`) dipilih daripada ID source-position dari `@onlook/nextjs` SWC plugin, karena:
- Override disimpan ke **config** (bukan edit file `.tsx`), jadi ID harus stabil terhadap perubahan kode
- Tidak perlu Tailwind class parser (bagian tersulit yang dihindari)

> `@onlook/nextjs` tetap terinstall tapi **belum diaktifkan** di `next.config.ts`. Untuk pendekatan config-driven ini kita pakai `data-edit-id` manual, bukan SWC plugin.

### 5.2 Override Store di Config

Schema config ditambah satu bagian `overrides`:

```json
{
  "content": { ... },
  "theme": { ... },
  "overrides": {
    "cover.groomName": {
      "color": "#E8D5A0",
      "fontSize": "72px",
      "textAlign": "center",
      "marginBottom": "8px"
    },
    "cover.quote": {
      "order": -1
    }
  }
}
```

### 5.3 Penerapan Override di Undangan

Satu helper kecil membaca override map dan menerapkannya sebagai inline style:

```tsx
// src/lib/overrides.ts
import overrides from "../../invitation.config.json";
export function ov(id: string): React.CSSProperties {
  return (overrides.overrides?.[id] ?? {}) as React.CSSProperties;
}

// Pemakaian di elemen
<h1 data-edit-id="cover.groomName" style={ov("cover.groomName")}>
```

Animasi (Framer Motion, GSAP, WebGL) **tidak tersentuh** — kita hanya menambah `style` dan `data-edit-id`, tidak mengubah struktur tree atau lifecycle.

### 5.4 Selection Overlay (di dalam iframe preview)

Script kecil di-inject saat `?preview=1`:

```
1. Listen klik pada elemen ber-[data-edit-id]
2. Gambar kotak highlight di sekeliling elemen terpilih
3. window.parent.postMessage({ type: "select", id, rect, computedStyle })
4. Listen pesan balik { type: "apply", id, style } → terapkan inline live (tanpa reload)
```

### 5.5 Property Panel (di studio)

Saat menerima `select`, studio menampilkan panel:
- **Teks** (kalau elemen teks): edit konten
- **Warna**: color picker
- **Ukuran teks**: slider/input
- **Alignment**: kiri / tengah / kanan
- **Urutan dalam parent**: naik / turun
- **Spacing**: margin & padding

Tiap perubahan → postMessage ke iframe (live) + tulis ke `overrides` (persist via API yang sudah ada).

### 5.6 Data Flow

```
Klik elemen di iframe
   → postMessage(select) ke studio
   → panel muncul
   → user ubah properti
   → postMessage(apply) ke iframe   [live, tanpa reload]
   → tulis ke config.overrides       [debounced auto-save]
```

---

## 6. Phased Delivery

### Phase 3a — Proof of Concept (estimasi: ~3 hari)
**Goal:** Buktikan satu elemen bisa diklik, dipilih, dan diubah warnanya tanpa merusak animasi.

- Tambah `data-edit-id` ke 3 elemen di CoverSection (nama pria, nama wanita, quote)
- Inject selection overlay script di mode `?preview=1`
- postMessage channel studio ↔ iframe
- Panel minimal: color picker untuk elemen terpilih
- Override store + helper `ov()`
- **Gate:** animasi shimmer + countdown masih jalan normal

### Phase 3b — Property Lengkap (estimasi: ~1 minggu)
- Kontrol: ukuran teks, alignment, spacing, edit teks inline
- Highlight overlay yang rapi (hover + selected state)
- Live apply tanpa reload (sekarang preview reload tiap save)

### Phase 3c — Cakupan Penuh (estimasi: ~1–2 minggu)
- `data-edit-id` di semua 11 section
- Reorder elemen dalam section (via CSS `order`)
- Reset override per elemen / per section
- Panel tree elemen (opsional)

**Total realistis: ~3–4 minggu** dengan AI assistance. Ini phase terbesar sejauh ini.

---

## 7. Decision Log

### Kenapa BUKAN Puck
Puck 0.20.2 pin ke `@dnd-kit/react 0.1.18` yang **crash di React 19** ("Cannot start a drag operation"). Override ke versi lain gagal: `0.4.0` → API incompatible ("object is not iterable"), `0.1.21` → module resolution rusak. Bahkan canary Puck terbaru masih pin versi yang sama. Kesimpulan: Puck belum production-ready untuk React 19. Diganti custom studio.

### Kenapa BUKAN Craft.js
Craft.js bagus untuk editor di mana editor memiliki rendering tree. Undangan ini animation-heavy (Framer Motion, GSAP, WebGL, snap-scroll) — Craft.js re-render node saat select/drag akan bertabrakan dengan lifecycle animasi. Element-level sejati berarti tiap elemen jadi Craft node = rewrite besar yang mempertaruhkan polish premium (justifikasi tier Rp 700rb). Pendekatan overlay + override store mencapai tujuan tanpa rewrite.

### Kenapa BUKAN edit source code langsung (à la Onlook)
Butuh Tailwind class parser + bidirectional sync — kompleksitas berbulan-bulan. Override store di config mencapai 90% manfaat tanpa menyentuh `.tsx`.

### Catatan strategis
Element-level editing adalah investasi besar. Rekomendasi: **pakai dulu studio yang ada untuk 1 undangan klien sungguhan** sebelum membangun Phase 3, untuk memvalidasi bahwa ini benar-benar bottleneck — bukan asumsi. 80% pekerjaan undangan adalah ganti konten + warna, yang sudah bisa.

---

## 8. Out of Scope (tidak dibangun)

- ❌ Free pixel X/Y positioning (rusak responsive)
- ❌ Bidirectional sync ke file `.tsx` manual
- ❌ Client-facing editor (menunggu database — fase terpisah)
- ❌ AI code generation
