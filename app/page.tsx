'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
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
    };
  };
}

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
  const [posts, setPosts] = useState<PostNode[]>([]);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <main style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <p>Loading...</p>
      </main>
    );
  }

  const featured = posts[0];
  const trio = posts.slice(1, 4);
  const headlines = posts.slice(4, 9);
  const remaining = posts.slice(9);

  return (
    <main className="homepage">
      <div className="container">
        {/* Hero Board Section */}
        <section className="hb-surface">
          <div className="hb-board">
            {/* Left: Featured + Trio */}
            <div className="hb-left">
              {/* Main Featured Post */}
              {featured && (
                <article className="hb-feature">
                  <Link href={featured.uri || `/${featured.slug}`} className="hb-feature-link">
                    {featured.featuredImage?.node?.sourceUrl && (
                      <div 
                        className="hb-media" 
                        data-cat={featured.categories?.nodes?.[0]?.slug || ''}
                      >
                        <Image
                          src={featured.featuredImage.node.sourceUrl}
                          alt={featured.featuredImage.node.altText || featured.title}
                          fill
                          priority
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    )}
                    <div className="hb-content">
                      {featured.categories?.nodes?.[0] && (
                        <span 
                          className="hb-cat" 
                          data-cat={featured.categories.nodes[0].slug}
                        >
                          {featured.categories.nodes[0].name}
                        </span>
                      )}
                      <h1 className="hb-title">{featured.title}</h1>
                      <div className="hb-meta">
                        <span>{featured.author?.node?.name || 'Staff'}</span>
                        <span className="hb-dot">•</span>
                        <time dateTime={featured.date}>{timeAgo(featured.date)}</time>
                      </div>
                    </div>
                  </Link>
                </article>
              )}

              {/* Trio Cards */}
              {trio.length > 0 && (
                <div className="hb-trio">
                  {trio.map((post: PostNode) => (
                    <article key={post.slug} className="hb-mini">
                      <Link href={post.uri || `/${post.slug}`} className="hb-mini-link">
                        {post.featuredImage?.node?.sourceUrl && (
                          <div className="hb-mini-media">
                            <Image
                              src={post.featuredImage.node.sourceUrl}
                              alt={post.featuredImage.node.altText || post.title}
                              fill
                              sizes="(max-width: 768px) 100px, (max-width: 1024px) 200px, 280px"
                              style={{ objectFit: 'cover' }}
                            />
                          </div>
                        )}
                        <div className="hb-mini-body">
                          {post.categories?.nodes?.[0] && (
                            <span 
                              className="hb-mini-cat" 
                              data-cat={post.categories.nodes[0].slug}
                            >
                              {post.categories.nodes[0].name}
                            </span>
                          )}
                          <h3 className="hb-mini-title">{post.title}</h3>
                          <div className="hb-mini-meta">
                            <span>{post.author?.node?.name || 'Staff'}</span>
                            <span className="hb-dot">•</span>
                            <time dateTime={post.date}>{timeAgo(post.date)}</time>
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Headlines Sidebar */}
            {headlines.length > 0 && (
              <aside className="hb-right">
                <h2 className="hb-right-title">मुख्य समाचार</h2>
                <ul className="hb-right-list">
                  {headlines.map((post: PostNode) => (
                    <li key={post.slug} className="hb-right-item">
                      <Link href={post.uri || `/${post.slug}`}>
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </aside>
            )}
          </div>
        </section>

        {/* Additional Content Grid */}
        {remaining.length > 0 && (
          <section className="hp-block">
            <h2 className="hp-sec-title">ताज़ा खबरें</h2>
            <div className="hp-grid">
              {remaining.map((post: PostNode) => (
                <article key={post.slug} className="hp-card">
                  <Link href={post.uri || `/${post.slug}`} className="hp-card-link">
                    {post.featuredImage?.node?.sourceUrl && (
                      <div className="hp-card-media">
                        <Image
                          src={post.featuredImage.node.sourceUrl}
                          alt={post.featuredImage.node.altText || post.title}
                          width={400}
                          height={225}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    )}
                    <div className="hp-card-body">
                      {post.categories?.nodes?.[0] && (
                        <span className="hp-badge">
                          {post.categories.nodes[0].name}
                        </span>
                      )}
                      <h3 className="hp-card-title">{post.title}</h3>
                      <div className="hp-card-time">
                        <time dateTime={post.date}>{timeAgo(post.date)}</time>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
