# Prada Melati — Perbaikan Tata Letak (Wrapper-First)

> Tanggal: 2026-07-20 · Branch kerja: `feat/prada-melati-impl`
> Fokus: memperbaiki **peletakan, penyusunan, dan ukuran** konten section —
> bukan aset, bukan motion. Perubahan dipusatkan di tiga wrapper bersama
> (`SceneContent`, `KelirScene`, komponen header baru) supaya **satu perbaikan
> menyembuhkan seluruh sebelas section sekaligus.**

## 0. Kenapa dokumen ini ada

Section prada-melati benar secara struktur tapi **komposisinya lemah**, dan
lemahnya seragam karena semua section menyerahkan tata letak ke dua wrapper:
`KelirScene` (frame ornamen) + `SceneContent` (kolom teks). Saudara referensinya
— `warm-narrative` dan `soft-bloom` — **meng-compose tiap elemen dengan tangan**:
ukuran ter-`clamp()`, plate/halo lokal per teks, hierarki header seragam. prada
tidak.

Empat cacat konkret yang jadi sasaran dokumen ini:

1. **Padding `SceneContent` kelewat besar.** `SceneContent.tsx:40` memakai
   `padding: clamp(84px,15svh,150px) clamp(46px,13vw,82px) clamp(96px,16svh,148px)`.
   Sisi 46–82px per sisi menyisakan pita teks efektif ~230–270px di kolom
   360–420px. warm-narrative cukup `px-8` (32px) di `max-w-[400px]`
   (`warm-narrative/CoupleSection.tsx:88`). prada ±2× lebih sesak.

2. **Aktor ornamen menabrak zona teks.** `KelirScene.tsx:99-101` menaruh aktor
   absolut `top:5svh, height:56svh` (menempati ~61% atas layar), sementara
   `SceneContent.tsx:35` men-`justifyContent: center`. Komentar
   `KelirScene.tsx:188-189` sendiri menuntut konten "di zona bawah
   (marginTop:auto)", tapi kode tak pernah menegakkannya. Akibatnya di **setiap**
   section non-cover (couple, akad, resepsi, rsvp, dst.) teks di-center vertikal
   → **numpuk dengan aktor emas.** Hanya cover (`align="bottom"`) yang benar.

3. **Legibility pakai gumpalan gelap, bukan plate lokal.** `SceneContent.tsx:43-52`
   menghampar satu scrim radial `rgba(20,12,6,0.82)` menutupi seluruh blok konten
   → **blob coklat kotor di tengah scene emas.** Bandingkan halo/plate lokal
   warm-narrative (`warm-narrative/CoupleSection.tsx:11-12`) yang tak mengotori
   latar.

4. **Tak ada hierarki header bersama.** Cover pakai `<h1>` polos
   (`CoverSection.tsx:32`), Couple pakai `GiltTitle`+kicker mungil
   (`CoupleSection.tsx:55-58`), Event pakai `<p>` telanjang
   (`EventSection.tsx:43`). Tiap section beda treatment → terasa acak. Ditambah
   lompatan skala kasar di Event: judul `clamp(26–40px)` langsung ke numeral
   tanggal `clamp(54–84px)` tanpa ritme antara (`EventSection.tsx:43-53`).

Aturan estetika **tidak berubah**: palet, aset, dan kosakata Kelir tetap. Yang
berubah hanya **geometri kolom konten** dan **konsistensi header**.

---

## 1. `SceneContent` — zona aman & padding waras

Berkas: `src/components/shared/SceneContent.tsx`.

### 1.1 Padding samping diciutkan
Ganti padding menjadi:

```
padding: var(--kelir-safe-top, clamp(20px, 5svh, 40px))
         clamp(26px, 7vw, 44px)
         clamp(72px, 12svh, 120px);
```

- **Samping** turun dari 46–82px → **26–44px**. Lebar teks efektif kini diatur
  oleh `maxWidth` (naikkan default 340 → **360**, dan panggil 380 di section
  padat), bukan oleh padding yang menggerus dari dua sisi.
- **Bawah** turun sedikit (72–120px) — cukup untuk membebaskan hem `TumpalBand`
  (`KelirScene.tsx:180-186`, tinggi band ± satu pita), tak lebih.
- **Atas** kini dibaca dari CSS var `--kelir-safe-top` (lihat §2) supaya konten
  otomatis turun di bawah aktor. Fallback kecil untuk section tanpa aktor.

### 1.2 Zona konten: `center` diartikan ulang
`justifyContent` tetap boleh `center` **tetapi center itu terjadi di dalam
sisa ruang setelah zona-aman-atas** — karena `--kelir-safe-top` sudah mendorong
kotak konten turun. Tambah nilai `align` ketiga:

| `align` | perilaku | pemakai |
|---|---|---|
| `"bottom"` | `justify-content: flex-end` (sudah ada) | cover, greeting |
| `"center"` | center di sisa ruang bawah zona aman | couple, akad, resepsi, closing |
| `"lower"` (baru) | `justify-content: flex-end` + padding bawah lebih tebal | gift, dresscode |

### 1.3 Scrim gumpalan dihapus
Hapus blok scrim radial `SceneContent.tsx:43-52`. Prop `scrim` **default
`false`.** Legibility dipindah ke plate lokal per grup teks (§4). Section yang
benar-benar butuh backdrop menyeluruh (mis. rsvp di atas aktor terang) boleh
`scrim` `true`, tapi dengan gradient jauh lebih lembut:
`rgba(20,12,6,0.5)` di pusat, larut penuh di 70%.

---

## 2. `KelirScene` — zona aman aktor lewat CSS var

Berkas: `src/components/shared/KelirScene.tsx`.

Masalah tabrakan (cacat #2) diselesaikan dengan **mendeklarasikan tinggi zona
aktor** dan meneruskannya ke kolom konten sebagai `--kelir-safe-top`, sehingga
konten selalu mulai di bawah aktor tanpa section perlu tahu geometrinya.

### 2.1 Preset membawa tinggi zona
Tambah field ke `KelirPreset` (`src/components/shared/sceneKelir.ts`):

```ts
/** Tinggi zona aman atas (svh) yang harus dilewati konten agar tak menimpa
 *  aktor. Hero besar → ~62. Ceplok kecil di actorY → actorY + tinggi ceplok.
 *  Section tanpa aktor → 0 (fallback padding kecil SceneContent yang berlaku). */
safeTopSvh?: number;
```

Nilai anjuran per bentuk aktor:
- **hero** (`actorScale >= 1`, `KelirScene.tsx:37`): `safeTopSvh: 62`
  (aktor `top:5svh + height:56svh` ≈ 61 → bulatkan 62).
- **ceplok** (`actorScale < 1` di `actorY`): `safeTopSvh` ≈ nilai `actorY` dalam
  svh + `actorScale*40`. Praktis 30–44.
- **corners / tanpa aktor**: `safeTopSvh: 0`.

### 2.2 Var ditempel di wrapper konten
Di wrapper konten `KelirScene.tsx:190-199`, set style:

```ts
style={{
  position: "relative", zIndex: 10, display: "flex",
  flexDirection: "column", width: "100%", flex: "1 0 auto",
  ["--kelir-safe-top" as string]: preset.safeTopSvh
    ? `${preset.safeTopSvh}svh`
    : "clamp(20px, 5svh, 40px)",
}}
```

`SceneContent` (§1.1) membaca var ini sebagai `padding-top`. Hasilnya: konten
couple/akad/resepsi turun ke separuh bawah, **lepas dari aktor** — tanpa
menyentuh satu pun file section.

---

## 3. `SectionHeader` — komponen baru, header seragam

Berkas baru: `src/components/shared/SectionHeader.tsx`.

Menggantikan tiga treatment judul ad-hoc (Cover `<h1>`, Couple `GiltTitle`+kicker,
Event `<p>`) dengan satu hierarki: **eyebrow → judul display → (divider) →
intro.** Ia **membungkus** `GiltTitle` & `GiltDivider` yang sudah ada, bukan
menggantinya.

### 3.1 Signature

```ts
export default function SectionHeader({
  eyebrow,              // kicker kecil di atas, uppercase
  title,               // judul display utama
  intro,               // kalimat pengantar italic (opsional)
  divider = "lung",    // varian GiltDivider; false → tanpa pembatas
  flanked = true,      // bungkus judul dgn sepasang sulur LungTitel (GiltTitle)
  titleGradient = false, // judul pakai .text-gold-gradient
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  divider?: "lung" | "truntum" | "modang" | false;
  flanked?: boolean;
  titleGradient?: boolean;
  align?: "center" | "left" | "right";
}): JSX.Element
```

### 3.2 Ukuran & ritme (final, bukan saran)

| Elemen | font | size | warna | jarak |
|---|---|---|---|---|
| eyebrow | `font-label` | `clamp(9.5px, 2.6vw, 11px)`, `letter-spacing:0.28em`, uppercase | `var(--gold-dim)` | — |
| judul | `font-display` | `clamp(26px, 7.5vw, 38px)`, `line-height:1.12` | `var(--text)` / gradient | `margin-top: 8px` |
| divider | GiltDivider | width 90–110 | — | `margin: 14px 0` |
| intro | `font-body` italic | `clamp(12px, 3.2vw, 14px)`, `line-height:1.7` | `var(--text-muted)` | `max-width:300px`, center, `margin-top: 10px` |

- Bila `flanked`, judul dibungkus `GiltTitle` (`GiltTitle.tsx`) — sulur pengapit
  ikut kilau scene. Bila tidak, judul polos.
- Eyebrow **selalu satu baris**; judul boleh dua baris.
- **Batas skala:** judul header dijaga ≤ 38px supaya numeral khusus (mis. tanggal
  Event) tetap boleh jadi elemen terbesar tanpa berkelahi dengan judul.

### 3.3 Dampak pemakaian
- **CoverSection** (`CoverSection.tsx:29-38`): ganti label+h1+divider manual →
  `<SectionHeader eyebrow="Undangan Pernikahan" title="{groom} & {bride}"
  titleGradient divider="lung" flanked={false} />` (nama mempelai butuh ukuran
  hero sendiri — lihat catatan §5, Cover tetap boleh override size judul).
- **CoupleSection** (`CoupleSection.tsx:55-58`): ganti `GiltTitle`+kicker →
  `<SectionHeader eyebrow="Kedua Mempelai" title="Mempelai"
  intro="Dua insan, satu kisah baru." divider="truntum" />`.
- **EventSection** (`EventSection.tsx:43-46`): ganti `<p>`+divider →
  `<SectionHeader eyebrow="{day}" title="{Akad Nikah|Resepsi}" divider="modang" />`;
  numeral tanggal jadi blok terpisah di bawahnya (§5).

---

## 4. Legibility — plate lokal, bukan blob

Ganti scrim menyeluruh (dihapus di §1.3) dengan dua utilitas lokal di
`globals.css`. Karena tema gelap (teks terang di atas emas ramai), yang dipakai
adalah **plate gelap ketat** + **halo bayangan**.

### 4.1 `.kelir-plate` — backdrop grup teks
```css
.kelir-plate {
  background: radial-gradient(closest-side,
    rgba(20,12,6,0.72) 0%, rgba(20,12,6,0.42) 68%, transparent 100%);
  border-radius: 16px;
  padding: 10px 14px;
}
```
Dibungkuskan ke grup teks yang duduk di atas aktor/kain ramai (blok nama
Person, kartu venue Event, quote). **Ketat ke konten**, tak menutup seluruh
kolom.

### 4.2 `.text-halo` — untuk teks lepasan
```css
.text-halo { text-shadow: 0 1px 6px rgba(20,12,6,0.7), 0 0 3px rgba(20,12,6,0.6); }
```
Analog `HALO` warm-narrative (`warm-narrative/CoupleSection.tsx:11`) tapi arah
gelap. Dipasang di eyebrow/judul/intro `SectionHeader` dan label kecil yang tak
perlu plate penuh.

---

## 5. Migrasi per-section (checklist)

Semua di `src/components/sections/`. Tak ada section yang perlu ubah struktur —
hanya ganti header ke `SectionHeader`, bungkus grup teks dgn `.kelir-plate`, dan
pastikan preset punya `safeTopSvh` benar.

| Section | Aksi |
|---|---|
| `CoverSection` | header via SectionHeader (nama = override hero size); countdown di bawah; `align="bottom"` tetap |
| `GreetingSection` | SectionHeader + nama tamu di plate; `align="bottom"` |
| `CoupleSection` | SectionHeader; tiap `Person` dibungkus `.kelir-plate`; naikkan foto `42%`→`46%` (`CoupleSection.tsx:28`); label `fontSize:9`→`clamp(9.5px,2.5vw,11px)` |
| `EventSection` | SectionHeader (day=eyebrow); **numeral tanggal jadi blok**: `dNum` besar di tengah, `dMonth·dYear` di bawah, kartu venue+map dibungkus `.kelir-plate` |
| `RSVPSection` | SectionHeader; `scroll`+`maxWidth:380`; boleh `scrim` lembut |
| `GiftSection` | SectionHeader; `align="lower"` |
| `ClosingSection` | SectionHeader; hashtag di `.text-halo` |
| `LoveStory/Gallery/DressCode` | SectionHeader; ikut pola yang sama |

Verifikasi tiap preset di `sceneKelir.ts` mendapat `safeTopSvh` sesuai bentuk
aktornya (§2.1) — ini penentu apakah tabrakan benar-benar hilang.

---

## 6. Acceptance criteria

1. **Tak ada tabrakan aktor↔teks.** Di couple/akad/resepsi/rsvp, blok teks
   teratas (eyebrow SectionHeader) mulai **di bawah** batas bawah aktor emas.
   Verifikasi visual di viewport 360×740 dan 414×896.
2. **Lebar teks efektif ≥ 300px** di kolom 360px (padding samping ≤ 44px/sisi).
3. **Tidak ada blob gelap menyeluruh** di section mana pun; scrim `SceneContent`
   default mati; legibility datang dari `.kelir-plate`/`.text-halo` lokal.
4. **Header seragam:** setiap section memakai `SectionHeader` dengan hierarki
   eyebrow→judul→intro yang sama; tak ada `<h1>`/`<p>` judul ad-hoc tersisa
   kecuali numeral khusus (tanggal Event) & nama hero Cover.
5. **Tak ada regresi motion/aset:** GiltSweep, blencong, gold-dust, kupu, reveal
   tetap jalan; `scene-kelir.test.mjs` hijau.
6. **Reduced-motion tetap patuh** (`globals.css:334-341`).

---

## 7. Urutan eksekusi

1. `SectionHeader.tsx` baru + utilitas `.kelir-plate`/`.text-halo` di globals
   (bisa berdiri sendiri, tak merusak apa pun).
2. `sceneKelir.ts`: tambah `safeTopSvh` ke tiap preset.
3. `KelirScene.tsx`: tempel `--kelir-safe-top` (§2.2).
4. `SceneContent.tsx`: padding + align + hapus scrim (§1).
5. Migrasi section satu per satu (§5), mulai dari **couple** (kasus tabrakan
   terparah, jadi pembukti mekanisme) lalu event, lalu sisanya.
6. Verifikasi §6.
