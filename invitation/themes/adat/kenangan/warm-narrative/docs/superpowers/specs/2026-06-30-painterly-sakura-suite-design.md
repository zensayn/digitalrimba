# Painterly Sakura Suite — warm-narrative

**Tanggal:** 2026-06-30
**Tema:** `adat/kenangan/warm-narrative`
**Tujuan:** Mengangkat undangan dari kesan "flat / ornamen clipart tertempel" menjadi satu suite visual *painterly* yang premium, kohesif, dan bergerak (parallax berlapis). Mengganti seluruh ornamen raster lama (Ranting1–4, KaranganAkad/Resepsi, GapuraBunga, PitaPenanda, SegelLilin) dengan sistem scene baru. Mempertahankan TeksturKertas (paper-overlay) dan FallingFlowers (kelopak sakura jatuh).

---

## 1. Keputusan desain (terkunci)

| Aspek | Keputusan |
|---|---|
| **Palette** | Tetap copper/krem hangat (`--bg #FAF7F2`, `--gold #C07830`). Sakura dibikin tone **peach/blush/cream**, bukan pink terang. Tidak mengubah token CSS. |
| **Scope** | **Setiap section** punya scene painterly sendiri. |
| **Gerak** | **Parallax berlapis** — tiap scene dipecah menjadi 2–3 layer transparan yang bergerak beda kecepatan saat scroll. |
| **Benang merah** | `FallingFlowers` (BungaJatuh1–6) dipertahankan di atas semua scene. |
| **Aksesibilitas** | `prefers-reduced-motion: reduce` → parallax dimatikan (scene statis). |

---

## 2. Style Bible (sudah ditanam ke setiap prompt di Bagian 5)

Agar 11 scene + kit terasa **satu set**, semua prompt memakai fondasi gaya yang sama. **Tidak perlu menempel apa pun lagi** — di Bagian 5 setiap prompt sudah berdiri sendiri. Fondasinya (untuk referensi):

> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture. Primary flower: **cherry blossom (sakura)**; occasional blush peony and garden rose as accents. Palette: warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage, and copper-brown (#C07830) accents on branches and stems. Warm, desaturated, serene and expensive mood. Soft diffuse light from the upper-left, gentle atmospheric depth. No people, no text, no lettering, no numbers, no logos, no rectangular frame or border.

---

## 3. Tata bahasa komposisi (grammar berlapis)

Tiap section memakai struktur yang sama; teks konten selalu di *safe-zone* tengah.

| Layer | Isi | `depth` (parallax) | Format |
|---|---|---|---|
| **L0 — Atmosfer** | wash cat: langit/kabut krem-peach, foliage jauh | `0.04` | webp opaque |
| **L1 — Fokus** | motif khas section (lengkung/kanopi/ranting menjuntai) — *hanya sebagian section* | `0.12` | webp transparan |
| **L2 — Foreground** | rumpun sakura di sudut/sisi (dari Sakura Kit) | `0.22` | webp transparan |
| **Global** | kelopak sakura jatuh (`FallingFlowers`, sudah ada) | — | — |

`depth` = fraksi tinggi viewport yang ditempuh layer sepanjang section masuk→keluar. Makin besar = makin "dekat".

---

## 4. Strategi aset

**Prinsip:** tiap section dapat **background unik** (ciri khasnya), tapi **foreground memakai ulang "Sakura Kit"** → unik + kohesif + jumlah generate terkendali.

### 4a. Sakura Kit (reusable, generate sekali)

| Nama file | Deskripsi | Dimensi (px) |
|---|---|---|
| `SakuraCornerL.webp` | rumpun sakura melengkung dari sudut **kiri-bawah** ke dalam-atas | 1200×1200 |
| `SakuraCornerR.webp` | rumpun sakura dari sudut **kanan-bawah** (digenerate terpisah, bukan flip, agar natural) | 1200×1200 |
| `SakuraDrapeTop.webp` | ranting sakura menjuntai dari **atas-tengah** ke bawah, sisi kiri & kanan | 1800×900 |
| `SakuraBranchSide.webp` | ranting sakura vertikal anggun untuk **satu sisi** | 800×1800 |
| `SakuraSprigSmall.webp` | sprig kecil aksen (untuk sudut galeri) | 700×700 |

### 4b. Background per section (unik)

| Section | File L0 (opaque) | File L1 (transparan) | L2 (dari Kit) | Parallax penuh? |
|---|---|---|---|---|
| cover | `CoverBg.webp` | `CoverArch.webp` | CornerL + CornerR | ✅ 3 layer (hero) |
| greeting | `GreetingBg.webp` | — | DrapeTop (halus) | 2 layer |
| couple | `CoupleBg.webp` | — | DrapeTop + CornerL/R | 2–3 layer |
| lovestory | `LoveStoryBg.webp` | — | BranchSide (kanan) | 2 layer |
| akad | `AkadBg.webp` | `AkadArch.webp` | CornerL + CornerR | ✅ 3 layer |
| resepsi | `ResepsiBg.webp` | `ResepsiArch.webp` | CornerL + CornerR | ✅ 3 layer |
| dresscode | `DressCodeBg.webp` | — | CornerL + CornerR (kecil) | 2 layer |
| gallery | `GalleryBg.webp` | — | SprigSmall ×4 sudut | 2 layer |
| rsvp | `RSVPBg.webp` | — | BranchSide (kanan-atas) | 2 layer |
| gift | `GiftBg.webp` | — | CornerL | 2 layer |
| closing | `ClosingBg.webp` | `ClosingCanopy.webp` | CornerL + CornerR (penuh) | ✅ 3 layer (hero) |

**Total aset baru:** 5 (kit) + 11 (Bg) + 4 (L1: Cover/Akad/Resepsi/Closing) = **20 gambar**.

### 4c. Dimensi & budget
- Background L0: 1080×2340, webp quality ~82, target **< 180KB**.
- Layer transparan: webp alpha, target **< 120KB**.
- Semua di-upload ke R2 (`rimba-themes`, path `adat/kenangan/warm-narrative/...`) via `wrangler`, served via `https://assets-themes.rimba.io`.

---

## 5. Prompt siap-copy (sudah lengkap — langsung paste)

> Setiap prompt di bawah sudah berisi gaya, palette, format, dan instruksi transparansi/aspek rasio. **Tidak perlu menambah apa pun.** Generate pada aspek rasio yang disebut. Untuk layer transparan, ekspor **PNG dengan alpha** (nanti dikonversi ke webp saat optimasi).

### 5a. Sakura Kit (PNG transparan)

**`SakuraCornerL`** — 1200×1200, transparan
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, primary flower cherry blossom (sakura) with occasional blush peony and garden rose accents, palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) branches and stems, warm desaturated serene expensive mood, soft diffuse light from the upper-left, no people, no text, no logos, no rectangular frame. A graceful cluster of cherry-blossom branches arching from the bottom-left corner inward and upward, a few drifting petals, gentle depth. Isolated on a fully transparent background (PNG with alpha) — no backdrop, no sky, no ground, no cast shadow — with the center of the canvas left empty. Square composition.

**`SakuraCornerR`** — 1200×1200, transparan
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, primary flower cherry blossom (sakura) with occasional blush peony and garden rose accents, palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) branches and stems, warm desaturated serene expensive mood, soft diffuse light from the upper-left, no people, no text, no logos, no rectangular frame. A graceful cluster of cherry-blossom branches arching from the bottom-right corner inward and upward, a few drifting petals, gentle depth. Isolated on a fully transparent background (PNG with alpha) — no backdrop, no sky, no ground, no cast shadow — with the center of the canvas left empty. Square composition.

**`SakuraDrapeTop`** — 1800×900, transparan
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, primary flower cherry blossom (sakura) with occasional blush peony and garden rose accents, palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) branches and stems, warm desaturated serene expensive mood, soft diffuse light from the upper-left, no people, no text, no logos, no rectangular frame. Slender cherry-blossom branches draping downward from the top edge, denser toward the upper-left and upper-right corners and thinning toward the center, a few falling petals. Isolated on a fully transparent background (PNG with alpha) — no backdrop, no sky, no ground, no cast shadow — with the center of the canvas left empty. Wide horizontal composition.

**`SakuraBranchSide`** — 800×1800, transparan
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, primary flower cherry blossom (sakura) with occasional blush peony and garden rose accents, palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) branches and stems, warm desaturated serene expensive mood, soft diffuse light from the upper-left, no people, no text, no logos, no rectangular frame. A single elegant vertical cherry-blossom branch curving gently, suited to frame one side of a layout, a few drifting petals. Isolated on a fully transparent background (PNG with alpha) — no backdrop, no sky, no ground, no cast shadow — with the center of the canvas left empty. Tall vertical composition.

**`SakuraSprigSmall`** — 700×700, transparan
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, primary flower cherry blossom (sakura), palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) stems, warm desaturated serene expensive mood, soft diffuse light from the upper-left, no people, no text, no logos, no rectangular frame. A small delicate sprig of two or three cherry blossoms with a short stem, for a corner accent. Isolated on a fully transparent background (PNG with alpha) — no backdrop, no ground, no cast shadow — center empty. Square composition.

### 5b. Background per section

**`CoverBg`** — 1080×2340, opaque, hero
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, cherry blossom (sakura) motifs, palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) accents, warm desaturated serene expensive mood, soft diffuse light from the upper-left, no people, no text, no lettering, no logos, no rectangular frame. A serene dawn sky wash in warm cream and soft peach with faint clouds; distant blooming sakura groves softly blurred and receding into warm atmospheric haze along the far left and right edges; a gentle copper glow near the horizon; tranquil and expensive. Vertical portrait composition, aspect ratio 9:19.5, full-bleed with an opaque background; keep the central vertical 60% calm, low-contrast and uncluttered for overlaid text; concentrate detail toward the top and bottom edges.

**`CoverArch`** — 1080×2340, transparan, hero
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, cherry blossom (sakura), palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) accents, warm desaturated serene expensive mood, soft diffuse light from the upper-left, no people, no text, no logos. An elegant slender garden pergola/archway painted in pale cream and soft copper, dressed with climbing cherry blossoms, framing an empty central opening (the arch interior stays empty), positioned to leave the vertical middle clear. Isolated on a fully transparent background (PNG with alpha) — no sky, no backdrop, no ground — vertical portrait aspect ratio 9:19.5, center opening empty.

**`GreetingBg`** — 1080×2340, opaque
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, cherry blossom (sakura), palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) accents, warm desaturated serene expensive mood, soft diffuse light from the upper-left, no people, no text, no logos, no rectangular frame. A soft warm-cream atmospheric wash with a few faint, blurred sakura branches drifting in from the top corners, generous empty serene space across the center and lower half. Vertical portrait composition, aspect ratio 9:19.5, full-bleed opaque background; central vertical 60% calm and low-contrast for overlaid text.

**`CoupleBg`** — 1080×2340, opaque
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, cherry blossom (sakura), palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) accents, warm desaturated serene expensive mood, soft diffuse light from the upper-left, no people, no text, no logos, no rectangular frame. A warm-cream wash suggesting a gentle garden aisle: a soft pair of blooming sakura trees faintly indicated at the far left and far right like a symmetrical avenue, calm empty vertical center, soft peach light. Vertical portrait composition, aspect ratio 9:19.5, full-bleed opaque background; central vertical 60% calm and low-contrast for overlaid text.

**`LoveStoryBg`** — 1080×2340, opaque
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, cherry blossom (sakura), palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) accents, warm desaturated serene intimate expensive mood, soft diffuse light from the upper-left, no people, no text, no logos, no rectangular frame. A warm-cream wash with a single graceful sakura branch meandering vertically along the right edge like a path, soft bokeh blossoms, calm uncluttered left and center. Vertical portrait composition, aspect ratio 9:19.5, full-bleed opaque background; central vertical 60% calm and low-contrast for overlaid text.

**`AkadBg`** — 1080×2340, opaque
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, cherry blossom (sakura), palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) accents, warm desaturated serene ceremonial expensive mood, soft diffuse light from the upper-left, no people, no text, no numbers, no logos, no rectangular frame. A softly painted rounded alcove of pale cream light in the upper-center suggesting a sacred arch, surrounded by delicate sakura, calm low-contrast center, warm copper accents. Vertical portrait composition, aspect ratio 9:19.5, full-bleed opaque background; central vertical 60% calm and low-contrast for overlaid text.

**`AkadArch`** — 1080×2340, transparan
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, cherry blossom (sakura), palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) accents, warm desaturated serene expensive mood, soft diffuse light from the upper-left, no people, no text, no logos. A delicate semicircular arc/wreath of cherry blossoms and copper-brown twigs framing the upper portion of the canvas like a ceremonial arch, open and empty in the middle. Isolated on a fully transparent background (PNG with alpha) — no sky, no backdrop, no ground — vertical portrait aspect ratio 9:19.5, center empty.

**`ResepsiBg`** — 1080×2340, opaque
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, cherry blossom (sakura), palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) accents, warm desaturated festive yet refined expensive mood, soft diffuse light from the upper-left, no people, no text, no numbers, no logos, no rectangular frame. A gentle overhead canopy of sakura suggested at the top, soft warm-cream light with faint copper string-light bokeh, calm low-contrast center. Vertical portrait composition, aspect ratio 9:19.5, full-bleed opaque background; central vertical 60% calm and low-contrast for overlaid text.

**`ResepsiArch`** — 1080×2340, transparan
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, cherry blossom (sakura), palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) accents, warm desaturated serene expensive mood, soft diffuse light from the upper-left, no people, no text, no logos. A soft horizontal garland/canopy of cherry blossoms and copper twigs spanning the top of the canvas and gently curving down at both sides, open empty middle. Isolated on a fully transparent background (PNG with alpha) — no sky, no backdrop, no ground — vertical portrait aspect ratio 9:19.5, center empty.

**`DressCodeBg`** — 1080×2340, opaque
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, cherry blossom (sakura), palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) accents, warm desaturated light airy expensive mood, soft diffuse light from the upper-left, no people, no text, no logos, no rectangular frame. A clean warm-cream wash with faint sakura sprigs only at the bottom-left and bottom-right corners, very calm and empty center. Vertical portrait composition, aspect ratio 9:19.5, full-bleed opaque background; central vertical 60% calm and low-contrast for overlaid text.

**`GalleryBg`** — 1080×2340, opaque
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, cherry blossom (sakura), palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) accents, warm desaturated serene expensive mood, soft diffuse light from the upper-left, no people, no text, no logos, no rectangular frame. A soft neutral warm-cream wash with a gentle darker vignette toward the edges to help photographs stand out, faint sakura suggested at the four corners, calm clean center. Vertical portrait composition, aspect ratio 9:19.5, full-bleed opaque background; central vertical 60% calm and low-contrast for overlaid text.

**`RSVPBg`** — 1080×2340, opaque
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, cherry blossom (sakura), palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) accents, warm desaturated calm expensive mood, soft diffuse light from the upper-left, no people, no text, no logos, no rectangular frame. A calm warm-cream wash with a single soft sakura branch in the top-right corner, generous empty space across the center and lower half for legibility. Vertical portrait composition, aspect ratio 9:19.5, full-bleed opaque background; central vertical 60% calm and low-contrast for overlaid text.

**`GiftBg`** — 1080×2340, opaque
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, cherry blossom (sakura), palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) accents, warm desaturated calm expensive mood, soft diffuse light from the upper-left, no people, no text, no logos, no rectangular frame. A warm-cream wash with a soft cluster of sakura low in the bottom-left corner, generous empty center. Vertical portrait composition, aspect ratio 9:19.5, full-bleed opaque background; central vertical 60% calm and low-contrast for overlaid text.

**`ClosingBg`** — 1080×2340, opaque, hero
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, cherry blossom (sakura), palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) accents, warm desaturated tranquil expensive mood, soft diffuse light, no people, no text, no logos, no rectangular frame. A peaceful full sakura grove at warm golden dusk in cream and copper tones, blossoms and petals gently drifting, a soft radial glow at the center, rich atmospheric depth, calm low-contrast middle. Vertical portrait composition, aspect ratio 9:19.5, full-bleed opaque background; central vertical 60% calm and low-contrast for overlaid text.

**`ClosingCanopy`** — 1080×2340, transparan, hero
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, cherry blossom (sakura), palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) accents, warm desaturated serene expensive mood, soft diffuse light from the upper-left, no people, no text, no logos. A graceful canopy of overhanging cherry-blossom branches draping from the top edge across both the left and right sides, drifting petals, the central opening empty. Isolated on a fully transparent background (PNG with alpha) — no sky, no backdrop, no ground — vertical portrait aspect ratio 9:19.5, center opening empty.

### 5c. Kit tambahan v2 — "frame penuh" (transparan)

Alasan: untuk mencapai kesan **berbingkai penuh seperti referensi**, kit sudut + ranting sisi tipis belum cukup. Yang paling berdampak: **kolom sisi tinggi** (efek "diapit pohon" seperti referensi) dan **sudut atas proper** (agar tidak perlu merotate sudut-bawah 180° yang sering terlihat janggal). Empat aset baru ini dipakai ulang lintas section, dianimasikan masuk dari tepinya masing-masing.

| Nama file | Deskripsi | Dimensi (px) |
|---|---|---|
| `SakuraColumnL.webp` | kolom foliage sakura vertikal **full-height** menempel tepi **kiri** | 760×2000 |
| `SakuraColumnR.webp` | kolom vertikal full-height tepi **kanan** (generate terpisah, bukan flip) | 760×2000 |
| `SakuraTopL.webp` | rumpun sudut **kiri-atas**, menjuntai ke dalam-bawah | 1100×1100 |
| `SakuraTopR.webp` | rumpun sudut **kanan-atas**, menjuntai ke dalam-bawah | 1100×1100 |

**`SakuraColumnL`** — 760×2000, transparan
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, primary flower cherry blossom (sakura) with occasional blush peony and garden rose accents, palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) branches and stems, warm desaturated serene expensive mood, soft diffuse light from the upper-left, no people, no text, no logos, no rectangular frame. A tall, elegant vertical column of cherry-blossom branches and foliage running the full height along the LEFT edge, densest near the left edge and gently tapering toward the center, airy and graceful (not a solid wall), a few drifting petals. Isolated on a fully transparent background (PNG with alpha) — no backdrop, no sky, no ground, no cast shadow — with the right two-thirds of the canvas completely empty. Tall vertical composition.

**`SakuraColumnR`** — 760×2000, transparan
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, primary flower cherry blossom (sakura) with occasional blush peony and garden rose accents, palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) branches and stems, warm desaturated serene expensive mood, soft diffuse light from the upper-left, no people, no text, no logos, no rectangular frame. A tall, elegant vertical column of cherry-blossom branches and foliage running the full height along the RIGHT edge, densest near the right edge and gently tapering toward the center, airy and graceful (not a solid wall), a few drifting petals. Isolated on a fully transparent background (PNG with alpha) — no backdrop, no sky, no ground, no cast shadow — with the left two-thirds of the canvas completely empty. Tall vertical composition.

**`SakuraTopL`** — 1100×1100, transparan
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, primary flower cherry blossom (sakura) with occasional blush peony and garden rose accents, palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) branches and stems, warm desaturated serene expensive mood, soft diffuse light from the upper-left, no people, no text, no logos, no rectangular frame. A graceful cluster of cherry-blossom branches arching from the TOP-LEFT corner inward and downward, draping down into the frame, a few drifting petals, gentle depth. Isolated on a fully transparent background (PNG with alpha) — no backdrop, no sky, no ground, no cast shadow — with the center and bottom-right of the canvas empty. Square composition.

**`SakuraTopR`** — 1100×1100, transparan
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, primary flower cherry blossom (sakura) with occasional blush peony and garden rose accents, palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) branches and stems, warm desaturated serene expensive mood, soft diffuse light from the upper-left, no people, no text, no logos, no rectangular frame. A graceful cluster of cherry-blossom branches arching from the TOP-RIGHT corner inward and downward, draping down into the frame, a few drifting petals, gentle depth. Isolated on a fully transparent background (PNG with alpha) — no backdrop, no sky, no ground, no cast shadow — with the center and bottom-left of the canvas empty. Square composition.

**Rencana pemakaian (per section, setelah aset ada):** `ColumnL` + `ColumnR` (tepi kiri-kanan full-height) + `TopL` + `TopR` (sudut atas) + `CornerL` + `CornerR` (sudut bawah, sudah ada) = bingkai penuh mengelilingi konten, tiap sisi beranimasi masuk dari tepinya. Ranting-sisi tipis (`SakuraBranchSide`) yang sekarang dipakai sebagai penambal akan digantikan `Column` yang lebih tegas. Section berkonten lebar (Greeting/Event/Gift/RSVP) memakai `Column` dengan opacity lebih rendah + lebih tipis agar tidak menutup konten.

### 5d. Varian anti-repetisi (strategi **Hybrid**)

Masalah: satu aset kit yang sama muncul di banyak section (sudut bawah di ~9 section) atau berbarengan di satu layar (4 sprig identik di Gallery) → terlihat "copy-paste". Strategi Hybrid: **generate varian hanya untuk piece yang paling sering berulang**, selebihnya cukup dibedakan lewat transform (flip/rotate/scale/opacity/posisi) + background yang memang beda tiap section.

**Varian yang perlu digenerate:**

| File | Untuk | Catatan |
|---|---|---|
| `SakuraCornerL2.webp` | sudut bawah kiri (alternatif dari `SakuraCornerL`) | susunan beda; diselang-seling antar section |
| `SakuraCornerR2.webp` | sudut bawah kanan (alternatif dari `SakuraCornerR`) | susunan beda |
| `SakuraSprigSmall2.webp` | sudut Gallery | biar 4 sudut Gallery tidak identik |
| `SakuraSprigSmall3.webp` | sudut Gallery | (existing + 2 varian = 3 unik; sudut ke-4 pakai flip) |

> Kolom sisi (`ColumnL/R`) & sudut atas (`TopL/R`) untuk sementara **1 versi dulu** + dibedakan transform; kalau setelah dipasang masih terasa berulang, baru tambah `ColumnL2/R2`.

Kunci varian: **komposisi harus beda nyata** dari versi pertama, tapi gaya/palette tetap sama.

**`SakuraCornerL2`** — 1200×1200, transparan
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, primary flower cherry blossom (sakura) with occasional blush peony and garden rose accents, palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) branches and stems, warm desaturated serene expensive mood, soft diffuse light from the upper-left, no people, no text, no logos, no rectangular frame. A cluster of cherry-blossom branches arching from the bottom-left corner inward and upward, in a DIFFERENT arrangement — looser and taller, more open sakura sprays reaching up the left edge, fewer large peonies and more small blossoms and buds, a few drifting petals. Isolated on a fully transparent background (PNG with alpha) — no backdrop, no ground, no cast shadow — center empty. Square composition.

**`SakuraCornerR2`** — 1200×1200, transparan
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, primary flower cherry blossom (sakura) with occasional blush peony and garden rose accents, palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) branches and stems, warm desaturated serene expensive mood, soft diffuse light from the upper-left, no people, no text, no logos, no rectangular frame. A cluster of cherry-blossom branches arching from the bottom-right corner inward and upward, in a DIFFERENT arrangement — looser and taller, more open sakura sprays reaching up the right edge, fewer large peonies and more small blossoms and buds, a few drifting petals. Isolated on a fully transparent background (PNG with alpha) — no backdrop, no ground, no cast shadow — center empty. Square composition.

**`SakuraSprigSmall2`** — 700×700, transparan
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, primary flower cherry blossom (sakura), palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) stems, warm desaturated serene expensive mood, soft diffuse light from the upper-left, no people, no text, no logos, no rectangular frame. A small delicate sprig of cherry blossoms with a curved stem and four or five open blossoms plus a couple of buds, arranged differently from a single-cluster sprig, for a corner accent. Isolated on a fully transparent background (PNG with alpha) — no backdrop, no ground, no cast shadow — center empty. Square composition.

**`SakuraSprigSmall3`** — 700×700, transparan
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, primary flower cherry blossom (sakura), palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) stems, warm desaturated serene expensive mood, soft diffuse light from the upper-left, no people, no text, no logos, no rectangular frame. A small delicate sprig of cherry blossoms — a short branching twig with two blossoms and a small leafy tip, more horizontal and sparse than a full cluster, for a corner accent. Isolated on a fully transparent background (PNG with alpha) — no backdrop, no ground, no cast shadow — center empty. Square composition.

**Wiring anti-repetisi (setelah aset ada):**
- Sudut bawah: selang-seling `CornerL`/`CornerL2` dan `CornerR`/`CornerR2` antar section (mis. ganjil pakai v1, genap pakai v2), plus variasi flip/scale.
- Gallery: 4 sudut pakai 4 aset/tampilan berbeda (`SprigSmall`, `SprigSmall2`, `SprigSmall3`, + satu flip) — tidak ada dua yang identik dalam satu layar.
- Section lain yang reuse aset sama tetap dibedakan via flip/rotate/scale/opacity + background unik.

### 5e. Frame border foto (transparan)

Untuk mengangkat foto (Mempelai, Kisah Kami, Galeri) dari kesan "kotak polos" jadi lebih premium, dipasang **bingkai foto painterly** sebagai overlay transparan di atas foto (pusat & luar bingkai tembus pandang). Butuh 2 aspek:

| File | Aspek | Untuk | Dimensi |
|---|---|---|---|
| `PhotoFramePortrait.webp` | 3:4 | foto Mempelai (potret) | 900×1200 |
| `PhotoFrameLandscape.webp` | 4:3 | foto Kisah Kami & Galeri | 1200×900 |

Kunci prompt: **hanya bingkai tepi yang digambar** — bagian TENGAH dan LUAR bingkai wajib transparan penuh (jangan ada objek/bunga menutup area foto).

**`PhotoFramePortrait`** — 900×1200 (3:4), transparan
> An ornate rectangular photo frame border ONLY, elegant editorial wedding style, thin hand-painted copper-and-gold filigree with delicate cherry-blossom (sakura) accents clustered at the four corners in soft peach and blush-cream, muted sage-green leaves, warm desaturated palette matching #FAF7F2 cream and #C07830 copper, soft painterly watercolor texture, refined and expensive. IMPORTANT: only the thin border/frame around the edges is drawn; the entire center area is a fully empty transparent window and the area outside the frame is also fully transparent — no photo, no background, no flowers covering the middle. PNG with alpha, vertical 3:4 aspect ratio.

**`PhotoFrameLandscape`** — 1200×900 (4:3), transparan
> An ornate rectangular photo frame border ONLY, elegant editorial wedding style, thin hand-painted copper-and-gold filigree with delicate cherry-blossom (sakura) accents clustered at the four corners in soft peach and blush-cream, muted sage-green leaves, warm desaturated palette matching #FAF7F2 cream and #C07830 copper, soft painterly watercolor texture, refined and expensive. IMPORTANT: only the thin border/frame around the edges is drawn; the entire center area is a fully empty transparent window and the area outside the frame is also fully transparent — no photo, no background, no flowers covering the middle. PNG with alpha, horizontal 4:3 aspect ratio.

**Wiring (setelah aset ada):** overlay `<img>` frame absolute di atas tiap foto (`inset` sedikit negatif mis. −6% biar hiasan sudut memeluk tepi foto), `pointer-events:none`, `zIndex` di atas foto. Ganti border CSS + corner-ornament yang sekarang. Sudut sakura di frame boleh sedikit keluar dari kotak foto (efek mekar).

---

### 5f. Scatter & Base Kit — "kepadatan referensi" (Arah B, transparan)

**Alasan:** referensi undangan yang jadi acuan terasa *hidup* karena **banyak piece kecil yang saling mengisi celah** dan **satu jangkar rendah di bawah**, lalu semuanya **dirakit satu-per-satu** saat animasi. Kit sakura yang ada (Column/Top/Corner/Drape/Sprig) potongannya besar & lega — belum cukup padat. Tujuh aset kecil ini menambah "amunisi sebar" tanpa keluar dari Style Bible (§2): tetap sakura + aksen blush peony/garden rose + foliage sage + copper `#C07830`.

**Prinsip pemakaian:** piece scatter (`Floret/Bud/Leaf`) disebar **kecil** (width 8–16%), `opacity` 0.6–0.85, di celah antara kolom & sudut; base cluster jadi **pita bawah** yang grounding + bleed melewati lipatan ke section berikut. Semua ikut ambient-wind (`.ambient-wind` / `.ambient-float`) yang sudah ada.

| Nama file | Fungsi | Dimensi (px) | Budget |
|---|---|---|---|
| `SakuraFloretA.webp` | rumpun 2–3 blossom mungil untuk disebar | 700×700 | < 60KB |
| `SakuraFloretB.webp` | varian sebar (susunan beda) | 700×700 | < 60KB |
| `SakuraBudTwig.webp` | ranting kecil berkuncup + 1 blossom mekar | 700×700 | < 60KB |
| `SakuraLeafSprig.webp` | sprig daun sage-green (aksen "hijau", minim bunga) | 700×700 | < 60KB |
| `SakuraBaseClusterL.webp` | gundukan taman rendah **kiri-bawah** (grounding) | 1400×700 | < 140KB |
| `SakuraBaseClusterR.webp` | gundukan rendah **kanan-bawah** (generate terpisah) | 1400×700 | < 140KB |
| `SakuraBaseCenter.webp` | rumpun rendah **tengah-bawah** — jangkar floral (pengganti "mandala" referensi) | 1000×700 | < 120KB |

**`SakuraFloretA`** — 700×700, transparan
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, primary flower cherry blossom (sakura), palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) stems, warm desaturated serene expensive mood, soft diffuse light from the upper-left, no people, no text, no logos, no rectangular frame. A tiny floating cluster of two or three open cherry blossoms with a couple of small buds and a hint of sage leaf, no visible branch, compact and centered, for scattering into gaps. Isolated on a fully transparent background (PNG with alpha) — no backdrop, no ground, no cast shadow — most of the canvas empty around a small central motif. Square composition.

**`SakuraFloretB`** — 700×700, transparan
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, primary flower cherry blossom (sakura), palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) stems, warm desaturated serene expensive mood, soft diffuse light from the upper-left, no people, no text, no logos, no rectangular frame. A tiny loose spray of cherry blossoms in a DIFFERENT arrangement — three or four small blossoms trailing diagonally with a few scattered petals and one tiny bud, airy and delicate, for scattering into gaps. Isolated on a fully transparent background (PNG with alpha) — no backdrop, no ground, no cast shadow — most of the canvas empty around a small motif. Square composition.

**`SakuraBudTwig`** — 700×700, transparan
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, primary flower cherry blossom (sakura), palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) twigs, warm desaturated serene expensive mood, soft diffuse light from the upper-left, no people, no text, no logos, no rectangular frame. A short slender copper-brown twig bearing several closed pink buds and a single half-open cherry blossom with two small sage leaves, delicate and sparse, for a small accent. Isolated on a fully transparent background (PNG with alpha) — no backdrop, no ground, no cast shadow — most of the canvas empty around the small twig. Square composition.

**`SakuraLeafSprig`** — 700×700, transparan
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, muted sage-green foliage with copper-brown (#C07830) stems, palette of warm cream (#FAF7F2), soft peach and dusty blush kept very minimal, warm desaturated serene expensive mood, soft diffuse light from the upper-left, no people, no text, no logos, no rectangular frame. A small graceful sprig of soft sage-green leaves on a thin curving copper stem, with at most one tiny blush cherry blossom, foliage-dominant, for adding green depth between flowers. Isolated on a fully transparent background (PNG with alpha) — no backdrop, no ground, no cast shadow — most of the canvas empty around the small sprig. Square composition.

**`SakuraBaseClusterL`** — 1400×700, transparan
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, primary flower cherry blossom (sakura) with occasional blush peony and garden rose accents, palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) branches and stems, warm desaturated serene expensive mood, soft diffuse light from the upper-left, no people, no text, no logos, no rectangular frame. A low, wide mound of blooming cherry blossoms, buds and sage foliage resting along the BOTTOM edge and rising a little higher toward the LEFT, like the base of a flower garden, a few drifting petals, airy silhouette (not a solid block). Isolated on a fully transparent background (PNG with alpha) — no backdrop, no sky, no ground line, no cast shadow — the entire upper half of the canvas completely empty. Wide horizontal composition.

**`SakuraBaseClusterR`** — 1400×700, transparan
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, primary flower cherry blossom (sakura) with occasional blush peony and garden rose accents, palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) branches and stems, warm desaturated serene expensive mood, soft diffuse light from the upper-left, no people, no text, no logos, no rectangular frame. A low, wide mound of blooming cherry blossoms, buds and sage foliage resting along the BOTTOM edge and rising a little higher toward the RIGHT, like the base of a flower garden, a few drifting petals, airy silhouette (not a solid block). Isolated on a fully transparent background (PNG with alpha) — no backdrop, no sky, no ground line, no cast shadow — the entire upper half of the canvas completely empty. Wide horizontal composition.

**`SakuraBaseCenter`** — 1000×700, transparan
> Elegant editorial wedding illustration, painterly soft watercolor-and-gouache style with loose expressive brushwork and visible hand-painted texture, primary flower cherry blossom (sakura) with occasional blush peony and garden rose accents, palette of warm cream (#FAF7F2), soft peach, dusty blush, muted sage-green foliage and copper-brown (#C07830) branches and stems, warm desaturated serene expensive mood, soft diffuse light from the upper-left, no people, no text, no logos, no rectangular frame. A small symmetrical low cluster of cherry blossoms, buds and sage leaves resting on the BOTTOM edge and gently mounding toward the center, as a delicate floral anchor for the bottom-center, a few drifting petals. Isolated on a fully transparent background (PNG with alpha) — no backdrop, no sky, no ground line, no cast shadow — upper two-thirds of the canvas completely empty. Wide horizontal composition.

---

### 5g. Komposisi padat + animasi "dirakit satu-per-satu"

**Preset `sceneFrame()` (baru — `src/components/shared/sceneFrame.ts`).** Fungsi yang mengembalikan `ParallaxLayer[]` bingkai padat standar, dipanggil tiap section supaya seragam (kunci alur mulus antar-section). Sketsa signature:

```ts
sceneFrame({
  bg,                 // src background L0 (opaque) — wajib
  arch,               // src L1 opsional (Arch/Canopy)
  variant = 0,        // 0/1 → pilih CornerL vs CornerL2, dst (anti-repetisi)
  density = "full",   // "full" | "light" (section konten lebar pakai "light")
  base = true,        // pasang BaseCluster L/R + Center di bawah
}): ParallaxLayer[]
```

**Urutan layer = urutan "dirakit"** (array order → stagger entrance). Struktur dulu, detail belakangan:
1. `bg` (L0, cover) · `arch` (L1) — muncul instan/awal.
2. `ColumnL`, `ColumnR` — sisi masuk dari kiri & kanan.
3. `TopL`, `TopR` — sudut atas menjuntai turun.
4. `CornerL(/2)`, `CornerR(/2)` — sudut bawah tumbuh naik.
5. `BaseClusterL`, `BaseClusterR`, `BaseCenter` — pita bawah grounding (mode `float`).
6. **Scatter** `FloretA/B`, `BudTwig`, `LeafSprig` ×(4–7 posisi acak-deterministik di celah) — detail terakhir yang "mengunci" kepadatan.

**Mekanisme animasi rakit (di `ParallaxScene`):** entrance per-piece sudah ada (tiap `box` masuk dari tepinya saat ter-scroll, replay tiap re-enter). Untuk efek "dirakit satu-per-satu" ditambah:
- **`enterDelay?: number` baru di `ParallaxLayer`** — override delay entrance eksplisit, supaya urutan rakit bisa ditata (default tetap `index * stagger`).
- **Stagger diperbesar** untuk scene padat (mis. base 0.10–0.14s antar piece) agar mata menangkap piece muncul beruntun, bukan sekaligus.
- **Frame-first → content:** konten section mulai reveal setelah bingkai inti mendarat. Implementasi: naikkan base-delay varian `fade()` konten (mis. mulai ~0.5–0.8s) **atau** expose satu konstanta `REVEAL_AFTER_FRAME` per section. Sifatnya "bingkai memimpin, isi menyusul cepat" (bukan menunggu bingkai 100% selesai).
- Ambient-wind (§ sudah diimplementasi) tetap jalan setelah settle → bingkai lengkap tidak freeze.

**Anti-repetisi scatter:** posisi & transform (scale/flip/rotate/opacity) tiap scatter diturunkan dari index secara **deterministik** (aman SSR, tak ada hydration mismatch), 3 aset scatter + flip → variasi cukup tanpa terlihat copy-paste.

**Cakupan bertahap:** **Akad & Resepsi dulu** (acuan referensi) untuk validasi rasa & performa, lalu rollout ke section lain via preset yang sama. Section konten lebar (Greeting/Gift/RSVP) pakai `density:"light"` + `opacity` scatter lebih rendah agar teks tetap terbaca.

---

## 6. Mekanisme parallax (arsitektur teknis)

### 6a. Komponen baru
- **`src/components/shared/parallax-context.ts`**: `createContext<RefObject<HTMLDivElement | null> | null>(null)` + hook `useParallaxContainer()`.
- **`src/components/shared/SnapContainer.tsx`** (client): membungkus `children`, memegang `scrollRef` pada div scroll (`.snap-container`), dan menyebarkannya lewat `ParallaxContext`. `page.tsx` di-refactor agar `.snap-container` dirender oleh komponen ini.
- **`src/components/shared/ParallaxScene.tsx`** (client): menerima prop `layers: { src; depth; opacity?; objectPosition?; transparent?; className?; style? }[]` + optional `children`. Untuk tiap layer:
  - `const container = useParallaxContainer()`
  - `const { scrollYProgress } = useScroll({ container, target: sceneRef, offset: ["start end", "end start"] })`
  - `const y = useTransform(scrollYProgress, [0, 1], ["${depth*100}vh".neg, "${depth*100}vh"])` → `motion.img`/`motion.div` dengan `style={{ y, willChange: "transform" }}`.
  - Layer dirender absolute `inset-0`, `pointer-events-none`, di bawah `children`.

### 6b. Mount & performa
- `ParallaxScene` hanya me-*mount* `<img>` layer saat section mendekati viewport via `IntersectionObserver` (rootMargin generous, mis. `200px 0px`), agar tidak semua gambar diunduh sekaligus.
- Layer Cover di-*preload* (mis. `fetchPriority="high"`) karena di atas lipatan.
- `loading="lazy"` + `decoding="async"` untuk layer non-Cover.

### 6c. Reduced-motion
- Bila `prefers-reduced-motion: reduce`, `ParallaxScene` melewati `useTransform` dan merender layer statis (tanpa `y`). Hook membaca `window.matchMedia`.

### 6d. Refactor section
- Tiap section membungkus background-nya dengan `<ParallaxScene layers={...}>`, menghapus blok ornamen lama (sudah dilakukan) dan elemen background lama yang digantikan scene. `style={{ background: "transparent" }}` tetap.
- `paper-overlay` tetap dirender di atas scene (mix-blend multiply) untuk kesan tactile.

---

## 7. Pembersihan aset lama
- **Sudah dicopot dari kode:** `Ranting1–4`, `KaranganAkad`, `KaranganResepsi`, `GapuraBunga`, `PitaPenanda`, `SegelLilin`. (LoveStory pakai node titik tembaga; EventSection pakai angka tanggal copper-gradient bersih.)
- **File** dibiarkan di `public/images` & R2 sampai sistem baru terverifikasi, lalu dihapus dalam langkah terpisah.
- **Dipertahankan:** `TeksturKertas` (paper-overlay), `BungaJatuh1–6` (FallingFlowers).
- **Ditinjau saat implementasi Cover/Closing:** aset lama `AwanPink`, `BintangBintang`, `FrameEmas` (Cover), `BungaPutihBorder`, `Borderbawah` (Closing/Couple/Greeting), `CincinEmas`, `TempatPernikahan` (Event) — kemungkinan digantikan scene baru demi "satu tema".

---

## 8. Urutan build (untuk plan implementasi)
1. **Aset:** generate 20 gambar (Bagian 5) → optimasi webp → upload R2.
2. **Infra parallax:** `parallax-context` + `SnapContainer` + `ParallaxScene` + refactor `page.tsx`.
3. **Per-section:** ganti background tiap section dengan `ParallaxScene` (urut: Cover → Closing dulu sebagai hero, lalu sisanya).
4. **Performa:** IntersectionObserver mount-gating, preload Cover, reduced-motion.
5. **Verifikasi:** `tsc --noEmit`, cek visual tiap section, cek beban jaringan & smoothness scroll.
6. **Cleanup:** hapus aset lama dari R2/`public` setelah disetujui.

### 8b. Densifikasi (Arah B) — urutan
1. **Aset:** generate 7 gambar §5f → optimasi webp (target budget di tabel) → upload R2 (§7b) → verifikasi `200 image/webp`.
2. **Kode preset:** buat `sceneFrame.ts` (§5g) + tambah `enterDelay?` ke `ParallaxLayer` + perbesar stagger scene padat.
3. **Frame-first reveal:** geser base-delay konten (mulai setelah bingkai inti mendarat).
4. **Terapkan Akad & Resepsi dulu** via `sceneFrame()` → validasi rasa, performa, keterbacaan.
5. **Rollout** section lain (`density:"light"` untuk konten lebar), jaga anti-repetisi scatter.
6. Ambient-wind (`.ambient-wind`/`.ambient-float`) **sudah diimplementasi** — scatter & base ikut otomatis.

---

## 9. Kriteria sukses
- 11 section punya scene painterly yang jelas **satu tema** (palette, gaya brush, spesies bunga konsisten).
- Parallax terasa berlapis & halus (60fps), mati rapi saat reduced-motion.
- Teks tiap section tetap terbaca (safe-zone center terjaga).
- Tidak ada lagi ornamen clipart lama; kesan "buatan anak SD" hilang → terasa premium.
- Total beban awal terkendali (hanya Cover preloaded; sisanya lazy).

### 9b. Kriteria sukses Arah B (kepadatan + rakit)
- Section event terasa **padat & "hidup" ala referensi** (banyak piece kecil saling mengisi) tapi tetap sakura, bukan clipart.
- Piece muncul **beruntun (dirakit)**, berakhir jadi bingkai lengkap; konten menyusul setelah bingkai inti mendarat.
- Setelah settle, bingkai **tidak freeze** (ambient-wind jalan); teks tetap terbaca.
- Scatter tidak terlihat copy-paste (variasi transform deterministik); tambahan beban jaringan wajar (7 aset kecil, lazy per-section).
