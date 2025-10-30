import { Metadata } from 'next';
import { SEOData } from '../lib/seo';

interface SEOHeadProps {
  seoData: SEOData;
  structuredData?: any[];
}

export function generateMetadata(seoData: SEOData): Metadata {
  return {
    title: seoData.title,
    description: seoData.description,
    openGraph: {
      title: seoData.ogTitle,
      description: seoData.ogDescription,
      url: seoData.canonical,
      type: seoData.ogType,
      images: seoData.ogImage ? [{ url: seoData.ogImage }] : [],
      publishedTime: seoData.publishedTime,
      modifiedTime: seoData.modifiedTime,
      authors: seoData.author ? [seoData.author] : [],
      tags: seoData.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: seoData.ogTitle,
      description: seoData.ogDescription,
      images: seoData.ogImage ? [seoData.ogImage] : [],
    },
    alternates: {
      canonical: seoData.canonical,
    },
  };
}

export function StructuredData({ data }: { data: any[] }) {
  return (
    <>
      {data.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
      ))}
    </>
  );
}
