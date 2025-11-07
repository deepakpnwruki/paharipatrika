import Link from 'next/link';
import Image from 'next/image';
import { wpFetch } from '../lib/graphql';
import AuthorLink from '../components/AuthorLink';
// import type { Metadata } from 'next';
import './homepage.css';
import { getPostUrl } from '../lib/url-helpers';

// Static homepage metadata removed. Only Yoast SEO will be used.

const HOMEPAGE_POSTS_QUERY = `
  query HomepagePosts {
    posts(first: 20, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        title
        slug
        uri
        date
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        categories(first: 1) {
          nodes {
            name
            slug
          }
        }
        author {
          node {
            name
            slug
          }
        }
      }
    }
  }
`;

interface PostNode {
  title: string;
  slug: string;
  uri?: string;
  date: string;
  excerpt?: string;
  featuredImage?: {
    node?: {
      sourceUrl?: string;
      altText?: string;
    };
  };
  categories?: {
    nodes?: Array<{
      name: string;
      slug: string;
    }>;
  };
  author?: {
    node?: {
      name?: string;
      slug?: string;
    };
  };
};

export const revalidate = 180; // ISR: 3 minutes for homepage (high traffic, needs freshness)
export const dynamic = 'force-static'; // Force static generation
export const dynamicParams = true; // Allow new posts to be added

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

export default async function Home() {
  let posts: PostNode[] = [];
  
  try {
    const data = await wpFetch<{ 
      posts: { nodes: PostNode[] };
    }>(
      HOMEPAGE_POSTS_QUERY,
      {},
      revalidate,
      'homepage-posts'
    );
    posts = data?.posts?.nodes || [];
  } catch (error) {
    // Silently handle error, use empty posts array
    posts = [];
  }

  const featured = posts[0];
  const secondaryPosts = posts.slice(1, 4);
  const listPosts = posts.slice(4, 20);

  return (
    <main className="homepage">
      <div className="container">
        <div className="homepage-layout-no-sidebar">
          {/* Featured Stories Only */}
          <div className="featured-column">
            {/* Large Featured Card - Side by Side Layout */}
            {featured && (
              <Link href={getPostUrl(featured)} className="featured-card large" prefetch={false}>
                <div className="featured-image">
                  {featured.featuredImage?.node?.sourceUrl && (
                    <Image
                      src={featured.featuredImage.node.sourceUrl}
                      alt={featured.featuredImage?.node?.altText || featured.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 992px) 95vw, 720px"
                      priority
                      style={{ objectFit: 'cover' }}
                    />
                  )}
                  {Array.isArray(featured.categories?.nodes) && featured.categories.nodes.length > 0 && (
                    <span className={`category-badge ${featured.categories.nodes[0].slug}`}>
                      {featured.categories.nodes[0].name}
                    </span>
                  )}
                </div>
                <div className="featured-content">
                  <div>
                    <h2 className="featured-title">{featured.title}</h2>
                    <div className="featured-meta">
                      {featured.author?.node?.slug ? (
                        <AuthorLink href={`/author/${featured.author.node.slug}`}>
                          {featured.author.node.name || 'Staff'}
                        </AuthorLink>
                      ) : (
                        <span className="author">{featured.author?.node?.name || 'Staff'}</span>
                      )}
                      <span className="separator">•</span>
                      <span className="time">{timeAgo(featured.date)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Secondary Featured Cards */}
            <div className="secondary-grid">
              {secondaryPosts.map((post, index) => (
                <Link 
                  key={post.slug} 
                  href={getPostUrl(post)} 
                  className="featured-card small"
                  prefetch={false}
                >
                  <div className="featured-image">
                    {post.featuredImage?.node?.sourceUrl && (
                      <Image
                        src={post.featuredImage.node.sourceUrl}
                        alt={post.featuredImage?.node?.altText || post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 992px) 50vw, 380px"
                        priority={index === 0}
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                    {Array.isArray(post.categories?.nodes) && post.categories.nodes.length > 0 && (
                      <span className={`category-badge ${post.categories.nodes[0].slug}`}>
                        {post.categories.nodes[0].name}
                      </span>
                    )}
                  </div>
                  <div className="featured-content">
                    <h3 className="featured-title">{post.title}</h3>
                    <div className="featured-meta">
                      {post.author?.node?.slug ? (
                        <AuthorLink href={`/author/${post.author.node.slug}`}>
                          {post.author.node.name || 'Staff'}
                        </AuthorLink>
                      ) : (
                        <span className="author">{post.author?.node?.name || 'Staff'}</span>
                      )}
                      <span className="separator">•</span>
                      <span className="time">{timeAgo(post.date)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Article List for Mobile and Desktop */}
            <div className="article-list">
              {listPosts.map((post) => (
                <Link 
                  key={post.slug} 
                  href={getPostUrl(post)} 
                  className="article-item"
                  prefetch={false}
                >
                  <div className="article-thumbnail">
                    {post.featuredImage?.node?.sourceUrl && (
                      <Image
                        src={post.featuredImage.node.sourceUrl}
                        alt={post.featuredImage?.node?.altText || post.title}
                        fill
                        sizes="120px"
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                  </div>
                  <div className="article-content">
                    <h4 className="article-title">{post.title}</h4>
                    <div className="article-meta">
                      {post.author?.node?.slug ? (
                        <AuthorLink href={`/author/${post.author.node.slug}`}>
                          {post.author.node.name || 'Staff'}
                        </AuthorLink>
                      ) : (
                        <span className="author">{post.author?.node?.name || 'Staff'}</span>
                      )}
                      <span className="separator">•</span>
                      <span className="time">{timeAgo(post.date)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}




















