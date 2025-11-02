/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
    unoptimized: true,
    // Enable experimental optimizations
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['react', 'react-dom'],
  },
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';
    const csp = [
      "default-src 'self'",
      "img-src * data: blob:",
      "media-src * data: blob:",
      "style-src 'self' 'unsafe-inline'",
      // Allow AdSense and Twitter scripts
      `script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://adservice.google.com https://www.googletagmanager.com https://platform.twitter.com${isProd ? '' : " 'unsafe-eval'"}`,
      // Allow connections to CMS, AdSense, and Twitter endpoints
      "connect-src * https://pagead2.googlesyndication.com https://platform.twitter.com https://syndication.twitter.com",
      "font-src 'self' data:",
      "object-src 'none'",
      // Allow AdSense, Twitter widgets, and YouTube iframes
      "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://platform.twitter.com https://www.youtube.com https://www.youtube-nocookie.com",
      "frame-ancestors 'self'"
    ].join('; ');

    const headers = [
      { key: 'Content-Security-Policy', value: csp },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=(), payment=()' },
      // HSTS (only effective over HTTPS)
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      // Performance headers
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
      { key: 'Cache-Control', value: 'public, max-age=300, stale-while-revalidate=600' }
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
  serverExternalPackages: ['graphql'],
  typescript: {
    ignoreBuildErrors: false,
  },
  env: {
    // Ensure both keys are available to the app/runtime
    WP_GRAPHQL_ENDPOINT: process.env.WORDPRESS_GRAPHQL_ENDPOINT || process.env.WP_GRAPHQL_ENDPOINT,
    WORDPRESS_GRAPHQL_ENDPOINT: process.env.WORDPRESS_GRAPHQL_ENDPOINT,
    SITE_NAME: process.env.SITE_NAME || 'Pahari Patrika',
    SITE_URL: process.env.SITE_URL || 'https://paharipatrika.in',
    ORGANIZATION_NAME: process.env.ORGANIZATION_NAME || 'Pahari Patrika Media',
    NEXT_PUBLIC_SITE_URL: process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://paharipatrika.in',
    // Keep both names aligned; graphql.ts reads WP_GRAPHQL_TIMEOUT_MS first
    WP_FETCH_TIMEOUT_MS: process.env.WP_FETCH_TIMEOUT_MS || '7000',
    WP_GRAPHQL_TIMEOUT_MS: process.env.WP_GRAPHQL_TIMEOUT_MS || process.env.WP_FETCH_TIMEOUT_MS || '7000',
    WP_FETCH_RETRIES: '2',
    REVALIDATE_SECONDS: '300',
  },
  reactStrictMode: true,
  compress: true,
  productionBrowserSourceMaps: false,
  // Optimize for production
  poweredByHeader: false,
};

module.exports = nextConfig;

