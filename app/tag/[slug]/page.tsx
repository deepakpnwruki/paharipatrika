import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { wpFetch } from '../../../lib/graphql';
import { TAG_BY_SLUG_QUERY } from '../../../lib/queries';
import Link from 'next/link';
import Image from 'next/image';
import './tag-page.css';

type TagPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;
export const dynamicParams = true;

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

function absoluteUrl(url?: string, site?: string) {
  if (!url) return url as any;
  if (/^https?:\/\//i.test(url)) return url;
  const base = (site || process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const data = await wpFetch<{ tag: any }>(TAG_BY_SLUG_QUERY, { slug }, revalidate);
    const tag = data?.tag;
    
    if (!tag) return { title: 'Tag Not Found' };
    
    const site = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
    const canonical = `${site}/tag/${slug}`;
    
    return {
      title: `${tag.name} | ${process.env.SITE_NAME || 'EduNews'}`,
      description: tag.description || `Articles tagged with ${tag.name}`,
      alternates: { canonical },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch {
    return { title: 'Tag Not Found' };
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  
  let tag: any = null;
  try {
    const data = await wpFetch<{ tag: any }>(TAG_BY_SLUG_QUERY, { slug }, revalidate);
    tag = data?.tag;
  } catch (error) {
    console.error('Error fetching tag:', error);
  }
  
  if (!tag) notFound();
  
  const posts = tag.posts?.nodes || [];
  const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
  
  // Format tag name for display (uppercase)
  const tagNameDisplay = (tag.name || '').replace(/\b\w/g, (l: string) => l.toUpperCase());
  
  return (
    <main className="es-tag-page">
      {/* Header Section */}
      <section className="es-tag-header">
        <div className="es-tag-header__inner">
          <h1 className="es-tag-header__title">{tagNameDisplay}</h1>
        </div>
      </section>
      
      {/* Content Section */}
      <section className="es-tag-content">
        <div className="es-tag-content__inner">
          <h2 className="es-tag-content__subtitle">
            {tagNameDisplay} NEWS
          </h2>
          <p className="es-tag-content__desc">
            Stories About lastest news
          </p>
          <p className="es-tag-content__date">
            {new Intl.DateTimeFormat('en-US', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            }).format(new Date())}
          </p>
          
          {/* Posts Grid */}
          {posts.length > 0 ? (
            <div className="es-tag-posts">
              {posts.map((post: any, index: number) => {
                const href = post.uri || `/${post.slug}`;
                const imgUrl = post.featuredImage?.node?.sourceUrl;
                const category = post.categories?.nodes?.[0];
                const isFirstPost = index === 0;
                
                return (
                  <article key={post.slug} className={`es-tag-post ${isFirstPost ? 'es-tag-post--featured' : ''}`}>
                    <Link href={href.endsWith('/') ? href : href + '/'} className="es-tag-post__link">
                      <div className="es-tag-post__content">
                        {!isFirstPost && (
                          <span className="es-tag-post__badge-top">NEWS</span>
                        )}
                        
                        <h3 className="es-tag-post__title">{post.title}</h3>
                        
                        {post.author?.node?.name && (
                          <p className="es-tag-post__author">
                            By {post.author.node.name}
                          </p>
                        )}
                      </div>
                      
                      {imgUrl && (
                        <div className="es-tag-post__image">
                          <Image
                            src={absoluteUrl(imgUrl, site)}
                            alt={post.featuredImage?.node?.altText || post.title}
                            fill
                            sizes={isFirstPost ? "(max-width: 768px) 100vw, 768px" : "(max-width: 768px) 40vw, 220px"}
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                      )}
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="es-tag-empty">No articles found for this tag.</p>
          )}
        </div>
      </section>
    </main>
  );
}
