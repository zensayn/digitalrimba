# Prada Melati — Design Doc

**Tanggal:** 2026-07-10
**Tema:** `adat/kenangan/prada-melati`
**Status:** desain disetujui; Fase 1 sedang dikerjakan
**Plan:** `invitation/docs/superpowers/plans/2026-07-10-prada-melati.md`
**Bersandar pada:** `invitation/docs/superpowers/specs/2026-07-10-adat-kenangan-tier-spec-design.md`

**Tujuan:** Menjadi tema adat pertama yang benar-benar adat di repo ini —
keraton Jawa, gelap, dengan motif prada emas dan roncean melati — dan berdiri
cukup jauh dari `warm-narrative` agar keduanya terbaca sebagai dua pilihan,
bukan dua bersaudara.

---

## 1. Latar Belakang

### 1.1 Kategori `adat` belum berisi adat

Motif utama `warm-narrative` adalah **sakura**. Style bible-nya
(`warm-narrative/docs/superpowers/specs/2026-06-30-painterly-sakura-suite-design.md`
§2) berbunyi "Primary flower: cherry blossom (sakura); occasional blush peony
and garden rose". Tipografinya Playfair Display dan Source Serif 4 — editorial
Barat. Nusantara hanya tersisa pada nama berkas aset lama seperti `GapuraBunga`,
yang justru sudah digantikan suite sakura.

Prada Melati mengisi janji yang selama ini kosong.

### 1.2 Bahaya tertukar dengan warm-narrative

`warm-narrative` memakai `--bg #FAF7F2` (parchment nyaris putih) dengan aksen
copper `#C07830`, digambar cat air gouache painterly. Sogan keraton juga coklat
hangat keemasan. Sogan di atas latar krem akan berdampingan dengan
`warm-narrative` di `TemplateSelector` seperti dua bersaudara.

Pembeda tidak datang dari motif. Dari thumbnail, orang melihat **terang atau
gelap**, **berbingkai atau tidak**, dan **terbuat dari apa** jauh sebelum ia
melihat parang atau sakura.

### 1.3 Revisi 2026-07-10: pembeda nilai dan material saja tidak cukup

Draf pertama spec ini membedakan Prada Melati pada dua sumbu — nilai (gelap)
dan material (emas pipih, bukan sapuan kuas) — lalu memakai ulang seluruh tata
bahasa komposisi `warm-narrative` apa adanya. Ditumpuk berdampingan, keduanya
ternyata satu berkas yang di-*find-and-replace*:

| warm-narrative | draf pertama prada-melati |
|---|---|
| L0 `0.04` · L1 `0.12` · L2 `0.22` | angka `depth` identik |
| `SakuraCornerL` / `CornerR` | `PradaSuluranCornerL` / `CornerR` |
| `SakuraDrapeTop` | `PradaSuluranTop` |
| `SakuraSprigSmall` 700×700 | `MelatiSprig` 700×700 |
| `CoverArch` · `AkadArch` · `ResepsiArch` · `ClosingCanopy` | `CoverGunungan` · `AkadGapura` · `ResepsiGapura` · `ClosingKayon` |
| tabel section→aset | baris demi baris sama |
| strategi Hybrid anti-repetisi | sama, cuma flip dilarang |

Akarnya: **`warm-narrative` menyusun komposisi seperti taman.** Sesuatu tumbuh
dari sudut bawah, menjuntai dari tepi atas, kelopak berserak, ada kedalaman
atmosfer. Draf pertama meminjam tata bahasa taman itu lalu mengganti bunganya
dengan emas.

Tapi prada bukan taman. Prada adalah **kain**. Kain tidak punya sudut yang
ditumbuhi apa pun — kain punya pinggiran, tumpal, dan sumbu simetri. Bidangnya
rata, dan yang bergerak bukan jaraknya melainkan **cahayanya**.

Spec ini menulis ulang §3 sampai §6 dan §9 di atas premis itu. §7 (token warna)
dan §8 (tipografi) tidak berubah.

### 1.4 Pelajaran dari sacred-luxe

`sacred-luxe` juga gelap dan emas (obsidian `#0A0A08` + champagne gold), dan
dihapus karena jelek. Kegagalannya bukan pada gelapnya, melainkan pada
kekosongan motif: ornamennya `◆` dan corner SVG generik yang bisa dipakai brand
parfum mana pun.

Prada Melati berakar pada gunungan, parang rusak, kawung, tumpal, dan melati.
Kalau ia gagal, ia gagal karena alasan lain.

---

## 2. Keputusan Desain (terkunci)

| Aspek | Keputusan |
|---|---|
| **Kategori · tier** | `adat/kenangan/prada-melati` |
| **Palet** | Sogan pekat, prada emas, gading. Gelap — kebalikan nilai `warm-narrative` |
| **Medium** | Prada gold-leaf: siluet emas pipih bertekstur daun emas, tanpa perspektif |
| **Tata bahasa** | **Kelir + Kain.** Pinggiran & tumpal memeluk empat tepi; satu aktor per section di sumbu tengah |
| **Latar** | **Satu `KainBadan`** untuk sebelas section |
| **Gerak inti** | **Kilau** — sudut sapuan emas bergeser saat scroll. Bukan parallax |
| **Benang merah** | `RonceanMelati` — untaian melati gading menjuntai, bergoyang pelan |
| **Section** | Sebelas id, identik dengan `warm-narrative` |
| **Aksesibilitas** | `prefers-reduced-motion: reduce` → kilau membeku, tancap jadi fade, napas & goyang mati |

### 2.1 Kenapa medium prada, bukan ukiran atau batik penuh

**Ukiran jati tersinari lilin** ditolak: relief kayu yang di-generate cenderung
tampak seperti render 3D murahan, dan konsistensinya sulit dijaga lintas scene.

**Batik menutup seluruh bidang** ditolak sebagai *subjek*: pola berulang yang
memenuhi bidang melawan safe-zone teks di tengah. Ia tetap dipakai, tapi
diturunkan jadi tenunan samar pada `KainBadan` dan pinggiran di tepi.

**Cat air gouache di atas latar gelap** ditolak: medium yang sama dengan
`warm-narrative`. Mata mengenali sapuan kuas sebelum ia mengenali motif.

### 2.2 Risiko medium prada, dan penawarnya

Siluet emas pipih dapat terasa datar seperti stiker. Kedalamannya tidak boleh
datang dari bayangan — itu mengingkari mediumnya. Ia juga **tidak boleh datang
dari parallax**: emas pipih yang bergeser posisi terbaca sebagai stiker yang
digeser, bukan sebagai logam.

Ia datang dari **kilau**. Logam bereaksi terhadap sudut pandang: yang berubah
adalah materialnya, bukan tempatnya. Ditambah tekstur retak halus daun emas
(*crackle*) dan serat kain di bawahnya.

---

## 3. Style Bible

Dua bible, karena tema ini punya dua material. Simetri **tidak** masuk bible —
`PinggiranTile` justru harus miring dan berulang. Simetri disebut per-aset.

### 3.1 `SB_GOLD` — semua aset emas

> Javanese keraton wedding ornament in the manner of prada cloth and wayang
> beber. Flat gold-leaf silhouette: burnished gold #C9A227, fine crackle,
> visible fabric grain. Uniform line weight, hard-edged contours, no tapering
> strokes, no gradient shading. Interiors filled with dense isen-isen — cecek
> dots and sawut hatching. Ceremonial, hieratic, still. No perspective, no cast
> shadows, no depth, no volumetric light. No people, no text, no lettering, no
> numbers, no logos.

### 3.2 `SB_IVORY` — tiga aset melati

Melati adalah gading, bukan emas. `SB_GOLD` menyebut `burnished gold`, jadi ia
tidak boleh dipakai di sini. `No gold` wajib eksplisit.

> Javanese wedding jasmine ornament. Flat graphic silhouette in ivory white
> #F3E9D2, subtle fabric grain, uniform line weight, hard-edged contours, no
> gradient shading. No gold. Ceremonial, hieratic, still. No perspective, no
> cast shadows, no depth, no volumetric light. No people, no text, no lettering,
> no numbers, no logos.

### 3.3 Klausul latar — wajib, dan tidak boleh menyebut sogan

Draf pertama menulis `on deep sogan brown #2A1D12` lalu, dua kalimat kemudian,
`transparent background`. Generator tidak bisa menuruti keduanya; yang menang
biasanya yang disebut lebih dulu. Dua belas prompt mengidapnya.

Warna emas sudah dinyatakan pada materialnya. Hex sogan tidak punya urusan di
aset transparan. Setiap aset transparan ditutup **persis** salah satu dari ini:

```text
Gold leaf only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow.
```

```text
Ivory only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow.
```

Hanya `KainBadan` — satu-satunya aset opaque — yang boleh menyebut `#2A1D12`,
karena ia memang kainnya.

### 3.4 Kosakata: perajin, bukan pelukis

`warm-narrative` mendeskripsikan lukisan. Draf pertama meniru kerangka
kalimatnya dan menukar kata bendanya. Perajin tidak bicara arah cahaya; ia
bicara berat garis, kerapatan isen-isen, dan sumbu simetri.

| `warm-narrative` (pelukis) | `prada-melati` (perajin) |
|---|---|
| `loose expressive brushwork` | `uniform line weight, no tapering strokes` |
| `soft diffuse light from the upper-left` | dibuang → `no volumetric light` |
| `gentle atmospheric depth` | `no depth` |
| `visible hand-painted texture` | `fine crackle, visible fabric grain` |
| `warm desaturated serene expensive mood` | `ceremonial, hieratic, still` |
| `no rectangular frame` | **dibuang** — prada justru berbingkai |
| — | `dense isen-isen — cecek dots and sawut hatching` |
| — | `strict bilateral symmetry about the vertical axis` |
| — | `seamless on the top and bottom edges` |

`expensive mood` adalah kata yang paling menelanjangi: ia muncul di dua belas
prompt `warm-narrative` dan di style bible draf pertama. Kata itu tidak
mendeskripsikan apa pun; ia memohon. `hieratic` — kaku, resmi, tanpa ilusi
ruang — mendeskripsikan sesuatu, dan kebetulan persis benar untuk emas pipih.

Larangan `no rectangular frame` dibuang dengan sengaja. `warm-narrative`
memakainya di setiap prompt: tepinya compang-camping, berat komposisinya di
sudut. Prada Melati justru memeluk tepi. Itu saja sudah membuat keduanya tak
tertukar pada ukuran thumbnail.

---

## 4. Tata Bahasa Komposisi — Kelir

Tabel `depth` `0.04 / 0.12 / 0.22` dibuang seluruhnya. Kain tidak punya
kedalaman, jadi tidak ada angka kedalaman. Yang menggantikannya adalah peran.

```text
┌────────────────────┐
│▚│   ((  ◉  ))   │▞│  blencong bernapas
│▚│      ╱╲       │▞│  di balik kain
│▚│     ╱  ╲      │▞│
│▚│    │ ▓▓ │     │▞│  aktor: satu saja,
│▚│    │ ▓▓ │     │▞│  di sumbu tengah
│▚│               │▞│
│▚│ [ safe-zone ] │▞│
│▚│               │▞│
│◣◣◣◣◣◣◣◣◣◣◣◣◣◣◣◣◣◣│  tumpal (pucuk rebung)
└────────────────────┘
  ↑ pinggiran kiri/kanan, statis
```

| Lapis | Isi | Gerak | Format |
|---|---|---|---|
| **Kelir** | `KainBadan` — sehelai, sama untuk sebelas section | diam | webp opaque |
| **Blencong** | pendar hangat menembus tenunan | bernapas (idle) | CSS radial-gradient |
| **Aktor** | satu saja, di sumbu tengah | menancap saat masuk | webp transparan |
| **Pinggiran** | selvedge kiri & kanan, memeluk tepi | diam, kena kilau | webp transparan, `repeat-y` |
| **Tumpal** | pucuk rebung di hem bawah | diam, kena kilau | webp transparan |
| **Konten** | teks section, safe-zone tengah | fade | — |
| **Roncean** | melati gading menjuntai dari tepi atas | bergoyang | komponen |

Urutan itu juga urutan `z-index`.

Pinggiran dan tumpal **diam**. Ini penting: di `warm-narrative` justru elemen
tepi yang paling banyak bergerak — kolom masuk dari samping, sudut tumbuh naik.
Di sini tepi adalah bingkai kain. Ia tidak ke mana-mana. Yang hidup cuma cahaya
di atasnya.

### 4.1 Kenapa satu kain untuk sebelas section

Di `warm-narrative`, sebelas section punya sebelas L0 unik. Masuk akal: tiap
scene adalah *tempat* yang berbeda — subuh, lorong taman, senja di rimbun
sakura.

Kain tidak begitu. Sehelai jarik tetap sehelai jarik dari ujung ke ujung; yang
berganti adalah apa yang ditancapkan di depannya. Sebelas L0 unik mengingkari
premis materialnya sendiri.

Pembeda suasana diambil alih **blencong** — murni CSS radial-gradient, nol byte.
Posisi dan terangnya berubah per section: rendah dan redup di `greeting`, tinggi
dan berpendar di `cover`, terbit dari hem bawah di `closing`.

Risikonya monoton. Penawarnya blencong dan aktor, **bukan** menambah kain.

---

## 5. Gerak — empat slot, tak satu pun sejenis

| Slot | `warm-narrative` | `prada-melati` |
|---|---|---|
| Respons scroll | parallax translate | **kilau** — sudut sapuan emas bergeser; tak ada yang berpindah tempat |
| Masuk | tiap piece tumbuh dari tepinya | **menancap** — aktor turun ke sumbu, overshoot miring, lalu diam |
| Diam | ambient-wind (goyangan) | **bernapas** — blencong naik-turun pelan |
| Global | kelopak jatuh | **roncean** menjuntai, bergoyang |

> **Perluasan 2026-07-12:** tiga gerak ambient tambahan (debu emas naik, blencong
> flicker, kilau idle) didefinisikan di `2026-07-12-prada-melati-motion-design.md`.
> Semua tetap "cahaya, bukan lintasan" — tak ada parallax/kelopak jatuh.

### 5.1 Kilau

Tidak butuh aset tambahan. Aset prada yang transparan itu sendiri dipakai
sebagai `mask-image` di atas satu div gradien yang bergeser, dengan
`mix-blend-mode: overlay` — jadi cahaya hanya menyentuh piksel emasnya, sisanya
tetap tembus. Nol byte tambahan.

| Parameter | Nilai |
|---|---|
| Sumber | `scrollYProgress` section, `offset: ["start end", "end start"]` |
| Sapuan | offset gradien `-120%` → `220%` |
| Sudut | `105deg`, tetap |
| Blend | `overlay` |
| Elemen kena kilau | pinggiran, tumpal, aktor. **Tidak** `KainBadan` |

### 5.2 Menancap

Seperti dalang menancapkan wayang di debog.

| Parameter | Nilai |
|---|---|
| `y` | `-8%` → `0` |
| `rotate` | `3deg` → `0` (overshoot, redam) |
| Durasi | `520ms`, spring |
| Pemicu | section masuk viewport, replay tiap re-enter |

### 5.3 Bernapas

| Parameter | Nilai |
|---|---|
| `opacity` | `0.85` ↔ `1.0` |
| `scale` | `1.0` ↔ `1.04` |
| Periode | `6s`, `ease-in-out`, `infinite` |

### 5.4 Roncean bergoyang

| Parameter | Nilai |
|---|---|
| `rotate` | `±1.5deg` |
| `transform-origin` | `top center` |
| Periode | `7s`, untai kiri dan kanan beda fase |

### 5.5 Reduced motion

`prefers-reduced-motion: reduce`:

- **kilau** membeku di `45%` sapuan — emas tetap terlihat berkilat, tidak jadi rata;
- **menancap** jadi `opacity` fade `300ms`;
- **bernapas** mati, blencong diam di terang penuhnya;
- **roncean** diam.

---

## 6. Strategi Aset

Lima belas berkas. Draf pertama meminta dua puluh delapan.

### 6a. Kit

**Kain (3)**

| Berkas | Deskripsi | Dimensi (px) | Format |
|---|---|---|---|
| `KainBadan.webp` | Sehelai kain sogan, kawung samar. Satu-satunya latar | 1080×2340 | opaque |
| `PinggiranTile.webp` | Selvedge parang, *seamless vertikal*, di-`repeat-y` | 240×480 | transparan |
| `TumpalBand.webp` | Pucuk rebung di hem, *seamless horizontal* | 1800×360 | transparan |

Sisi kanan memakai `PinggiranTile` yang sama, **diputar 180°, bukan di-flip**.
Rotasi melestarikan arah lereng parang; flip membalikkannya.

**Aktor (7)**

| Berkas | Section | Dimensi (px) |
|---|---|---|
| `AktorGunungan.webp` | `cover` | 1200×1800 |
| `AktorCandiBentar.webp` | `akad` | 1200×1800 |
| `AktorPaduraksa.webp` | `resepsi` | 1200×1800 |
| `AktorKayon.webp` | `closing` | 1200×1800 |
| `CeplokKawung.webp` | `lovestory`, `dresscode` | 900×900 |
| `CeplokMelati.webp` | `couple`, `gift` | 900×900 |
| `CeplokSulur.webp` | `greeting`, `rsvp` | 900×900 |

**Melati (3)**

| Berkas | Deskripsi | Dimensi (px) |
|---|---|---|
| `RonceanMelatiL.webp` | Untaian menjuntai, sisi kiri | 600×1800 |
| `RonceanMelatiR.webp` | Sisi kanan, digenerate terpisah | 600×1800 |
| `MelatiSprig.webp` | Sprig kecil, sudut galeri | 700×700 |

**Bingkai foto (2)**

| Berkas | Untuk | Dimensi (px) |
|---|---|---|
| `BingkaiGebyok.webp` | `couple` | 900×1200 |
| `BingkaiTumpal.webp` | `lovestory`, `gallery` | 1200×900 |

`PradaFrameOval` draf pertama dibuang: oval berukir adalah konvensi potret
Barat, bahasa `warm-narrative`, bukan bahasa keraton. `PradaFrameCorner` juga —
bracket sudut adalah gagasan yang sama dengan `PhotoFrame` sakura suite.

`PradaParangBand` dibuang: tumpal sudah memegang hem, dan pemisah section kedua
cuma menambah berat tanpa menambah arti.

### 6b. Anti-repetisi

Seluruh §5f draf pertama hilang bersama sebelas L0. Tidak ada lagi sulur sudut
yang muncul sepuluh kali berturut-turut, jadi tidak ada yang perlu ditawar.

Tiga ceplok dipakai dua kali masing-masing, dibedakan lewat `scale`, posisi
vertikal, dan `opacity` (§6f). Pengulangan ceplok di atas kain **benar secara
material** — memang begitu kain bekerja. Ia tidak terbaca sebagai copy-paste.

`scaleX(-1)` tetap dilarang untuk semua aset emas: parang dan sulur punya arah
lengkung.

### 6c. Prompt — Kain

**`KainBadan.webp`** — 1080×2340, opaque. Satu-satunya prompt yang menyebut
sogan, karena ia satu-satunya yang memang kain.

```text
A single length of deep sogan brown #2A1D12 hand-dyed cloth, seen flat and straight on, filling the whole frame. Woven into it, a kawung batik lattice — rows of four overlapping ellipses — in gold #C9A227 at roughly six percent opacity, only just catching the light. Visible warp and weft, the soft irregularity of hand-dyeing, a few slubs in the thread. Flat, no perspective, no cast shadows, no depth, no volumetric light, no folds, no drape. The middle third must stay quiet and uncluttered — text will sit there. No people, no text, no lettering, no numbers, no logos. Vertical composition, 1080x2340, opaque, edge to edge.
```

**`PinggiranTile.webp`** — 240×480, transparan, seamless vertikal

```text
Javanese keraton wedding ornament in the manner of prada cloth and wayang beber. Flat gold-leaf silhouette: burnished gold #C9A227, fine crackle, visible fabric grain. Uniform line weight, hard-edged contours, no tapering strokes, no gradient shading. Interiors filled with dense isen-isen — cecek dots and sawut hatching. Ceremonial, hieratic, still. No perspective, no cast shadows, no depth, no volumetric light. No people, no text, no lettering, no numbers, no logos. Subject: a narrow vertical selvedge band of parang rusak — repeating diagonal S-curved blades marching from lower-left to upper-right, every blade the same size, the slope constant. The band fills the full width of the canvas. Gold leaf only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow. Tall narrow composition, 240x480, seamless on the top and bottom edges: the blade leaving the top must meet the blade entering the bottom without a visible seam.
```

**`TumpalBand.webp`** — 1800×360, transparan, seamless horizontal

```text
Javanese keraton wedding ornament in the manner of prada cloth and wayang beber. Flat gold-leaf silhouette: burnished gold #C9A227, fine crackle, visible fabric grain. Uniform line weight, hard-edged contours, no tapering strokes, no gradient shading. Interiors filled with dense isen-isen — cecek dots and sawut hatching. Ceremonial, hieratic, still. No perspective, no cast shadows, no depth, no volumetric light. No people, no text, no lettering, no numbers, no logos. Subject: a row of tumpal — isosceles triangles standing on the bottom edge, tips pointing up, each filled with a pucuk rebung (bamboo shoot) motif and cecek dots. The triangles are identical, evenly spaced, their bases touching. Above their tips the canvas is empty. Gold leaf only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow. Wide composition, 1800x360, seamless on the left and right edges.
```

> **Perluasan 2026-07-12:** hem tak lagi selalu `TumpalBand`. Tiga hem alternatif
> (`HemSulur`, `HemMelati`, `HemKawung`) berima dengan motif aktor per section —
> lihat `2026-07-12-prada-melati-hem-variasi-design.md`.

### 6d. Prompt — Aktor

**`AktorGunungan.webp`** — 1200×1800, transparan

```text
Javanese keraton wedding ornament in the manner of prada cloth and wayang beber. Flat gold-leaf silhouette: burnished gold #C9A227, fine crackle, visible fabric grain. Uniform line weight, hard-edged contours, no tapering strokes, no gradient shading. Interiors filled with dense isen-isen — cecek dots and sawut hatching. Ceremonial, hieratic, still. No perspective, no cast shadows, no depth, no volumetric light. No people, no text, no lettering, no numbers, no logos. Subject: a single gunungan (kayon) — the mountain-shaped shadow-puppet motif — standing upright, its base on the bottom edge, its tip reaching the upper third. Strict bilateral symmetry about the vertical axis. Its interior is filled with sulur scrolling foliage and small kawung circles, densest at the tip and opening out toward the base, so the lower half reads as an empty chamber. Gold leaf only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow. Vertical composition, 1200x1800.
```

**`AktorCandiBentar.webp`** — 1200×1800, transparan

```text
Javanese keraton wedding ornament in the manner of prada cloth and wayang beber. Flat gold-leaf silhouette: burnished gold #C9A227, fine crackle, visible fabric grain. Uniform line weight, hard-edged contours, no tapering strokes, no gradient shading. Interiors filled with dense isen-isen — cecek dots and sawut hatching. Ceremonial, hieratic, still. No perspective, no cast shadows, no depth, no volumetric light. No people, no text, no lettering, no numbers, no logos. Subject: a candi bentar — a split gateway of two mirrored stepped pylons standing on the bottom edge, the passage between them empty from top to bottom. Strict bilateral symmetry about the vertical axis. Each pylon is stepped in receding tiers, its face filled with kawung circles and cecek dots. Gold leaf only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow. Vertical composition, 1200x1800.
```

**`AktorPaduraksa.webp`** — 1200×1800, transparan

```text
Javanese keraton wedding ornament in the manner of prada cloth and wayang beber. Flat gold-leaf silhouette: burnished gold #C9A227, fine crackle, visible fabric grain. Uniform line weight, hard-edged contours, no tapering strokes, no gradient shading. Interiors filled with dense isen-isen — cecek dots and sawut hatching. Ceremonial, hieratic, still. No perspective, no cast shadows, no depth, no volumetric light. No people, no text, no lettering, no numbers, no logos. Subject: a paduraksa — a roofed ceremonial gateway, one joined mass rather than a split pair, its lintel crowned with a kala head, its tiered roof rising to a point, framing an empty doorway in the middle. Strict bilateral symmetry about the vertical axis. Clearly distinct from a split candi bentar: the two halves meet at the top. Gold leaf only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow. Vertical composition, 1200x1800.
```

**`AktorKayon.webp`** — 1200×1800, transparan

```text
Javanese keraton wedding ornament in the manner of prada cloth and wayang beber. Flat gold-leaf silhouette: burnished gold #C9A227, fine crackle, visible fabric grain. Uniform line weight, hard-edged contours, no tapering strokes, no gradient shading. Interiors filled with dense isen-isen — cecek dots and sawut hatching. Ceremonial, hieratic, still. No perspective, no cast shadows, no depth, no volumetric light. No people, no text, no lettering, no numbers, no logos. Subject: an inverted kayon — the mountain-shaped motif turned upside down, hanging from the top edge, its tip pointing down toward the center, its foliage spreading wide across the upper half like a tree seen from beneath. Strict bilateral symmetry about the vertical axis. The lower half of the canvas is empty. Gold leaf only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow. Vertical composition, 1200x1800.
```

**`CeplokKawung.webp`** — 900×900, transparan

```text
Javanese keraton wedding ornament in the manner of prada cloth and wayang beber. Flat gold-leaf silhouette: burnished gold #C9A227, fine crackle, visible fabric grain. Uniform line weight, hard-edged contours, no tapering strokes, no gradient shading. Interiors filled with dense isen-isen — cecek dots and sawut hatching. Ceremonial, hieratic, still. No perspective, no cast shadows, no depth, no volumetric light. No people, no text, no lettering, no numbers, no logos. Subject: a single ceplok medallion built from kawung — four overlapping ellipses radiating from a center point, ringed by a thin circular border of cecek dots. Fourfold rotational symmetry. Compact and centered, occupying the middle sixty percent of the canvas. Gold leaf only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow. Square composition, 900x900.
```

**`CeplokMelati.webp`** — 900×900, transparan. Emas, bukan gading: ini ceplok,
bukan roncean.

```text
Javanese keraton wedding ornament in the manner of prada cloth and wayang beber. Flat gold-leaf silhouette: burnished gold #C9A227, fine crackle, visible fabric grain. Uniform line weight, hard-edged contours, no tapering strokes, no gradient shading. Interiors filled with dense isen-isen — cecek dots and sawut hatching. Ceremonial, hieratic, still. No perspective, no cast shadows, no depth, no volumetric light. No people, no text, no lettering, no numbers, no logos. Subject: a single ceplok medallion built from jasmine — eight melati blossoms arranged in a ring around a small central rosette, their stems meeting at the center, ringed by a thin circular border of cecek dots. Eightfold rotational symmetry. Compact and centered, occupying the middle sixty percent of the canvas. Gold leaf only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow. Square composition, 900x900.
```

**`CeplokSulur.webp`** — 900×900, transparan

```text
Javanese keraton wedding ornament in the manner of prada cloth and wayang beber. Flat gold-leaf silhouette: burnished gold #C9A227, fine crackle, visible fabric grain. Uniform line weight, hard-edged contours, no tapering strokes, no gradient shading. Interiors filled with dense isen-isen — cecek dots and sawut hatching. Ceremonial, hieratic, still. No perspective, no cast shadows, no depth, no volumetric light. No people, no text, no lettering, no numbers, no logos. Subject: a single ceplok medallion built from sulur — scrolling foliage curling outward from a center point in four spiral arms, ringed by a thin circular border of cecek dots. Fourfold rotational symmetry. Compact and centered, occupying the middle sixty percent of the canvas. Gold leaf only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow. Square composition, 900x900.
```

### 6e. Prompt — Melati dan bingkai

**`RonceanMelatiL.webp`** — 600×1800, transparan

```text
Javanese wedding jasmine ornament. Flat graphic silhouette in ivory white #F3E9D2, subtle fabric grain, uniform line weight, hard-edged contours, no gradient shading. No gold. Ceremonial, hieratic, still. No perspective, no cast shadows, no depth, no volumetric light. No people, no text, no lettering, no numbers, no logos. Subject: strands of jasmine garland (roncean melati) hanging straight down from the top edge, blossoms strung on a fine thread. The strands run along the left side only, at four different lengths; the right two-thirds of the canvas is empty. Ivory only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow. Tall composition, 600x1800.
```

**`RonceanMelatiR.webp`** — 600×1800, transparan. Digenerate terpisah, bukan
hasil flip.

```text
Javanese wedding jasmine ornament. Flat graphic silhouette in ivory white #F3E9D2, subtle fabric grain, uniform line weight, hard-edged contours, no gradient shading. No gold. Ceremonial, hieratic, still. No perspective, no cast shadows, no depth, no volumetric light. No people, no text, no lettering, no numbers, no logos. Subject: strands of jasmine garland (roncean melati) hanging straight down from the top edge, blossoms strung on a fine thread. The strands run along the right side only, at four lengths different from their left-hand counterpart; the left two-thirds of the canvas is empty. Ivory only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow. Tall composition, 600x1800.
```

**`MelatiSprig.webp`** — 700×700, transparan

```text
Javanese wedding jasmine ornament. Flat graphic silhouette in ivory white #F3E9D2, subtle fabric grain, uniform line weight, hard-edged contours, no gradient shading. No gold. Ceremonial, hieratic, still. No perspective, no cast shadows, no depth, no volumetric light. No people, no text, no lettering, no numbers, no logos. Subject: a small sprig of jasmine (melati), two blossoms and two leaves on a short stem, tucked into one corner. Most of the canvas is empty. Ivory only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow. Square composition, 700x700.
```

**`BingkaiGebyok.webp`** — 900×1200, transparan. Untuk `couple`.

```text
Javanese keraton wedding ornament in the manner of prada cloth and wayang beber. Flat gold-leaf silhouette: burnished gold #C9A227, fine crackle, visible fabric grain. Uniform line weight, hard-edged contours, no tapering strokes, no gradient shading. Interiors filled with dense isen-isen — cecek dots and sawut hatching. Ceremonial, hieratic, still. No perspective, no cast shadows, no depth, no volumetric light. No people, no text, no lettering, no numbers, no logos. Subject: a gebyok doorway frame — a Javanese carved-door opening, its head a shouldered arch with jointed corner brackets, its jambs narrow and straight, the opening itself completely empty. Strict bilateral symmetry about the vertical axis. Only the frame is drawn; the opening and everything outside the frame are fully transparent. Gold leaf only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow, no door, no photograph. Vertical composition, 900x1200, the opening fully transparent.
```

**`BingkaiTumpal.webp`** — 1200×900, transparan. Untuk `lovestory` dan
`gallery`.

```text
Javanese keraton wedding ornament in the manner of prada cloth and wayang beber. Flat gold-leaf silhouette: burnished gold #C9A227, fine crackle, visible fabric grain. Uniform line weight, hard-edged contours, no tapering strokes, no gradient shading. Interiors filled with dense isen-isen — cecek dots and sawut hatching. Ceremonial, hieratic, still. No perspective, no cast shadows, no depth, no volumetric light. No people, no text, no lettering, no numbers, no logos. Subject: a rectangular border whose four edges are lined with small tumpal triangles pointing inward toward the center, tips sharp, bases touching along the rim. The rectangle it encloses is completely empty. Only the border is drawn; the center and everything outside the border are fully transparent. Gold leaf only, on a fully transparent background (PNG with alpha) — no cloth, no backdrop, no ground, no cast shadow, no photograph. Horizontal composition, 1200x900, the center fully transparent.
```

### 6f. Pemetaan section

`y` blencong diukur dari tepi atas viewport. `y` aktor adalah posisi puncaknya.

| Section | Aktor | `scale` | `y` aktor | Blencong `y` · terang | Bingkai |
|---|---|---|---|---|---|
| `cover` | `AktorGunungan` | 1.00 | — | 38% · 0.90 | — |
| `greeting` | `CeplokSulur` | 0.55 | 26% | 30% · 0.35 | — |
| `couple` | `CeplokMelati` | 0.70 | 22% | 28% · 0.50 | `BingkaiGebyok` |
| `lovestory` | `CeplokKawung` | 0.50 | 18% | 24% · 0.40 | `BingkaiTumpal` |
| `akad` | `AktorCandiBentar` | 1.00 | — | 44% · 0.75 | — |
| `resepsi` | `AktorPaduraksa` | 1.00 | — | 42% · 0.75 | — |
| `dresscode` | `CeplokKawung` | 0.62 | 30% | 32% · 0.40 | — |
| `gallery` | `MelatiSprig` ×4 sudut | 0.40 | — | 30% · 0.35 | `BingkaiTumpal` |
| `rsvp` | `CeplokSulur` | 0.66 | 24% | 28% · 0.40 | — |
| `gift` | `CeplokMelati` | 0.58 | 28% | 30% · 0.40 | — |
| `closing` | `AktorKayon` | 1.00 | — | 88% · 1.00 | — |

`closing` menaruh blencong di `88%` — cahaya terbit dari hem bawah, kebalikan
`cover`. Dua hero itu menjadi kurung buka dan kurung tutup.

### 6g. Dimensi & budget

- `KainBadan`: 1080×2340, webp quality ~82, target **< 180KB**. Diunduh sekali,
  dipakai sebelas kali — layak diberi kualitas lebih.
- Aktor: webp alpha, **< 120KB**
- Ceplok: webp alpha, **< 70KB**
- `PinggiranTile`: webp alpha, **< 20KB**
- `TumpalBand`: webp alpha, **< 60KB**
- Roncean: webp alpha, **< 90KB**
- `MelatiSprig`: webp alpha, **< 40KB**
- Bingkai: webp alpha, **< 80KB**

R2 bucket `rimba-themes`, path `adat/kenangan/prada-melati/...`, disajikan lewat
`https://assets-themes.rimba.io`.

---

## 7. Token Warna

Mengikuti kontrak dua lapis pada `warm-narrative/DESIGN_SPEC.md`: sembilan token
di bawah ini ditimpa runtime oleh `buildCssVars` dari `theme.colors` pada
`invitation.config.json`. Deklarasi `:root` di `globals.css` hanya fallback.

| Token | Nilai | Nama |
|---|---|---|
| `--bg` | `#2A1D12` | Sogan Pekat |
| `--surface` | `#3A2A1B` | Kayu Jati |
| `--surface-2` | `#4A3524` | Sogan Terang |
| `--gold` | `#C9A227` | Prada |
| `--gold-light` | `#E3C766` | Prada Kilau |
| `--gold-dim` | `#A68430` | Prada Tua |
| `--text` | `#F3E9D2` | Gading |
| `--text-muted` | `#C9BCA1` | Gading Redup |
| `--text-dim` | `#B3AA9D` | Debu |

`--border` menyusul sebagai token statik, tidak ditimpa runtime.

**Kontras terverifikasi** terhadap `DESIGN_SYSTEM.md` §9, dan dijaga oleh
`scripts/__tests__/contrast-contract.test.mjs`. Dua nilai yang diusulkan mula-mula
gagal dan sudah dikoreksi:

| Token | Usul awal | Terburuk | Nilai terpakai | Terburuk |
|---|---|---|---|---|
| `--text-dim` | `#8C8070` | 2.98:1 ❌ | `#B3AA9D` | 5.01:1 ✅ |
| `--gold-dim` | `#8A6E28` | 2.38:1 ❌ | `#A68430` | 3.27:1 ✅ |

Ambang: token teks 4.5:1, `--gold-dim` 3:1 karena ia dekoratif. "Terburuk"
diukur di atas `--surface-2`, permukaan paling terang.

`--gold-light` `#E3C766` adalah puncak sapuan kilau (§5.1).

---

## 8. Tipografi

Playfair Display dihindari karena itu suara `warm-narrative`. Cormorant Garamond
dihindari karena itu suara `sacred-luxe`.

| Element | Font | Alasan |
|---|---|---|
| Display | Marcellus | Kontras rendah, berkarakter pahatan — cocok untuk emas terukir |
| Body | Lora | Serif hangat, terbaca panjang, jelas bukan Source Serif |
| Label | Inter | Fungsional, sudah dipakai lintas tema |

`--font-display` dan `--font-body` ditimpa runtime dari `theme.typography`.

---

## 9. Komponen

`ParallaxScene` dan `sceneFrame` tidak ikut. Keduanya milik `warm-narrative`,
dan `scripts/sync-shared.ts` hanya menyinkronkan `config-types`, `css-vars`,
`MusicPlayer`, `GuestName`, dan `InfiniteMenu` — jadi tidak ada yang perlu
diakali.

| Berkas | Tugas |
|---|---|
| `shared/KelirScene.tsx` | merakit kelir: `KainBadan` → blencong → aktor → pinggiran ×2 → tumpal → `children` |
| `shared/GiltSweep.tsx` | membungkus satu `<img>` emas; menempel div gradien ber-`maskImage: url(src)` + `mixBlendMode: overlay`, digeser `scrollYProgress` |
| `shared/RonceanMelati.tsx` | dua untai gading, goyang lambat, `pointer-events: none` |
| `shared/sceneKelir.ts` | tabel preset per section (§6f) |
| `shared/scroll-context.ts` | ref kontainer scroll — `GiltSweep` perlu tahu progres scroll |
| `shared/SnapContainer.tsx` | memegang `scrollRef`, menyebarkannya lewat `ScrollContext` |

### 9.1 `RonceanMelati` bukan `FallingFlowers` beraset baru

| | `FallingFlowers` (warm-narrative) | `RonceanMelati` (prada-melati) |
|---|---|---|
| Objek | kelopak sakura | untaian melati |
| Gerak | jatuh, lintasan acak | menjuntai dari tepi atas, bergoyang |
| Amplitudo | — | `±1.5deg`, periode `7s` |
| Warna | blush/peach | gading `#F3E9D2` |
| Jumlah instance | banyak, di-spawn | tepat dua, statis |

Sakura **jatuh**; melati **menjuntai**.

### 9.2 Performa

- `KelirScene` me-*mount* `<img>` aktor lewat `IntersectionObserver`
  (`rootMargin: 200px 0px`); `KainBadan`, pinggiran, dan tumpal dimuat sekali di
  root karena dipakai semua section.
- Aset `cover` di-*preload* (`fetchPriority="high"`).
- `loading="lazy"` + `decoding="async"` untuk aktor non-`cover`.
- `mask-image` + `mix-blend-mode` berat di GPU. Kilau **hanya** dipasang pada
  pinggiran, tumpal, dan aktor — tidak pada `KainBadan`, dan tidak pada roncean.

---

## 10. Section

Sebelas id, identik dengan `RenderSection.tsx` milik `warm-narrative`:

`cover` · `greeting` · `couple` · `lovestory` · `akad` · `resepsi` ·
`dresscode` · `gallery` · `rsvp` · `gift` · `closing`

Delapan di antaranya adalah entitlement Kenangan. `lovestory` dan `gallery`
milik Kisah, `dresscode` milik Warisan; ketiganya dimatikan lewat
`sections.enabled` saat undangan dijual sebagai Kenangan. Wedding Wish tidak
punya id sendiri — ia field "Ucapan (opsional)" di dalam `RSVPSection.tsx`.

**Pembaruan 2026-07-14:** ditambah dua id lintas-tier — `rundown` dan `turut`
(Turut Mengundang) — sehingga `RenderSection.tsx` kini mengenali tiga belas id.
Keduanya milik entitlement Warisan, dimatikan `sections.enabled` bila dijual
sebagai Kenangan. Detail skema & preset: `2026-07-14-prada-melati-rundown-turut-design.md`.

Lihat `2026-07-10-adat-kenangan-tier-spec-design.md` §2.1.

---

## 11. Pendaftaran Tema

Tema baru harus didaftarkan di lima tempat. Daftar ini diturunkan dari
pembersihan `sacred-luxe`, yang meninggalkan tujuh referensi menggantung.

| Tempat | Isi |
|---|---|
| `scripts/sync-shared.ts` | entri pada `THEMES` (`hasSrc: true`, `hasInfiniteMenu: false`) |
| `router/src/index.ts` | `Env`, `themeFor()`, `RESERVED_SUBDOMAINS` |
| `router/wrangler.jsonc` | service binding `THEME_PRADA_MELATI` → `rimba-prada-melati` |
| `digital/backend/internal/handlers/invitation.go` | `reservedSlugs` |
| `digital/frontend/components/invitation/TemplateSelector.tsx` | entri `templates` |

Subdomain demo: `prada-melati.rimba.io`.

---

## 12. Bukan Cakupan

- implementasi komponen dan pengkabelan section ke scene — lihat plan Fase 1 dan 2;
- generate aset dan unggah ke R2;
- pendaftaran tema di lima tempat (§11);
- tier Kisah dan Warisan untuk tema ini.

---

## 13. Yang Masih Terbuka

- **Kilau belum diukur di perangkat kelas bawah.** `mask-image` +
  `mix-blend-mode: overlay` pada empat elemen sekaligus per section bisa
  menjatuhkan frame rate di Android murah. Penawarnya berurutan: turunkan kilau
  ke pinggiran dan tumpal saja; kalau masih berat, ganti `overlay` dengan
  `screen` beropasitas rendah; baru terakhir matikan kilau di bawah lebar
  tertentu. **Jangan** mengembalikan parallax sebagai gantinya.
- **Tekstur retak daun emas belum teruji.** Kalau hasil generate tampak seperti
  stiker datar, penawarnya adalah menaikkan kontras kilau atau menambah serat
  kain pada `KainBadan` — bukan menambahkan bayangan.
- **Seamless tile belum diverifikasi.** `PinggiranTile` (vertikal) dan
  `TumpalBand` (horizontal) harus dicek jahitannya sebelum diunggah; generator
  sering mengabaikan instruksi seamless.
- **Satu kain berisiko monoton.** Kalau sebelas section terasa seragam setelah
  dirakit, penawarnya menaikkan rentang `y` dan terang blencong (§6f) — bukan
  menambah aset kain kedua.
- **Marcellus belum diuji pada nama panjang.** Font pahatan berkontras rendah
  bisa terasa berat pada hero dua baris.
- **Restrukturisasi folder `2026-07-09` §4** akan mengeluarkan `kenangan/` dari
  path tema ini.
