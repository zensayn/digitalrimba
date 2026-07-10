# Kenangan · Kategori Adat

> **Tier 1 — Basic · Rp 150rb**
> Setiap momen jadi kenangan.

Setiap subfolder di bawah ini adalah tema desain yang mandiri (Next.js app tersendiri).

**Pembeda tier:** section yang berhak muncul, bukan estetika maupun motion.
Selengkapnya di `DESIGN_SPEC.md`.

---

## Tema yang Tersedia

| Folder | Tema | Aesthetic | Status |
|--------|------|-----------|--------|
| `warm-narrative/` | Warm Narrative | Warm Parchment + Copper — editorial, bertekstur | ✅ Active |

---

## Cara Menjalankan Tema

```bash
cd <nama-tema>
bun dev
# → http://localhost:3000
```

---

## Panduan Menambah Tema Baru

1. Buat folder baru: `mkdir nama-tema`
2. Init Next.js: `cd nama-tema && bun x create-next-app@latest ./`
3. Buat `DESIGN_SPEC.md` tema — palet, tipografi, kosakata motion
4. Daftarkan tema di `scripts/sync-shared.ts`, `router/src/index.ts`,
   `router/wrangler.jsonc`, dan `TemplateSelector.tsx`
5. Tambahkan baris baru di tabel di atas
