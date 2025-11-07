import './article.css';
import Image from 'next/image';
import { wpFetch } from '../../lib/graphql';
import {
  NODE_BY_URI_QUERY,
  PAGE_BY_URI_QUERY,
  POST_BY_URI_QUERY,
  CATEGORY_BY_SLUG_QUERY,
} from '../../lib/queries';
import ShareButtonsClient from './ShareButtonsClient';
import ImageCaption from '../../components/ImageCaption';
import InArticleAd from '../../components/InArticleAd';
import MgidNativeAd from '../../components/MgidNativeAd';
import ArticleContentWithAds from '../../components/ArticleContentWithAds';
import SocialEmbeds from '../../components/SocialEmbeds';
import EmbedProcessor from '../../components/EmbedProcessor';
import Link from 'next/link';
import Breadcrumbs from '../../components/Breadcrumbs';
import { getPostUrl, getCategoryUrl } from '../../lib/url-helpers';
import { 
  processArticleContent, 
  generateOptimizedBreadcrumbs, 
  formatOptimizedDate 
} from '../../lib/content-optimization';
// ...existing code...

type ParamPromise = Promise<{ slug?: string[] }>;

// ISR Configuration for optimal performance
export const revalidate = 900; // 15 minutes - articles don't change often after publishing
export const dynamic = 'force-static'; // Use ISR for better performance
export const dynamicParams = true; // Allow new articles to be generated

// Pre-generate most popular articles at build time
export async function generateStaticParams() {
  try {
    // Get 50 most recent articles for pre-generation
    const data = await wpFetch<{ posts: { nodes: Array<{ slug: string, uri: string }> } }>(
      `query RecentPostsForPreGeneration {
        posts(first: 50, where: { orderby: { field: DATE, order: DESC } }) {
          nodes {
            slug
            uri
          }
        }
      }`,
      {},
      3600, // Cache for 1 hour during build
      'build-articles'
    );

    return data?.posts?.nodes?.map((post) => {
      // Remove leading/trailing slashes and split by /
      const cleanUri = post.uri?.replace(/^\/+|\/+$/g, '') || post.slug;
      return {
        slug: cleanUri.split('/'),
      };
    }).filter(Boolean) || [];
  } catch (error) {
    // Silently handle error, return empty array
    return [];
  }
}

async function resolveNode(segments?: string[]) {
  // Build URI candidates for the given segments
  const cs: string[] = [];
  if (!segments) {
    return { node: null, isPost: false };
  }
  const uri = '/' + segments.join('/');
  cs.push(uri);
  if (!uri.endsWith('/')) cs.push(uri + '/');
  if (uri.endsWith('/')) cs.push(uri.slice(0, -1));

  // Try NODE_BY_URI first with better caching
  for (const uri of cs) {
    try {
      const data = await wpFetch<{ nodeByUri: any }>(
        NODE_BY_URI_QUERY,
        { uri },
        revalidate, // Use the same revalidate time as page
        `node:${uri}`,
      );
      if (data?.nodeByUri) {
        const n = data.nodeByUri;
        return { node: n, isPost: n.__typename === 'Post' };
      }
    } catch (_e) {
      // Continue to next URI variation
    }
  }
  
  // Fallback: try specific post/page queries with optimized caching
  for (const uri of cs) {
    try {
      const p = await wpFetch<{ post: any }>(
        POST_BY_URI_QUERY,
        { uri },
        revalidate,
        `post:${uri}`,
      );
      if (p?.post) {
        return { node: p.post, isPost: true };
      }
    } catch (_e) {
      // Continue
    }
    try {
      const pg = await wpFetch<{ page: any }>(
        PAGE_BY_URI_QUERY,
        { uri },
        revalidate,
        `page:${uri}`,
      );
      if (pg?.page) {
        return { node: pg.page, isPost: false };
      }
    } catch (_e) {
      // Continue
    }
  }
  
  // Special case: category URLs
  if (Array.isArray(segments) && segments.length >= 2 && segments[0] === 'category') {
    const categorySlug = segments[1];
    try {
      const catData = await wpFetch<{ category: any }>(
        CATEGORY_BY_SLUG_QUERY,
        { slug: categorySlug },
        revalidate,
        `cat:${categorySlug}`,
      );
      if (catData?.category) {
        return { node: catData.category, isPost: false };
      }
    } catch (_e) {
      // Continue
    }
  }

  // Last fallback: try to match any category by the last segment
  if (Array.isArray(segments) && segments.length > 0) {
    const lastSeg = segments[segments.length - 1];
    try {
      const catData = await wpFetch<{ category: any }>(
        CATEGORY_BY_SLUG_QUERY,
        { slug: lastSeg },
        revalidate,
        `cat-fallback:${lastSeg}`,
      );
      if (catData?.category) {
        return { node: catData.category, isPost: false };
      }
    } catch (_e) {
      // Final fallback failed
    }
  }

  return { node: null, isPost: false };
}

  /* ---------------- metadata ---------------- */


// Use only Yoast SEO fields for metadata
import type { Metadata, ResolvingMetadata } from 'next';
export async function generateMetadata(
  { params }: { params: ParamPromise },
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const { node } = await resolveNode(slug);
  if (!node) return { title: 'Not found' };

  // Use Yoast SEO fields only
  const seo = node.seo || {};
  return {
    title: seo.title || node.title || node.name || 'Article',
    description: seo.metaDesc || '',
    alternates: { canonical: seo.canonical || '' },
    robots: {
      index: seo.metaRobotsNoindex !== 'noindex',
      follow: seo.metaRobotsNofollow !== 'nofollow',
    },
    openGraph: {
      title: seo.opengraphTitle || seo.title || node.title || '',
      description: seo.opengraphDescription || seo.metaDesc || '',
      url: seo.canonical || '',
      type: node.__typename === 'Post' ? 'article' : 'website',
      locale: 'hi_IN',
      siteName: process.env.SITE_NAME || 'Pahari Patrika',
      images: seo.opengraphImage?.sourceUrl
        ? [{ url: seo.opengraphImage.sourceUrl, width: 1200, height: 630, alt: node.title || node.name }]
        : [],
      publishedTime: (node as any)?.date,
      modifiedTime: (node as any)?.modified,
      authors: (node as any)?.author?.node?.name ? [(node as any).author.node.name] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.twitterTitle || seo.title || node.title || '',
      description: seo.twitterDescription || seo.metaDesc || '',
      images: seo.twitterImage?.sourceUrl ? [seo.twitterImage.sourceUrl] : [],
    },
  };
}

/* ---------------- page ---------------- */
export default async function NodePage({ params }: { params: ParamPromise }) {
    const { slug } = await params;
    
    if (!slug || !Array.isArray(slug) || slug.length === 0) {
      return <div>Page not found</div>;
    }
    const { node } = await resolveNode(slug);
    if (!node) {
      return <div>Content not found</div>;
    }
    // Calculate reading length (word count) for meta only (not UI)
    // const wordCount = typeof node?.content === 'string'
    //   ? node.content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length
    //   : 0;

    // Category listing view
      if (node.__typename === 'Category') {
        const posts = Array.isArray(node.posts?.nodes) ? node.posts.nodes : [];
        return (
          <main className="es-page">
            <header className="es-cat-header">
              <div className="es-container">
                <h1 className="es-cat-title">{node.name}</h1>
              </div>
            </header>

            <section className="es-container es-grid es-grid--cards" aria-label={`Posts in ${node.name}`}>
              {posts.length === 0 && (
                <div>No posts found for this category.</div>
              )}
              {posts.map((p: any) => (
                <Link href={getPostUrl(p)} key={p.slug} className="es-card" prefetch={false}>
                  {p.featuredImage?.node?.sourceUrl && (
                    <div style={{ position: 'relative', width: '100%', height: '200px' }}>
                      <Image 
                        src={p.featuredImage.node.sourceUrl} 
                        alt={p.featuredImage.node.altText || p.title} 
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'cover' }}
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="es-card-content">
                    <h2 className="es-card-title">{p.title}</h2>
                    {p.excerpt && (
                      <div className="es-card-excerpt" dangerouslySetInnerHTML={{ __html: p.excerpt }} />
                    )}
                  </div>
                </Link>
              ))}
            </section>
          </main>
        );
      }

    // Related posts section removed to reduce API load
    // let relatedPosts: any[] = [];

    const img = node?.featuredImage?.node || null;
    const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
    const canonical = `${site}${node?.uri || '/' + (slug || []).join('/')}`;

    // Use optimized breadcrumb generation
    const breadcrumbs = generateOptimizedBreadcrumbs(node);

    // All custom schema removed. Only Yoast schema will be injected via generateMetadata.

    // Use optimized content processing
    const processedContent = node.content ? processArticleContent(node.content) : '';

    // Use optimized date formatting  
    const { formatted: datePart, iso: dateIso, datetime: dt } = formatOptimizedDate((node as any)?.date);
    const timePart = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }).format(dt);
    const mobDateStr = `${datePart} | ${timePart} IST`;

    // author socials (best-effort)
    const authorNode = (node as any)?.author?.node || {};
    
    // Check author URL field first (WordPress default user profile field)
    const authorUrl = authorNode?.url || '';
    
    const authorFacebook: string | undefined =
      authorNode?.facebook || 
      authorNode?.social?.facebook || 
      authorNode?.userMeta?.facebook ||
      (typeof authorUrl === 'string' && authorUrl.includes('facebook.com') ? authorUrl : undefined);
    
    const authorTwitter: string | undefined =
      authorNode?.x || 
      authorNode?.twitter || 
      authorNode?.social?.x || 
      authorNode?.social?.twitter ||
      authorNode?.userMeta?.x || 
      authorNode?.userMeta?.twitter ||
      (typeof authorUrl === 'string' && (authorUrl.includes('twitter.com') || authorUrl.includes('x.com')) ? authorUrl : undefined);

    // Related posts sections removed to reduce API load
    // const _sanitizedRelated = [];
    // const latestItems = [];
    // const trendingItems = [];
    // const bottomItems = [];
    // const relatedItems = [];

    // small image picker
  // function pickThumb(imgNode?: any): { url?: string; width?: number; height?: number } {
  //   const sizes: Array<any> = Array.isArray(imgNode?.mediaDetails?.sizes) ? imgNode.mediaDetails.sizes : [];
  //   if (!Array.isArray(sizes) || !sizes.length) return { url: imgNode?.sourceUrl };
  //   const byName = (n: string) => sizes.find((s: any) => (s?.name || '').toLowerCase() === n);
  //   const t = byName('thumbnail') || byName('medium') ||
  //     [...sizes].sort((a, b) => (a?.width || 0) - (b?.width || 0))[0];
  //   return { url: t?.sourceUrl || imgNode?.sourceUrl, width: t?.width, height: t?.height };
  // }

    // Inject NewsArticle/Yoast schema only for article pages
    let yoastSchema = '';
    if (node.__typename === 'Post' && node.seo?.schema?.raw) {
      yoastSchema = node.seo.schema.raw;
    }

    return (
      <>
        {/* Inject Yoast/NewsArticle schema only for article pages */}
        {yoastSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: yoastSchema }}
          />
        )}
        <main className="es-page">
          {/* ---------- HERO ---------- */}
          <section className="es-hero">
            <div className="es-container es-hero__inner">
              <div className="es-hero__header">
                <div className="es-hero__text">
                  <Breadcrumbs items={breadcrumbs} className="es-breadcrumbs" />
                  <h1 className="es-title">{node.title}</h1>

                  <div className="es-meta">
                    <div className="es-meta-row">
                      <div className="es-meta-left">
                        {node.author?.node?.name && (
                          <div className="es-byline">
                            <span className="es-byline__name">By </span>
                            {node.author.node.slug ? (
                              <Link href={`/author/${node.author.node.slug}`} className="es-byline__name es-byline__link">{node.author.node.name}</Link>
                            ) : (
                              <span className="es-byline__name">{node.author.node.name}</span>
                            )}
                            {authorUrl && (
                              <>
                                <span className="es-pipe">|</span>
                                <a href={authorUrl} className="es-byline__x" target="_blank" rel="noopener noreferrer" aria-label="X profile">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/>
                                  </svg>
                                </a>
                              </>
                            )}
                          </div>
                        )}
                        <time dateTime={dt.toISOString()} className="es-time">{mobDateStr}</time>

                      </div>
                      <ShareButtonsClient
                        url={canonical}
                        title={node.title}
                        className="es-share es-share--hero"
                        networks={['facebook', 'whatsapp', 'copy']}
                        variant="icon"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {img?.sourceUrl && (
                <ImageCaption
                  src={img.sourceUrl}
                  alt={img?.altText || node.title || 'Article image'}
                  width={768}
                  height={432}
                  priority
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="es-hero__img"
                  caption={(img?.caption || img?.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 240) || (img?.altText || '')}
                />
              )}
            </div>
          </section>

          {/* ---------- BODY ---------- */}
          <div className="es-container es-layout">
            {/* LEFT: article */}
            <article className="es-article">

              <div className="es-article__body">
                <SocialEmbeds />
                <ArticleContentWithAds 
                  content={processedContent} 
                  inArticleAdSlot={process.env.NEXT_PUBLIC_ADSENSE_IN_ARTICLE_SLOT || ''}
                />
                <EmbedProcessor content={processedContent} />
              </div>


              {/* Author Box - E-E-A-T Compliant */}
              {node.author?.node && (
                <div className="es-author-eeat">
                  <div className="es-author-eeat__content">
                    {node.author.node.avatar?.url && (
                      <div className="es-author-eeat__avatar">
                        <Image 
                          src={node.author.node.avatar.url} 
                          alt={node.author.node.name} 
                          width={64}
                          height={64}
                          className="es-author-eeat__img" 
                        />
                      </div>
                    )}
                    <div className="es-author-eeat__info">
                      <div className="es-author-eeat__label">Written by</div>
                      <div className="es-author-eeat__name">
                        {node.author.node.slug ? (
                          <Link href={`/author/${node.author.node.slug}`} className="es-author-eeat__link">
                            {node.author.node.name}
                          </Link>
                        ) : (
                          node.author.node.name
                        )}
                      </div>
                      {node.author.node.description && (
                        <div className="es-author-eeat__bio">
                          {typeof node.author.node.description === 'string' && node.author.node.description.length > 120 
                            ? `${node.author.node.description.substring(0, 120)}...` 
                            : node.author.node.description}
                          {typeof node.author.node.description === 'string' && node.author.node.description.length > 120 && node.author.node.slug && (
                            <Link href={`/author/${node.author.node.slug}`} className="es-author-eeat__know-more">
                              {' '}Know More
                            </Link>
                          )}
                        </div>
                      )}
                      {(authorFacebook || authorTwitter) && (
                        <div className="es-author-eeat__social">
                          {authorFacebook && (
                            <a href={authorFacebook} target="_blank" rel="noopener noreferrer author" aria-label="Follow on Facebook" className="es-author-eeat__social-link">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                              </svg>
                            </a>
                          )}
                          {authorTwitter && (
                            <a href={authorTwitter} target="_blank" rel="noopener noreferrer author" aria-label="Follow on X" className="es-author-eeat__social-link">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                              </svg>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Share this with a friend */}
              <div className="es-share-section">
                <h3 className="es-share-section__title">Share this with a friend:</h3>
                <ShareButtonsClient 
                  url={canonical} 
                  title={node.title}
                  networks={['facebook', 'twitter', 'whatsapp', 'copy']}
                  variant="pill"
                />
              </div>

              {/* Related Articles section removed to reduce API load */}

              {/* MGID Native Ad after Related Articles - Lazy Loaded - Mobile & Desktop */}
              <MgidNativeAd 
                widgetId="1520454"
                className="after-related-mgid-ad"
                lazy={true}
              />

              {/* Tags */}

              {/* Share row */}
              <div className="es-share es-share--row">
                <ShareButtonsClient url={canonical} title={node.title} />
              </div>

              {/* Related */}
              {/* Related section removed as per request */}
            </article>

            {/* RIGHT: Sidebar - Desktop Only */}
            <aside className="es-sidebar">
              {/* AdSense Ad after Share Section - 300x50 - Desktop Only */}
              <div className="es-sidebar-section">
                <InArticleAd 
                  slot={process.env.NEXT_PUBLIC_ADSENSE_AFTER_SHARE_SLOT || ''} 
                  size="300x250"
                  className="sidebar-after-share-ad"
                />
              </div>

              {/* Additional Sidebar AdSense Ad */}
              <div className="es-sidebar-section">
                <InArticleAd 
                  slot={process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT || process.env.NEXT_PUBLIC_ADSENSE_AFTER_SHARE_SLOT || ''} 
                  size="300x250"
                  className="sidebar-main-ad"
                />
              </div>
            </aside>
          </div>
        </main>
      </>
    );
  }
