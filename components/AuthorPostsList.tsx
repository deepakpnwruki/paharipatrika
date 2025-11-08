'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { getPostUrl } from '@/lib/url-helpers';

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  uri: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText?: string;
    };
  };
  categories?: {
    nodes: Array<{
      name: string;
      slug: string;
    }>;
  };
  author?: {
    node: {
      name: string;
      slug: string;
    };
  };
}

interface Props {
  initialPosts: Post[];
  hasNextPage: boolean;
  endCursor: string | null;
  authorSlug: string;
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

export default function AuthorPostsList({ 
  initialPosts, 
  hasNextPage: initialHasNextPage, 
  endCursor: initialEndCursor,
  authorSlug 
}: Props) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [endCursor, setEndCursor] = useState<string | null>(initialEndCursor);
  const [isPending, startTransition] = useTransition();

  const loadMore = async () => {
    if (!endCursor || isPending) return;

    startTransition(async () => {
      try {
        const response = await fetch('/api/load-more-posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            authorSlug,
            after: endCursor,
            first: 20,
          }),
        });

        if (!response.ok) throw new Error('Failed to load more posts');

        const data = await response.json();
        
        setPosts((prev) => [...prev, ...(data.posts || [])]);
        setHasNextPage(data.hasNextPage || false);
        setEndCursor(data.endCursor || null);
      } catch (error) {
      }
    });
  };

  return (
    <>
      <div className="author-articles-list">
        {posts.map((post, index) => (
          <div className="author-article-card" key={post.id || post.slug || `post-${index}`} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem', borderRadius: 12, background: '#fff', boxShadow: 'none', padding: '0 0 0.5rem 0' }}>
            <div className="author-article-content" style={{ flex: '1 1 0%', minWidth: 0 }}>
              <Link href={getPostUrl(post)} className="author-article-title" style={{ fontSize: '1.18rem', fontWeight: 700, color: '#111', textDecoration: 'none', marginBottom: '0.3rem', display: 'block', lineHeight: 1.3 }}>
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
        ))}
      </div>

      {hasNextPage && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginTop: '48px',
          marginBottom: '48px' 
        }}>
          <button
            onClick={loadMore}
            disabled={isPending}
            style={{
              padding: '14px 32px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#fff',
              backgroundColor: isPending ? '#ccc' : '#ff4d4f',
              border: 'none',
              borderRadius: '4px',
              cursor: isPending ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(255, 77, 79, 0.3)',
            }}
            onMouseEnter={(e) => {
              if (!isPending) {
                e.currentTarget.style.backgroundColor = '#ff3333';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 77, 79, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isPending) {
                e.currentTarget.style.backgroundColor = '#ff4d4f';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 77, 79, 0.3)';
              }
            }}
          >
            {isPending ? 'लोड हो रहा है...' : 'और लेख देखें'}
          </button>
        </div>
      )}
    </>
  );
}
