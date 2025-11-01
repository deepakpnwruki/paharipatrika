import { MetadataRoute } from 'next';
import { wpFetch } from '../lib/graphql';

const SITEMAP_QUERY = `
  query SitemapData {
    posts(first: 1000) {
      nodes {
        uri
        modified
        date
      }
    }
    pages(first: 100) {
      nodes {
        uri
        modified
        date
      }
    }
    categories(first: 100) {
      nodes {
        uri
      }
    }
    tags(first: 100) {
      nodes {
        slug
      }
    }
  }
`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.SITE_URL || 'https://paharipatrika.in').replace(/\/$/, '');
  
  try {
    const data = await wpFetch<{
      posts: { nodes: Array<{ uri: string; modified: string; date: string }> };
      pages: { nodes: Array<{ uri: string; modified: string; date: string }> };
      categories: { nodes: Array<{ uri: string }> };
      tags: { nodes: Array<{ slug: string }> };
    }>(SITEMAP_QUERY);

    const posts = (data?.posts?.nodes || []).map((post) => ({
      url: `${siteUrl}${post.uri}`,
      lastModified: new Date(post.modified || post.date),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

    const pages = (data?.pages?.nodes || []).map((page) => ({
      url: `${siteUrl}${page.uri}`,
      lastModified: new Date(page.modified || page.date),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    const categories = (data?.categories?.nodes || []).map((category) => ({
      url: `${siteUrl}${category.uri}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

    // AEO/GEO: Include tag pages for topical authority
    const tags = (data?.tags?.nodes || []).map((tag) => ({
      url: `${siteUrl}/tag/${tag.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }));

    return [
      {
        url: siteUrl,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 1.0,
      },
      // Key pages for E-E-A-T
      {
        url: `${siteUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.9,
      },
      {
        url: `${siteUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      ...posts,
      ...pages,
      ...categories,
      ...tags,
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return [
      {
        url: siteUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
    ];
  }
}

export const revalidate = 3600; // Revalidate every hour
