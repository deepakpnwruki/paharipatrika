import { Metadata } from 'next';

interface BuildMetadataProps {
  title: string;
  description: string;
  url: string;
  image?: string | null;
  publishedTime?: string | null;
  modifiedTime?: string | null;
  authorName?: string | null;
}

export function buildMetadata({
  title,
  description,
  url,
  image,
  publishedTime,
  modifiedTime,
  authorName,
}: BuildMetadataProps): Metadata {
  const siteName = process.env.SITE_NAME || 'EduNews';
  
  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: publishedTime ? 'article' : 'website',
      siteName,
      images: image ? [{
        url: image,
        width: 1200,
        height: 630,
        alt: title
      }] : [],
      publishedTime: publishedTime || undefined,
      modifiedTime: modifiedTime || undefined,
      authors: authorName ? [authorName] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
  };
}
