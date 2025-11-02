import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { wpFetch } from '../../../lib/graphql';
import { CATEGORY_BY_SLUG_QUERY } from '../../../lib/queries';
import { normalizeUrl, getPostUrl } from '../../../lib/url-helpers';
import './category-page.css';

export const revalidate = 300; // ISR: 5 minutes for category pages (semi-static)
export const dynamic = 'auto'; // Allow dynamic rendering for query params
export const dynamicParams = true; // Allow new categories

// Pre-generate top categories at build time
export async function generateStaticParams() {
  try {
    const data = await wpFetch<{ categories: { nodes: Array<{ slug: string }> } }>(
      `query TopCategories {
        categories(first: 20) {
          nodes {
            slug
          }
        }
      }`,
      {},
      3600
    );
    
    return (data?.categories?.nodes || []).map((cat) => ({
      slug: cat.slug,
    }));
  } catch {
    return [];
  }
}

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>; // page number for pagination
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

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const pageParam = (sp as Record<string, any>)["page"];
  const page = pageParam ? Number(pageParam) : 1;
  
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
    const siteName = process.env.SITE_NAME || 'Pahari Patrika';
    const siteUrl = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const categoryUrl = `${siteUrl}${normalizeUrl(category.uri)}`;
  const pageUrl = page > 1 ? `${categoryUrl}?page=${page}` : categoryUrl;
    const description = category.description || `${category.name} की ताज़ा खबरें, समाचार और अपडेट्स - ${siteName}`;
    const titleWithPage = page > 1 ? `${category.name} समाचार - पेज ${page} | ${siteName}` : `${category.name} समाचार | ${siteName}`;

    return {
      title: titleWithPage,
      description,
      alternates: {
        canonical: pageUrl,
        languages: {
          'hi-IN': pageUrl,
        }
      },
      robots: {
        // Only index page 1, noindex pagination pages
        index: page === 1,
        follow: true,
        googleBot: {
          index: page === 1,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      openGraph: {
        title: `${category.name} - Latest News & Updates`,
        description,
        url: pageUrl,
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
  } catch {
    return { title: 'Category not found' };
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  // ...existing code...
  const { slug } = await params;
  const sp = await searchParams;
  // Safely extract 'page' from searchParams (string index signature)
  const pageParam = (sp as Record<string, any>)["page"];
  const page = pageParam ? Number(pageParam) : 1;
  const postsPerPage = 20;

  // For cursor-based pagination, we need to get the cursor for the requested page
  // We'll fetch page by page until we reach the desired page
  let afterCursor: string | null = null;
  
  if (page > 1) {
    // Fetch previous pages to get to the correct cursor
    for (let i = 1; i < page; i++) {
      const prevData: { category: any } = await wpFetch(
        CATEGORY_BY_SLUG_QUERY,
        { slug, first: postsPerPage, after: afterCursor },
        revalidate
      );
      afterCursor = prevData?.category?.posts?.pageInfo?.endCursor || null;
      if (!afterCursor) break; // No more pages
    }
  }

  const data = await wpFetch<{ category: any }>(
    CATEGORY_BY_SLUG_QUERY,
    { slug, first: postsPerPage, after: afterCursor },
    revalidate
  );

  if (!data?.category) {
    notFound();
  }

  const category = data.category;
  const posts = category.posts?.nodes ?? [];
  const _pageInfo = category.posts?.pageInfo;
  const totalPosts = category.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalPosts / postsPerPage));
  const siteUrl = (process.env.SITE_URL || '').replace(/\/$/, '');
  const _firstPost = posts[0];
  const _morePosts = posts.slice(1);

  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": category.name,
    "description": category.description || `${category.name} समाचार`,
  "url": `${siteUrl}${normalizeUrl(category.uri)}`,
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
          "item": `${siteUrl}${normalizeUrl(category.uri)}`
        }
      ]
    },
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": posts.map((post: any, index: number) => {
        const img = post?.featuredImage?.node?.sourceUrl as string | undefined;
        const absoluteImg = img
          ? (/^https?:\/\//i.test(img) ? img : `${siteUrl}${img.startsWith('/') ? '' : '/'}${img}`)
          : undefined;
        return {
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Article",
            "url": `${siteUrl}${getPostUrl(post)}`,
            "name": post.title,
            ...(absoluteImg ? { "image": absoluteImg } : {})
          }
        };
      })
    }
  });

  // SEO pagination rel links
  const canonicalUrl = page === 1 ? `${siteUrl}${category.uri}` : `${siteUrl}${category.uri}?page=${page}`;
  const prevUrl = page > 1 ? (page === 2 ? `${siteUrl}${category.uri}` : `${siteUrl}${category.uri}?page=${page - 1}`) : null;
  const nextUrl = page < totalPages ? `${siteUrl}${category.uri}?page=${page + 1}` : null;

  return (
    <>
  {/** Canonical/prev/next are managed via generateMetadata; avoid manual <link> tags to prevent stale head elements across navigations. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />
      
      <main className="category-page">
        <div className="category-container">
          {/* Breadcrumb */}
          <nav className="cat-breadcrumb" aria-label="breadcrumb">
            <Link href="/" className="cat-breadcrumb__link">Home</Link>
            <span className="cat-breadcrumb__sep">/</span>
            <span className="cat-breadcrumb__current">{category.name}</span>
          </nav>

          {/* Page Title with Red Line */}
          <div className="cat-header">
            <h1 className="cat-header__title">{category.name.toUpperCase()}</h1>
            <div className="cat-header__line"></div>
            {totalPosts > 0 && (
              <p className="cat-header__count" style={{ fontSize: '0.9rem', color: '#666', marginTop: '8px' }}>
                {totalPosts} {totalPosts === 1 ? 'Article' : 'Articles'}
                {page > 1 && ` - Page ${page} of ${totalPages}`}
              </p>
            )}
          </div>

          {posts.length === 0 ? (
            <div className="cat-no-posts">
              <p>No posts found in this category.</p>
            </div>
          ) : (
            <div className="cat-posts">
              {posts.map((post: any, index: number) => {
                const isFirst = index === 0;
                return (
                  <article key={post.slug} className={`cat-post ${isFirst ? 'cat-post--featured' : ''}`}>
                    <Link href={getPostUrl(post)} className="cat-post__link">
                      {post.featuredImage?.node?.sourceUrl && (
                        <div className="cat-post__image">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={post.featuredImage.node.sourceUrl}
                            alt={post.featuredImage.node.altText || post.title}
                            loading={index < 3 ? 'eager' : 'lazy'}
                          />
                        </div>
                      )}
                      <div className="cat-post__content">
                        <h2 className="cat-post__title">{post.title}</h2>
                        <div className="cat-post__meta">
                          <span className="cat-post__author">
                            {post?.author?.node?.name || 'Staff'}
                          </span>
                          <span className="cat-post__dot">•</span>
                          <time className="cat-post__time" dateTime={post.date}>
                            {timeAgo(post.date)}
                          </time>
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="cat-pagination" aria-label="Pagination">
              {/* Previous button */}
              {page > 1 && (
                <Link
                  href={page === 2 ? normalizeUrl(category.uri) : `${normalizeUrl(category.uri)}?page=${page - 1}`}
                  className="cat-pagination__btn cat-pagination__prev"
                  aria-label="Previous page"
                >
                  ‹
                </Link>
              )}

              {/* Page numbers */}
              {(() => {
                const maxPages = 5;
                let start = Math.max(1, page - Math.floor(maxPages / 2));
                let end = start + maxPages - 1;
                if (end > totalPages) {
                  end = totalPages;
                  start = Math.max(1, end - maxPages + 1);
                }
                
                return Array.from({ length: end - start + 1 }, (_, i) => {
                  const pageNum = start + i;
                  const isCurrent = pageNum === page;
                  const href = pageNum === 1 ? normalizeUrl(category.uri) : `${normalizeUrl(category.uri)}?page=${pageNum}`;
                  return (
                    <Link
                      key={pageNum}
                      href={href}
                      className={`cat-pagination__page${isCurrent ? ' cat-pagination__page--current' : ''}`}
                      style={{ 
                        color: '#fff', 
                        background: isCurrent ? '#ff4d4f' : 'transparent', 
                        borderRadius: '4px', 
                        padding: '0.2em 0.7em', 
                        margin: '0 2px', 
                        fontWeight: isCurrent ? 700 : 400 
                      }}
                      aria-current={isCurrent ? 'page' : undefined}
                    >
                      {pageNum}
                    </Link>
                  );
                });
              })()}

              {/* Next button */}
              {page < totalPages && (
                <Link
                  href={`${normalizeUrl(category.uri)}?page=${page + 1}`}
                  className="cat-pagination__btn cat-pagination__next"
                  aria-label="Next page"
                >
                  ›
                </Link>
              )}
            </nav>
          )}
        </div>
      </main>
    </>
  );
}
