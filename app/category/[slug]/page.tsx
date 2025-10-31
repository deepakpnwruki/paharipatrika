import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { wpFetch } from '../../../lib/graphql';
import { CATEGORY_BY_SLUG_QUERY } from '../../../lib/queries';
import './category.css';

export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string }>;
};

function formatDate(dateString: string) {
  try {
    return new Intl.DateTimeFormat('hi-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

// Mobile meta like: "Author • 2 hrs ago"
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
  const { slug } = await params;
  
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
    const siteName = process.env.SITE_NAME || 'EduNews';
    const siteUrl = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
    const description = category.description || `${category.name} की ताज़ा खबरें, समाचार और अपडेट्स - ${siteName}`;

    return {
      title: `${category.name} समाचार | ${siteName}`,
      description,
      alternates: {
        canonical: `${siteUrl}${category.uri}`,
      },
      openGraph: {
        title: `${category.name} - Latest News & Updates`,
        description,
        url: `${siteUrl}${category.uri}`,
        type: 'website',
        siteName,
        locale: 'hi_IN',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${category.name} समाचार`,
        description,
      },
    };
  } catch (error) {
    return { title: 'Category not found' };
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  const data = await wpFetch<{ category: any }>(
    CATEGORY_BY_SLUG_QUERY,
    { slug },
    revalidate
  );

  if (!data?.category) {
    notFound();
  }

  const category = data.category;
  const posts = category.posts?.nodes ?? [];
  const siteUrl = (process.env.SITE_URL || '').replace(/\/$/, '');
  const firstPost = posts[0];
  const morePosts = posts.slice(1);

  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": category.name,
    "description": category.description || `${category.name} समाचार`,
    "url": `${siteUrl}${category.uri}`,
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "होम",
          "item": siteUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": category.name,
          "item": `${siteUrl}${category.uri}`
        }
      ]
    },
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": posts.map((post: any, index: number) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `${siteUrl}${post.uri || '/' + post.slug}`
      }))
    }
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />
      
      {/* Mobile-first category template */}
      <section className="catm" aria-label="mobile category" >
        <div className="catm-wrap">
          <div className="catm-bc">
            <Link href="/" className="catm-bc-home">Home</Link>
            <span className="catm-bc-sep">/</span>
            <span className="catm-bc-current">{category.name}</span>
          </div>
          <h1 className="catm-title">LATEST {category.name?.toUpperCase()} NEWS</h1>

          {firstPost && (
            <article className="catm-hero">
              {firstPost?.featuredImage?.node?.sourceUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="catm-hero-img"
                  src={firstPost.featuredImage.node.sourceUrl}
                  alt={firstPost.featuredImage.node.altText || firstPost.title}
                />
              )}
              <Link href={firstPost.uri || `/${firstPost.slug}`} className="catm-hero-link">
                <h2 className="catm-hero-title">{firstPost.title}</h2>
                <div className="catm-meta">
                  <span className="catm-author">{firstPost?.author?.node?.name || 'Staff'}</span>
                  <span aria-hidden className="dot">•</span>
                  <time className="catm-time" dateTime={firstPost.date}>{timeAgo(firstPost.date)}</time>
                </div>
              </Link>
            </article>
          )}

          <div className="catm-list" role="list">
            {morePosts.map((p: any) => (
              <Link role="listitem" href={p.uri || `/${p.slug}`} className="catm-item" key={p.slug}>
                {p?.featuredImage?.node?.sourceUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="catm-thumb"
                    src={p.featuredImage.node.sourceUrl}
                    alt={p.featuredImage.node.altText || p.title}
                    loading="lazy"
                  />
                )}
                <div className="catm-item-body">
                  <h3 className="catm-item-title">{p.title}</h3>
                  <div className="catm-meta small">
                    <span className="catm-author">{p?.author?.node?.name || 'Staff'}</span>
                    <span aria-hidden className="dot">•</span>
                    <time className="catm-time" dateTime={p.date}>{timeAgo(p.date)}</time>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <main className="category-page">
        <nav className="breadcrumb-nav" aria-label="breadcrumb">
          <div className="container">
            <ol className="breadcrumb-list">
              <li>
                <Link href="/">होम</Link>
              </li>
              <li aria-current="page">{category.name}</li>
            </ol>
          </div>
        </nav>

        <header className="category-header">
          <div className="container">
            <h1 className="category-title">{category.name}</h1>
            {category.description && (
              <p className="category-description">{category.description}</p>
            )}
            <div className="category-meta">
              <span className="post-count">{posts.length} लेख</span>
            </div>
          </div>
        </header>

        <section className="category-content">
          <div className="container">
            {posts.length === 0 ? (
              <div className="no-posts">
                <p>इस श्रेणी में कोई पोस्ट नहीं मिली।</p>
              </div>
            ) : (
              <div className="posts-grid">
                {posts.map((post: any, index: number) => (
                  <article key={post.slug} className={`post-card ${index === 0 ? 'featured' : ''}`}>
                    <Link href={post.uri || `/${post.slug}`} className="post-link">
                      {post.featuredImage?.node?.sourceUrl && (
                        <div className="post-image">
                          <img
                            src={post.featuredImage.node.sourceUrl}
                            alt={post.featuredImage.node.altText || post.title}
                            loading={index < 3 ? 'eager' : 'lazy'}
                            width={800}
                            height={450}
                          />
                        </div>
                      )}
                      <div className="post-content">
                        <div className="post-meta">
                          {post.categories?.nodes?.[0]?.name && (
                            <span className="post-category">{post.categories.nodes[0].name}</span>
                          )}
                          <time className="post-date" dateTime={post.date}>
                            {formatDate(post.date)}
                          </time>
                        </div>
                        <h2 className="post-title">{post.title}</h2>
                        {post.excerpt && (
                          <div 
                            className="post-excerpt"
                            dangerouslySetInnerHTML={{ 
                              __html: post.excerpt.replace(/<[^>]*>/g, '').substring(0, 150) + '...' 
                            }} 
                          />
                        )}
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
