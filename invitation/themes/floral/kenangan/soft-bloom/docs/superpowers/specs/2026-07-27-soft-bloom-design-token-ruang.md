# Soft Bloom — Design Token Ruang (Margin, Gutter, Ritme)

> Tanggal: 2026-07-27 · Branch kerja: `perfecting-soft-bloom`
> Dipicu oleh: permintaan pemilik — "buatkan design token agar template ini
> sesuai dan konsisten, cek margin dari prada-melati (margin saja)".
> Rujukan: `adat/kenangan/prada-melati/docs/superpowers/specs/2026-07-21-prada-melati-spacing-typography-source-of-truth.md`

## 0. Apa yang sebenarnya rusak

Bukan satu section yang salah — semuanya "benar" sendiri-sendiri, dan justru itu
masalahnya. Audit sebelum perubahan:

| Peran | Jumlah nilai berbeda | Contoh |
|---|---|---|
| Padding atas section | **6** | `clamp(150,24vh,200)` greeting · `clamp(140,22vh,190)` couple/lovestory · `clamp(130,20vh,170)` dresscode/gift/rundown/turut · `clamp(124,22vh,188)` gallery · Event `clamp(92,14vh,132)` **ditumpuk** di atas `.flow-section` `clamp(64,11vh,104)` · RSVP `clamp(48,9vh,92)` ditumpuk juga |
| Padding bawah section | **5** | `clamp(40,9vh,72)` · `clamp(48,12vh,96)` · `clamp(96,15vh,128)` · `calc(clamp(28,5vh,44)+72)` · bawaan `.flow-section` |
| Gutter samping | **3** | `px-6` (24) · `px-7` (28) · `px-8` (32) |
| Lebar kolom | **5** | `max-w-sm` 384 · `max-w-md` 448 · `max-w-lg` 512 · `396px` · `420px` |
| Jarak antar-kelompok | **3** | `clamp(16,3.5vh,22)` · `clamp(18,4vh,26)` · `clamp(20,4.5vh,30)` |

Tak satu pun perbedaan itu pernah diputuskan; semuanya sisa dari section yang
ditulis di waktu berbeda. Event bahkan menumpuk dua padding sehingga ruang
atasnya ±2× tetangganya.

## 1. Yang diambil dari prada-melati (dan yang tidak)

Diminta "margin saja", dan memang hanya itu yang relevan — palet, tipografi, dan
ornamen kedua tema berbeda total. Yang disalin:

- **Mekanismenya**, bukan angkanya: satu pembungkus konten bersama (di prada
  `SceneContent.tsx`, di sini kelas `.section-shell`) + satu tabel preset per
  section (di prada `sceneKelir.ts`, di sini `src/lib/rhythm.ts`).
- **Pembagian atas/bawah** dari spec prada §2: bawah satu nilai untuk semua
  section (jadi "sama" per definisi), atas lewat satu rumus yang diberi masukan
  per section — karena tinggi zona aman ornamen memang berbeda dan memaksakan
  satu angka statis justru memunculkan lagi cacat "teks tertimpa ornamen".
- **Angka padding bawah** `clamp(88px, 14svh, 132px)` — diambil apa adanya.
  Kendalanya setara: di prada hem batik, di sini garland `SectionSeam` yang
  menjulur **131px ke atas** melewati batas section (terukur di browser).
- **20px antar-field form** (RSVP), angka warm-narrative yang juga dipakai prada.

Yang **tidak** disalin: gutter prada `clamp(42px, 9vw, 58px)` — itu untuk
membebaskan konten dari pinggiran batik yang solid. Ornamen tepi soft-bloom
(`RantingSamping`) adalah juntaian transparan; gutter setebal itu cuma membuat
kolom sesak tanpa membebaskan apa pun.

## 2. Token (globals.css)

```
--space-2xs/xs/sm/md/lg   4/8/12/16/20px      jarak DI DALAM satu blok
--space-block             clamp(14,3vh,24)    antar-blok dalam satu section
--space-group             clamp(20,4.5vh,30)  antar-kelompok (selalu > antar-blok)
--gutter                  clamp(26,7vw,32)    padding samping kolom
--content-max / -wide     384px / 460px       lebar kolom teks / grid galeri
--frame-max               per section         lebar BingkaiAtas (dari rhythm.ts)
--frame-crown             0.34                turunnya puncak lengkung ÷ lebar gambar
--frame-breath            var(--space-group)  napas lengkung → elemen pertama
--pad-block               clamp(56,10svh,88)  ruang atas section tanpa bingkai
--section-pad-bottom      clamp(88,14svh,132) ruang bawah — dari prada-melati
```

### 2.1 Kenapa ruang atas pakai persentase, bukan `vh`

`BingkaiAtas.webp` **persegi** dan dipasang `width:100%` (dibatasi `--frame-max`),
jadi tinggi lengkungnya mengikuti **lebar render**, bukan tinggi viewport.
Rumusnya:

```
padding-top: max(--pad-block, calc(min(100%, --frame-max) * --frame-crown + --frame-breath))
```

Persentase pada `padding` dihitung dari lebar containing block — yang di sini
persis sama dengan lebar bingkai. Nilai `clamp(...vh)` yang lama justru
**mengecil di layar pendek-lebar, tepat saat bingkainya membesar**. Terukur:

| Viewport | Lebar kolom | Ruang atas (framed) |
|---|---|---|
| 360×640 | 360 | 151.2px |
| 390×844 | 390 | 162.6px |
| 1440×900 | 475 (kolom desktop) | 191.6px |

Ruang atas naik seiring bingkai membesar — yang lama tidak.

### 2.2 Jebakan yang memakan satu putaran penuh

Rumus di atas mula-mula ditaruh di `:root` sebagai `--section-pad-top`.
**Salah, dan tanpa gejala keras.** `var()` disubstitusi di elemen tempat custom
property-nya *dideklarasikan*: karena `--section-pad-top` lahir di `:root`,
`var(--frame-max)` di dalamnya membeku jadi `0px` milik `:root`, dan nilai yang
disuntik `rhythmVars()` di `<section>` tak pernah terbaca. Akibatnya **seluruh
10 section framed diam-diam jatuh ke `--pad-block` (84px)** dan judulnya masuk ke
dalam bunga. Tes hijau, typecheck hijau; hanya screenshot yang menangkapnya.

Perbaikannya: rumus dideklarasikan di `.section-shell`, tempat `--frame-max`
sudah terwarisi dari `<section>`. Kelas bug ini sekarang dijaga tes eksplisit
(`spacing-contract`: "rumus zona aman atas dideklarasikan di .section-shell").

## 3. Pengecualian — dan alasannya (tabel `RITME`, `src/lib/rhythm.ts`)

Pengecualian wajib punya alasan struktural tertulis, bukan angka yang kebetulan
terasa pas.

| Section | Pengecualian | Alasan |
|---|---|---|
| `cover` | `frameBreath: 0px`, `padBottom` tipis | Elemen pertamanya wreath monogram — bundar & tepinya transparan, boleh duduk langsung di bawah lengkung. Tak ada jahitan garland yang menjulur dari section berikut di titik ini. `--shell-gap: 0` karena cover ber-`overflow:hidden` dan wajib muat satu viewport, jadi ritme dalamnya sengaja tak seragam. |
| `greeting` | `frameBreath: ×2` | Satu-satunya section yang elemen pertamanya judul script **lebar-penuh**, bukan eyebrow sempit. Bukaan lengkung melebar makin ke bawah; eyebrow tetangganya muat di bagian sempit, judul greeting menggesek kluster samping di ketinggian yang sama. |
| `gallery` | `width: "wide"` | Grid polaroid, bukan kolom teks. |
| `rsvp` | `frameMax: 0` | Sengaja tanpa BingkaiAtas — kolomnya sudah diisi panel kertas penuh yang akan bertabrakan dengan lengkung. |
| `closing` | `frameMax: 0`, `padBottom` 166px | Dibingkai `BingkaiPenuh`, bukan bingkai atas. Bawahnya harus melewati `.closing-brand-footer` yang duduk absolut di dasar section. |

## 4. Hasil terukur (390×844)

Seluruh 10 section framed: ruang atas **162.59px**, ruang bawah **118.16px**,
gutter **27.3px**, lebar kolom **384px** — identik, bukan mirip. Sisanya persis
lima pengecualian di §3.

## 5. Dijaga tes — `scripts/__tests__/spacing-contract.test.mjs`

1. Setiap token ruang terdefinisi di `globals.css`.
2. Rumus zona aman ada di `.section-shell`, **tidak** di `:root` (§2.2).
3. Setiap section memakai `.section-shell` dan memanggil `rhythmVars()`.
4. Tak ada section yang mengarang ruang vertikal berskala-layar
   (`paddingTop/Bottom` ber-`clamp()`/satuan viewport) atau gutter sendiri
   (`px-/py-/pt-/pb-`). Nudge optik beberapa piksel tetap boleh.
5. Lebar kolom tak dipatok per section (`max-w-*`, `maxWidth: 3xx` di pembungkus).
6. Setiap id di `KNOWN_SECTIONS` punya baris di tabel `RITME` — kalau tidak,
   `ritmeFor()` melempar saat dirender.
7. `<TopFrame maxWidth>` tak disetel per section: lebar bingkai & zona aman atas
   membaca `--frame-max` yang sama, jadi tak bisa melenceng sendiri-sendiri.

## 6. Di luar cakupan (dicatat untuk lanjutan)

- Kelas `.type-body` ditambahkan (empat section menuliskan tiga properti yang
  sama persis secara inline). Peran tipografi lain — mis. nama serif italic
  `clamp(19,5vw,23)` yang berulang di LoveStory & Turut — belum ditokenkan.
- Utilitas `gap-*` Tailwind kecil di dalam komponen belum diseragamkan ke
  `--space-*`; yang sudah hanya jarak tingkat-blok. Kontraknya sengaja dibatasi
  ke margin section, sesuai permintaan.
- Kontras palet masih belum lolos di atas `surface2` (lihat TEMPLATE.md §2) —
  tak tersentuh sesi ini.
