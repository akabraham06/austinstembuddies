/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**', // Allow all paths in storage
      }
    ],
    formats: ['image/avif', 'image/webp'],
    contentDispositionType: 'attachment',
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/studio',
        permanent: true,
      },
    ]
  },
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.(heic|HEIC)$/i,
      type: 'asset/resource',
    });
    return config;
  },
}

module.exports = nextConfig 