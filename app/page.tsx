import Link from 'next/link';
import Image from 'next/image';
import { wpFetch } from '../lib/graphql';
import AuthorLink from '../components/AuthorLink';
import type { Metadata } from 'next';
import './homepage.css';

// SEO: Generate metadata for homepage
export async function generateMetadata(): Promise<Metadata> {
  const siteName = process.env.SITE_NAME || 'Pahari Patrika';
  const siteUrl = (process.env.SITE_URL || 'https://paharipatrika.in').replace(/\/$/, '');
  const description = `${siteName} - Latest breaking news, current affairs, and in-depth analysis. Stay informed with trusted journalism in Hindi.`;
  
  return {
    title: `${siteName} - Latest News, Breaking News, Current Affairs in Hindi`,
    description,
    keywords: ['news', 'breaking news', 'latest news', 'hindi news', 'current affairs', siteName.toLowerCase()],
    alternates: {
      canonical: siteUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: `${siteName} - Your trusted source for news`,
      description,
      url: siteUrl,
      type: 'website',
      locale: 'hi_IN',
      siteName,
      images: [{
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: siteName,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description,
      images: [`${siteUrl}/og-image.jpg`],
    },
    other: {
      'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION || '',
    },
  };
}

const HOMEPAGE_POSTS_QUERY = `
  query HomepagePosts {
    posts(first: 12, where: { orderby: { field: DATE, order: DESC } }) {
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
    latestPosts: posts(first: 5, where: { orderby: { field: DATE, order: DESC } }) {
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
      }
    }
    trendingPosts: posts(first: 5, where: { orderby: { field: COMMENT_COUNT, order: DESC } }) {
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
  let latestPosts: PostNode[] = [];
  let trendingPosts: PostNode[] = [];
  
  try {
    const data = await wpFetch<{ 
      posts: { nodes: PostNode[] };
      latestPosts: { nodes: PostNode[] };
      trendingPosts: { nodes: PostNode[] };
    }>(
      HOMEPAGE_POSTS_QUERY,
      {},
      revalidate,
      'homepage-posts'
    );
    posts = data?.posts?.nodes || [];
    latestPosts = data?.latestPosts?.nodes || [];
    trendingPosts = data?.trendingPosts?.nodes || [];
  } catch (error) {
    console.error('Error fetching homepage posts:', error);
    posts = [];
    latestPosts = [];
    trendingPosts = [];
  }

  const featured = posts[0];
  const secondaryPosts = posts.slice(1, 4);
  const listPosts = posts.slice(4, 24);

  return (
    <main className="homepage">
      <div className="container">
        <div className="homepage-layout">
          {/* Featured Stories Only */}
          <div className="featured-column">
            {/* Large Featured Card - Side by Side Layout */}
            {featured && (
              <Link href={featured.uri || `/${featured.slug}`} className="featured-card large">
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
                  {featured.categories?.nodes && featured.categories.nodes.length > 0 && (
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
                  href={post.uri || `/${post.slug}`} 
                  className="featured-card small"
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
                    {post.categories?.nodes && post.categories.nodes.length > 0 && (
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

            {/* Article List for Mobile */}
            <div className="article-list">
              {listPosts.map((post) => (
                <Link 
                  key={post.slug} 
                  href={post.uri || `/${post.slug}`} 
                  className="article-item"
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

          {/* Sidebar */}
          <aside className="homepage-sidebar">
            {/* Latest Updates */}
            <div className="sidebar-section">
              <h3 className="sidebar-title">Latest Updates</h3>
              <div className="sidebar-posts">
                {latestPosts.map((post, index) => (
                  <Link 
                    key={post.slug} 
                    href={post.uri || `/${post.slug}`}
                    className="sidebar-post"
                  >
                    <div className="sidebar-post-number">{index + 1}</div>
                    <div className="sidebar-post-content">
                      <h4 className="sidebar-post-title">{post.title}</h4>
                      <span className="sidebar-post-time">{timeAgo(post.date)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Trending */}
            <div className="sidebar-section">
              <h3 className="sidebar-title">Trending</h3>
              <div className="sidebar-posts">
                {trendingPosts.map((post, index) => (
                  <Link 
                    key={post.slug} 
                    href={post.uri || `/${post.slug}`}
                    className="sidebar-post"
                  >
                    <div className="sidebar-post-number trending">{index + 1}</div>
                    <div className="sidebar-post-content">
                      <h4 className="sidebar-post-title">{post.title}</h4>
                      <span className="sidebar-post-time">{timeAgo(post.date)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}




















