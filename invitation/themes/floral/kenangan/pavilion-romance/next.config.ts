import type { NextConfig } from "next";

if (process.env.NODE_ENV === "development") {
  void import("@opennextjs/cloudflare").then((cf) => cf.initOpenNextCloudflareForDev());
}

const nextConfig: NextConfig = {
  // Tambahkan IP local dev jika perlu test dari device lain di jaringan yang sama
  // allowedDevOrigins: ["192.168.x.x"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
