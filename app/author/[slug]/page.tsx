import { wpFetch } from '../../../lib/graphql';
import { AUTHOR_BY_SLUG_QUERY, AUTHOR_POST_COUNT_QUERY } from '../../../lib/queries';
// ...existing code...
// import { getPostUrl } from '../../../lib/url-helpers';
// import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import AuthorPostsList from '../../../components/AuthorPostsList';
import './author.css';

export const revalidate = 600; // ISR: 10 minutes for author pages
export const dynamic = 'force-static'; // Static generation with Load More
export const dynamicParams = true;

// Pre-generate top authors at build time
export async function generateStaticParams() {
  try {
    const data = await wpFetch<{ users: { nodes: Array<{ slug: string }> } }>(
      `query TopAuthors {
        users(first: 50, where: { hasPublishedPosts: [POST] }) {
          nodes {
            slug
          }
        }
      }`,
      {},
      3600
    );
    
    return (data?.users?.nodes || []).map((user) => ({
      slug: user.slug,
    }));
  } catch {
    return [];
  }
}

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;
  
  try {
    const data = await wpFetch<{ user: any }>(AUTHOR_BY_SLUG_QUERY, { slug, first: 1 }, 300);
    const author = data?.user;
    
    if (!author) {
      return { title: 'Author Not Found' };
    }
    
    const siteUrl = (process.env.SITE_URL || 'https://paharipatrika.in').replace(/\/$/, '');
    const authorUrl = `${siteUrl}/author/${slug}`;
    const description = author.description || `Read articles by ${author.name}, journalist at ${process.env.ORGANIZATION_NAME || 'Pahari Patrika Media'}`;
    
    return {
      title: `${author.name} - ${process.env.ORGANIZATION_NAME || 'Pahari Patrika Media'}`,
      description,
      alternates: { 
        canonical: authorUrl,
        languages: {
          'hi-IN': authorUrl,
        }
      },
      authors: [{ name: author.name, url: authorUrl }],
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      openGraph: {
        title: author.name,
        description,
        url: authorUrl,
        type: 'profile',
        locale: 'hi_IN',
        siteName: process.env.ORGANIZATION_NAME || 'Pahari Patrika Media',
        images: author.avatar?.url ? [{
          url: author.avatar.url,
          width: 400,
          height: 400,
          alt: author.name
        }] : [],
      },
      twitter: {
        card: 'summary',
        title: author.name,
        description,
        images: author.avatar?.url ? [author.avatar.url] : [],
      },
    };
  } catch {
    return { title: 'Author Not Found' };
  }
}

export default async function AuthorPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const postsPerPage = 20;
  
  let error: string | null = null;
  let author: any = null;
  let initialPosts: any[] = [];
  let hasNextPage = false;
  let endCursor: string | null = null;
  let totalCount = 0;

  if (!slug || typeof slug !== 'string') {
    error = 'Author not found.';
  } else {
    // Fetch total count by paginating through all posts (WordPress limits to 100 per query)
    try {
      const allPostIds: string[] = [];
      let afterCursor: string | null = null;
      let hasMore: boolean = true;
      let iterations = 0;
      const maxIterations = 50; // Safety limit: max 5000 posts (50 * 100)

      while (hasMore && iterations < maxIterations) {
        const batchData: { user: any } = await wpFetch<{ user: any }>(
          AUTHOR_POST_COUNT_QUERY,
          { slug, first: 100, after: afterCursor },
          revalidate
        );
        
        const posts = batchData?.user?.posts?.nodes || [];
        allPostIds.push(...posts.map((p: any) => p.id));
        
        hasMore = batchData?.user?.posts?.pageInfo?.hasNextPage || false;
        afterCursor = batchData?.user?.posts?.pageInfo?.endCursor || null;
        iterations++;
      }
      
      totalCount = allPostIds.length;
    } catch (e) {
      console.error('Failed to fetch author post count:', e);
      totalCount = 0;
    }

    // Then get the first page of posts
    let data: { user: any } | null = null;
    try {
      data = await wpFetch<{ user: any }>(
        AUTHOR_BY_SLUG_QUERY,
        { slug, first: postsPerPage, after: null },
        revalidate
      );
    } catch {
      error = 'Author not found.';
    }
    if (!error && (!data?.user)) {
      error = 'Author not found.';
    }
    if (!error && data?.user) {
      author = data.user;
      initialPosts = author.posts?.nodes || [];
      hasNextPage = author.posts?.pageInfo?.hasNextPage || false;
      endCursor = author.posts?.pageInfo?.endCursor || null;
    }
  }

  if (error) {
    return <div>{error}</div>;
  }

  // Only Yoast schema will be injected via generateMetadata. No static or custom schema here.

  return (
    <main className="author-page">
      {/* Only Yoast schema will be injected via generateMetadata. */}
      <section className="author-hero">
        <div className="author-avatar">
          {author.avatar?.url && (
            <span className="author-img-border">
              <div style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden' }}>
                <Image 
                  src={author.avatar.url} 
                  alt={author.name} 
                  fill
                  sizes="120px"
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>
            </span>
          )}
        </div>
        <div className="author-info">
          <h1 className="author-name">{author.name}</h1>
          <span className="author-articles-count">
            {totalCount > 0 ? `${totalCount} Article${totalCount !== 1 ? 's' : ''}` : `${initialPosts.length} Article${initialPosts.length !== 1 ? 's' : ''}`}
          </span>
        </div>
      </section>

      <section className="author-about">
        <div className="author-about-heading-row">
          <span className="author-about-title">ABOUT AUTHOR</span>
        </div>
        <div className="author-about-divider" />
        <div className="author-bio">{author.description || 'No bio available.'}</div>
        <div className="author-social-row">
          {author.facebookUrl && (
            <a href={author.facebookUrl} className="author-social-icon" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <span className="author-social-fb">f</span>
            </a>
          )}
          {author.linkedinUrl && (
            <a href={author.linkedinUrl} className="author-social-icon" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <span className="author-social-li">in</span>
            </a>
          )}
          {author.twitterUrl && (
            <a href={author.twitterUrl} className="author-social-icon" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <span className="author-social-tw">𝕏</span>
            </a>
          )}
        </div>
      </section>

      <section className="author-articles-list-section">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.2rem', width: '100%' }}>
          <span style={{ fontSize: '1.08rem', fontWeight: 900, letterSpacing: '0.01em', color: '#111', textTransform: 'uppercase', marginTop: 0, marginLeft: 0, whiteSpace: 'nowrap', lineHeight: 1 }}>
            Articles by Author
          </span>
          <span style={{ flex: 1, height: 4, background: '#e5736a', borderRadius: 2, marginLeft: 18, display: 'block' }} />
        </div>
        
        {initialPosts.length === 0 ? (
          <div className="author-no-articles">No articles found.</div>
        ) : (
          <AuthorPostsList
            initialPosts={initialPosts}
            hasNextPage={hasNextPage}
            endCursor={endCursor}
            authorSlug={slug}
          />
        )}
      </section>
    </main>
  );
}
