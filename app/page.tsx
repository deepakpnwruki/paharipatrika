'use client';
import { useState, useEffect } from 'react';

import Link from 'next/link';
import './homepage.css';
import './hero.css';

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
  const latest = posts.slice(1, 7);
  const remaining = posts.slice(7);

  return (
    <main className="homepage" style={{ minHeight: '100vh', background: '#090909' }}>
      <div className="container">
        {/* Hero Section */}
        {featured && (
          <section className="hero-section" style={{ overflow: 'hidden', marginBottom: '0', background: '#090909', borderRadius: '0 0 18px 18px' }}>
            <div className="hero-image-wrap" style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#222', overflow: 'hidden', borderRadius: '0 0 18px 18px' }}>
              <Link href={featured.uri || `/${featured.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
                <img
                  className="hero-image"
                  src={featured.featuredImage?.node?.sourceUrl || ''}
                  alt={featured.featuredImage?.node?.altText || featured.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </Link>
            </div>
            <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              {featured.categories?.nodes && featured.categories.nodes.length > 0 && (
                <Link
                  href={`/category/${featured.categories.nodes[0].slug}`}
                  style={{ color: '#fff', fontWeight: 800, textDecoration: 'none', cursor: 'pointer' }}
                >
                  {featured.categories.nodes[0].name}
                </Link>
              )}
              <span style={{ display: 'inline-block', width: 32, height: 4, background: '#e73c3c', borderRadius: 2, marginLeft: 8 }} />
            </div>
            <Link href={featured.uri || `/${featured.slug}`} style={{ textDecoration: 'none' }}>
              <h1 className="hero-title" style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 900, margin: '0 0 0.5rem 0', lineHeight: 1.18 }}>{featured.title}</h1>
            </Link>
            <div className="hero-meta" style={{ color: '#b0b0b0', fontSize: '0.7rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {featured.author?.node?.name ? (
                <Link
                  href={`/author/${encodeURIComponent(featured.author.node.name.toLowerCase().replace(/\s+/g, '-'))}`}
                  className="hero-author-link"
                  style={{ color: '#b0b0b0', fontWeight: 700, textDecoration: 'none', cursor: 'pointer' }}
                >
                  {featured.author.node.name}
                </Link>
              ) : (
                <span style={{ fontWeight: 700, color: '#b0b0b0' }}>Staff</span>
              )}
              <span className="hero-dot" style={{ fontSize: '1.2rem', color: '#b0b0b0' }}>•</span>
              <time dateTime={featured.date} style={{ color: '#b0b0b0' }}>{timeAgo(featured.date)}</time>
            </div>
          </section>
  )}

        {latest.length > 0 && (
          <section className="latest-news-section" style={{ marginTop: '0', marginBottom: '2.5rem', background: '#090909', borderRadius: 12, boxShadow: '0 2px 16px 0 rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
              <span className="latest-news-bar" style={{ display: 'inline-block', width: 5, height: 22, borderRadius: 3, background: 'linear-gradient(180deg, #e73c3c 0%, #ffb347 100%)', marginRight: 12 }} />
              <h2 style={{ color: '#fff', fontWeight: 900, fontSize: '1rem', margin: 0, display: 'inline-block', letterSpacing: '0.01em' }}>
                ताज़ा समाचार
              </h2>
            </div>
            <div style={{
              display: 'flex',
              overflowX: 'auto',
              gap: 24,
              paddingBottom: 8,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
              className="latest-news-scroll"
            >
              {latest.map((post) => (
                <div key={post.slug} style={{
                  background: '#181818',
                  borderRadius: 8,
                  minWidth: 280,
                  maxWidth: 340,
                  flex: '0 0 auto',
                  padding: '1.1rem 0.8rem 1.1rem 1.1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14
                }}>
                  <div style={{ flex: 1 }}>
                    <Link href={post.uri || `/${post.slug}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '0.98rem', margin: 0, marginBottom: 10, lineHeight: 1.18 }}>{post.title}</h3>
                    </Link>
                    <div style={{ color: '#b0b0b0', fontSize: '0.95rem', fontWeight: 500, marginTop: 10 }}>
                      {timeAgo(post.date)}
                    </div>
                  </div>
                  {post.featuredImage?.node?.sourceUrl && (
                    <img
                      src={post.featuredImage.node.sourceUrl}
                      alt={post.featuredImage.node.altText || post.title}
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, background: '#222' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <section style={{ background: '#fff', boxShadow: '0 2px 16px 0 rgba(0,0,0,0.08)', padding: '1.1rem 1.2rem 1.1rem 1.2rem', width: '100%' }}>
          <div style={{
            marginBottom: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <span style={{ display: 'inline-block', width: 6, height: 32, borderRadius: 3, background: 'linear-gradient(180deg, #e73c3c 0%, #ffb347 100%)' }} />
            <h2 style={{
              fontWeight: 900,
              fontSize: '1.35rem',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#1a1a1a',
              lineHeight: 1.1
            }}>
              टॉप स्टोरीज
            </h2>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {latest.map((post) => (
              <li key={post.slug} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 18 }}>
                <span style={{ display: 'inline-block', width: 10, height: 10, background: '#e0e0e0', borderRadius: 2, marginTop: 6 }} />
                <Link href={post.uri || `/${post.slug}`} style={{ color: '#222', fontWeight: 600, fontSize: '1.08rem', textDecoration: 'none' }}>
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}











