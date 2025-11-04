import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { wpFetch } from '../../../lib/graphql';
import { TAG_BY_SLUG_QUERY } from '../../../lib/queries';
import { normalizeUrl } from '../../../lib/url-helpers';
import TagPostsList from '../../../components/TagPostsList';
import './tag-page.css';

type TagPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ page?: string }>; // Make optional since we're not using pagination
};

export const revalidate = 600; // ISR: 10 minutes for tag pages
export const dynamic = 'force-static'; // Use ISR
export const dynamicParams = true;

// Pre-generate popular tags at build time
export async function generateStaticParams() {
  try {
    const data = await wpFetch<{ tags: { nodes: Array<{ slug: string }> } }>(
      `query PopularTags {
        tags(first: 100) {
          nodes {
            slug
          }
        }
      }`,
      {},
      3600
    );
    
    return (data?.tags?.nodes || []).map((tag) => ({
      slug: tag.slug,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const data = await wpFetch<{ tag: any }>(TAG_BY_SLUG_QUERY, { slug, first: 20 }, revalidate);
    const tag = data?.tag;
    
    if (!tag) return { title: 'Tag Not Found' };
    
    const site = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
    const tagUrl = `${site}${normalizeUrl(`/tag/${slug}`)}`;
    const description = tag.description || `Articles tagged with ${tag.name} - Latest news and updates`;
    const titleText = `${tag.name} | ${process.env.SITE_NAME || 'Pahari Patrika'}`;

    return {
      title: titleText,
      description,
      alternates: { 
        canonical: tagUrl,
        languages: {
          'hi-IN': tagUrl,
        }
      },
      robots: {
        // NOINDEX all tag pages to avoid duplicate content issues
        // Tags typically duplicate category/article content
        index: false,
        follow: true,
        googleBot: {
          index: false,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      openGraph: {
        title: tag.name,
        description,
        url: tagUrl,
        type: 'website',
        siteName: process.env.SITE_NAME || 'Pahari Patrika',
        locale: 'hi_IN',
      },
      twitter: {
        card: 'summary_large_image',
        title: tag.name,
        description,
      },
    };
  } catch {
    return { title: 'Tag Not Found' };
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const postsPerPage = 20;

  let tag: any = null;
  try {
    const data = await wpFetch<{ tag: any }>(
      TAG_BY_SLUG_QUERY, 
      { slug, first: postsPerPage }, 
      revalidate
    );
    tag = data?.tag;
  } catch (error) {
    console.error('Error fetching tag:', error);
  }
  
  if (!tag) notFound();
  
  const posts = tag.posts?.nodes || [];
  const hasNextPage = tag.posts?.pageInfo?.hasNextPage || false;
  const endCursor = tag.posts?.pageInfo?.endCursor || null;
  const totalPosts = tag.count || 0;
  const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
  
  // Format tag name for display (uppercase)
  const tagNameDisplay = (tag.name || '').replace(/\b\w/g, (l: string) => l.toUpperCase());
  
  // Only Yoast schema will be injected via generateMetadata. No static or custom schema here.
  
  return (
    <>
      {/* Only Yoast schema will be injected via generateMetadata. */}
      
      <main className="es-tag-page">
      {/* Header Section */}
      <section className="es-tag-header">
        <div className="es-tag-header__inner">
          <h1 className="es-tag-header__title">{tagNameDisplay}</h1>
          {totalPosts > 0 && (
            <p style={{ fontSize: '0.9rem', color: '#999', marginTop: '8px', textAlign: 'center' }}>
              {totalPosts} {totalPosts === 1 ? 'Article' : 'Articles'}
            </p>
          )}
        </div>
      </section>
      
      {/* Content Section */}
      <section className="es-tag-content">
        <div className="es-tag-content__inner">
          <h2 className="es-tag-content__subtitle">
            {tagNameDisplay} NEWS
          </h2>
          <p className="es-tag-content__desc">
            Stories About lastest news
          </p>
          <p className="es-tag-content__date">
            {new Intl.DateTimeFormat('en-US', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            }).format(new Date())}
          </p>
          
          {/* Posts with Load More */}
          {posts.length > 0 ? (
            <TagPostsList
              initialPosts={posts}
              hasNextPage={hasNextPage}
              endCursor={endCursor}
              tagSlug={slug}
              siteUrl={site}
            />
          ) : (
            <p className="es-tag-empty">No articles found for this tag.</p>
          )}
        </div>
      </section>
      </main>
    </>
  );
}
