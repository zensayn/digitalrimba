import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tambahkan IP local dev jika perlu test dari device lain di jaringan yang sama
  // allowedDevOrigins: ["192.168.x.x"],
  turbopack: {
    root: __dirname,
  },

  // ── Kompresi & Performa ──────────────────────────────────────────────────
  compress: true,

  // ── Optimasi Gambar ──────────────────────────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 tahun
    remotePatterns: [
      { protocol: "https", hostname: "assets-themes.rimba.io" },
      { protocol: "https", hostname: "pub-eb7353f7b67c4ec3b1c5d6d82cf29169.r2.dev" },
      { protocol: "https", hostname: "pub-ba3f4c2f41c847219cf24b0bfe7524a4.r2.dev" },
    ],
  },

  // ── Response Headers ─────────────────────────────────────────────────────
  // Guard: hanya aktif di production — dev mode butuh kontrol caching
  // sendiri agar hot-reload (HMR) berjalan normal.
  async headers() {
    if (process.env.NODE_ENV !== "production") return [];
    return [
      {
        // Cache aset statis Next.js selamanya (hash di nama file)
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Aset public/ TIDAK memakai hash di nama file, jadi jangan pernah
        // "immutable" — file yang diganti dengan nama sama akan tersangkut di
        // cache browser/CDN sampai setahun. 1 hari + SWR aman untuk aset tema.
        source: "/:path*.(webp|png|jpg|jpeg|svg|woff2|woff)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
