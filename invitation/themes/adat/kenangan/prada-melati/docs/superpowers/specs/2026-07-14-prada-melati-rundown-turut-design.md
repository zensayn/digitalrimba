# Prada Melati — Section Baru: Rundown & Turut Mengundang (Design)

> Tanggal: 2026-07-14 · Branch: `feat/prada-melati-impl`

## Tujuan

Menambah dua section konten baru ke tema `adat/kenangan/prada-melati` agar tema
ini mendukung seluruh section lintas-tier (kemampuan tema, bukan isi paket —
lihat `themes/adat/kenangan/DESIGN_SPEC.md`):

- **`rundown`** — susunan acara, terpisah untuk Akad dan Resepsi.
- **`turut`** — daftar pihak yang turut mengundang (nama + keterangan).

"Kirim Kado" **tidak** jadi section baru: identik dengan Amplop Digital yang
sudah ada di section `gift` (rekening bank). Galeri video di luar cakupan.

Keduanya milik entitlement tier Warisan (§4.3); di prada dirender sebagai
kelebihan kemampuan tema dan bisa dimatikan per-penjualan lewat `sections.enabled`.

## Keputusan desain (dari brainstorming)

1. **Turut Mengundang** — struktur `{ name, note }[]` (nama + keterangan).
2. **Rundown** — terpisah per acara: `{ akad: RundownItem[]; resepsi: RundownItem[] }`.
3. **Urutan** — keduanya menjelang akhir: `...gift, rundown, turut, closing`.
4. **Tanpa aset baru** — preset Kelir me-reuse aktor/hem yang sudah ada.

## Skema data (`src/lib/config-types.ts`)

Penambahan kontrak (file "FIXED" boleh berubah saat kontrak berubah):

```ts
export interface RundownItem { time: string; title: string; }
export interface TurutMengundangItem { name: string; note: string; }

// dalam InvitationConfig:
rundown: { akad: RundownItem[]; resepsi: RundownItem[] };
turutMengundang: TurutMengundangItem[];
```

`invitation.config.json` diisi data dummy bertema Surakarta, konsisten dengan
data contoh yang sudah ada.

## Preset Kelir (`src/components/shared/sceneKelir.ts`)

Reuse aktor & hem yang sudah dipakai section lain — nol aset baru. Dipilih agar
tak kembar dengan tetangganya (`gift`=Melati, `closing`=Kayon):

| id | actor | actorScale | actorY | blencongY | blencongBright | hem |
|---|---|---|---|---|---|---|
| `rundown` | `CeplokKawung` | 0.50 | 26% | 30% | 0.42 | `HemKawung` |
| `turut` | `CeplokSulur` | 0.60 | 24% | 30% | 0.40 | `HemSulur` |

Kawung (geometris, tertib) menandai susunan waktu; Sulur (menjalar, guyub)
menandai kebersamaan pihak pengundang.

## Komponen

Keduanya **server component** (tanpa interaktivitas), pola persis
`DressCodeSection`: `<section className="snap-section">` → `KelirScene` (dengan
`kain="KainBadan"`) → `SceneContent`. Konten mengalir menumbuhkan section
(konsep satu-halaman prada; tanpa scroll dalam-section).

### `src/components/sections/RundownSection.tsx`

Props: `rundown: InvitationConfig["rundown"]`.

- Label `Rundown Acara`, heading `Susunan Acara`, `gold-divider`.
- Dua blok bertajuk **Akad** lalu **Resepsi**. Tiap blok = timeline vertikal;
  tiap baris `{ time, title }`: `time` warna `--gold` (font-label), `title`
  warna `--text` (font-body). Baris dipisah tipis `--border`.
- Blok kosong (array kosong) tidak dirender.

### `src/components/sections/TurutMengundangSection.tsx`

Props: `turutMengundang: InvitationConfig["turutMengundang"]`.

- Label `Turut Mengundang`, kalimat pengantar singkat, `gold-divider`.
- Daftar terpusat: `name` (font-display kecil, `--text`) + `note`
  (font-label, `--text-dim`).

## Wiring

- `src/components/RenderSection.tsx` — 2 import + 2 `case`:
  ```tsx
  case "rundown": return <RundownSection key="rundown" rundown={config.rundown} />;
  case "turut":   return <TurutMengundangSection key="turut" turutMengundang={config.turutMengundang} />;
  ```
- `invitation.config.json` — tambah `rundown`, `turutMengundang`; `sections.order`
  & `sections.enabled` menyisipkan `rundown`, `turut` sebelum `closing`.

## Verifikasi

- **Unit test** `scripts/__tests__/scene-kelir.test.mjs`: tambah `"rundown"`,
  `"turut"` ke `SECTION_IDS`; tambah entri HEM `rundown→HemKawung`,
  `turut→HemSulur`. `bun run test:scene` hijau.
- `bun run typecheck && bun run lint` bersih.
- Mata di `bun dev`: kilau/blencong/roncean tampil wajar pada kedua section,
  teks terbaca di atas scrim, reduced-motion tetap menampilkan seluruh konten.

## Bukan cakupan

- Aset emas baru (semua reuse).
- Dukungan video di gallery, ikon acara custom, editor warna/font — fitur tier
  lain, di luar dua section ini.
- Pendaftaran tema & deploy (tetap urusan Fase 2).
