# Kisah · Kategori Floral

## Design Specification

> **Tier 2 — Standard · Rp 300rb**
> "Narasi visual yang lebih kaya."

---

### Aesthetic: "Full Bloom"

Hangat, elegan, dan hidup. Palet krem dengan dusty rose dan garden green,
diperkaya ilustrasi botanical bergaris dan sentuhan emas lembut. Lebih berwarna
dan berlapis dari Kenangan, namun tetap rapi dan anggun.

**Level komponen & animasi (Tier 2):** komponen lebih kaya, animasi sedang —
parallax lembut, stagger, transisi antar-section, dan kelopak melayang sesekali.

---

### Color Tokens

| Token | Hex | Nama |
|-------|-----|------|
| --bg | #FAF6F0 | Warm Cream |
| --surface | #F2EADF | Soft Almond |
| --surface-2 | #E8DDCC | Sand |
| --rose | #C97A6D | Dusty Rose |
| --rose-light | #E3A99E | Soft Rose |
| --green | #6E8B6A | Garden Green |
| --gold-soft | #C9A86A | Soft Gold |
| --text | #2E2A24 | Espresso Ink |
| --text-muted | #7A7468 | Taupe |
| --text-dim | #ADA597 | Faded |
| --border | rgba(201,122,109,0.2) | Rose Border |

---

### Typography

| Element | Font | Weight |
|---------|------|--------|
| Hero Names | Playfair Display | 400 |
| Section Title | Playfair Display | 400–500 |
| Sub-title | Playfair Display italic | 400 |
| Body | Source Sans Pro | 300–400 |
| Labels | Source Sans Pro | 400 |

---

### Sections

1. Cover — Countdown + nama + bingkai botanical line-art
2. Greeting — Salam pembuka hero + nama tamu personal
3. Couple — Foto dengan frame bunga + nama lengkap + orang tua
4. Love Story — Timeline vertikal dengan ikon bunga
5. Event (Akad) — Detail + peta + save to calendar
6. Event (Resepsi) — Detail + peta + save to calendar
7. Dress Code — Color swatch + tema pakaian
8. Gallery — Masonry grid dengan hover zoom
9. RSVP — Form konfirmasi + jumlah tamu
10. Gift — Bank card dengan copy to clipboard
11. Closing — Doa + hashtag + brand

---

### Animation Style

- Reveal: opacity + translateY, durasi 0.75s easeOut
- Parallax lembut pada background botanical
- Stagger 0.14s per item
- Kelopak melayang (CSS, low-density) di Cover & Closing
- Transisi antar-section halus

---

### Ornamental Elements

- Botanical line-art (SVG) sebagai bingkai & pemisah
- Floral divider (transparent → rose → transparent)
- Ikon bunga kecil sebagai penanda section
- Soft gold accent line

---

### Differentiator vs Kenangan

| Fitur | Kenangan | Kisah |
|-------|--------|-------|
| Palette | Putih airy | Krem + dusty rose |
| Gallery | Grid sederhana | Masonry + hover |
| Animasi | Fade minimal | Parallax + petal melayang |
| Sections | 9 | 11 (+ Love Story, Dress Code) |
| Ornamen | Kelopak tunggal | Botanical line-art penuh |

---

### Status Tema

| Folder | Tema | Aesthetic | Status |
|--------|------|-----------|--------|
| _(belum ada)_ | — | — | — |
