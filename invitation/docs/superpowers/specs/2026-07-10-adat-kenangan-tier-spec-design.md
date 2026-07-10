# Spec Tier Kenangan · Kategori Adat — Design Doc

**Tanggal:** 2026-07-10
**Status:** disetujui (desain), belum diimplementasikan
**Branch:** `chore/cleanup-adat-kenangan`
**Menyusul:** penghapusan `sacred-luxe` dan `sinema-kisah` pada branch yang sama

---

## 1. Latar Belakang

Setelah `sacred-luxe` dihapus, `themes/adat/kenangan/DESIGN_SPEC.md` menjadi
dokumen yatim: judulnya "Kenangan · Kategori Adat" tetapi isinya spec satu tema
yang sudah tidak ada — `### Aesthetic: Neo-Adat Noir "Sacred Luxe"`, palet
obsidian-emas, dan sebelas section milik tema itu.

Masalahnya lebih dalam dari sekadar file yang tertinggal.

### 1.1 Temuan atas keadaan sekarang

Diverifikasi langsung terhadap kode, bukan terhadap dokumen.

**Spec tier dibajak jadi spec tema.** Ketiga `DESIGN_SPEC.md` di `themes/adat/`
menamai satu estetika per tier: `kenangan` = Sacred Luxe, `kisah` = Warm
Narrative, `warisan` = Sacred Heritage. Tidak ada lapisan yang memisahkan
"apa yang berhak muncul di tier ini" dari "rupanya seperti apa".

**Tema tinggal di tier yang bukan rumah spec-nya.** App `warm-narrative` berada
di `themes/adat/kenangan/`, sementara art direction-nya tertulis di
`themes/adat/kisah/DESIGN_SPEC.md`. Tema itu sendiri tidak punya `DESIGN_SPEC.md`.

**Lapisan doc adat aspirasional.** `kisah/README.md` mendaftar `javanese-dusk`
dan nol menyebut `sinema-kisah` yang sebenarnya tinggal di sana.
`warisan/README.md` mendaftar `sacred-heritage` dan `keraton-noir` yang tidak
pernah ada. `kenangan/DESIGN_SPEC.md` mendaftar `obsidian-rose` dan `batik-noir`
yang juga tidak ada, sambil tidak menyebut `warm-narrative`.

**Tiga model tier saling bertabrakan.** `adat` memakai model estetika per tier.
`floral/README.md` memakai model kekayaan komponen dan animasi.
`2026-07-09-tier-model-and-multitenant-deploy-design.md` §2 menolak keduanya dan
menetapkan tier sebagai intensitas dari satu bahasa visual yang sama.

**Model kekayaan tidak dapat dipakai di adat.** `warm-narrative` sudah memiliki
`ParallaxScene`, `FallingFlowers`, `EnvelopeOverlay`, `DesktopCover`, dan
`SnapContainer` — seluruhnya di tier yang dinamai paling bawah. Spec tier yang
berbunyi "animasi minimal, tanpa parallax" akan dilanggar oleh satu-satunya
penghuninya sejak baris pertama.

---

## 2. Keputusan 1 — Tier Diukur dari Entitlement Section

> **Tier menentukan section mana yang berhak muncul. Tier tidak menyentuh
> estetika maupun motion.**

Estetika dan motion adalah milik tema. Sebuah tema boleh memakai parallax,
partikel, atau WebGL di tier mana pun; yang dibatasi tier hanyalah daftar section
yang aktif.

Konsekuensinya, `warm-narrative` sah berada di Kenangan apa adanya, tanpa perlu
dipreteli motion-nya. Ini juga sejalan dengan arah `2026-07-09` §3.3 (tier dibaca
runtime lalu dipakai menyaring `sections.enabled`) tanpa mendahului keputusan
dokumen tersebut soal signature section.

### 2.1 Sumber kebenaran entitlement

`DESIGN_SYSTEM.md` §4. Spec tier tidak mendefinisikan ulang entitlement; ia
menerjemahkannya menjadi daftar section.

| Tier | Section yang aktif |
|---|---|
| Kenangan | `cover`, `greeting`, `couple`, `akad`, `resepsi`, `rsvp`, `gift`, `closing` |
| Kisah | seluruh Kenangan + `lovestory`, `gallery` (maks 25 foto), satu video |
| Warisan | seluruh Kisah + `dresscode`, `gallery` unlimited, Kirim Kado, Turut Mengundang, Rundown |

Dua hal yang mudah disalahbaca pada `DESIGN_SYSTEM.md` §4, dan keduanya bukan
section:

- **Wedding Wish** bukan section. Ia field "Ucapan (opsional)" di dalam form
  RSVP (`RSVPSection.tsx` baris 224), dan ucapan yang masuk ditampilkan kembali
  sebagai guestbook feed (`digital/backend/internal/handlers/rsvp.go`).
- **"Sesi Akad dan Resepsi terpisah"** (§4.2) berarti dua undangan terpisah —
  satu untuk tamu akad, satu untuk tamu resepsi. Bukan dua section. Di Kenangan
  keduanya digabung dalam satu undangan, dan section `akad` serta `resepsi`
  tetap muncul berdampingan.

### 2.2 Yang didukung tema bukan yang termasuk paket

Sebuah tema boleh merender lebih banyak section daripada yang berhak muncul pada
tier tertentu. Entitlement menyaring saat runtime lewat `sections.enabled`.
Pemisahan ini mengikuti `2026-07-09` §4.1 (`supportedFeatures` berarti "dapat
dirender oleh tema", bukan "termasuk dalam paket").

---

## 3. Keputusan 2 — Dua Lapis Dokumen

> **Spec tier bicara apa yang berhak muncul. Spec tema bicara rupanya seperti
> apa. Tidak ada hex di spec tier; tidak ada entitlement di spec tema.**

Batas inilah yang selama ini absen, dan itulah sebab `kenangan/DESIGN_SPEC.md`
bisa dibajak menjadi spec Sacred Luxe.

| Dokumen | Isi | Bukan isinya |
|---|---|---|
| `<kategori>/<tier>/DESIGN_SPEC.md` | karakter tier, entitlement section, status tema | palet, font, motion |
| `<kategori>/<tier>/README.md` | indeks tema, cara menjalankan, panduan menambah tema | desain |
| `<tema>/DESIGN_SPEC.md` | palet, tipografi, kosakata motion, section yang didukung | entitlement, harga |

Token semantik bersama tetap tinggal di `DESIGN_SYSTEM.md` §8.1 dan tidak
diduplikasi ke mana pun.

---

## 4. warm-narrative Sudah Patuh Entitlement

`RenderSection.tsx` mengenali sebelas id: `cover`, `greeting`, `couple`,
`lovestory`, `akad`, `resepsi`, `dresscode`, `gallery`, `rsvp`, `gift`,
`closing`.

Sebelas itu terurai persis menjadi delapan entitlement Kenangan ditambah tiga
section tier atas:

| Section | Tier | Keadaan |
|---|---|---|
| `cover`, `greeting`, `couple`, `akad`, `resepsi`, `rsvp`, `gift`, `closing` | Kenangan | aktif |
| `lovestory`, `gallery` | Kisah | dimatikan lewat `sections.enabled` |
| `dresscode` | Warisan | dimatikan lewat `sections.enabled` |

Tidak ada section yang hilang dan tidak ada yang menyimpang. Kelebihan tiga
section adalah kelebihan kemampuan tema, bukan pelanggaran tier — sesuai §2.2.

Wedding Wish tidak muncul di daftar itu karena ia bukan section, melainkan
field di dalam RSVP. Lihat §2.1.

---

## 5. Token Warm Narrative Berlapis Dua

Ini menjelaskan mengapa membaca `globals.css` saja menyesatkan.

**Lapisan runtime.** `buildCssVars` (`_shared/lib/css-vars.ts`) menimpa sembilan
token warna dan dua font var dari `theme` pada `invitation.config.json`:
`--bg`, `--surface`, `--surface-2`, `--gold`, `--gold-light`, `--gold-dim`,
`--text`, `--text-muted`, `--text-dim`, `--font-display`, `--font-body`.

Nilai yang benar-benar dirender karena itu berasal dari config, bukan dari
deklarasi `:root`:

| Token | Nilai render | Nilai statik di `globals.css` |
|---|---|---|
| `--gold` | `#C07830` | `#99511A` |
| `--gold-light` | `#D4A056` | `#C0823A` |
| `--gold-dim` | `#A0917E` | `#6B4E28` |
| `--text` | `#2A2218` | `#261E14` |
| `--text-muted` | `#6B5E4E` | `#574A39` |
| `--text-dim` | `#A0917E` | `#6B4E28` |

`--bg` (`#FAF7F2`), `--surface` (`#F2EDE4`), dan `--surface-2` (`#E8E0D4`) sama
di kedua lapisan.

**Lapisan statik.** `--border` (`rgba(153,81,26,0.28)`), `--gold-deep`
(`#8A4A16`), `--paper-texture`, dan `--shadow-*` tidak ditimpa. Komentar di
`globals.css` menyatakan `--gold-deep` sengaja dinamai lain justru agar tidak
ikut tertimpa menjadi copper terang yang tenggelam di atas floral.

**Tipografi.** `layout.tsx` memuat Playfair Display, Source Serif 4, dan Inter.
`EB Garamond italic` yang tercantum pada `kisah/DESIGN_SPEC.md` tidak pernah
dimuat.

---

## 6. Perubahan File

| File | Aksi |
|---|---|
| `themes/adat/kenangan/DESIGN_SPEC.md` | tulis ulang sebagai spec tier |
| `themes/adat/kenangan/README.md` | baru; indeks tier, mendaftar `warm-narrative` |
| `themes/adat/kenangan/warm-narrative/DESIGN_SPEC.md` | baru; art direction, token dua lapis, kosakata motion |
| `themes/adat/kisah/DESIGN_SPEC.md` | tulis ulang sebagai spec tier; blok Aesthetic, Color Tokens, dan Typography dilepas |

README tier baru mengikuti format `kisah/README.md` dan `warisan/README.md` yang
sudah ada: judul, tier, tagline, tabel tema, cara menjalankan, panduan menambah
tema.

---

## 7. Bukan Cakupan

- `themes/adat/warisan/DESIGN_SPEC.md`;
- pembersihan tema fiktif dari README (`obsidian-rose`, `batik-noir`,
  `javanese-dusk`, `sacred-heritage`, `keraton-noir`);
- mewujudkan "pisah undangan" pada tier Kisah (dua undangan untuk satu pesanan);
- menyelaraskan `floral` ke model entitlement;
- restrukturisasi folder pada `2026-07-09` §4, yang mengeluarkan tier dari path;
- tema adat baru.

---

## 8. Yang Masih Terbuka

- **Rumusan `DESIGN_SYSTEM.md` §4 mudah disalahbaca.** "Wedding Wish" terbaca
  seperti section padahal ia field di dalam RSVP, dan "Sesi Akad dan Resepsi
  terpisah" terbaca seperti dua section padahal ia dua undangan. Keduanya sudah
  diluruskan di sini, tetapi §4 sendiri belum diperjelas.
- **`floral` memakai model tier yang berbeda.** Setelah keputusan ini, `adat`
  memakai entitlement sementara `floral/README.md` masih memakai kekayaan
  komponen dan animasi. Salah satu harus mengalah, tetapi bukan di sini.
- **Konflik dengan `2026-07-09` §4.** Dokumen itu mengeluarkan tier dari path
  folder. Spec tier per folder yang ditegakkan di sini akan ikut pindah bila
  restrukturisasi itu jadi dijalankan.
