# Kisah · Kategori Adat
## Design Specification

> **Tier 2 — Standard · Rp 300rb**
> "Terangkai dalam kisah."

---

### Aesthetic: "Warm Narrative"

Seperti lembaran buku cerita yang indah — hangat, editorial, penuh tekstur. Setiap section terasa seperti babak baru dalam sebuah narasi. Cocok untuk pasangan yang ingin undangan terasa personal dan berkesan, dengan tampilan yang lebih kaya dari tier Kenangan.

---

### Color Tokens

| Token | Hex | Nama |
|-------|-----|------|
| --bg | #FAF7F2 | Warm Parchment |
| --surface | #F2EDE4 | Cream |
| --surface-2 | #E8E0D4 | Linen |
| --gold | #C07830 | Copper Gold |
| --gold-light | #D4A056 | Warm Amber |
| --text | #2A2218 | Dark Walnut |
| --text-muted | #6B5E4E | Warm Brown |
| --text-dim | #A0917E | Taupe |
| --border | rgba(192,120,48,0.2) | Copper Border |

---

### Typography

| Element | Font | Weight |
|---------|------|--------|
| Hero Names | Playfair Display | 400 |
| Section Title | Playfair Display | 500 |
| Body | Source Serif 4 | 400 |
| Labels | Inter | 500 |
| Script/Quote | EB Garamond italic | 400 |

---

### Sections

1. Cover — Nama dengan warm glow, countdown elegan
2. Greeting — Bismillah dengan ornamen frame klasik
3. Couple — Foto dengan shadow hangat, orang tua
4. Love Story — Timeline vertikal (scroll), bukan carousel
5. Event (Akad) — Detail dengan map warm-tinted
6. Event (Resepsi) — Detail dengan map warm-tinted
7. Dress Code — Palet warna swatch + ilustrasi
8. Gallery — Masonry grid 2-kolom
9. RSVP — Form dengan underline input hangat
10. Gift — Bank card dengan copper accent
11. Closing — Quote + hashtag + brand

---

### Animation Style

- Fade-in dengan parallax ringan saat scroll
- Stagger: 0.15s per item
- Durasi transisi: 0.7s easeOut
- Tidak ada efek WebGL — performa lebih ringan

---

### Ornamental Elements

- Frame klasik (thin double-border)
- Gold divider dengan motif titik
- Sudut ornamen bergaya Art Nouveau
- Tekstur kertas subtle di background

---

### Differensiator vs Kenangan

| Fitur | Kenangan | Kisah |
|-------|----------|-------|
| Palette | Dark Neo-Noir | Light Warm |
| Gallery | WebGL 3D globe | Masonry grid |
| Love Story | Horizontal carousel | Vertical timeline |
| Ornamen | Minimalist corner | Art Nouveau frame |
| Font | Cormorant Garamond | Playfair Display |

---

### Status Tema

| Folder | Tema | Status |
|--------|------|--------|
| `warm-narrative/` | Warm Narrative | 🔜 Planned |
