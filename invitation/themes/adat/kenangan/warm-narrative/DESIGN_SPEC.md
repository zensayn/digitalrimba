# Warm Narrative

## Design Specification (Tema)

> Kategori **Adat** · tinggal di tier `kenangan/`

Spec ini mendefinisikan **identitas visual tema**. Section mana yang aktif
ditentukan oleh entitlement tier, bukan oleh dokumen ini — lihat
`../DESIGN_SPEC.md`.

---

### Aesthetic

Seperti lembaran buku cerita yang indah — hangat, editorial, penuh tekstur.
Setiap section terasa seperti babak baru dalam sebuah narasi. Parchment hangat,
tembaga, serif editorial, dan sakura yang berguguran.

---

### Color Tokens

Token warna tema berlapis dua. **Membaca `globals.css` saja menyesatkan.**

#### Lapisan runtime (ditimpa `buildCssVars`)

`buildCssVars` di `_shared/lib/css-vars.ts` menimpa sembilan token berikut dari
`theme.colors` pada `invitation.config.json`. Nilai di kolom kiri inilah yang
benar-benar dirender; nilai `:root` di `globals.css` hanya fallback.

| Token | Nilai render | Nama |
|-------|--------------|------|
| `--bg` | `#FAF7F2` | Warm Parchment |
| `--surface` | `#F2EDE4` | Cream |
| `--surface-2` | `#E8E0D4` | Linen |
| `--gold` | `#C07830` | Copper Gold |
| `--gold-light` | `#D4A056` | Warm Amber |
| `--gold-dim` | `#A0917E` | Taupe |
| `--text` | `#2A2218` | Dark Walnut |
| `--text-muted` | `#6B5E4E` | Warm Brown |
| `--text-dim` | `#A0917E` | Taupe |

#### Lapisan statik (tidak dapat ditimpa)

Didefinisikan di `globals.css` dan tidak disentuh `buildCssVars`.

| Token | Nilai | Catatan |
|-------|-------|---------|
| `--border` | `rgba(153,81,26,0.28)` | Copper Border |
| `--gold-deep` | `#8A4A16` | Copper pekat untuk teks kecil di atas floral ramai |
| `--paper-texture` | `rgba(192,120,48,0.04)` | Tekstur kertas |
| `--shadow-warm` | `0 4px 24px rgba(42,34,24,0.08)` | Bayangan hangat |
| `--shadow-card` | `0 2px 16px rgba(42,34,24,0.06)` | Bayangan kartu |

> `--gold-deep` sengaja dinamai lain, bukan `--gold`. Kalau ia memakai nama
> `--gold`, ia akan ikut tertimpa runtime menjadi copper terang `#C07830` yang
> tenggelam di atas bunga pink.

---

### Typography

Dimuat di `src/app/layout.tsx` via `next/font/google`.

| Element | Font | Kelas |
|---------|------|-------|
| Hero Names, Section Title | Playfair Display | `.font-display` |
| Body | Source Serif 4 | `.font-body` |
| Labels | Inter | `.font-label` |

`--font-display` dan `--font-body` juga ditimpa runtime dari
`theme.typography` pada `invitation.config.json`.

---

### Kosakata Motion

Semuanya di `src/components/shared/`.

| Komponen | Peran |
|----------|-------|
| `ParallaxScene.tsx` | Lapisan parallax berlapis pada scene |
| `FallingFlowers.tsx` | Sakura berguguran |
| `EnvelopeOverlay.tsx` | Amplop pembuka sebelum undangan terbuka |
| `DesktopCover.tsx` | Sampul khusus viewport lebar |
| `SnapContainer.tsx` | Scroll snap antar-section |
| `MotionProvider.tsx` | Konteks motion bersama |

---

### Section yang Didukung (11)

Terdaftar di `src/components/RenderSection.tsx`. Ini kemampuan tema, **bukan**
daftar section yang aktif — entitlement tier yang menentukan itu lewat
`sections.enabled`.

`cover` · `greeting` · `couple` · `lovestory` · `akad` · `resepsi` ·
`dresscode` · `gallery` · `rsvp` · `gift` · `closing`

> Tema ini belum memiliki `weddingwish`, padahal tier Kenangan berhak atasnya.
> Utang ini tercatat di `../DESIGN_SPEC.md`.

---

### Referensi

- Karakter tier dan entitlement: `../DESIGN_SPEC.md`
- Token semantik bersama: `DESIGN_SYSTEM.md` §8.1
- Panduan template: `docs/warm-narrative-template-guide.md`
