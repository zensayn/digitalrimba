# Puspa · Kategori Floral
## Design Specification

> **Tier 3 — Premium · Rp 700rb**
> "Bunga agung, mahakarya yang merekah."

---

### Aesthetic: "Garden Noir"

Mewah, dalam, dan dramatis. Latar hijau-kehitaman seperti taman malam, dengan
emerald pekat, emas, dan deep rose bak permata. Setiap elemen dirancang penuh —
ilustrasi botanical detail, motion sinematik, dan interaksi. Tier paling kaya
secara visual dan gerak; dibuat untuk dikenang.

**Level komponen & animasi (Tier 3):** komponen "wah" + animasi premium —
petal-fall partikel, hover-bloom interaktif, parallax berlapis, dan motion
kompleks. Boleh memakai canvas/WebGL untuk efek kelopak.

---

### Color Tokens

| Token | Hex | Nama |
|-------|-----|------|
| --bg | #0C100C | Garden Noir |
| --surface | #141A14 | Deep Forest |
| --surface-2 | #1E261D | Dark Moss |
| --emerald | #2E6B4A | Emerald Leaf |
| --gold | #D4AF6A | Botanic Gold |
| --gold-light | #F0D88A | Champagne Gold |
| --rose-deep | #8C3B4A | Jewel Rose |
| --text | #F0EFE8 | Moonlit Ivory |
| --text-muted | #9FA89A | Sage Mist |
| --text-dim | #5A6356 | Faded Leaf |
| --border | rgba(212,175,106,0.22) | Gold Border |

---

### Typography

| Element | Font | Weight |
|---------|------|--------|
| Hero Names | Cormorant Garamond | 300 |
| Section Title | Italiana / Cormorant | 400 |
| Sub-title | Cormorant Garamond italic | 300 |
| Body | Inter | 300 |
| Labels | Inter | 400 |

---

### Sections

1. Cover — Petal-fall background + countdown + nama gold shimmer
2. Greeting — Salam kaligrafi besar + bingkai botanical emas
3. Couple — Foto dengan frame bunga emas + silsilah keluarga
4. Love Story — Fullscreen chapter dengan transisi sinematik
5. Event (Akad) — Detail mewah + peta + save to calendar
6. Event (Resepsi) — Detail mewah + peta + save to calendar
7. Dress Code — Mood board visual + palet warna premium
8. Gallery — Slideshow sinematik fullscreen / 3D petal field
9. RSVP — Form premium + QR code tamu (opsional)
10. Gift — Bank card + alamat fisik (opsional)
11. Closing — Doa + family signature + wax seal bunga

---

### Animation Style

- Petal-fall partikel (canvas/WebGL) di Cover & Gallery
- Hover-bloom interaktif pada elemen kunci
- Parallax berlapis pada background botanical
- Cinematic reveal: opacity + scale 0.9→1, 0.9s easeOutQuint
- Gold shimmer loop pada nama
- Stagger 0.2s per item

---

### Ornamental Elements

- Ilustrasi botanical detail (SVG) + double gold border
- Wax seal bunga di Closing
- Kelopak emas dekoratif sebagai pemisah section
- Kaligrafi dekoratif + family signature

---

### Premium Features (eksklusif tier ini)

- Petal-fall / 3D petal field interaktif
- QR code per tamu untuk check-in
- Multi-bahasa (Indonesia + English)
- Custom domain siap pakai
- Unlimited tamu (URL ?to=)
- Print-ready PDF version

---

### Differensiator vs Mekar

| Fitur | Mekar | Puspa |
|-------|-------|-------|
| Palette | Krem warm | Garden Noir + emas |
| Gallery | Masonry grid | Sinematik / 3D petal field |
| Cover | Petal melayang ringan | Petal-fall partikel |
| Animasi | Parallax sedang | Interaktif + sinematik kompleks |
| RSVP | Form standar | Form + QR tamu |
| Extra | — | QR check-in, PDF, custom domain |

---

### Status Tema

| Folder | Tema | Aesthetic | Status |
|--------|------|-----------|--------|
| _(belum ada)_ | — | — | — |
