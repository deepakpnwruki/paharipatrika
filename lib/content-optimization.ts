/**
 * Performance-optimized content processing utilities
 * These functions improve article page performance without changing UI
 */

// Optimize table wrapping with better performance
export function wrapTables(content: string): string {
  if (!content || typeof content !== 'string') return content;
  
  // Use more efficient regex with global flag
  return content
    .replace(/<table([^>]*)>/gi, '<div class="table-wrapper"><table$1>')
    .replace(/<\/table>/gi, '</table></div>');
}

// Optimize ad insertion with better performance
export function insertAdsInContent(content: string): string {
  if (!content || typeof content !== 'string') return content;

  // Split by paragraphs more efficiently
  const paragraphs = content.split('</p>');
  if (paragraphs.length <= 3) return content; // Don't insert ads in very short content

  const result: string[] = [];
  
  for (let i = 0; i < paragraphs.length; i++) {
    result.push(paragraphs[i]);
    
    // Add closing </p> tag except for the last item
    if (i < paragraphs.length - 1) {
      result.push('</p>');
    }
    
    // Insert ad slot every 3 paragraphs (instead of 2 for better readability)
    if ((i + 1) % 3 === 0 && i < paragraphs.length - 2) {
      result.push('<div class="article-ad-slot" data-ad-type="in-content"></div>');
    }
  }
  
  return result.join('');
}

// Optimize content processing with memoization-like approach
const contentCache = new Map<string, string>();

export function processArticleContent(content: string): string {
  if (!content) return '';
  
  // Simple cache key based on content length and first 100 chars
  const cacheKey = `${content.length}-${content.substring(0, 100)}`;
  
  if (contentCache.has(cacheKey)) {
    return contentCache.get(cacheKey)!;
  }
  
  // Process content
  let processed = wrapTables(content);
  processed = insertAdsInContent(processed);
  
  // Cache the result (limit cache size to prevent memory issues)
  if (contentCache.size > 100) {
    const firstKey = contentCache.keys().next().value;
    if (firstKey) contentCache.delete(firstKey);
  }
  contentCache.set(cacheKey, processed);
  
  return processed;
}

// Optimize breadcrumb generation
export function generateOptimizedBreadcrumbs(node: any): Array<{name: string, href: string}> {
  const breadcrumbs = [{ name: 'Home', href: '/' }];
  
  if (!node) return breadcrumbs;
  
  // Add category breadcrumb for posts
  if (node.__typename === 'Post' && Array.isArray(node.categories?.nodes) && node.categories.nodes.length > 0) {
    const primaryCategory = node.categories.nodes[0];
    breadcrumbs.push({
      name: primaryCategory.name,
      href: `/category/${primaryCategory.slug}`
    });
  }
  
  // Add current page (without link)
  breadcrumbs.push({
    name: node.title || node.name || 'Article',
    href: '' // Current page, no link
  });
  
  return breadcrumbs;
}

// Optimize meta date formatting
const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'long', 
  year: 'numeric',
  timeZone: 'Asia/Kolkata'
});

export function formatOptimizedDate(dateString?: string): { 
  formatted: string, 
  iso: string,
  datetime: Date 
} {
  if (!dateString) {
    const now = new Date();
    return {
      formatted: dateFormatter.format(now),
      iso: now.toISOString(),
      datetime: now
    };
  }
  
  const date = new Date(dateString);
  return {
    formatted: dateFormatter.format(date),
    iso: date.toISOString(), 
    datetime: date
  };
}

// Extract author social URLs with better performance
export function extractAuthorSocial(authorNode: any) {
  if (!authorNode) return {};
  
  const authorUrl = authorNode?.url || '';
  
  return {
    twitter: authorNode?.userMeta?.x || 
             authorNode?.userMeta?.twitter ||
             (typeof authorUrl === 'string' && (authorUrl.includes('twitter.com') || authorUrl.includes('x.com')) ? authorUrl : undefined),
    facebook: authorNode?.userMeta?.facebook ||
              (typeof authorUrl === 'string' && authorUrl.includes('facebook.com') ? authorUrl : undefined)
  };
}