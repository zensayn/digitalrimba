# Kisah · Kategori Adat

## Design Specification (Tier)

> **Tier 2 — Standard · Rp 300rb**
> "Terangkai dalam kisah."

Spec ini mendefinisikan **karakter tier Kisah**, bukan satu tema tertentu.
Palet, tipografi, dan kosakata motion adalah milik tema — lihat `DESIGN_SPEC.md`
di folder tema masing-masing.

---

### Karakter Tier

Tier tengah. Kisah memberi ruang bagi cerita: perjalanan pasangan, galeri
kenangan, dan dua sesi acara yang berdiri sendiri-sendiri.

**Pembeda tier = section yang berhak muncul.** Tier tidak menyentuh estetika
maupun motion. Sebuah tema bebas memakai parallax, partikel, atau WebGL di tier
mana pun; yang dibatasi tier hanyalah daftar section yang aktif.

---

### Entitlement Section

Sumber kebenaran: `DESIGN_SYSTEM.md` §4.2. Kisah mencakup seluruh entitlement
Kenangan, ditambah:

| Section | Isi |
|---------|-----|
| `lovestory` | Perjalanan pasangan |
| `gallery` | Galeri foto maksimal 25 foto, plus maksimal satu video |

"Sesi Akad dan Resepsi terpisah" pada `DESIGN_SYSTEM.md` §4.2 bukan section
tambahan, melainkan **dua undangan terpisah**: satu untuk tamu akad, satu untuk
tamu resepsi. Di Kenangan keduanya digabung dalam satu undangan. Section `akad`
dan `resepsi` sendiri sudah berhak muncul sejak Kenangan.

Di luar section, Kisah menambah custom lagu (upload sendiri), ikon acara custom,
dan masa aktif dua tahun.

---

### Yang Tidak Berhak Muncul di Kisah

| Section | Milik tier |
|---------|------------|
| `dresscode` | Warisan |

Galeri unlimited, Kirim Kado, Turut Mengundang, dan Rundown juga milik Warisan.

---

### Yang Didukung Tema ≠ Yang Termasuk Paket

Sebuah tema boleh merender lebih banyak section daripada yang berhak muncul pada
tier ini. Entitlement menyaringnya saat runtime lewat `sections.enabled`.
Kelebihan kemampuan tema bukan pelanggaran tier.

---

### Tema di Tier Ini

| Folder | Tema | Aesthetic | Status |
|--------|------|-----------|--------|
| — | — | — | belum ada |

---

### Referensi

- Entitlement per paket: `DESIGN_SYSTEM.md` §4
- Token semantik bersama: `DESIGN_SYSTEM.md` §8.1
- Alasan tier diukur dari entitlement:
  `docs/superpowers/specs/2026-07-10-adat-kenangan-tier-spec-design.md`
