# Rimba Digital — Design System & Template Contract

> Dokumen ini adalah sumber acuan untuk paket, kontrak template, dan batas antara
> sistem bersama dengan art direction masing-masing tema.
>
> **Status:** eksploratif. Rimba belum memiliki satu bahasa visual brand yang
> dikunci. Template boleh mengeksplorasi arah visual yang berbeda selama tetap
> memenuhi kontrak pengalaman, aksesibilitas, dan kapabilitas paket.

## 1. Prinsip Sistem

1. **Tier menentukan kapabilitas, bukan kualitas visual.**
   Kenangan, Kisah, dan Warisan membedakan fitur komersial serta masa aktif.
   Tier tidak menentukan bahwa sebuah template harus terlihat sederhana,
   elegan, gelap, terang, tradisional, atau premium.
2. **Tema menentukan art direction.**
   Warna, tipografi, komposisi, ornamen, imagery, dan motion dimiliki oleh tema.
3. **Komponen boleh tersedia sebelum fiturnya dibeli.**
   Sebuah template boleh menyimpan komponen Gallery, Dress Code, atau Love Story
   untuk add-on. Komponen tersebut hanya ditampilkan jika konfigurasi pesanan
   mengaktifkannya.
4. **Fitur yang terlihat harus benar-benar berfungsi.**
   Production tidak boleh menampilkan RSVP sukses, Wedding Wish terkirim, atau
   aksi lain jika data tidak benar-benar diproses.
5. **Mobile adalah pengalaman utama.**
   Tampilan desktop boleh memberi framing tambahan, tetapi tidak boleh mengubah
   atau mengurangi alur utama undangan.
6. **Konsistensi perilaku lebih penting daripada keseragaman tampilan.**
   Semua tema harus memberi pengalaman yang dapat dipahami, diakses, dan
   dipercaya tanpa dipaksa terlihat sama.

## 2. Terminologi Resmi

### 2.1 Tier paket

Hanya tiga nama berikut yang digunakan sebagai tier:

| ID | Nama publik | Harga | Posisi |
|---|---|---:|---|
| `kenangan` | Kenangan | Rp150.000 | Paket dasar |
| `kisah` | Kisah | Rp300.000 | Paket menengah |
| `warisan` | Warisan | Rp700.000 | Paket lengkap |

Nama **Leaf, Timber, dan Heartwood tidak digunakan lagi**.

### 2.2 Taksonomi tema

- **Kategori** menjelaskan keluarga besar visual, misalnya `adat` atau `floral`.
- **Subtema** adalah pengelompokan kreatif di dalam kategori, misalnya `kuncup`,
  `mekar`, atau `puspa`. Subtema bukan tier dan tidak menentukan harga.
- **Tema/template** adalah implementasi undangan yang dapat dipilih, misalnya
  `warm-narrative` atau `soft-bloom`.
- **Tier paket** tetap selalu `kenangan`, `kisah`, atau `warisan`.

Contoh metadata:

```jsonc
{
  "id": "soft-bloom",
  "name": "Soft Bloom",
  "category": "floral",
  "subtheme": "kuncup",
  "packageTier": "kenangan"
}
```

## 3. Status Kapabilitas

Setiap fitur pada sebuah pesanan menggunakan salah satu status berikut:

| Status | Arti |
|---|---|
| `included` | Termasuk dalam harga paket dan aktif bila datanya tersedia |
| `addon` | Didukung template, tetapi hanya aktif jika dibeli |
| `unavailable` | Tidak didukung oleh template atau produk saat ini |

Status paket dan dukungan template adalah dua hal berbeda:

- Paket menentukan apakah fitur termasuk atau memerlukan add-on.
- Template menyatakan apakah ia memiliki implementasi untuk fitur tersebut.
- Konfigurasi pesanan menentukan fitur yang benar-benar aktif.

Secara konseptual:

```text
fitur aktif = didukung template
            + termasuk paket atau add-on dibeli
            + data/config valid
```

## 4. Detail Fitur per Paket

Paket yang lebih tinggi mewarisi fitur paket di bawahnya. Jika fitur yang sama
memiliki batas berbeda, nilai pada paket lebih tinggi menggantikan nilai
sebelumnya. Contoh: masa aktif dua tahun menggantikan satu tahun, dan galeri
unlimited menggantikan batas 25 foto.

### 4.1 Kenangan — Rp150.000

| Fitur | Status |
|---|---|
| Unlimited edit sebelum pelunasan | Included |
| Maps lokasi acara | Included |
| Countdown timer | Included |
| Add to Calendar | Included |
| Autoplay lagu dari katalog | Included |
| Link Instagram mempelai | Included |
| RSVP/konfirmasi kehadiran | Included |
| Amplop Digital | Included |
| Wedding Wish/ucapan dan doa | Included |
| Subdomain `nama.rimbadigital.id` | Included |
| Bahasa Indonesia dan Inggris | Included |
| Pilihan dari katalog tema Kenangan | Included |
| Share WhatsApp manual | Included |
| Masa aktif satu tahun | Included |

### 4.2 Kisah — Rp300.000

Kisah mencakup seluruh fitur Kenangan, ditambah:

| Fitur | Status |
|---|---|
| Custom lagu/upload sendiri | Included |
| Love Story | Included |
| Galeri foto maksimal 25 foto | Included |
| Galeri video maksimal satu video | Included |
| Sesi Akad dan Resepsi terpisah | Included |
| Ikon acara custom | Included |
| Pilihan dari katalog tema Kenangan dan Kisah | Included |
| Masa aktif dua tahun | Included |

### 4.3 Warisan — Rp700.000

Warisan mencakup seluruh fitur Kisah, ditambah:

| Fitur | Status |
|---|---|
| Galeri foto unlimited | Included |
| Ganti warna dan font | Included |
| Kirim Kado | Included |
| Dress Code | Included |
| Turut Mengundang | Included |
| Custom teks WhatsApp untuk share manual | Included |
| Rundown acara | Included |
| Akses ke seluruh katalog tema | Included |
| Masa aktif selamanya | Included |

### 4.4 Catatan produk yang perlu dipastikan

`Amplop Digital` sudah tersedia pada Kenangan, sedangkan daftar Warisan juga
memuat `Kirim Kado` dengan deskripsi rekening digital. Sebelum implementasi
backend dikunci, keduanya harus dibedakan secara eksplisit agar tidak menjadi
dua nama untuk kapabilitas yang sama. Untuk sementara:

- `digitalEnvelope` mewakili rekening/e-wallet untuk pemberian uang.
- `sendGift` disimpan sebagai kapabilitas terpisah, tetapi perilaku finalnya
  belum boleh diasumsikan oleh template.

## 5. Kebijakan Add-on

Komponen di atas tier aktif boleh tetap berada di codebase. Contoh:

- Gallery, Love Story, atau Dress Code dapat tersedia di template Kenangan.
- Konfigurasi default Kenangan tidak boleh mengaktifkannya sebagai fitur
  included.
- Jika add-on dibeli, komponen dapat diaktifkan tanpa membuat tema baru.
- Add-on tidak boleh merusak urutan narasi, performa, atau aksesibilitas tema.

Tema harus mendeklarasikan dukungannya:

```jsonc
{
  "supportedFeatures": [
    "maps",
    "countdown",
    "calendar",
    "catalogMusic",
    "instagram",
    "rsvp",
    "digitalEnvelope",
    "weddingWishes",
    "gallery",
    "dressCode"
  ]
}
```

Daftar tersebut berarti “bisa dirender oleh template”, bukan “otomatis termasuk
dalam paket”.

## 6. Rimba Core

Rimba Core adalah bagian lintas-tema. Ia tidak membawa art direction.

### 6.1 Kontrak data

Kontrak bersama minimal mencakup:

- pasangan dan orang tua;
- tautan sosial;
- tanggal utama dan sesi acara;
- lokasi, tautan maps, dan data kalender;
- lagu dan sumber lagu;
- RSVP, jumlah tamu, serta status pengiriman;
- Wedding Wish;
- rekening/e-wallet;
- konfigurasi bahasa;
- urutan section dan feature flags;
- metadata paket, add-on, subdomain, dan masa aktif.

Tipe atau schema kontrak harus memiliki satu sumber kebenaran. Template tidak
boleh mempertahankan salinan tipe yang berkembang sendiri-sendiri tanpa
validasi terhadap kontrak pusat.

### 6.2 Perilaku bersama

Perilaku berikut harus konsisten di semua tema:

- Instagram dirender sebagai link yang dapat dibuka, bukan teks dekoratif.
- Maps dan Add to Calendar menggunakan data acara yang sama dengan konten.
- Musik dimulai setelah interaksi membuka undangan agar sesuai kebijakan browser.
- RSVP memiliki state idle, loading, success, validation error, dan server error.
- Production tidak boleh memakai simulasi timeout sebagai submit berhasil.
- Wedding Wish hanya mengaku terkirim setelah backend mengonfirmasi.
- Copy rekening memberi feedback yang dapat dibaca dan diumumkan ke assistive
  technology.
- Bahasa memengaruhi seluruh copy sistem, label, tanggal, dan pesan error.
- Section yang tidak aktif tidak boleh meninggalkan navigasi, separator, atau
  ruang kosong.

### 6.3 Struktur section

Template tidak wajib memakai layout yang sama, tetapi harus memiliki pemetaan
section yang eksplisit:

```text
section registry
  -> cek dukungan template
  -> cek entitlement paket/add-on
  -> cek enabled pada pesanan
  -> validasi data
  -> render section
```

Urutan boleh dikustomisasi selama cover/opening tetap menjadi pintu masuk dan
informasi acara tetap mudah ditemukan.

## 7. Theme Art Direction

Setiap tema wajib memiliki dokumen atau manifest lokal yang menjelaskan:

- scene atau konsep fisik yang menjadi acuan;
- target rasa dan karakter;
- kategori dan subtema;
- strategi warna;
- tipografi dan alasan pemilihannya;
- aturan komposisi dan safe-zone;
- sistem imagery serta ornamen;
- karakter motion;
- perlakuan section;
- batas performa dan fallback;
- hal yang sengaja dihindari.

Tema tidak wajib memakai:

- palet warna Rimba yang seragam;
- pasangan font tertentu;
- satu jenis radius, kartu, divider, atau ornament;
- layout dan motion yang sama;
- estetika minimal untuk Kenangan atau estetika mewah untuk Warisan.

Tema harus tetap menghindari visual generik yang hanya mengganti warna dari
template lain. Perbedaan tema harus terlihat pada komposisi, ritme, imagery,
tipografi, dan perilaku motion—bukan sekadar token warna.

## 8. Token

### 8.1 Token semantik bersama

Nama token boleh distandarkan tanpa menyeragamkan nilainya:

```css
--background;
--surface;
--surface-elevated;
--text;
--text-muted;
--accent;
--accent-contrast;
--border;
--focus;
--error;
--success;
```

Tema boleh menambah token ekspresif seperti `--copper`, `--leaf`, atau
`--paper-texture`. Komponen Rimba Core hanya boleh bergantung pada token semantik.

### 8.2 Tipografi

Tema bebas memilih keluarga dan skala font dengan ketentuan:

- body tetap terbaca pada perangkat kecil;
- heading panjang tidak overflow;
- line-height dan kontras memenuhi kebutuhan baca;
- font yang gagal dimuat memiliki fallback yang layak;
- maksimal ukuran display adalah `6rem`/`96px`;
- letter spacing display tidak lebih rapat dari `-0.04em`;
- label kecil bukan satu-satunya cara menyampaikan informasi penting.

### 8.3 Layer dan elevation

Tema yang memakai banyak layer harus mendefinisikan skala z-index semantik.
Hindari angka arbitrer yang terus meningkat. Konten interaktif harus selalu
berada di atas dekorasi dan tidak tertutup elemen `pointer-events`.

## 9. Accessibility dan Responsive Contract

Semua tema wajib memenuhi:

- target WCAG 2.2 AA;
- kontras teks normal minimal 4.5:1 dan teks besar minimal 3:1;
- touch target utama minimal 44×44 CSS px;
- focus indicator yang terlihat;
- semua aksi dapat digunakan dengan keyboard;
- landmark dan heading memiliki urutan semantik;
- gambar konten memiliki alt text, gambar dekoratif memakai alt kosong;
- informasi tidak bergantung pada warna saja;
- dukungan zoom hingga 200%;
- safe area untuk perangkat ber-notch;
- `prefers-reduced-motion` untuk semua motion non-esensial;
- konten utama tetap terlihat bila JavaScript motion atau observer gagal.

Teks 9–11px hanya boleh digunakan sebagai aksen non-esensial. Informasi acara,
form, tombol, dan status tidak boleh bergantung pada ukuran tersebut.

## 10. Motion Contract

Motion adalah bagian dari art direction, bukan indikator tier.

- Gunakan transform dan opacity untuk animasi umum.
- Parallax, particle, atau cinematic transition boleh digunakan bila mendukung
  konsep tema dan tetap lancar di mobile.
- Animasi loop harus berhenti atau dijeda ketika berada di luar viewport.
- LCP dan konten penting tidak boleh menunggu animasi masuk.
- Reduced motion harus menghapus parallax dan loop, bukan menghilangkan konten.
- Hindari entrance yang sama pada setiap section tanpa alasan naratif.

## 11. Asset dan Performance Contract

- Hero/LCP asset diprioritaskan; aset section lain lazy-load.
- Aset dekoratif menggunakan format modern dan ukuran sesuai dimensi tampil.
- CDN asset versioning dan cache policy harus eksplisit.
- Kegagalan aset dekoratif tidak boleh menghilangkan konten.
- Embed peta tidak boleh langsung mengambil alih scroll; gunakan interaksi yang
  disengaja atau tautan fallback.
- Tema kaya aset harus melakukan mount dekat viewport dan melepas atau menjeda
  pekerjaan di luar viewport.
- Jangan menambah library motion/rendering berat tanpa kebutuhan tema yang jelas.

## 12. Reference Implementations

### 12.1 Warm Narrative

Peran referensi: **immersive narrative theme**.

Yang layak dipertahankan:

- dunia visual yang konsisten antar-section;
- safe-zone teks di tengah dan ornamen di tepi;
- scene berlapis dengan lazy mounting;
- parallax yang memiliki reduced-motion fallback;
- animasi loop dijeda ketika section tidak terlihat;
- pemisahan data undangan dari komponen.

Yang tetap lokal pada tema:

- `ParallaxScene`, `sceneFrame`, dan sistem layer sakura;
- token copper, paper texture, serta painterly backgrounds;
- komposisi editorial dan transisi seam khusus;
- posisi serta koreografi ornamen.

Warm Narrative tidak menjadi bukti bahwa semua tema Adat harus memakai warna
hangat, serif editorial, sakura, atau parallax.

### 12.2 Soft Bloom

Peran referensi: **light botanical theme**.

Yang layak dipertahankan:

- primitif lokal dengan tanggung jawab jelas seperti backdrop, seam, title, dan
  side ornament;
- identitas floral yang tidak hanya mengganti palet Warm Narrative;
- motion yang lebih ringan;
- fallback aset lokal saat development;
- pemisahan konfigurasi konten dari layout.

Yang tetap lokal pada tema:

- `FloralTitle`, `SideVines`, `Meadow`, botanical frames, dan falling flowers;
- palet wildflower;
- komposisi botanical serta script typography.

Soft Bloom tidak menjadi bukti bahwa semua tema Floral harus pastel, terang,
memakai script font, atau memiliki jahitan bunga di setiap section.

## 13. Checklist Template Baru

### Produk

- [ ] Tier memakai `kenangan`, `kisah`, atau `warisan`
- [ ] Kategori, subtema, dan theme ID terpisah
- [ ] Included features sesuai paket
- [ ] Add-on dinyatakan eksplisit
- [ ] Tidak ada fitur berbayar yang aktif karena default template

### Data dan perilaku

- [ ] Menggunakan kontrak konfigurasi bersama
- [ ] Section registry memeriksa entitlement dan data
- [ ] RSVP/Wish tidak memakai success palsu di production
- [ ] Instagram, Maps, dan Calendar merupakan link yang berfungsi
- [ ] Semua state loading, empty, success, dan error ditangani

### Desain

- [ ] Art direction memiliki konsep yang spesifik
- [ ] Tidak sekadar recolor template lain
- [ ] Safe-zone konten jelas
- [ ] Typography tahan terhadap nama dan venue panjang
- [ ] Dekorasi tidak menghalangi interaksi

### Quality

- [ ] Mobile dan desktop diuji
- [ ] Keyboard, focus, contrast, dan reduced motion diuji
- [ ] LCP serta beban aset diperiksa
- [ ] Typecheck, lint, dan build lulus
- [ ] Dokumentasi lokal sesuai implementasi

## 14. Technical Baseline

Baseline implementasi saat ini:

- Next.js 16 App Router
- React 19
- TypeScript 5
- Tailwind CSS 4 dan CSS custom properties
- Framer Motion 12 bila dibutuhkan
- Lucide React untuk functional icons
- OpenNext dan Cloudflare Workers
- Cloudflare R2/CDN untuk theme assets

Versi library bukan identitas design system. Tema boleh tidak memakai Framer
Motion atau Lucide jika kebutuhan visual dan fungsionalnya dapat dipenuhi dengan
lebih sederhana.

## 15. Known Gaps

Hal berikut belum dikunci oleh dokumen ini:

- bahasa visual brand Rimba secara keseluruhan;
- perbedaan final `Amplop Digital` dan `Kirim Kado`;
- harga serta aturan add-on;
- schema pusat dan lokasi package/shared contract;
- backend RSVP dan Wedding Wish;
- manifest template yang dapat divalidasi otomatis;
- migrasi dokumentasi dan nomenklatur lama pada template yang sudah ada.

Known gaps boleh dieksplorasi, tetapi tidak boleh ditutup dengan asumsi diam-diam
di dalam satu template.

---

*Version 2.0 · 2026-07-09*
