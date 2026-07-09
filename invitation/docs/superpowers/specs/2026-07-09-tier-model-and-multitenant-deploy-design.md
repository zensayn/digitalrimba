# Model Tier dan Deploy Multi-Tenant

**Tanggal:** 2026-07-09
**Status:** disetujui (desain), belum diimplementasikan
**Menggantikan sebagian:** `DESIGN_SYSTEM.md` §1 prinsip 1, `2026-06-25-server-first-invitation-themes-design.md` (Config Data Flow)

---

## 1. Latar Belakang

Dokumen ini lahir dari dua pertanyaan: apa arti tier bagi sebuah tema, dan
bagaimana undangan disajikan ketika pelanggan mengisi datanya sendiri.

Keduanya ternyata satu masalah. Tier hanya bisa murah kalau dibaca saat runtime,
dan runtime hanya mungkin kalau data pelanggan tidak dipanggang ke dalam bundle.

### 1.1 Temuan atas keadaan sekarang

Temuan berikut diverifikasi langsung terhadap kode pada commit `66a1b96`.

**Doc bertentangan dengan repo.** `DESIGN_SYSTEM.md` §1 prinsip 1 menyatakan
tier tidak menentukan kualitas visual. Seluruh `DESIGN_SPEC.md` di dalam
`themes/` menyatakan sebaliknya, misalnya `themes/floral/warisan/DESIGN_SPEC.md`
("tier paling kaya secara visual dan gerak") dan `themes/floral/README.md`
("pembeda tier = kekayaan komponen + animasi"). `rimba.md` masih memakai nama
Leaf/Timber/Heartwood yang `DESIGN_SYSTEM.md` §2.1 nyatakan tidak dipakai lagi.

**Struktur folder mengunci model lama.** Path `themes/<kategori>/<tier>/<tema>`
memaksa tier menjadi properti lokasi, bukan properti pesanan.

**Isi folder tidak cocok dengan namanya.** `sacred-luxe` (gelap, emas) dan
`warm-narrative` (parchment hangat) sama-sama berada di `themes/adat/kenangan/`.
Keduanya bukan dua tier dari satu tema, melainkan dua tema berbeda.

**Metadata pada doc belum ada wujudnya.** `category`, `subtheme`, `packageTier`,
dan `supportedFeatures` nol hasil saat di-grep di `themes/`, `_shared/`, dan
`_boilerplate/`. Subtema `kuncup`, `mekar`, `puspa` pada `DESIGN_SYSTEM.md` §2.2
tidak dipakai di mana pun.

**Warm Narrative sudah merupakan tema tier tertinggi.** Ia menyimpan sepuluh
section termasuk `LoveStorySection`, `GallerySection`, dan `DressCodeSection` —
fitur yang menurut `DESIGN_SYSTEM.md` §4 baru muncul di Kisah dan Warisan. Ia
juga sudah memiliki `ParallaxScene`, `FallingFlowers`, `EnvelopeOverlay`,
`DesktopCover`, dan `SnapContainer`. Seluruh perbendaharaan motion tema ini
sudah terpakai habis di anak tangga yang dinamai paling bawah.

**Belum ada tema yang dapat menyajikan data pelanggan.**
`warm-narrative/src/app/page.tsx` melakukan `import configJson from
"../../invitation.config.json"` pada level modul, sehingga data dipanggang saat
build. Tidak ada `middleware.ts`, dynamic route, `route.ts`, maupun binding
database pada `wrangler.jsonc`. Worker terikat ke satu custom domain
`warm-narrative.rimba.io`. Yang berdiri sekarang adalah etalase, bukan aplikasi
penyaji undangan.

**Dua spec sebelumnya menarik ke arah berlawanan.**
`2026-05-28-rimba-studio-design.md` membangun `GET/POST /api/config` untuk config
yang berubah tanpa build. `2026-06-25-server-first-invitation-themes-design.md`
kemudian menghapus `RimbaConfigProvider`, `useInvitationConfig`, dan jalur
`postMessage`, lalu menetapkan `invitation.config.json` sebagai production source
of truth. Keputusan kedua tidak kompatibel dengan model bisnis self-serve.

---

## 2. Keputusan 1 — Arti Tier

> **Satu tema sama dengan satu bahasa visual. Tier menaikkan intensitas, bukan
> mengganti bahasa.**

Warm Narrative tetap parchment hangat, copper, serif editorial, dan sakura di
ketiga tier. Yang naik adalah kedalaman dan koreografinya.

### 2.1 Dikunci di semua tier

Ini identitas tema dan tidak boleh berubah karena tier:

- palet warna;
- pasangan font dan skala tipografi;
- kosakata ornamen dan motif;
- rasa dasar serta konsep scene.

Konsekuensinya, `sacred-luxe` yang gelap-emas bukan "Warm Narrative tier bawah".
Ia tema lain. Aturan ini membuat kekacauan folder yang ada sekarang tidak dapat
terulang.

### 2.2 Boleh naik seiring tier

- jumlah section yang muncul, mengikuti entitlement paket;
- kepadatan ornamen;
- kualitas dan resolusi aset;
- komposisi pada *signature section* (lihat §2.3).

### 2.3 Signature section

Motion **tidak** dipakai sebagai tangga tier, karena pada Warm Narrative seluruh
motion sudah terpakai di Kenangan. Yang menjadi tangga adalah komposisi, tetapi
dibatasi agar ongkos produksi tidak meledak.

Setiap tema menunjuk **paling banyak tiga signature section** yang komposisinya
benar-benar berbeda per tier. Default yang disarankan: `cover` dan `closing`,
karena keduanya kesan pertama dan terakhir.

Section selain signature memiliki **satu komposisi** untuk semua tier. Bedanya
cukup datang dari kepadatan ornamen dan dari section mana yang muncul.

Tanpa batas ini, sepuluh section dikali tiga tier dikali tiga tema menghasilkan
sembilan puluh komposisi yang harus digambar, dibangun, dan diuji.

### 2.4 Kenangan bukan versi yang dilemahkan

Tema dirancang penuh terlebih dahulu, lalu **disuling ke bawah**. Kenangan harus
terasa utuh dan indah sebagai dirinya sendiri. Perbedaan antar-tier adalah
"intim versus megah", bukan "jelek versus bagus".

### 2.5 Dampak pada DESIGN_SYSTEM.md

Prinsip 1 pada `DESIGN_SYSTEM.md` §1 terlalu keras dan harus direvisi. Yang ingin
dicegah bukan "tier mempengaruhi visual", melainkan "tier mengganti identitas
tema". Rumusan pengganti adalah kalimat pada awal §2 dokumen ini.

---

## 3. Keputusan 2 — Penyajian Multi-Tenant

### 3.1 Kendala yang menentukan bentuk

Pelanggan mengisi datanya sendiri dan tidak ada redeploy manual per pesanan.
Karena itu:

- **tier wajib dibaca saat runtime.** Build-time variant mensyaratkan satu build
  per pesanan, dan build per pesanan tidak ada;
- **subdomain menunjuk pesanan, bukan tema.** Saat permintaan masuk ke
  `raka-kirana.rimbadigital.id`, hostname tidak memberi tahu bahwa ini Warm
  Narrative. Karena itu pola sekarang — satu Worker per tema, masing-masing
  memegang custom domain sendiri — tidak dapat dilanjutkan. Tidak ada Worker per
  tema yang bisa mengklaim `*.rimbadigital.id`.

### 3.2 Bentuk yang dipilih

**Router Worker plus satu Worker per tema, disambung service binding.**

```text
*.rimbadigital.id
  -> Router Worker
     -> resolve subdomain menjadi pesanan
     -> baca themeId, packageTier, addons, dan data undangan
     -> service binding ke Worker tema yang sesuai
        -> render dengan data yang diterima
```

Router memegang wildcard dan satu-satunya yang menyentuh database. Worker tema
tidak mengenal database; ia menerima data yang sudah jadi.

Alasan pemilihan: struktur per-tema yang sudah ada tetap utuh, tiap tema
mempertahankan `wrangler.jsonc` dan `open-next.config.ts` sendiri serta dapat
dirilis sendiri-sendiri. Isolasi rilis berharga selama tema masih sering
diutak-atik desainnya. Service binding Cloudflare tidak melewati jaringan publik
sehingga ongkos latensinya nyaris nol.

Alternatif yang ditolak: satu app tunggal berisi semua tema. Lebih sederhana
di-deploy, tetapi mengubah Soft Bloom berarti men-deploy ulang Warm Narrative.

### 3.3 Tier menjadi murah

Setelah bentuk ini berdiri, tier hanyalah kolom pada pesanan yang dibaca per
request, lalu dipakai untuk:

1. menyaring `sections.enabled` terhadap entitlement paket dan add-on;
2. memilih varian komposisi signature section melalui `next/dynamic`.

Beban performa terkendali karena aset berat sudah tinggal di R2 dan dirujuk lewat
`NEXT_PUBLIC_THEMES_CDN` serta `NEXT_PUBLIC_PHOTOS_CDN`, bukan berada di dalam
bundle. Yang perlu dipecah hanya JS varian, dan itu ringan.

### 3.4 Kontrak router dan tema

Karena tema tidak lagi membaca `invitation.config.json`, kontrak antara router
dan tema harus dikunci pada satu sumber kebenaran. Kontrak minimal mengikuti
`DESIGN_SYSTEM.md` §6.1, ditambah:

- `themeId`;
- `packageTier`;
- daftar add-on yang dibeli;
- `sections.order` dan `sections.enabled` yang sudah tersaring entitlement;
- nama tamu, yang sekarang dibaca dari `searchParams`.

`invitation.config.json` tetap dipertahankan sebagai fixture pengembangan lokal
dan preview tema, bukan sebagai production source of truth.

---

## 4. Restrukturisasi Folder

Tier keluar dari path karena ia properti pesanan.

```text
sebelum:  themes/<kategori>/<tier>/<tema>
sesudah:  themes/<kategori>/<tema>
```

Sehingga:

```text
themes/adat/warm-narrative
themes/floral/soft-bloom
```

Kategori dan tier yang didukung dinyatakan pada manifest tema, bukan pada lokasi
folder. `DESIGN_SPEC.md` per-tier dilebur menjadi satu dokumen art direction per
tema, sesuai `DESIGN_SYSTEM.md` §7.

### 4.1 Manifest tema

Manifest mewujudkan metadata yang selama ini hanya ada di `DESIGN_SYSTEM.md`
§2.2 dan §5:

```jsonc
{
  "id": "warm-narrative",
  "name": "Warm Narrative",
  "category": "adat",
  "supportedTiers": ["kenangan", "kisah", "warisan"],
  "signatureSections": ["cover", "closing"],
  "supportedFeatures": [
    "maps", "countdown", "calendar", "catalogMusic", "instagram",
    "rsvp", "digitalEnvelope", "weddingWishes", "gallery",
    "loveStory", "dressCode"
  ]
}
```

`supportedFeatures` berarti "dapat dirender oleh tema", bukan "termasuk dalam
paket". Ini menjaga `DESIGN_SYSTEM.md` §5.

---

## 5. Pembersihan

`themes/adat/kenangan/sacred-luxe` dan `themes/adat/kisah/sinema-kisah` dihapus.
Keduanya prototipe awal yang sudah tidak relevan. Bukti: nol referensi dari luar
foldernya sendiri, dan terakhir tersentuh pada `3a4bff2` (2026-06-27) yang bahkan
merupakan commit pengerjaan `warm-narrative`.

Penghapusan dilakukan sebagai commit tersendiri agar mudah di-revert bila ada
aset yang ingin diselamatkan.

Karena `2026-06-25-server-first-invitation-themes-design.md` mendaftarkan kedua
tema itu sebagai active themes, cakupannya menyusut menjadi `warm-narrative` dan
`soft-bloom` saja.

---

## 6. Urutan Pengerjaan

Ketiganya bergantung berurutan dan masing-masing memerlukan plan tersendiri.

1. **Lapisan tenancy.** Router Worker, resolusi subdomain menjadi pesanan,
   penyimpanan data, kontrak router-tema, service binding. Ini prasyarat
   segalanya dan merupakan pekerjaan terbesar.
2. **Restrukturisasi folder dan manifest.** Tier keluar dari path, manifest
   ditegakkan, `DESIGN_SPEC.md` dilebur, pembersihan §5 dijalankan.
3. **Tangga tier pada Warm Narrative.** Menyuling Kenangan dan Kisah dari bentuk
   penuh yang sudah ada, dimulai dari `cover` dan `closing`.

Menambah kategori atau tema baru berada **sesudah** ketiganya. Membangun tema
keempat di atas fondasi sekarang berarti melipatgandakan pekerjaan migrasi.

---

## 7. Bukan Cakupan

- pemilihan teknologi penyimpanan data pesanan;
- backend RSVP dan Wedding Wish;
- Rimba Studio dan editing level elemen;
- bahasa visual brand Rimba secara keseluruhan;
- kategori atau tema baru.

---

## 8. Yang Masih Terbuka

Hal berikut sengaja tidak diputuskan di sini dan tidak boleh ditutup dengan
asumsi diam-diam di dalam satu tema.

- **Penyimpanan data pesanan.** D1, KV, atau lainnya. Menentukan bentuk router.
- **Signature section per tema.** `cover` dan `closing` baru usulan; Soft Bloom
  belum tentu sama dengan Warm Narrative.
- **Wujud konkret tiap anak tangga.** Seperti apa persisnya Cover Warm Narrative
  di Kenangan dibandingkan di Warisan belum digambar.
- **Subtema.** `kuncup`, `mekar`, `puspa` pada `DESIGN_SYSTEM.md` §2.2 tidak
  dipakai di mana pun. Ditegakkan atau dihapus dari doc.
- **Harga.** Apakah satu tema di tiga tier berarti tiga SKU, dan bagaimana add-on
  dihargai.
- **`Amplop Digital` versus `Kirim Kado`.** Masih terbuka sejak
  `DESIGN_SYSTEM.md` §4.4.
- **`rimba.md`.** Masih memakai nomenklatur Leaf/Timber/Heartwood dan memetakan
  Sacred Luxe ke Heartwood. Perlu diselaraskan atau dipensiunkan.
