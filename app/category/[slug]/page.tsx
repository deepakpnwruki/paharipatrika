import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { wpFetch } from '../../../lib/graphql';
import { CATEGORY_BY_SLUG_QUERY } from '../../../lib/queries';
import './category-page.css';

export const revalidate = 300;

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

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { after } = await searchParams;
  const postsPerPage = 10;

  const data = await wpFetch<{ category: any }>(
    CATEGORY_BY_SLUG_QUERY,
    { slug, first: postsPerPage, after: after || null },
    revalidate
  );

  if (!data?.category) {
    notFound();
  }

  const category = data.category;
  const posts = category.posts?.nodes ?? [];
  const pageInfo = category.posts?.pageInfo;
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
                          <img
                            src={post.featuredImage.node.sourceUrl}
                            alt={post.featuredImage.node.altText || post.title}
                            // loading removed
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
          {(pageInfo?.hasPreviousPage || pageInfo?.hasNextPage) && (
            <nav className="cat-pagination" aria-label="Pagination">
              {pageInfo?.hasPreviousPage && (
                <Link
                  href={`${category.uri}`}
                  className="cat-pagination__btn cat-pagination__prev"
                  aria-label="Previous page"
                >
                  ‹
                </Link>
              )}
              <span className="cat-pagination__current-page">Page</span>
              {pageInfo?.hasNextPage && (
                <Link
                  href={`${category.uri}?after=${encodeURIComponent(pageInfo.endCursor)}`}
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
