import { MetadataRoute } from 'next';
import { wpFetch } from '../lib/graphql';

const SITEMAP_QUERY = `
  query SitemapData {
    posts(first: 1000) {
      nodes {
        uri
        modified
      }
    }
    pages(first: 100) {
      nodes {
        uri
        modified
      }
    }
    categories(first: 100) {
      nodes {
        uri
      }
    }
  }
`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.SITE_URL || 'https://edunews.com').replace(/\/$/, '');
  
  try {
    const data = await wpFetch<{
      posts: { nodes: Array<{ uri: string; modified: string }> };
      pages: { nodes: Array<{ uri: string; modified: string }> };
      categories: { nodes: Array<{ uri: string }> };
    }>(SITEMAP_QUERY);

    const posts = (data?.posts?.nodes || []).map((post) => ({
      url: `${siteUrl}${post.uri}`,
      lastModified: new Date(post.modified),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

    const pages = (data?.pages?.nodes || []).map((page) => ({
      url: `${siteUrl}${page.uri}`,
      lastModified: new Date(page.modified),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    const categories = (data?.categories?.nodes || []).map((category) => ({
      url: `${siteUrl}${category.uri}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

    return [
      {
        url: siteUrl,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 1.0,
      },
      ...posts,
      ...pages,
      ...categories,
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

export const revalidate = 60; // Revalidate every minute for news freshness
