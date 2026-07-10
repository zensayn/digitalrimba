import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'contents.rimba.app',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/dashboard/invitation",
        destination: "/dashboard/invitations/new",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
