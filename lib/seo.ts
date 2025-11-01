export interface SEOData {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
}

export function generateSEOData(
  post: any,
  type: 'post' | 'page' | 'category' = 'page'
): SEOData {
  const siteUrl = process.env.SITE_URL || 'https://paharipatrika.in';
  const siteName = process.env.SITE_NAME || 'Pahari Patrika';
  
  const title = post?.title || post?.name || 'Page';
  const description = post?.excerpt || post?.description || `${title} - ${siteName}`;
  const slug = post?.slug || post?.uri || '';
  
  return {
    title: `${title} | ${siteName}`,
    description: description.replace(/<[^>]*>/g, '').substring(0, 160),
    canonical: `${siteUrl}${slug}`,
    ogTitle: title,
    ogDescription: description.replace(/<[^>]*>/g, '').substring(0, 160),
    ogImage: post?.featuredImage?.node?.sourceUrl || `${siteUrl}/og-image.jpg`,
    ogType: type === 'post' ? 'article' : 'website',
    publishedTime: post?.date,
    modifiedTime: post?.modified,
    author: post?.author?.node?.name,
    tags: post?.tags?.nodes?.map((tag: any) => tag.name) || [],
  };
}
