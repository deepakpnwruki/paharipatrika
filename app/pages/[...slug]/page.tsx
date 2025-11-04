import { notFound, redirect } from 'next/navigation';
import { wpFetch } from '../../../lib/graphql';
import { PAGE_BY_URI_QUERY, POST_BY_URI_QUERY } from '../../../lib/queries';
import { normalizeUrl } from '../../../lib/url-helpers';
import type { Metadata } from 'next';

export const revalidate = 300;

function candidates(segments: string[]) {
  // WordPress pages use URIs like /about/, /contact/, not /pages/about/
  const joined = '/' + segments.join('/');
  const c = new Set<string>();
  c.add(joined);
  c.add(joined.endsWith('/') ? joined : joined + '/');
  c.add(joined.toLowerCase());
  c.add((joined.toLowerCase().endsWith('/') ? joined.toLowerCase() : joined.toLowerCase() + '/'));
  return Array.from(c);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const p = await params;
  const slug = p.slug || [];
  const uris = candidates(slug);
  
  for (const uri of uris) {
    try {
      const data = await wpFetch<any>(PAGE_BY_URI_QUERY, { uri }, revalidate, `page:${uri}`);
      if (data?.page) {
        const site = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
        const canonical = `${site}${normalizeUrl(data.page.uri)}`;
        const description = (data.page?.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160) || data.page.title;
        return {
          title: `${data.page.title} | ${process.env.SITE_NAME || 'Pahari Patrika'}`,
          description,
          alternates: { canonical },
          openGraph: {
            title: data.page.title,
            description,
            url: canonical,
            type: 'website',
            siteName: process.env.SITE_NAME || 'Pahari Patrika',
            locale: 'hi_IN',
          },
          twitter: {
            card: 'summary_large_image',
            title: data.page.title,
            description,
          },
        };
      }
    } catch {}
  }
  return { title: 'Page Not Found' };
}

export default async function PageRoute({ params }: { params: Promise<{ slug: string[] }> }) {
  const p = await params;
  const slug = p.slug || [];
  const uris = candidates(slug);
  
  let page: any = null;

  // First try to find as a page
  for (const uri of uris) {
    try {
      const data = await wpFetch<any>(PAGE_BY_URI_QUERY, { uri }, revalidate, `page:${uri}`);
      if (data?.page) {
        page = data.page;
        break;
      }
    } catch {
      // Continue to next URI
    }
  }

  // If not found as page, check if it's a post and redirect
  if (!page) {
    for (const uri of uris) {
      try {
        const data = await wpFetch<any>(POST_BY_URI_QUERY, { uri }, revalidate, `post:${uri}`);
        if (data?.post) {
          // Redirect to the post route (without /pages/ prefix)
          redirect(`/${slug.join('/')}`);
        }
      } catch {
        // Continue
      }
    }
  }
  
  if (!page) {
    console.error(`Page not found for slugs: ${slug.join('/')}, tried URIs: ${uris.join(', ')}`);
    notFound();
  }

  return (
    <main className="en-page">
      <div className="container en-page-content">
        <h1 className="en-page-title">{page.title}</h1>
        <div className="en-page-body" dangerouslySetInnerHTML={{ __html: page.content }} />
      </div>
    </main>
  );
}
