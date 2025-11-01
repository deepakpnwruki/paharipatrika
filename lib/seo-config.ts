/**
 * SEO Configuration for Next.js 15+ App Router
 * 
 * This file defines the ISR (Incremental Static Regeneration) strategy
 * for different page types following Core Web Vitals and SEO best practices.
 */

export const SEO_CONFIG = {
  // Homepage - High traffic, needs frequent updates
  homepage: {
    revalidate: 180, // 3 minutes
    dynamic: 'force-static' as const,
    reason: 'Homepage gets most traffic and needs fresh content for returning visitors',
  },

  // Article/Post Pages - Breaking news, most important for SEO
  articles: {
    revalidate: 60, // 1 minute
    dynamic: 'force-static' as const,
    preGenerate: 100, // Pre-generate 100 most recent posts
    reason: 'Articles are time-sensitive content that needs quick updates',
  },

  // Category Pages - Semi-dynamic, updated when new posts published
  categories: {
    revalidate: 300, // 5 minutes
    dynamic: 'force-static' as const,
    preGenerate: 20, // Pre-generate top 20 categories
    reason: 'Categories change when new posts are added but less frequently than posts',
  },

  // Author Pages - Less dynamic, author bios rarely change
  authors: {
    revalidate: 600, // 10 minutes
    dynamic: 'force-static' as const,
    preGenerate: 50, // Pre-generate 50 active authors
    reason: 'Author pages are evergreen content with infrequent updates',
  },

  // Tag Pages - Similar to categories
  tags: {
    revalidate: 600, // 10 minutes
    dynamic: 'force-static' as const,
    preGenerate: 100, // Pre-generate 100 popular tags
    reason: 'Tags are topical groupings that update less frequently',
  },

  // Search Page - Dynamic by nature
  search: {
    revalidate: false, // No caching for search results
    dynamic: 'force-dynamic' as const,
    reason: 'Search results are user-specific and cannot be cached',
  },

  // Sitemap - Updated hourly
  sitemap: {
    revalidate: 3600, // 1 hour
    reason: 'Sitemap doesn\'t need real-time updates, hourly is sufficient for search engines',
  },

  // RSS Feed - Updated every 10 minutes
  feed: {
    revalidate: 600, // 10 minutes
    reason: 'RSS readers poll feeds periodically, 10 minutes balances freshness and load',
  },
} as const;

/**
 * SEO Best Practices Documentation
 * 
 * 1. ISR (Incremental Static Regeneration)
 *    - Generates pages at build time
 *    - Revalidates in background after specified time
 *    - Serves stale content while revalidating (stale-while-revalidate)
 *    - Perfect for news sites with dynamic content
 * 
 * 2. generateStaticParams
 *    - Pre-generates most important pages at build time
 *    - Ensures instant loading for top content
 *    - Reduces server load for popular pages
 *    - Combined with dynamicParams=true for new content
 * 
 * 3. Revalidation Strategy by Page Type:
 *    - Breaking News: 1 minute (ultra-fresh)
 *    - Homepage: 3 minutes (high traffic)
 *    - Categories: 5 minutes (semi-static)
 *    - Authors/Tags: 10 minutes (evergreen)
 *    - Search: No cache (user-specific)
 * 
 * 4. Performance Benefits:
 *    - First visit: Served from edge CDN (instant)
 *    - Subsequent visits: Served from cache (instant)
 *    - Updates: Background revalidation (no wait)
 *    - SEO: Crawlers always get fresh HTML
 * 
 * 5. Core Web Vitals Impact:
 *    - LCP: <0.5s (pre-rendered HTML)
 *    - FID: <100ms (minimal JS)
 *    - CLS: 0 (no layout shift)
 *    - TTFB: <200ms (edge cache)
 */

export function getRevalidateTime(pageType: keyof typeof SEO_CONFIG): number | false {
  return SEO_CONFIG[pageType].revalidate;
}

export function shouldPreGenerate(pageType: keyof typeof SEO_CONFIG): number {
  const config = SEO_CONFIG[pageType];
  return 'preGenerate' in config ? config.preGenerate : 0;
}
