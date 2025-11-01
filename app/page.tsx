'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import './homepage.css';

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

export default function Home() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostNode[]>([]);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/posts');
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } 
    }
    fetchPosts();
  }, []);

  const featured = posts[0];
  const secondaryPosts = posts.slice(1, 4);
  const listPosts = posts.slice(4, 24); // Articles 5-24 for mobile list view

  // Show loading state
  if (posts.length === 0) {
    return (
      <main className="homepage">
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="homepage">
      <div className="container">
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
                      <span
                        className="author-link"
                        role="link"
                        tabIndex={0}
                        aria-label={`Read more by ${featured.author.node.name}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          router.push(`/author/${featured.author!.node!.slug!}`);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(`/author/${featured.author!.node!.slug!}`);
                          }
                        }}
                      >
                        {featured.author.node.name || 'Staff'}
                      </span>
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
            {secondaryPosts.map((post) => (
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
                      <span
                        className="author-link"
                        role="link"
                        tabIndex={0}
                        aria-label={`Read more by ${post.author.node.name}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          router.push(`/author/${post.author!.node!.slug!}`);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(`/author/${post.author!.node!.slug!}`);
                          }
                        }}
                      >
                        {post.author.node.name || 'Staff'}
                      </span>
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
                      <span
                        className="author-link"
                        role="link"
                        tabIndex={0}
                        aria-label={`Read more by ${post.author.node.name}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          router.push(`/author/${post.author!.node!.slug!}`);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(`/author/${post.author!.node!.slug!}`);
                          }
                        }}
                      >
                        {post.author.node.name || 'Staff'}
                      </span>
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
    </main>
  );
}




















