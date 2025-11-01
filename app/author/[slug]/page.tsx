import { wpFetch } from '../../../lib/graphql';
import { AUTHOR_BY_SLUG_QUERY } from '../../../lib/queries';
import { generateAuthorProfileSchema } from '../../../lib/structured-data';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import './author.css';

export const revalidate = 600; // ISR: 10 minutes for author pages (less dynamic)
export const dynamic = 'force-static';
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
      alternates: { canonical: authorUrl },
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
  // Next.js 15+: params is always a Promise
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  let error: string | null = null;
  let author: any = null;
  let posts: any[] = [];

  if (!slug || typeof slug !== 'string') {
    error = 'Author not found.';
  } else {
    let data: { user: any } | null = null;
    try {
      data = await wpFetch<{ user: any }>(
        AUTHOR_BY_SLUG_QUERY,
        { slug, first: 20 },
        300
      );
    } catch {
      error = 'Author not found.';
    }
    if (!error && (!data?.user)) {
      error = 'Author not found.';
    }
    if (!error && data?.user) {
      author = data.user;
      posts = author.posts?.nodes || [];
    }
  }

  if (error) {
    return <div>{error}</div>;
  }

  const siteUrl = (process.env.SITE_URL || 'https://edunews.com').replace(/\/$/, '');
  const authorSchema = generateAuthorProfileSchema(author, siteUrl);

  return (
    <main className="author-page">
      {/* E-E-A-T: Author structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(authorSchema) }}
      />
      
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
          <div className="author-name">{author.name}</div>
          <span className="author-articles-count">{posts.length} Articles</span>
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
          {author.xUrl && (
            <a href={author.xUrl} className="author-social-icon" target="_blank" rel="noopener noreferrer" aria-label="X">
              <span className="author-social-x">X</span>
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
        <div className="author-articles-list">
          {posts.length === 0 ? (
            <div className="author-no-articles">No articles found.</div>
          ) : (
            posts.map((post: any) => (
              <div className="author-article-card" key={post.slug} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem', borderRadius: 12, background: '#fff', boxShadow: 'none', padding: '0 0 0.5rem 0' }}>
                <div className="author-article-content" style={{ flex: '1 1 0%', minWidth: 0 }}>
                  <Link href={post.uri || `/${post.slug}`} className="author-article-title" style={{ fontSize: '1.18rem', fontWeight: 700, color: '#111', textDecoration: 'none', marginBottom: '0.3rem', display: 'block', lineHeight: 1.3 }}>
                    {post.title}
                  </Link>
                  <div className="author-article-meta" style={{ color: '#b0b0b0', fontSize: '0.98rem', marginTop: '0.2rem' }}>
                    <span>{timeAgo(post.date)}</span>
                  </div>
                </div>
                {post.featuredImage?.node?.sourceUrl && (
                  <div className="author-article-image-wrapper" style={{ flexShrink: 0, width: 100, height: 100, borderRadius: '0 18px 0 0', overflow: 'hidden', background: '#eee', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="author-article-image"
                      src={post.featuredImage.node.sourceUrl}
                      alt={post.featuredImage.node.altText || post.title}
                      width={100}
                      height={100}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0 18px 0 0', display: 'block' }}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}