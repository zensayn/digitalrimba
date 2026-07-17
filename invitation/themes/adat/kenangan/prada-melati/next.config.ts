import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },

  compress: true,

  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 tahun
    remotePatterns: [{ protocol: "https", hostname: "assets-themes.rimba.io" }],
  },

  // Guard: hanya aktif di production — dev mode butuh kontrol caching
  // sendiri agar hot-reload berjalan normal.
  async headers() {
    if (process.env.NODE_ENV !== "production") return [];
    return [
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // Aset public/ tidak memakai hash di nama file, jadi jangan pernah
        // "immutable" — file yang diganti dengan nama sama akan tersangkut di
        // cache sampai setahun.
        source: "/:path*.(webp|png|jpg|jpeg|svg|woff2|woff)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },
};

export default nextConfig;
