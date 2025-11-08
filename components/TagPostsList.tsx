'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPostUrl } from '@/lib/url-helpers';

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
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
      uri: string;
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
  tagSlug: string;
  siteUrl: string;
}

function absoluteUrl(url: string, site: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${site.replace(/\/$/, '')}${url.startsWith('/') ? url : `/${url}`}`;
}

export default function TagPostsList({ 
  initialPosts, 
  hasNextPage: initialHasNextPage, 
  endCursor: initialEndCursor,
  tagSlug,
  siteUrl
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
            tagSlug,
            after: endCursor,
            first: 20,
          }),
        });

        if (!response.ok) throw new Error('Failed to load more posts');

        const data = await response.json();
        
        setPosts((prev) => [...prev, ...(data.posts || [])]);
        setHasNextPage(data.hasNextPage || false);
        setEndCursor(data.endCursor || null);
        } catch {
      }
    });
  };

  return (
    <>
      <div className="es-tag-posts">
        {posts.map((post: Post, index: number) => {
          const href = getPostUrl(post);
          const imgUrl = post.featuredImage?.node?.sourceUrl;
          
          return (
            <article key={post.id || post.slug || `post-${index}`} className="es-tag-post">
              <Link href={href} className="es-tag-post__link">
                <div className="es-tag-post__content">
                  <span className="es-tag-post__badge-top">NEWS</span>
                  
                  <h3 className="es-tag-post__title">{post.title}</h3>
                  
                  {post.author?.node?.name && (
                    <p className="es-tag-post__author">
                      {post.author.node.name}
                    </p>
                  )}
                </div>
                
                {imgUrl && (
                  <div className="es-tag-post__image">
                    <Image
                      src={absoluteUrl(imgUrl, siteUrl)}
                      alt={post.featuredImage?.node?.altText || post.title}
                      fill
                      sizes="(max-width: 768px) 40vw, 280px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
              </Link>
            </article>
          );
        })}
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
              borderRadius: '8px',
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
