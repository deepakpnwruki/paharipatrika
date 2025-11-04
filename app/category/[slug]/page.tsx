import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { wpFetch } from '../../../lib/graphql';
import { CATEGORY_BY_SLUG_QUERY } from '../../../lib/queries';
import { normalizeUrl, getPostUrl } from '../../../lib/url-helpers';
import './category-page.css';

export const revalidate = 300; // ISR: 5 minutes for category pages (semi-static)
export const dynamic = 'auto'; // Allow dynamic rendering for query params
export const dynamicParams = true; // Allow new categories

// Pre-generate top categories at build time
export async function generateStaticParams() {
  try {
    const data = await wpFetch<{ categories: { nodes: Array<{ slug: string }> } }>(
      `query TopCategories {
        categories(first: 20) {
          nodes {
            slug
          }
        }
      }`,
      {},
      3600
    );
    
    return (data?.categories?.nodes || []).map((cat) => ({
      slug: cat.slug,
    }));
  } catch {
    return [];
  }
}

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>; // page number for pagination
};

function timeAgo(dateString?: string) {
  if (!dateString) return '';
  const then = new Date(dateString).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes || 1} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hrs ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} wks ago`;
  const months = Math.floor(days / 30);
  return `${months} mo ago`;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const pageParam = (sp as Record<string, any>)["page"];
  const page = pageParam ? Number(pageParam) : 1;
  
  try {
    const data = await wpFetch<{ category: any }>(
      CATEGORY_BY_SLUG_QUERY,
      { slug },
      revalidate
    );
    if (!data?.category) {
      return { title: 'Category not found' };
    }
    const category = data.category;
    const seo = category.seo || {};
    return {
      title: seo.title || category.name,
      description: seo.metaDesc || category.description || '',
      alternates: {
        canonical: seo.canonical || '',
        languages: {
          'hi-IN': seo.canonical || '',
        }
      },
      robots: {
        index: seo.metaRobotsNoindex !== 'noindex',
        follow: seo.metaRobotsNofollow !== 'nofollow',
        googleBot: {
          index: seo.metaRobotsNoindex !== 'noindex',
          follow: seo.metaRobotsNofollow !== 'nofollow',
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      openGraph: {
        title: seo.opengraphTitle || category.name,
        description: seo.opengraphDescription || category.description || '',
        url: seo.canonical || '',
        type: 'website',
        siteName: process.env.SITE_NAME || 'Pahari Patrika',
        locale: 'hi_IN',
        images: seo.opengraphImage?.sourceUrl ? [{ url: seo.opengraphImage.sourceUrl }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: seo.twitterTitle || category.name,
        description: seo.twitterDescription || category.description || '',
        images: seo.twitterImage?.sourceUrl ? [seo.twitterImage.sourceUrl] : [],
      },
    };
  } catch {
    return { title: 'Category not found' };
  }
}

export default async function CategoryPage() {
  // TODO: Implement category page UI
  return <main className="category-page">Category page works!</main>;
}
