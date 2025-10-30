import { notFound, redirect } from 'next/navigation';
import { wpFetch } from '../../../lib/graphql';
import { PAGE_BY_URI_QUERY, POST_BY_URI_QUERY } from '../../../lib/queries';
import type { Metadata } from 'next';

export const revalidate = Number(process.env.REVALIDATE_SECONDS ?? 300);

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
        return {
          title: data.page.title,
          description: data.page.title, // fallback since no seo.metaDesc
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
  let isPost = false;

  // First try to find as a page
  for (const uri of uris) {
    try {
      const data = await wpFetch<any>(PAGE_BY_URI_QUERY, { uri }, revalidate, `page:${uri}`);
      if (data?.pageBy) {
        page = data.pageBy;
        break;
      }
    } catch (e) {
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
      } catch (e) {
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
