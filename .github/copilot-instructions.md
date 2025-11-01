# Copilot Instructions for Pahari Patrika (edunes-next)

## Project Overview
Next.js 15+ headless WordPress news platform using App Router, WPGraphQL, TypeScript, and ISR for optimal performance. Hindi-first news site with extensive SEO/E-E-A-T optimization and AdSense monetization.

## Architecture

### Data Flow: Headless WordPress → WPGraphQL → Next.js ISR
- WordPress backend (not in repo) exposes WPGraphQL endpoint
- `lib/graphql.ts`: Single `wpFetch()` function handles ALL GraphQL requests with retry logic, timeout, and ISR tags
- `lib/queries.ts`: All GraphQL query strings (posts, categories, authors, tags, pages)
- Pages use ISR with different revalidation times based on content type (see `lib/seo-config.ts`)

### Critical Pattern: URI Resolution
The catch-all route `app/[...slug]/page.tsx` handles Posts, Pages, and Categories through multi-step resolution:
1. Try `NODE_BY_URI_QUERY` with URI variations (with/without trailing slash, decoded, lowercase)
2. Fallback to `POST_BY_URI_QUERY` and `PAGE_BY_URI_QUERY`
3. Special case: detect category URLs (e.g., `/category/slug`) and use `CATEGORY_BY_SLUG_QUERY`
4. This complexity exists because WordPress URIs can vary in format

### ISR Strategy (Critical for Performance)
**Every page MUST define these three exports:**
```typescript
export const revalidate = 60; // seconds - varies by page type
export const dynamic = 'force-static'; // Use ISR
export const dynamicParams = true; // Allow new content
```

**Revalidation Times by Route:**
- Articles (`[...slug]`): 60s (breaking news)
- Homepage: 180s (high traffic)
- Categories: 300s (semi-static)
- Authors/Tags: 600s (evergreen)
- Search: `force-dynamic` (no cache)

**Pre-generation at Build:**
- Articles: `generateStaticParams()` pre-builds last 100 posts
- Categories: Top 20 categories
- Authors: Active 50 authors
- See `lib/seo-config.ts` for strategy documentation

## Essential Developer Workflows

### Environment Setup
```bash
npm install
cp .env.example .env.local
# Edit .env.local with WP_GRAPHQL_ENDPOINT
npm run dev
```

### Key Environment Variables (see `next.config.js`)
- `WP_GRAPHQL_ENDPOINT` or `WORDPRESS_GRAPHQL_ENDPOINT`: WordPress GraphQL URL
- `SITE_URL` / `NEXT_PUBLIC_SITE_URL`: Production domain
- `REVALIDATE_SECONDS`: Default ISR time (300s)
- `WP_FETCH_TIMEOUT_MS`: GraphQL timeout (15000ms)
- `WP_FETCH_RETRIES`: Retry attempts (3)
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID`: Google AdSense client ID

### Build & Deploy
```bash
npm run build          # Production build
npm start             # Production server
npm run lint          # ESLint check
npm run type-check    # TypeScript validation
```

**Build Errors:** If WordPress is unreachable, build fails. Increase timeouts in `.env` or ensure WordPress is accessible.

## Project-Specific Conventions

### Component Structure
- **Client Components:** Marked `'use client'` - SocialEmbeds, EmbedProcessor, ArticleContentWithAds, ShareButtons
- **Server Components:** Default - all page routes, SEOHead, Header, Footer
- Never add `'use client'` to page routes - breaks ISR

### Content Processing Pipeline (Articles Only)
1. **WordPress → Raw HTML**: Content comes as HTML string
2. **Table Wrapping**: `wrapTables()` wraps `<table>` in `.table-wrapper` for responsive scrolling
3. **Ad Injection**: `insertAdsInContent()` inserts `.article-ad-slot` divs every 2 paragraphs
4. **Client-Side Processing**:
   - `EmbedProcessor`: Converts YouTube/Twitter oEmbed links to actual embeds
   - `SocialEmbeds`: Loads Twitter widget script with retry logic (loads 6 times with increasing delays)
   - `ArticleContentWithAds`: Dynamically injects AdSense ads into `.article-ad-slot` placeholders

### Styling Approach
- **Global Styles**: `app/globals.css` (reset, utilities, base typography)
- **Route-Specific CSS**: Co-located with pages (`article.css`, `homepage.css`, `category-page.css`)
- **Component CSS**: Inline styles in TSX for dynamic values
- **No CSS-in-JS library**: Just plain CSS modules pattern

### Image Handling
- Always use `next/image` with `fill` for responsive images
- `sizes` prop MUST be specified for optimal performance
- Example: `sizes="(max-width: 768px) 100vw, 768px"`
- Use `priority` for above-the-fold images (hero, first 3 posts)
- `unoptimized: true` in `next.config.js` - images served as-is from WordPress

### SEO & Structured Data
- Every route generates `Metadata` via `generateMetadata()` with OpenGraph, Twitter Cards
- Article pages include NewsArticle schema, breadcrumb schema, and author info
- Hindi locale: `hi_IN` for OpenGraph, `hi-IN` for HTML lang
- Canonical URLs MUST NOT have trailing slash (enforced in `next.config.js` redirects)

### Author Social Links
WordPress author `url` field is checked first for social links. The pattern in `app/[...slug]/page.tsx`:
```typescript
const authorUrl = authorNode?.url || '';
const authorTwitter = authorUrl.includes('twitter.com') || authorUrl.includes('x.com') ? authorUrl : undefined;
```
This is a workaround because WPGraphQL doesn't expose custom user meta by default.

## Integration Points

### WordPress Plugin Dependencies
1. **WPGraphQL** (required): Exposes GraphQL endpoint
2. **WPGraphQL for ACF** (optional): If custom fields needed
3. **Custom PHP** (`scripts/wp-graphql-user-social.php`): Extends WPGraphQL schema for author social links (not implemented by default)

### External Services
- **Google AdSense**: Loaded in `layout.tsx`, ads injected client-side
- **Twitter Widgets**: Script loaded in `layout.tsx` with `strategy="lazyOnload"`
- **YouTube Embeds**: Processed client-side by `EmbedProcessor`

### Cross-Component Communication
- **No state management library**: Props and URL params only
- **Sidebar Data**: Related posts fetched in article page, passed as props to sidebar sections
- **Header Categories**: Fetched once in `layout.tsx`, passed to `Header` component

## Common Pitfalls

### 1. ISR Not Working
- Check all three exports are present: `revalidate`, `dynamic`, `dynamicParams`
- Don't add `'use client'` to page routes
- Verify `next: { revalidate, tags }` in `wpFetch()` calls

### 2. Twitter Embeds Not Rendering
- `SocialEmbeds` component MUST be in page (triggers widget load)
- `EmbedProcessor` converts oEmbed links to blockquotes
- Twitter script loads with 6 retry attempts (1s, 2s, 3s, 5s, 7s, 10s delays)
- Check browser console for `twttr.widgets.load()` calls

### 3. Build Failing on Missing Posts
- `generateStaticParams()` filters out invalid URIs
- If WordPress returns null/undefined URIs, build breaks
- Always use `data?.posts?.nodes || []` with fallback

### 4. AdSense Not Showing
- Verify `NEXT_PUBLIC_ADSENSE_CLIENT_ID` is set
- AdSense needs production domain (localhost won't show ads)
- Check `.article-ad-slot` divs are inserted (view page source)

### 5. Metadata Not Updating
- Metadata is generated at build/revalidation time
- Changes to `generateMetadata()` require rebuild or wait for ISR revalidation
- Use `canonical` URLs without trailing slash

## Key Files Reference

- **`lib/graphql.ts`**: Retry logic, timeout, ISR tags - NEVER fetch outside this
- **`lib/seo-config.ts`**: ISR strategy documentation and constants
- **`app/[...slug]/page.tsx`**: 600+ lines - URI resolution, metadata, article rendering, sidebar logic
- **`next.config.js`**: Security headers (CSP, HSTS), env vars, image config, redirects
- **`components/EmbedProcessor.tsx`**: YouTube/Twitter oEmbed processing
- **`components/SocialEmbeds.tsx`**: Twitter widget loading with retry
- **`app/layout.tsx`**: Root layout with organization/website schema, header/footer

## Testing & Debugging

### Local Development
- Use `npm run dev` - Turbopack HMR is fast
- Test ISR: Build (`npm run build`), then start (`npm start`), check revalidation with timestamp

### Production Checklist
- Verify `.env.production` has correct `SITE_URL` and `WP_GRAPHQL_ENDPOINT`
- Test build: `npm run build` should pre-generate 100+ posts
- Check Lighthouse: Target 95+ score (ISR + static generation)
- Validate structured data: Google Rich Results Test

### Debug Commands
```bash
# Check TypeScript errors
npm run type-check

# Analyze bundle size
ANALYZE=true npm run build

# Check all GraphQL queries are working
curl -X POST $WP_GRAPHQL_ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{"query": "{ posts(first: 1) { nodes { title } } }"}'
```

## Code Examples

### Adding a New Route with ISR
```typescript
// app/new-route/page.tsx
export const revalidate = 300; // 5 minutes
export const dynamic = 'force-static';
export const dynamicParams = true;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'New Route',
    // ... metadata
  };
}

export default async function NewRoute() {
  const data = await wpFetch<ResponseType>(
    QUERY_STRING,
    { variables },
    revalidate,
    'unique-tag'
  );
  
  return <div>{/* JSX */}</div>;
}
```

### Adding a New GraphQL Query
```typescript
// lib/queries.ts
export const NEW_QUERY = `
  query NewQuery($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      title
      # ... fields
    }
  }
`;

// Usage in page
const data = await wpFetch<{ post: PostType }>(
  NEW_QUERY,
  { slug: 'example' },
  revalidate
);
```

### Processing WordPress Content
```typescript
// Always sanitize and process HTML from WordPress
function wrapTables(content: string): string {
  return content
    .replace(/<table([^>]*)>/gi, '<div class="table-wrapper"><table$1>')
    .replace(/<\/table>/gi, '</table></div>');
}

const processedContent = wrapTables(node.content);
```

---

**Last Updated:** 2025-11-02  
**For Questions:** Check docs in root: `PRODUCTION_READINESS.md`, `SEO_IMPLEMENTATION.md`, `SOCIAL_EMBEDS_GUIDE.md`
