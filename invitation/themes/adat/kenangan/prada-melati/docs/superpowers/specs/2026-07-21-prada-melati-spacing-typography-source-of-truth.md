# Prada Melati — Spacing & Typography (Source of Truth)

> Tanggal: 2026-07-21 · Branch kerja: `feat/prada-melati-impl`
> Dipicu oleh: catatan rapat review desain — "margin atas/bawah tak konsisten",
> "konten mepet ke bawah section", "banyak teks terlalu dekat elemen lain".
> Tujuan: satu tabel angka yang jadi rujukan tunggal untuk margin & ukuran
> font section, diturunkan dari sistem `warm-narrative` (tema saudara yang
> jadi standar kualitas — lihat memory `theme-quality-benchmark`), disesuaikan
> ke arsitektur prada yang beda (lihat §0).

## 0. Kenapa tak bisa 1:1 disalin dari warm-narrative

`warm-narrative` **tidak punya wrapper konten bersama** — tiap section
menyetel padding-nya sendiri secara manual. prada-melati **punya**
(`SceneContent` + `--kelir-safe-top` dari `KelirScene`, lihat spec
`2026-07-20-prada-melati-tata-letak-wrapper-design.md`), karena prada punya
kendala yang warm-narrative tidak: **aktor emas ceplok/hero yang duduk
absolut di zona atas dan bisa menabrak teks** kalau padding-atas tak cukup.
Jadi:

- **Bawah** — tak ada kendala struktural apa pun, jadi angka warm-narrative
  bisa jadi rujukan langsung (§1).
- **Atas** — tetap harus lewat `--kelir-safe-top` per preset (§2), BUKAN
  angka statis warm-narrative — memaksakannya akan memunculkan lagi cacat
  "numpuk dengan aktor" yang sudah diperbaiki spec sebelumnya.

## 1. Angka warm-narrative (diverifikasi, dengan sitasi)

| Kategori | Nilai | Sumber |
|---|---|---|
| Padding samping | `px-8` (32px) dalam `max-w-[400px]` | seragam di 8 section |
| Padding atas/bawah standar (section "plain content": Couple/Event/RSVP) | `clamp(48px, 10svh, 80px)` **kedua sisi, simetris** | CoupleSection.tsx:88-89 dkk |
| Eyebrow/kicker | `10px` tetap, weight 600, tracking `0.3em`, uppercase | RSVP/Gift/Closing |
| Judul h2 (display italic) | `clamp(26-32px, 7.5-9vw, 40-48px)` | DressCode/Event/RSVP/Gift |
| Nama hero (Cover/Closing) | `clamp(34,9.5vw,64)` → `clamp(48,14vw,80)` | terbesar di sistem |
| Numeral tanggal (Event) | `clamp(54,16vw,84)`, line-height 0.9 | elemen ke-2 terbesar |
| Intro/lead italic | `clamp(12-13, 3-3.5vw, 14-15)`, line-height **1.85-1.9** | berulang persis |
| Body/meta | `13px` tetap | baris pendek (tanggal, no. rekening) |
| Caption kecil | `9-11px` tetap | label form, tag swatch, meta countdown |
| Gap antar-item berulang | form fields **20px** (gap-5); card grid **16px** (gap-4); swatch grid `clamp(10,2.5vw,14)` | RSVP / Gift / DressCode |
| Plate legibility | `rgba(250,247,242,0.62)` + `blur(2px)` + border 1px, padding `clamp(9,2vh,13) clamp(14,4vw,20)` | Event venue card |

Catatan: warm-narrative sendiri **tidak 100% konsisten** — 2 dari 8 section
(DressCode, Gift) tak menyetel padding-bawah eksplisit sama sekali. Jangan
disalin buta; itu bukan pola, itu kelalaian di reference-nya.

## 2. Keputusan prada-melati (diadaptasi, final)

### 2.1 Bawah — `SceneContent.tsx`
```
paddingBottom: align === "lower" ? clamp(96px, 16svh, 148px) : clamp(88px, 14svh, 132px)
```
Sengaja **lebih tebal** dari standar warm-narrative (`80px` maks) karena:
- Section prada bertumpu pada **kartu gelap** (§4 tata-letak) untuk baris
  berulang (Rundown, venue Event, swatch DressCode) — kartu butuh jarak
  napas ke hem batik di bawahnya lebih dari teks polos warm-narrative.
- Hem/tumpal band prada adalah elemen gambar (bukan garis tipis), perlu
  clearance lebih supaya kartu terakhir tak mepet tekstur.

Ini **satu nilai untuk semua section non-"lower"** lewat wrapper bersama —
artinya bawah sudah otomatis "sama" di seluruh section per definisi (tak
perlu disetel per file).

### 2.2 Atas — tetap lewat `--kelir-safe-top` (preset `sceneKelir.ts`)
Tak disamakan dengan bawah secara angka mentah — **tak bisa**, karena tiap
preset punya tinggi zona aktor beda (ceplok 26-36svh vs hero ~62svh). Yang
"disamakan" di sini adalah **mekanismenya**: semua section lewat rumus yang
sama (`safeTopSvh` preset → CSS var → `paddingTop`), bukan angka ad-hoc per
file. Itulah makna "margin seragam" yang realistis untuk arsitektur ini.

**Item terbuka** (bukan bagian scope sesi ini, dicatat untuk lanjutan):
`akad` & `resepsi` (`EventSection`, preset hero `actorScale:1.0`) **tidak
menyetel `safeTopSvh`** di `sceneKelir.ts:46-47`, padahal keduanya memakai
`SceneContent` dengan `align="center"` default (bukan `"bottom"`). Menurut
komentar `sceneKelir.ts:29-33`, hero seharusnya mengandalkan `align` untuk
menegakkan zona, tapi `EventSection.tsx:42` tak meng-override `align`. Ini
berisiko konten Event start terlalu tinggi (dekat/tabrak aktor gapura). Perlu
diverifikasi visual lalu ditambal (`safeTopSvh: 62` atau `align="lower"`) di
sesi berikutnya — di luar keluhan rapat kemarin, tapi ditemukan saat audit.

### 2.3 Font-size — dipertahankan, bukan disamakan mentah ke warm-narrative
Skala prada sudah dekat dengan warm-narrative dan punya **batas sengaja**
yang didokumentasikan di spec tata-letak §3.2: judul header ≤ 38px supaya
numeral tanggal Event tetap boleh jadi elemen terbesar section. Menaikkan
judul ke 40-48px (angka warm-narrative) akan merusak hierarki itu. Jadi:

| Elemen | prada (final) | warm-narrative (rujukan) | Status |
|---|---|---|---|
| Eyebrow | `clamp(9.5,2.6vw,11)` | `10px` tetap | Setara, dipertahankan (responsif lebih cocok utk lebar kolom prada yg lebih sempit di mobile kecil) |
| Judul h2 | `clamp(26,7.5vw,38)` | `clamp(26-32,7.5-9vw,40-48)` | **Sengaja lebih kecil** — lihat batas §3.2 di atas |
| Intro | `clamp(12,3.2vw,14)`, lh 1.7 | `clamp(12-13,3-3.5vw,14-15)`, lh 1.85-1.9 | Naikkan `line-height` intro ke **1.8** (§3 di bawah) agar sepadan |
| Body | `clamp(10.5-13px)` responsif | `13px` tetap | Dipertahankan responsif — kolom prada lebih sering dipakai di layar sangat kecil |
| Caption | `9-11px` | `9-11px` | Sudah sama |

### 2.4 Ritme vertikal antar-item berulang — disamakan
Adopsi langsung angka warm-narrative karena tak ada kendala struktural:
- Form field (RSVP): **20px** (`gap-5`) — prada sudah pakai ini, pertahankan.
- Card/list berulang (Rundown row, Gift card, Turut item): target **16px**
  minimum antar-item; row Rundown baru dinaikkan ke `padding:14px 0` (≈28px
  antar-baseline) — sudah di atas target, oke.
- Grid swatch (DressCode): `gap-x-5 gap-y-4` (20px/16px) — dinaikkan dari
  `gap-4` seragam sebelumnya.
- Antar-kelompok (mis. card Akad → card Resepsi di Rundown): **lebih besar**
  dari antar-item dalam satu kelompok — `clamp(36px, 7svh, 52px)`, supaya dua
  kelompok terasa terpisah jelas, bukan satu daftar panjang.

## 3. Perubahan yang sudah diterapkan sesi ini (checklist)

- [x] `SceneContent.tsx` — padding bawah `clamp(88,14svh,132)` (§2.1)
- [x] `RundownSection.tsx` — jarak antar-kelompok Akad/Resepsi
      `clamp(36px,7svh,52px)` via `mt-[clamp(...)] first:mt-0`; kartu gelap
      pembungkus baris; padding baris `14px 0`
- [x] `CoupleSection.tsx` — foto di atas, identitas di bawah; frame gerbang
      besar dihapus (`GebyokCard variant="none"`), tepi tipis + sulur sudut
      kecil saja; ikon Mars/Venus bedakan pria/wanita
- [x] `DressCodeSection.tsx` — swatch dibungkus kartu gelap; ring terang
      (`var(--text-dim)`) di tiap swatch supaya warna Sogan/Kayu Jati (=
      `--bg`/`--surface` tema) tak hilang ditelan latar senada
- [x] `RSVPSection.tsx` — tombol Hadir/Tidak Hadir diperbesar (padding
      16px/12px, font 13px, ikon Check/X)
- [x] `RonceanMelati.tsx` — tinggi untai melati `58vh` → `38vh`
- [x] Cover tak lagi dobel di desktop — `CoverSection` diberi kelas
      `.cover-in-scroll`, disembunyikan `@media (min-width:1024px)` karena
      `DesktopCover` sudah menampilkannya statis di panel kiri
- [x] Musik diganti dari file lokal ke katalog R2 `rimba-invitations`
      (`music/catalog/gamelan-dawn-dd2ce5a2.mp3` — instrumental gamelan,
      senada tema & aksen Kendang di Rundown)

## 4. Acceptance criteria

1. Semua section non-"lower" memakai padding-bawah `clamp(88px,14svh,132px)`
   lewat `SceneContent` — tak ada override manual di file section.
2. Tak ada dua kelompok konten berulang (mis. Akad/Resepsi, card list) yang
   jaraknya < `clamp(36px,7svh,52px)`.
3. Tak ada swatch warna atau elemen dekoratif gelap yang kontrasnya hilang
   terhadap latar section (verifikasi manual — swatch harus selalu punya
   ring/plate kontras, bukan cuma bergantung warnanya sendiri).
4. `test:contrast`, `test:scene`, `test:motion`, `test:desktop` tetap hijau
   setelah tiap perubahan.
5. Cover tidak pernah tampil dua kali sekaligus di viewport ≥1024px.
