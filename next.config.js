const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.BUNDLE_ANALYZE === 'both',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
    unoptimized: true
  },
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';
    const csp = [
      "default-src 'self'",
      "img-src * data: blob:",
      "media-src * data: blob:",
      "style-src 'self' 'unsafe-inline'",
      // in prod drop 'unsafe-eval' to harden; keep in dev for HMR/tooling
      `script-src 'self' 'unsafe-inline'${isProd ? '' : " 'unsafe-eval'"}`,
      "connect-src *",
      "font-src 'self' data:",
      "object-src 'none'",
      "frame-ancestors 'self'"
    ].join('; ');

    const headers = [
      { key: 'Content-Security-Policy', value: csp },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=(), payment=()' },
      // HSTS (only effective over HTTPS)
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }
    ];

    return [
      {
        source: '/:path*',
        headers
      }
    ];
  },
  async redirects() {
    return [
      {
        source: '/pages/:slug*',
        destination: '/:slug*',
        permanent: true,
      },
    ];
  },

  trailingSlash: true,
  serverExternalPackages: ['graphql'],
  typescript: {
    ignoreBuildErrors: false,
  },
  env: {
    // Ensure both keys are available to the app/runtime
    WP_GRAPHQL_ENDPOINT: process.env.WORDPRESS_GRAPHQL_ENDPOINT || process.env.WP_GRAPHQL_ENDPOINT,
    WORDPRESS_GRAPHQL_ENDPOINT: process.env.WORDPRESS_GRAPHQL_ENDPOINT,
    SITE_NAME: process.env.SITE_NAME || 'EduNews',
    SITE_URL: process.env.SITE_URL || 'https://edunews.com',
    ORGANIZATION_NAME: process.env.ORGANIZATION_NAME || 'EduNews Media',
    NEXT_PUBLIC_SITE_URL: process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://edunews.com',
  },
  reactStrictMode: true,
  compress: true,
  productionBrowserSourceMaps: false,
};

module.exports = withBundleAnalyzer(nextConfig);
