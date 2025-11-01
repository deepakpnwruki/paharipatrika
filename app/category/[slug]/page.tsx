import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { wpFetch } from '../../../lib/graphql';
import { CATEGORY_BY_SLUG_QUERY } from '../../../lib/queries';
import './category-page.css';

export const revalidate = 300; // ISR: 5 minutes for category pages (semi-static)
export const dynamic = 'force-static'; // Force static generation
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
  searchParams: Promise<{ after?: string }>; // use 'after' for cursor-based pagination
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
    const siteName = process.env.SITE_NAME || 'Pahari Patrika';
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
  const postsPerPage = 10;

  // To get the correct 'after' cursor for the requested page, fetch all previous endCursors
  let afterCursor: string | null = null;
  if (page > 1) {
    let lastCursor: string | null = null;
    for (let i = 1; i < page; i++) {
      const prevData: { category: any } = await wpFetch(
        CATEGORY_BY_SLUG_QUERY,
        { slug, first: postsPerPage, after: lastCursor },
        revalidate
      );
      lastCursor = prevData?.category?.posts?.pageInfo?.endCursor || null;
    }
    afterCursor = lastCursor;
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

  // SEO pagination rel links
  const canonicalUrl = page === 1 ? `${siteUrl}${category.uri}` : `${siteUrl}${category.uri}?page=${page}`;
  const prevUrl = page > 1 ? (page === 2 ? `${siteUrl}${category.uri}` : `${siteUrl}${category.uri}?page=${page - 1}`) : null;
  const nextUrl = page < totalPages ? `${siteUrl}${category.uri}?page=${page + 1}` : null;

  return (
    <>
      <link rel="canonical" href={canonicalUrl} />
      {prevUrl && <link rel="prev" href={prevUrl} />}
      {nextUrl && <link rel="next" href={nextUrl} />}
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
                    <Link href={post.uri || `/${post.slug}`} className="cat-post__link">
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
              {(() => {
                // Get current page from searchParams (server-side)
                let currentPage = 1;
                if (typeof window === 'undefined') {
                  if (page && !isNaN(Number(page))) {
                    currentPage = Number(page);
                  }
                } else {
                  const urlParams = new URLSearchParams(window.location.search);
                  const pageParam = urlParams.get('page');
                  if (pageParam && !isNaN(Number(pageParam))) {
                    currentPage = Number(pageParam);
                  }
                }
                const maxPages = 5;
                let start = Math.max(1, currentPage - Math.floor(maxPages / 2));
                let end = start + maxPages - 1;
                if (end > totalPages) {
                  end = totalPages;
                  start = Math.max(1, end - maxPages + 1);
                }
                // Prev button
                if (currentPage > 1) {
                  const prevHref = currentPage - 1 === 1 ? `${category.uri}` : `${category.uri}?page=${currentPage - 1}`;
                  return (
                    <>
                      <Link
                        href={prevHref}
                        className="cat-pagination__btn cat-pagination__prev"
                        aria-label="Previous page"
                      >
                        ‹
                      </Link>
                      {Array.from({ length: end - start + 1 }, (_, i) => {
                        const pageNum = start + i;
                        const isCurrent = pageNum === currentPage;
                        const href = pageNum === 1 ? `${category.uri}` : `${category.uri}?page=${pageNum}`;
                        return (
                          <Link
                            key={pageNum}
                            href={href}
                            className={`cat-pagination__page${isCurrent ? ' cat-pagination__page--current' : ''}`}
                            style={{ color: '#fff', background: isCurrent ? '#ff4d4f' : 'transparent', borderRadius: '4px', padding: '0.2em 0.7em', margin: '0 2px', fontWeight: isCurrent ? 700 : 400 }}
                          >
                            {pageNum}
                          </Link>
                        );
                      })}
                      {currentPage < totalPages && (
                        <Link
                          href={`${category.uri}?page=${currentPage + 1}`}
                          className="cat-pagination__btn cat-pagination__next"
                          aria-label="Next page"
                        >
                          ›
                        </Link>
                      )}
                    </>
                  );
                } else {
                  // No prev button on first page
                  return (
                    <>
                      {Array.from({ length: end - start + 1 }, (_, i) => {
                        const pageNum = start + i;
                        const isCurrent = pageNum === currentPage;
                        const href = pageNum === 1 ? `${category.uri}` : `${category.uri}?page=${pageNum}`;
                        return (
                          <Link
                            key={pageNum}
                            href={href}
                            className={`cat-pagination__page${isCurrent ? ' cat-pagination__page--current' : ''}`}
                            style={{ color: '#fff', background: isCurrent ? '#ff4d4f' : 'transparent', borderRadius: '4px', padding: '0.2em 0.7em', margin: '0 2px', fontWeight: isCurrent ? 700 : 400 }}
                          >
                            {pageNum}
                          </Link>
                        );
                      })}
                      {currentPage < totalPages && (
                        <Link
                          href={`${category.uri}?page=${currentPage + 1}`}
                          className="cat-pagination__btn cat-pagination__next"
                          aria-label="Next page"
                        >
                          ›
                        </Link>
                      )}
                    </>
                  );
                }
              })()}
            </nav>
          )}
        </div>
      </main>
    </>
  );
}
