import { Metadata } from 'next';

interface BuildMetadataProps {
  title: string;
  description: string;
  url: string;
  image?: string | null;
  publishedTime?: string | null;
  modifiedTime?: string | null;
  authorName?: string | null;
  keywords?: string[];
  articleSection?: string;
}

export function buildMetadata({
  title,
  description,
  url,
  image,
  publishedTime,
  modifiedTime,
  authorName,
  keywords = [],
  articleSection,
}: BuildMetadataProps): Metadata {
  const siteName = process.env.SITE_NAME || 'Pahari Patrika';
  
  // Enhanced meta description with keywords for SGE
  const enhancedDescription = description.length > 155 
    ? description.slice(0, 155) + '...' 
    : description;
  
  return {
    title,
    description: enhancedDescription,
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    alternates: {
      canonical: url,
    },
    // Enhanced robots for SGE/AEO
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title,
      description: enhancedDescription,
      url,
      type: publishedTime ? 'article' : 'website',
      siteName,
      locale: 'hi_IN',
      images: image ? [{
        url: image,
        width: 1200,
        height: 630,
        alt: title
      }] : [],
      // Article-specific OG tags for E-E-A-T
      ...(publishedTime && {
        publishedTime,
        modifiedTime: modifiedTime || publishedTime,
        authors: authorName ? [authorName] : [],
        section: articleSection,
        tags: keywords,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: enhancedDescription,
      images: image ? [image] : [],
      creator: authorName ? `@${authorName.replace(/\s+/g, '')}` : undefined,
    },
    // Additional meta tags for AEO/GEO
    other: {
      ...(publishedTime && { 'article:published_time': publishedTime }),
      ...(modifiedTime && { 'article:modified_time': modifiedTime }),
      ...(authorName && { 'article:author': authorName }),
      ...(articleSection && { 'article:section': articleSection }),
      ...(keywords.length > 0 && { 'article:tag': keywords.join(',') }),
    },
  };
}

// Generate dynamic meta description optimized for featured snippets
export function generateSEODescription(content: string, keywords: string[] = []): string {
  // Remove HTML tags
  const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Try to extract first sentence or paragraph
  const firstSentence = plainText.match(/^[^।.!?]+[।.!?]/)?.[0] || plainText.slice(0, 160);
  
  // Include primary keyword if available
  if (keywords.length > 0 && !firstSentence.toLowerCase().includes(keywords[0].toLowerCase())) {
    return `${keywords[0]}: ${firstSentence}`.slice(0, 155) + '...';
  }
  
  return firstSentence.slice(0, 155) + (firstSentence.length > 155 ? '...' : '');
}
