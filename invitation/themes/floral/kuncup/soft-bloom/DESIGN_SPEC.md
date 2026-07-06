# Soft Bloom · Tema (Kategori Floral · Tier Kuncup)
## Design Specification

> **Tier 1 — Basic** · Kategori Floral
> "Bunga liar yang merekah ceria."

---

### Konsep: "Wildflower Pastel"

Ceria, segar, dan playful. Campuran **bunga liar pastel** — daisy putih, lavender
lilac, ranunculus kuning mentega, cosmos & forget-me-not biru pudar — di atas
latar terang yang lapang. Ringan dan minimalis (Tier-1), tapi penuh warna lembut
yang riang.

> **Diferensiasi (penting):** sengaja dibuat **berbeda total** dari warm-narrative
> (kategori adat) yang bernuansa mawar-putih + emas + blush romantis. Soft Bloom
> = multi-warna pastel ceria, bunga liar, bukan monokrom mawar-mewah.

---

### Color Tokens

| Token | Hex | Nama |
|-------|-----|------|
| --bg | #FDFCFA | Petal White |
| --surface | #F7F5F1 | Soft Paper |
| --lilac | #C9B8DA | Lilac Lavender |
| --butter | #F0E2A8 | Butter Yellow |
| --sky | #BCD0DB | Powder Blue |
| --leaf | #9BB08A | Meadow Green |
| --peach | #E9C4B4 | Soft Peach (aksen tipis) |
| --text | #3A3A36 | Charcoal Ink |
| --text-muted | #8A8A82 | Stone Gray |
| --border | rgba(155,176,138,0.20) | Meadow Border |

---

### Typography

| Element | Font | Weight |
|---------|------|--------|
| Hero Names | Fraunces | 400 |
| Section Title | Fraunces | 400 |
| Body | Poppins | 300 |
| Labels | Poppins | 400 |

> Fraunces (soft modern serif) dipilih agar terasa lebih playful & segar daripada
> serif klasik warm-narrative. Bisa diganti Cormorant kalau mau lebih netral.

---

### Sections (10 — sesuai tier kuncup)

1. Cover — Nama + tanggal, `SudutBunga` di sudut, bunga liar jatuh halus
2. Greeting — Salam pembuka + nama tamu personal
3. Couple — Foto bulat dalam `BingkaiFoto` (wreath wildflower) + nama + orang tua
4. Event (Akad) — Tanggal + lokasi + save to calendar (ikon Lucide)
5. Event (Resepsi) — Tanggal + lokasi + save to calendar
6. Dress Code — Tema busana + swatch warna pastel + daftar "hindari"
7. Gallery — Grid foto sederhana
8. RSVP — Form konfirmasi kehadiran
9. Gift — Bank card dengan copy to clipboard (ikon `Gift`)
10. Closing — Ucapan terima kasih + hashtag

---

### Animation Style (minimal — Tier 1)

- Fade-in pada scroll (`useInView`), durasi 0.6s easeOut
- Stagger ringan 0.08s per elemen
- Bunga liar jatuh (`BungaJatuh1–3`) melayang turun, low-density, di Cover & Closing
- Tanpa parallax / WebGL / efek berat

---

### Ornamental Elements

- `SudutBunga` — rangkaian bunga liar di sudut Cover/Closing
- `PembatasBunga` — divider tipis antar-section
- `BingkaiFoto` / `WreathInisial` — bingkai wildflower (tengah transparan)
- Background wash pastel — **CSS `radial-gradient`** (bukan gambar; gpt-image sulit
  bikin awan opacity-rendah dengan alpha memudar). Resep di `./ASSET_PROMPTS.md`.
- Ikon fungsional via `lucide-react` (bukan gambar generate)

> Aset gambar & prompt generate: lihat `./ASSET_PROMPTS.md`.

---

### Status

| Item | Status |
|------|--------|
| Konsep & palet | ✅ Final (Wildflower Pastel) |
| Prompt aset | ✅ `ASSET_PROMPTS.md` |
| Gambar di-generate | 🔜 (ChatGPT, oleh user) |
| Scaffold app + komponen | 🔜 |
