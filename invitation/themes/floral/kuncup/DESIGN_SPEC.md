# Kuncup · Kategori Floral
## Design Specification (Tier)

> **Tier 1 — Basic**
> "Tunas yang baru merekah."

Spec ini mendefinisikan **karakter tier Kuncup** secara umum. Tiap tema di dalam
tier punya konsep visualnya sendiri — lihat `DESIGN_SPEC.md` di folder tema
masing-masing (mis. `soft-bloom/DESIGN_SPEC.md`).

---

### Karakter Tier

Terang, lapang, dan ringan. Latar putih bersih dengan aksen **floral pastel** dan
ornamen yang sedikit serta lembut. Fokus pada keterbacaan, kecepatan, dan kesan
segar — undangan manis dan rapi tanpa banyak ornamen, dengan harga terjangkau.

**Pembeda tier = level komponen & animasi (Tier 1):** komponen standar, layout
single-column bersih, animasi minimal (fade + scroll reveal). Tidak ada parallax,
partikel berat, WebGL, atau efek mahal — itu jatah tier Mekar & Puspa.

---

### Palet Dasar (boleh diperluas per tema)

Base terang & netral; tiap tema menambah aksen warnanya sendiri.

| Token | Hex | Nama |
|-------|-----|------|
| --bg | #FDFCFA | Petal White |
| --surface | #F7F5F1 | Soft Paper |
| --text | #3A3A36 | Charcoal Ink |
| --text-muted | #8A8A82 | Stone Gray |
| --text-dim | #B5B5AC | Whisper |
| --border | rgba(58,58,54,0.10) | Soft Border |

> Aksen warna (mis. lilac / butter / powder-blue di **soft-bloom**) didefinisikan
> di spec tema, bukan di sini.

---

### Typography

| Element | Font | Weight |
|---------|------|--------|
| Hero Names | (per tema) | — |
| Body | Poppins | 300 |
| Labels | Poppins | 400 |

> Body default Poppins (bersih, ringan). Display font dipilih per tema agar tiap
> tema punya karakter sendiri (mis. Fraunces di soft-bloom).

---

### Sections (9)

1. Cover — Nama + tanggal, ornamen floral di sudut
2. Greeting — Salam pembuka + nama tamu personal
3. Couple — Foto bulat + nama lengkap + orang tua
4. Event (Akad) — Tanggal + lokasi + save to calendar
5. Event (Resepsi) — Tanggal + lokasi + save to calendar
6. Gallery — Grid foto sederhana
7. RSVP — Form konfirmasi kehadiran
8. Gift — Bank card dengan copy to clipboard
9. Closing — Ucapan terima kasih + hashtag

---

### Animation Style

- Fade-in pada scroll (`useInView`), durasi 0.6s easeOut
- Stagger ringan 0.08s per elemen
- Opsional: ornamen floral jatuh low-density di Cover/Closing
- Tanpa parallax / partikel berat / efek mahal

---

### Ornamental Elements

- Ornamen floral di sudut Cover/Closing (gambar transparan `.webp`)
- Garis pemisah tipis antar-section
- Spasi lega sebagai elemen desain utama
- Ikon fungsional via `lucide-react` (bukan gambar generate)

> Aset gambar = **`.webp` transparan** (di-generate per tema, disimpan di R2).
> Bukan SVG. Prompt generate ada di tiap folder tema (`ASSET_PROMPTS.md`).

---

### Status Tema

| Folder | Tema | Aesthetic | Status |
|--------|------|-----------|--------|
| `soft-bloom/` | Soft Bloom | Wildflower Pastel — lilac · butter · powder-blue | 🔜 Konsep final, build berikutnya |
