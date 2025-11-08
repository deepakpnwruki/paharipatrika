import { wpFetch } from '../../lib/graphql';

/**
 * Google News Sitemap
 * Following Google News guidelines (2024/2025)
 * - Only articles published in the last 2 days
 * - Maximum 1000 URLs per sitemap
 * - Must include: publication name, date, title
 * - Optional but recommended: keywords (up to 10)
 * - Language tag (hi for Hindi)
 */

const NEWS_SITEMAP_QUERY = `
  query NewsSitemap {
    posts(first: 1000, where: {
      orderby: {field: DATE, order: DESC}
      dateQuery: {
        after: {
          year: YEAR_PLACEHOLDER
          month: MONTH_PLACEHOLDER  
          day: DAY_PLACEHOLDER
        }
      }
    }) {
      nodes {
        id
        title
        uri
        date
        modified
        excerpt
        categories(first: 3) {
          nodes {
            name
          }
        }
        tags(first: 10) {
          nodes {
            name
          }
        }
      }
    }
  }
`;

interface Post {
  id: string;
  title: string;
  uri: string;
  date: string;
  modified: string;
  excerpt: string;
  categories?: {
    nodes: Array<{ name: string }>;
  };
  tags?: {
    nodes: Array<{ name: string }>;
  };
}

function getTwoDaysAgo() {
  const date = new Date();
  date.setDate(date.getDate() - 2);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function extractKeywords(post: Post): string[] {
  const keywords: string[] = [];
  
  // Add categories as keywords
  if (post.categories?.nodes) {
    post.categories.nodes.forEach(cat => {
      if (cat.name && keywords.length < 10) {
        keywords.push(cat.name);
      }
    });
  }
  
  // Add tags as keywords (up to 10 total)
  if (post.tags?.nodes && keywords.length < 10) {
    post.tags.nodes.forEach(tag => {
      if (tag.name && keywords.length < 10) {
        keywords.push(tag.name);
      }
    });
  }
  
  return keywords;
}

export async function GET() {
  const siteUrl = (process.env.SITE_URL || 'https://paharipatrika.in').replace(/\/$/, '');
  const siteName = process.env.SITE_NAME || 'Pahari Patrika';
  const publicationLanguage = 'hi'; // Hindi language code
  
  try {
    // Get date 2 days ago for filtering
    const twoDaysAgo = getTwoDaysAgo();
    
    // Replace placeholders in query
    const query = NEWS_SITEMAP_QUERY
      .replace('YEAR_PLACEHOLDER', twoDaysAgo.year.toString())
      .replace('MONTH_PLACEHOLDER', twoDaysAgo.month.toString())
      .replace('DAY_PLACEHOLDER', twoDaysAgo.day.toString());

    const data = await wpFetch<{
      posts: { nodes: Post[] };
    }>(query, {}, 600); // Cache for 10 minutes

    const posts = data?.posts?.nodes || [];

    // Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

    posts.forEach((post) => {
      if (!post.uri || !post.title || !post.date) return;

      const url = `${siteUrl}${post.uri}`;
      const title = escapeXml(post.title);
      const publicationDate = new Date(post.date).toISOString();
      
      // Get keywords (max 10)
      const keywords = extractKeywords(post);
      const keywordsString = keywords.length > 0 
        ? `    <news:keywords>${escapeXml(keywords.join(', '))}</news:keywords>\n`
        : '';

      xml += `
  <url>
    <loc>${escapeXml(url)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(siteName)}</news:name>
        <news:language>${publicationLanguage}</news:language>
      </news:publication>
      <news:publication_date>${publicationDate}</news:publication_date>
      <news:title>${title}</news:title>
${keywordsString}    </news:news>
  </url>`;
    });

    xml += '\n</urlset>';

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=600, s-maxage=600', // Cache for 10 minutes
      },
    });
  } catch {
  // ...existing code...
    
    // Return minimal valid sitemap on error
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
</urlset>`;

    return new Response(errorXml, {
      status: 500,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  }
}

// Revalidate every 10 minutes
export const revalidate = 600;
export const dynamic = 'force-static';
