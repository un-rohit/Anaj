import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  transpilePackages: ['@anaj/shared-types', '@anaj/shared-validation'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.anaj.example.com',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
