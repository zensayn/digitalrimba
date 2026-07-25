# Kenangan · Kategori Floral

## Design Specification (Tier)

> **Tier 1 — Basic**
> "Tier pembuka yang bersih, ringan, mudah dibaca, dan tetap terasa selesai."

Spec ini mendefinisikan standar **tier Kenangan** untuk semua template floral baru.
Mulai sekarang, `soft-bloom/` adalah tolok ukur implementasi tier ini: template
baru boleh punya arah visual berbeda, tetapi kualitas struktur, interaksi, aset,
dan polish minimalnya harus setara.

---

### Benchmark

Template acuan: `themes/floral/kenangan/soft-bloom/`

Yang menjadi standar dari Soft Bloom:

- opening gate sebagai pengalaman pertama sebelum isi undangan;
- layout mobile-first dengan panel cover dekoratif di desktop;
- section tersambung oleh dekorasi/seam, bukan terasa seperti blok terpisah;
- aset tema dari R2 via `NEXT_PUBLIC_THEMES_CDN`;
- data undangan terpusat di `invitation.config.json`;
- fallback aset gambar aman agar gambar rusak tidak memecah layout;
- aksesibilitas dasar pada opening gate: modal semantics, focus awal, focus trap,
  dan konten belakang dibuat inert saat gate tampil;
- build/deploy Cloudflare Worker mengikuti pola `soft-bloom`.

---

### Karakter Tier

Terang, lapang, ringan, dan romantis. Tier ini tidak boleh terasa kosong atau
mentah hanya karena berada di level Basic. Kualitas yang dicari adalah **rapi,
utuh, cepat, dan mudah dipakai**, dengan ornamen floral yang cukup untuk memberi
identitas kuat tanpa efek mahal.

**Pembeda tier = komposisi dan intensitas gerak.** Kenangan memakai komponen
standar, narasi linear, animasi ringan, dan dekorasi terkendali. Parallax kompleks,
WebGL, partikel padat, timeline sinematik, QR check-in, multi-bahasa, atau fitur
premium lain tetap menjadi ruang tier Kisah & Warisan.

---

### Palet Dasar

Base terang & netral; tiap tema menambah aksen warnanya sendiri.

| Token | Hex | Nama |
|-------|-----|------|
| --bg | #FDFCFA | Petal White |
| --surface | #F7F5F1 | Soft Paper |
| --surface-2 | #EFEBE4 | Warm Paper |
| --accent | per tema | Floral Accent |
| --accent-soft | per tema | Soft Accent |
| --leaf | per tema | Botanical Green |
| --text | #3A3A36 | Charcoal Ink |
| --text-muted | #6F6F67 | Muted Ink |
| --text-dim | #8C8C83 | Dim Ink |
| --border | rgba(58,58,54,0.10) | Soft Border |

Contoh Soft Bloom: lilac, butter, powder-blue, sage, dan ivory. Template baru
boleh memakai palet lain selama tetap terang, mudah dibaca, dan tidak menjadi
versi redup dari tier Warisan.

---

### Typography

| Element | Font | Weight |
|---------|------|--------|
| Hero Names | per tema | 400–500 |
| Section Title | per tema | 400–500 |
| Body | Poppins atau setara | 300–400 |
| Labels | Poppins atau setara | 400–500 |
| Script Accent | opsional per tema | 400 |

Display font dipilih per tema. Untuk tier Kenangan, hindari komposisi typography
yang terlalu editorial atau gelap; heading harus tetap terbaca di mobile.

---

### Required Sections

Urutan dapat dikonfigurasi lewat `invitation.config.json`, tetapi template baru
minimal harus menyediakan section berikut:

1. Opening Gate — sapaan tamu + tombol buka undangan
2. Cover — nama pasangan + tanggal + ornamen utama
3. Greeting — salam pembuka + nama tamu personal
4. Couple — foto/nama mempelai + orang tua
5. Event (Akad) — tanggal, waktu, lokasi, map, save to calendar
6. Event (Resepsi) — tanggal, waktu, lokasi, map, save to calendar
7. Dress Code — tema busana + swatch warna
8. Gallery — grid foto sederhana yang stabil di mobile
9. RSVP — form konfirmasi kehadiran
10. Gift — rekening/alamat hadiah + copy to clipboard
11. Closing — ucapan terima kasih + hashtag + brand

Opening gate tidak dihitung sebagai section konten scroll, tetapi wajib ada
sebagai pengalaman masuk.

---

### Layout Standard

- Mobile-first; kolom utama nyaman dibaca di layar kecil.
- Desktop memakai split experience: cover dekoratif di kiri, undangan di kolom
  fokus di kanan, mengikuti pola `DesktopCover` + `content-scroll`.
- Section harus terasa menyambung. Gunakan background paper/wash dan seam floral
  seperti `SectionSeam`, bukan kartu besar yang berdiri sendiri.
- Dimensi elemen tetap stabil; gambar, ornamen, dan tombol tidak boleh membuat
  layout shift saat loading atau saat fallback.
- Semua teks penting harus muat di mobile tanpa overlap.

---

### Animation Style

- Entrance ringan: fade/scale/translate kecil, durasi sekitar 0.6–0.9s.
- Ambient motion boleh ada, tetapi low-density: sway, floating, falling flowers
  ringan, atau breathing frame.
- Motion harus memperkaya rasa hidup, bukan menjadi fitur utama.
- Hindari parallax berat, partikel padat, WebGL, dan scroll hijacking.
- Respect fallback: jika aset dekorasi gagal load, konten utama tetap terbaca.

---

### Ornamental & Asset Standard

- Aset dekorasi utama berupa `.webp`, disimpan di:
  `rimba-themes/floral/kenangan/<template-name>/<file>`.
- Source path runtime melalui `src/lib/assets.ts`.
- Dev lokal fallback ke `public/images`.
- Prompt aset disimpan di `ASSET_PROMPTS.md`.
- Ornamen minimum:
  - frame/ornamen cover;
  - divider atau seam antar-section;
  - frame foto atau aksen couple;
  - brand/logo closing;
  - 2–3 aksen ambient ringan.
- Ikon fungsional memakai `lucide-react`, bukan gambar generate.

---

### Accessibility & Resilience

- Opening gate harus berperan sebagai modal sampai undangan dibuka.
- Konten di belakang gate memakai `aria-hidden`/`inert` saat gate tampil.
- Tombol utama harus menerima focus awal dan bisa diakses keyboard.
- Gambar dekoratif memakai `alt=""` dan `aria-hidden` bila tidak informatif.
- Gambar yang gagal load harus tersembunyi dengan helper fallback bersama.
- Konten inti tidak boleh bergantung pada gambar dekoratif.

---

### Engineering Standard

- Template adalah app Next.js mandiri.
- Data konten ada di `invitation.config.json`.
- Typed config diekspor dari `src/data/invitation.ts`.
- Shared visual helper ditempatkan di `src/components/shared/`.
- Aset tema memakai helper `asset(file)`.
- Build production tetap `next build --webpack`.
- Deployment Cloudflare memakai OpenNext/Wrangler sesuai pola Soft Bloom.

---

### Status Tema

| Folder | Tema | Aesthetic | Status |
|--------|------|-----------|--------|
| `soft-bloom/` | Soft Bloom | Wildflower Pastel — lilac · butter · powder-blue | ✅ Benchmark tier Kenangan |
| `pavilion-romance/` | Pavilion Romance | Garden Pavilion Storybook — parchment ivory · dusty rose · sage · burgundy | ✅ Turun tier dari Kisah (Jul 2026) |
