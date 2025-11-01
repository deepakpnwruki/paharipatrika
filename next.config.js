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
      // Allow AdSense scripts
      `script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://adservice.google.com https://www.googletagmanager.com${isProd ? '' : " 'unsafe-eval'"}`,
      "connect-src * https://pagead2.googlesyndication.com",
      "font-src 'self' data:",
      "object-src 'none'",
      // Allow AdSense iframes
      "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
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
    WP_FETCH_TIMEOUT_MS: '5000',
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

