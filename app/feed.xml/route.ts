import { NextResponse } from 'next/server';
import { wpFetch } from '../../lib/graphql';
import { LATEST_POSTS_QUERY } from '../../lib/queries';

export const revalidate = 600; // 10 minutes

export async function GET() {
  const siteUrl = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

  try {
    const data = await wpFetch<{ posts: { nodes: Array<{
      title: string;
      slug: string;
      uri?: string;
      date: string;
      excerpt?: string;
      author?: { node?: { name?: string } };
      featuredImage?: { node?: { sourceUrl?: string; altText?: string } };
    }> } }>(LATEST_POSTS_QUERY, {}, 600, 'rss');

    const posts = data?.posts?.nodes || [];

    const itemsXml = posts.slice(0, 20).map((p) => {
      const url = p.uri ? `${siteUrl}${p.uri}` : `${siteUrl}/${p.slug}`;
      const title = escapeXml(p.title || 'Post');
      const desc = escapeXml(stripHtml(p.excerpt || ''));
      const pubDate = new Date(p.date).toUTCString();
  return `\n    <item>\n      <title>${title}</title>\n      <link>${url}</link>\n      <guid isPermaLink="true">${url}</guid>\n      <pubDate>${pubDate}</pubDate>\n      <description>${desc}</description>\n    </item>`;
    }).join('\n');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>${escapeXml(process.env.SITE_NAME || 'EduNews')}</title>\n    <link>${siteUrl}</link>\n    <description>${escapeXml('Latest news and updates')}</description>\n    <language>hi-IN</language>\n    ${itemsXml}\n  </channel>\n</rss>`;

    return new NextResponse(rss, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
  } catch {
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>${escapeXml(process.env.SITE_NAME || 'EduNews')}</title>\n    <link>${siteUrl}</link>\n    <description>${escapeXml('Latest news and updates')}</description>\n    <language>hi-IN</language>\n  </channel>\n</rss>`;
    return new NextResponse(fallback, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
  }
}

function stripHtml(html?: string) {
  return (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
function escapeXml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
