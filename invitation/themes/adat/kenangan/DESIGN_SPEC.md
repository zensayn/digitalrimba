# Kenangan · Kategori Adat

## Design Specification (Tier)

> **Tier 1 — Basic · Rp 150rb**
> "Setiap momen jadi kenangan."

Spec ini mendefinisikan **karakter tier Kenangan**, bukan satu tema tertentu.
Palet, tipografi, dan kosakata motion adalah milik tema — lihat `DESIGN_SPEC.md`
di folder tema masing-masing (mis. `warm-narrative/DESIGN_SPEC.md`).

---

### Karakter Tier

Tier pembuka. Kenangan adalah undangan yang utuh dan selesai, bukan versi lumpuh
dari tier di atasnya. Pasangan yang memilihnya mendapat undangan yang benar-benar
jadi, hanya dengan babak cerita yang lebih ringkas.

**Pembeda tier = section yang berhak muncul.** Tier tidak menyentuh estetika
maupun motion. Sebuah tema bebas memakai parallax, partikel, atau WebGL di tier
mana pun; yang dibatasi tier hanyalah daftar section yang aktif.

---

### Entitlement Section (8)

Sumber kebenaran: `DESIGN_SYSTEM.md` §4.1. Spec ini menerjemahkannya menjadi
daftar section, tidak mendefinisikannya ulang.

| Section | Isi |
|---------|-----|
| `cover` | Nama mempelai, tanggal, countdown |
| `greeting` | Salam pembuka + nama tamu personal |
| `couple` | Foto, nama lengkap, orang tua, link Instagram |
| `akad` | Detail akad: maps lokasi + add to calendar |
| `resepsi` | Detail resepsi: maps lokasi + add to calendar |
| `rsvp` | Konfirmasi kehadiran + Wedding Wish (ucapan dan doa) |
| `gift` | Amplop Digital |
| `closing` | Penutup + hashtag |

Wedding Wish bukan section tersendiri. Ia field "Ucapan (opsional)" di dalam
form RSVP, dan ucapan yang masuk ditampilkan kembali sebagai guestbook feed
(`digital/backend/internal/handlers/rsvp.go`).

Lagu autoplay dari katalog dan pilihan bahasa Indonesia/Inggris berlaku di
seluruh tier, bukan section tersendiri.

---

### Yang Tidak Berhak Muncul di Kenangan

| Section | Milik tier |
|---------|------------|
| `lovestory` | Kisah |
| `gallery` | Kisah (maks 25 foto) · Warisan (unlimited) |
| `dresscode` | Warisan |

"Sesi Akad dan Resepsi terpisah" pada `DESIGN_SYSTEM.md` §4.2 **bukan** soal
section. Yang dimaksud adalah dua undangan terpisah — satu untuk tamu akad,
satu untuk tamu resepsi. Di Kenangan keduanya digabung dalam satu undangan,
sehingga section `akad` dan `resepsi` tetap muncul berdampingan.

---

### Yang Didukung Tema ≠ Yang Termasuk Paket

Sebuah tema boleh merender lebih banyak section daripada yang berhak muncul pada
tier ini. Entitlement menyaringnya saat runtime lewat `sections.enabled`.
Kelebihan kemampuan tema bukan pelanggaran tier.

---

### Tema di Tier Ini

| Folder | Tema | Aesthetic | Status |
|--------|------|-----------|--------|
| `warm-narrative/` | Warm Narrative | Warm Parchment + Copper — editorial, bertekstur | ✅ Active |

---

### Catatan atas warm-narrative

`RenderSection.tsx` mengenali sebelas id: delapan entitlement Kenangan di atas,
ditambah `lovestory`, `gallery`, dan `dresscode`. Ketiganya milik tier di
atasnya dan dimatikan lewat `sections.enabled` saat undangan dijual sebagai
Kenangan. Ini kelebihan kemampuan tema, bukan pelanggaran tier.

---

### Referensi

- Entitlement per paket: `DESIGN_SYSTEM.md` §4
- Token semantik bersama: `DESIGN_SYSTEM.md` §8.1
- Alasan tier diukur dari entitlement:
  `docs/superpowers/specs/2026-07-10-adat-kenangan-tier-spec-design.md`
