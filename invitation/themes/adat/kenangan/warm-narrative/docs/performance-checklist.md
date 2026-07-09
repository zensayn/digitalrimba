# Warm Narrative Performance Checklist

Gunakan kondisi yang sama sebelum dan sesudah perubahan.

## Viewport

- Desktop: 1280×720
- Mobile: 390×844
- Uji normal motion dan `prefers-reduced-motion: reduce`

## Trace

1. Cold reload untuk LCP.
2. Buka envelope.
3. Mulai trace baru tanpa reload.
4. Scroll Cover sampai Closing.
5. Scroll balik Closing sampai Cover.

## DOM counters

Jalankan di posisi Cover dan Closing:

```js
({
  elements: document.querySelectorAll("*").length,
  images: document.images.length,
  inlineStyles: document.querySelectorAll("[style]").length,
  transforms: [...document.querySelectorAll("[style]")].filter(
    (el) => (el.getAttribute("style") || "").includes("transform"),
  ).length,
  willChange: [...document.querySelectorAll("[style]")].filter(
    (el) => (el.getAttribute("style") || "").includes("will-change"),
  ).length,
})
```

## Acceptance criteria

- Jumlah layer visual saat section terlihat tidak berubah.
- Pertumbuhan total DOM dari Cover ke Closing maksimal 10%.
- Pertumbuhan elemen gambar maksimal 15%.
- `will-change` maksimal 16 pada satu posisi.
- Tidak ada scene kosong saat scroll cepat atau reverse scroll.
- LCP tetap di bawah 2,5 detik.
- Tidak ada scroll task di atas 200 ms.
- `npm run test:perf-contract`, `npm run typecheck`, `npm run lint:source`,
  dan `npm run build` berhasil.
