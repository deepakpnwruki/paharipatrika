/**
 * Ensure consistent URL formatting with trailing slash for non-file paths.
 * - Preserves query/hash
 * - Does NOT add slash for file-like paths (e.g., .html posts)
 */
export function normalizeUrl(url: string): string {
  if (!url) return '/';
  // If absolute URL is passed, split to operate on path portion only
  try {
    if (/^https?:\/\//i.test(url)) {
      const u = new URL(url);
      const normalizedPath = normalizeUrl(u.pathname + (u.search || '') + (u.hash || ''));
      return `${u.origin}${normalizedPath}`;
    }
  } catch {}

  // Separate path from query/hash
  const qIndex = url.indexOf('?');
  const hIndex = url.indexOf('#');
  const cut = [qIndex === -1 ? Infinity : qIndex, hIndex === -1 ? Infinity : hIndex].reduce((a, b) => Math.min(a, b), Infinity);
  let path = cut === Infinity ? url : url.slice(0, cut);
  const suffix = cut === Infinity ? '' : url.slice(cut);

  if (!path) path = '/';

  // If path looks like a file (has an extension), don't add trailing slash
  const isFile = /\.[a-z0-9]+$/i.test(path);
  if (!isFile) {
    if (!path.endsWith('/')) path += '/';
    // Collapse multiple slashes except protocol
    path = path.replace(/([^:])\/\/+/, '$1/');
  }

  return path + suffix;
}

/**
 * Get post URL from WordPress post data
 */
export function getPostUrl(post: any): string {
  // Prefer WordPress-provided URI; otherwise construct from slug with .html suffix (new permalink)
  const uri = post?.uri || (post?.slug ? `/${post.slug}.html` : '/');
  return normalizeUrl(uri);
}

/**
 * Get category URL from WordPress category data
 */
export function getCategoryUrl(category: any): string {
  const uri = category?.uri || `/category/${category?.slug || ''}`;
  return normalizeUrl(uri);
}

/**
 * Get tag URL from WordPress tag data
 */
export function getTagUrl(tag: any): string {
  const uri = tag?.uri || `/tag/${tag?.slug || ''}`;
  return normalizeUrl(uri);
}
