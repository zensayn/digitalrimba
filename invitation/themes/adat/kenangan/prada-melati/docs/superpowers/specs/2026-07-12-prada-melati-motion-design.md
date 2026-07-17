# Prada Melati — Gerak Tambahan: "Prada Hidup"

**Tanggal:** 2026-07-12
**Tema:** `adat/kenangan/prada-melati`
**Status:** desain disetujui; menunggu review spec
**Bersandar pada:** `2026-07-10-prada-melati-design.md` (§5 Gerak, §6 Aset, §2.2 Risiko)

**Tujuan:** Menambah kesan "hidup" pada Prada Melati agar setara "wah" dengan
`warm-narrative` dan `soft-bloom`, **tanpa** meminjam kosakata gerak keduanya.
Ditumpuk berdampingan, dua tema itu terasa lebih hidup karena punya beberapa
sistem gerak ambient yang **selalu jalan** (kelopak jatuh + angin di
`warm-narrative`; kupu-kupu, burung, kelopak, sulur di `soft-bloom`). Prada
sekarang praktis hanya punya satu gerak otonom — `RonceanMelati`, dan itupun
cuma di `cover`. Saat user berhenti scroll, section prada nyaris diam.

---

## 1. Prinsip — cahaya, bukan lintasan

Spec induk §5 mengunci tesisnya: *"yang bergerak bukan jaraknya melainkan
cahayanya."* Prada adalah kain dan logam, bukan taman. Maka penawar
"kurang hidup" **bukan** menambah parallax atau kelopak jatuh — itu justru
mengembalikan prada ke bahasa `warm-narrative` yang spec induk §1.2 perjuangkan
untuk dihindari.

Tiga gerak baru di bawah ini semuanya soal **cahaya**: debu emas yang naik
seperti bara pelita, blencong yang berkedip seperti pelita minyak, dan kilau
logam yang tetap berdenyut saat diam. Tak satu pun memindahkan "tempat" sebuah
piece; yang berubah adalah terang dan materialnya.

---

## 2. Tiga komponen

| # | Gerak | Sifat | Menyentuh |
|---|---|---|---|
| 1 | `GoldDust` — debu emas naik | ambient, selalu jalan, global | komponen baru + `page.tsx` |
| 2 | Blencong `flicker` | ambient, per-section | `KelirScene.tsx` |
| 3 | Kilau idle shimmer | ambient, per-aktor | `GiltSweep.tsx` |

### 2.1 `GoldDust` — debu emas melayang

Padanan "kelopak jatuh" milik prada — partikel ambient yang selalu jalan, tapi
terbuat dari **serpih emas tertangkap cahaya**, bukan bunga, dan **naik** seperti
bara/asap pelita alih-alih gugur. Arah naik menyatu dengan blencong `closing`
yang juga terbit dari hem bawah (spec induk §6f).

**Penempatan.** Satu lapis global, dipasang **sekali** di `page.tsx` (seperti
`MusicPlayer`), bukan per-section — menjaga beban GPU tetap datar di atas kilau
(lihat spec induk §13, kekhawatiran Android murah). `position: fixed; inset: 0;
pointer-events: none; aria-hidden`.

**Render — aset webp, bukan dot CSS.** Satu sprite `SerpihEmas.webp` (serpih
daun emas pipih, transparan) dipakai ulang ~14×. Konsisten dengan disiplin aset
prada; bukan `radial-gradient` CSS.

**Anti-"konfeti".** Satu sprite yang diulang 14× berisiko terbaca sebagai
tempelan berulang — persis risiko "stiker datar" spec induk §2.2. Penawarnya:
tiap instance divariasikan lewat **rotasi, skala, dan opacity** yang berbeda.
Rotasi (termasuk `scaleX(-1)`) **boleh di sini** — berbeda dari parang dan sulur
yang punya arah lengkung dan dilarang di-flip (spec induk §6b). Serpih tidak
punya orientasi kanonik, jadi memutarnya benar secara material.

**Gerak.** Pola deterministik seperti `FallingFlowers` `warm-narrative`: fungsi
`sr(seed)` memberi `left`, durasi, delay, skala, rotasi per serpih. Tiap serpih
`@keyframes` sendiri:

- terbit dari bawah viewport, `opacity 0`, sedikit di bawah `translateY(0)`;
- naik ~`92vh` dengan sway horizontal halus (`±14px`) dan rotasi pelan;
- meredup (`opacity 0`) di sepertiga atas.

| Parameter | Nilai |
|---|---|
| Jumlah | ~14 serpih |
| Ukuran | `12–26px` (variasi per seed) |
| Durasi | `14–22s` |
| Delay | negatif (`-durasi × rand`) agar langsung ramai saat load |
| Opacity puncak | `≤ 0.5` — tetap faint agar tak mengganggu keterbacaan teks |
| z-index | di atas konten section, meniru `FallingFlowers` (z3) — motes kecil & redup, aman di atas teks yang sudah ber-`textShadow` |

**Reduced-motion.** `prefers-reduced-motion: reduce` → **disembunyikan total**
(`display: none`). Serpih yang diam di tengah layar terbaca seperti noda/artefak,
beda dari roncean yang diam pun jelas sebuah untaian. Menyembunyikannya lebih
jujur daripada membekukannya.

### 2.2 Blencong `flicker` — kedip pelita minyak

Blencong sekarang "bernapas" mulus dan simetris (`opacity [0.85,1,0.85]`,
`scale [1,1.04,1]`, sinus 6s) di `KelirScene.tsx`. Blencong **adalah** lampu
minyak wayang; napas sinus terasa mekanis. Diganti **kedip tak beraturan**
seperti nyala pelita.

| Parameter | Nilai |
|---|---|
| `opacity` | keyframe tak simetris, mis. `[0.9, 1, 0.86, 0.97, 0.88, 1]` pada offset tak rata |
| `scale` | denyut tipis dipertahankan, mis. `[1, 1.03, 1.01, 1.04, 1, 1.02]` |
| Durasi | `~5s`, `repeat: Infinity` |
| Amplitudo | kecil — anggun, **bukan** strobo |

Nol byte — hanya mengubah `animate`/`transition` motion yang sudah ada.

**Reduced-motion.** Tak berubah dari spec induk §5.5: blencong beku di terang
penuhnya (`animate={undefined}`).

### 2.3 Kilau idle shimmer — logam hidup saat diam

Kelemahan terbesar: `GiltSweep` menggerakkan sapuan **hanya** dari
`scrollYProgress`. Begitu user berhenti scroll, emas mati total. Ditambah
**denyut kilau idle** yang jalan independen dari scroll.

- Sapuan gradien yang digerakkan scroll (`backgroundPosition`) **tetap** jadi
  gerak utama — tak berubah.
- Ditambah animasi CSS `@keyframes giltIdle` pada **opacity** div sapuan
  (mis. `0.6 ↔ 1.0`), `~4.5s`, `ease-in-out`, `repeat: Infinity`. Opacity ramah
  compositor, murah di GPU.
- Hasil: saat diam, sheen emas berdenyut pelan alih-alih membeku.

**Reduced-motion.** Idle shimmer **mati** (opacity dipatok `1`); sapuan tetap
beku di `45%` seperti sekarang (spec induk §5.5 tak berubah).

---

## 3. Aset baru

Satu berkas, mengikuti style bible `SB_GOLD` spec induk §3.1, dengan klausul
latar transparan §3.3.

**`SerpihEmas.webp`** — 256×256, transparan, budget **< 15KB**

```text
Javanese keraton wedding ornament in the manner of prada cloth and wayang beber. Flat gold-leaf silhouette: burnished gold #C9A227, fine crackle, visible fabric grain. Uniform line weight, hard-edged contours, no tapering strokes, no gradient shading. Ceremonial, hieratic, still. No perspective, no cast shadows, no depth, no volumetric light. No people, no text, no lettering, no numbers, no logos. Subject: a single small torn flake of gold leaf — an irregular organic shard of prada gold foil with an uneven edge, a few cecek dots stippled across its interior. Compact and centered, occupying the middle forty percent of the canvas, the rest empty. Gold leaf only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow. Square composition, 256x256.
```

R2 bucket `rimba-themes`, path `adat/kenangan/prada-melati/SerpihEmas.webp`,
disajikan lewat `https://assets-themes.rimba.io`. Didaftarkan di `lib/assets.ts`.

Total aset prada naik dari 15 → **16 berkas**.

---

## 4. Komponen & berkas tersentuh

| Berkas | Tindakan |
|---|---|
| `src/components/shared/GoldDust.tsx` | **baru** — lapis global serpih emas naik |
| `src/app/page.tsx` | pasang `<GoldDust />` (di dalam fragment, sejajar `MusicPlayer`) |
| `src/components/shared/KelirScene.tsx` | ganti napas blencong → flicker |
| `src/components/shared/GiltSweep.tsx` | tambah idle shimmer + guard reduced-motion |
| `src/app/globals.css` | `@keyframes` debu & `giltIdle`; blok `prefers-reduced-motion` untuk keduanya |
| `src/lib/assets.ts` | daftarkan `SerpihEmas` |
| `2026-07-10-prada-melati-design.md` | tambah rujukan silang ke spec ini di §5 |

---

## 5. Performa

Spec induk §13 mewanti-wanti kilau (`mask-image` + `mix-blend-mode: overlay`)
berat di Android murah. Gerak baru menjaga agar tak memperburuk:

- `GoldDust` **satu instance global**, bukan per-section. Animasi CSS murni pada
  `transform`/`opacity` (compositor-only), tanpa `mix-blend-mode`.
- Idle shimmer menganimasi **opacity** saja — tidak menambah lapisan blend baru,
  hanya memodulasi yang sudah ada.
- Blencong flicker menyalin biaya blencong lama persis (satu `radial-gradient`
  beranimasi); nol tambahan.

Kalau frame rate tetap jatuh, urutan penawar spec induk §13 berlaku lebih dulu
(turunkan kilau) sebelum menyentuh gerak baru. **Jangan** mengembalikan parallax
atau kelopak jatuh sebagai gantinya.

---

## 6. Bukan cakupan

- Generate `SerpihEmas.webp` dan unggah ke R2 (didokumentasikan di §3; eksekusi
  terpisah).
- Gerak baru untuk pinggiran/tumpal — keduanya tetap diam (spec induk §4).
- Perubahan pada `RonceanMelati` — sudah cukup sebagai benang merah.
