/**
 * Static Categories Configuration
 * 
 * This eliminates the need for API calls in layout.tsx for navigation.
 * Update this file when you add/remove main categories.
 */

export const STATIC_CATEGORIES = [
  { name: 'Politics', slug: 'politics' },
  { name: 'Sports', slug: 'sports' },
  { name: 'Business', slug: 'business' },
  { name: 'Technology', slug: 'technology' },
  { name: 'Entertainment', slug: 'entertainment' },
  { name: 'Health', slug: 'health' },
  { name: 'Education', slug: 'education' },
  { name: 'Local News', slug: 'local-news' },
] as const;

export type StaticCategory = typeof STATIC_CATEGORIES[number];

/**
 * Usage Instructions:
 * 
 * 1. Replace the dynamic categories fetch in layout.tsx with this static list
 * 2. Update this list when you add/remove main categories
 * 3. This eliminates 1 API call on every page load
 * 4. Categories still work dynamically on category pages via slug resolution
 */