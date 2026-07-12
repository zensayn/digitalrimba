# Prada Melati — Layout Desktop 2-Panel

**Tanggal:** 2026-07-12
**Tema:** `adat/kenangan/prada-melati`
**Status:** desain disetujui; menunggu review spec
**Bersandar pada:** `2026-07-10-prada-melati-design.md`; pola
`warm-narrative/DesktopCover.tsx` + `soft-bloom/DesktopCover.tsx`

**Tujuan:** Prada belum punya layout desktop. Di layar lebar, undangan tampil
sebagai frame HP polos memenuhi lebar — tidak rapi. `warm-narrative` dan
`soft-bloom` memakai **layout 2-panel**: panel cover dekoratif mengisi sisi kiri,
kolom undangan selebar HP di kanan. Spec ini membawa pola yang sama ke prada,
dalam bahasa kelir-nya sendiri.

---

## 1. Struktur — `.app-shell`

`page.tsx` membungkus dua anak dalam `.app-shell`:

```
┌───────────────────────────┬──────────────┐
│                           │              │
│      DesktopCover         │ SnapContainer│
│   (panel kelir cover)     │  (kolom HP)  │
│      flex: 1 1 auto       │ clamp 360–420│
│                           │              │
└───────────────────────────┴──────────────┘
         ≥ 1024px: dua panel
         < 1024px: panel hilang, kolom full-width
```

**Breakpoint 1024px** (ikut `soft-bloom`). Di bawahnya `.desktop-cover`
`display:none` dan `.snap-container` kembali full-width — **mobile tak berubah
sama sekali**.

## 2. Panel `DesktopCover` — gemakan cover mobile

Me-reuse **`KelirScene`** dengan preset `cover` (`kelirFor("cover")`), kain
`KainBadan`. Tak ada duplikasi lapisan kelir. Isi:

- lapisan kelir dari `KelirScene`: KainBadan + pinggiran ×2 + tumpal +
  `AktorGunungan` + blencong;
- `RonceanMelati` (seperti `CoverSection`);
- `SceneContent` berisi:
  - label "Undangan Pernikahan" (font-label, `--text-dim`);
  - nama pasangan `{groom} & {bride}` (Marcellus besar, `clamp(40px, 4vw, 68px)`);
  - `gold-divider` + tanggal (`toLocaleDateString("id-ID", …)`, `--text-muted`);
  - blok tamu: label "Kepada Yth." + `<GuestName />` (Marcellus, `--gold`),
    dibungkus `<Suspense fallback={null}>`.

`GoldDust` global (`position: fixed`) sudah menyapu kedua panel — tak perlu
diubah. `forwardWheel`: roda mouse di panel kiri meneruskan scroll ke
`.snap-container` (pola `warm-narrative`), karena scroll terjadi di kontainer itu,
bukan window.

Komponen `"use client"` (GuestName membaca query param via `useSearchParams`).
Root `<aside>` memakai `aria-hidden="true"` (ikut `warm-narrative`): panel ini
gema dekoratif; undangan sebenarnya — termasuk cover section dan kontennya — ada
di kolom `.snap-container`, jadi panel disembunyikan dari screen-reader agar tak
terbaca ganda. Aset kelir tetap `alt=""`.

**Nol aset baru** — semua aset (KainBadan, PinggiranTile, TumpalBand,
AktorGunungan, RonceanMelati) sudah dipakai `CoverSection`, jadi di desktop tak
ada request jaringan tambahan.

### 2.1 GuestName

`GuestName` sudah ada (`src/components/GuestName.tsx`) tapi belum terpakai di
prada. Ia membaca nama tamu dari query URL (`?to=…`), fallback
"Tamu Undangan". Karena butuh hook query param, pemanggilnya wajib `Suspense`.
Prada tetap memakai `configJson` statis (bukan `resolveConfig(slug)`) — GuestName
bekerja independen lewat query param, jadi tak butuh multi-tenant. Lihat §5.

## 3. CSS (`globals.css`)

Ditambahkan setelah blok `.snap-container` yang ada:

```css
/* ─── Layout shell (desktop 2-panel) ─────────────────────────────────────── */
.app-shell { width: 100%; }
.desktop-cover { display: none; }

@media (min-width: 1024px) {
  .app-shell {
    display: flex;
    justify-content: flex-start;
  }
  .desktop-cover {
    display: block;
    position: relative;
    flex: 1 1 auto;
    height: 100dvh;
    overflow: hidden;
    border-right: 1px solid var(--border);
  }
  .snap-container {
    flex: 0 0 clamp(360px, 46vw, 420px);
    max-width: 420px;
    box-shadow: -24px 0 48px rgba(0, 0, 0, 0.35);
  }
}
```

Panel (`flex: 1 1 auto`) + kolom (`flex: 0 0 clamp(...)`) mengisi 100% lebar
tanpa celah, jadi `--bg` di belakang tak terlihat.

## 4. `page.tsx`

```tsx
import MusicPlayer from "@/components/MusicPlayer";
import GoldDust from "@/components/shared/GoldDust";
import DesktopCover from "@/components/shared/DesktopCover";
import SnapContainer from "@/components/shared/SnapContainer";
import { renderSection } from "@/components/RenderSection";
import type { InvitationConfig } from "@/lib/config-types";
import configJson from "../../invitation.config.json";

const config = configJson as InvitationConfig;

export default function Page() {
  const sectionIds = config.sections.order.filter((id) => config.sections.enabled[id]);

  return (
    <>
      <MusicPlayer />
      <GoldDust />
      <div className="app-shell">
        <DesktopCover couple={config.couple} weddingDate={config.weddingDate} />
        <SnapContainer>
          {sectionIds.map((id) => renderSection(id, config))}
        </SnapContainer>
      </div>
    </>
  );
}
```

## 5. Berkas tersentuh

| Berkas | Tindakan |
|---|---|
| `src/components/shared/DesktopCover.tsx` | **baru** — panel cover kelir + GuestName |
| `src/app/page.tsx` | bungkus `.app-shell`, pasang `DesktopCover` |
| `src/app/globals.css` | `.app-shell` / `.desktop-cover` / split `@media (min-width: 1024px)` |
| `scripts/__tests__/desktop.test.mjs` | **baru** — konformansi struktur & CSS |

## 6. Test (source-conformance)

- `page.tsx` merender `<DesktopCover` di dalam `<div className="app-shell">`.
- `DesktopCover.tsx` me-reuse `KelirScene` preset cover, memuat `GuestName`
  dalam `Suspense`, dan `forwardWheel` ke `.snap-container`.
- `globals.css`: default `.desktop-cover { display: none }`, dan blok
  `@media (min-width: 1024px)` menyetel `.app-shell { display: flex }` +
  `.snap-container { flex: 0 0 clamp(...) }`.

## 7. Verifikasi visual

Screenshot lebar (mis. 1440×900) untuk memastikan:
- proporsi panel kiri vs kolom kanan seimbang;
- gunungan & konten panel tidak melar/tercecer di panel lebar (tune sizing bila perlu);
- kolom kanan terbaca sebagai frame HP mengambang;
- di < 1024px tampilan mobile identik dengan sebelumnya.

## 8. Bukan cakupan

- Multi-tenant `resolveConfig(slug)` — prada tetap `configJson` statis.
- Gerbang pembuka / envelope overlay.
- Layout desktop untuk section non-cover (kolom kanan tetap snap section HP).
- Personalisasi GuestName di dalam section (mis. GreetingSection) — hanya panel.
