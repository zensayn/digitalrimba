# Kenangan · Kategori Adat
## Design Specification

> **Tier 1 — Basic · Rp 150rb**
> "Setiap momen jadi kenangan."

---

### Aesthetic: Neo-Adat Noir "Sacred Luxe"

Gelap, elegan, dan penuh kedalaman. Terinspirasi dari kuil Jawa yang diterangi cahaya lilin emas — perpaduan tradisi adat Indonesia dengan estetika dark luxury modern. Cocok untuk pasangan yang ingin undangan terasa eksklusif dan berbeda dari yang lain, dengan harga yang terjangkau.

---

### Color Tokens

| Token | Hex | Nama |
|-------|-----|------|
| --bg | #0A0A08 | Deep Obsidian |
| --surface | #121210 | Charcoal |
| --surface-2 | #1A1A17 | Dark Ash |
| --gold | #C9A84C | Antique Gold |
| --gold-light | #E8D5A0 | Champagne Gold |
| --gold-dim | #7A6330 | Aged Bronze |
| --text | #F0EDE6 | Ivory |
| --text-muted | #9A9A8E | Silver Gray |
| --text-dim | #5A5A50 | Whisper |
| --border | rgba(201,168,76,0.15) | Gold Border |

---

### Typography

| Element | Font | Weight |
|---------|------|--------|
| Hero Names | Cormorant Garamond | 300 |
| Section Title | Cormorant Garamond | 300–400 |
| Body | Inter | 300 |
| Labels | Inter | 300–400 |
| Script/Quote | EB Garamond italic | 400 |

---

### Sections

1. Cover — Countdown, nama dengan gold shimmer, corner ornamen
2. Greeting — Bismillah hero besar + nama tamu personal
3. Couple — Foto bulat + nama lengkap + orang tua
4. Love Story — Horizontal swipe carousel + auto-advance
5. Event (Akad) — Tanggal hero besar + map + save to calendar
6. Event (Resepsi) — Tanggal hero besar + map + save to calendar
7. Dress Code — Color swatch + tema pakaian
8. Gallery — WebGL 3D globe interaktif
9. RSVP — Form dengan gold input + konfirmasi kehadiran
10. Gift — Bank card dengan copy to clipboard
11. Closing — Ayat Al-Quran + hashtag + brand

---

### Animation Style

- Framer Motion `useInView` stagger per elemen
- Stagger: 0.18s per item
- Durasi: 0.85–0.9s easeOut
- Gold shimmer loop animation pada nama
- Waveform animasi di music player

---

### Ornamental Elements

- Corner ornaments SVG (4 sudut)
- Gold divider gradient (transparent → gold → transparent)
- Diamond ornamen (◆) sebagai pemisah section
- Roman numeral dekoratif di background
- Noise texture overlay
- Radial vignette

---

### Effects

- Gold shimmer text animation
- Noise texture overlay (0.04 opacity)
- Radial vignette gradient
- WebGL 3D globe di gallery
- Music player dengan audio lokal

---

### Status Tema

| Folder | Tema | Aesthetic | Status |
|--------|------|-----------|--------|
| `sacred-luxe/` | Sacred Luxe | Neo-Adat Noir — Dark Obsidian + Champagne Gold | ✅ Active |
| `obsidian-rose/` | Obsidian Rose | Dark + Rose Gold + Floral | 🔜 Planned |
| `batik-noir/` | Batik Noir | Dark + Batik Pattern + Burnt Sienna | 🔜 Planned |
