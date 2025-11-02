import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { wpFetch } from '../../lib/graphql';
import {
  NODE_BY_URI_QUERY,
  PAGE_BY_URI_QUERY,
  POST_BY_URI_QUERY,
  CATEGORY_BY_SLUG_QUERY,
} from '../../lib/queries';
import ShareButtons from '../../components/ShareButtons';
import ImageCaption from '../../components/ImageCaption';
import InArticleAd from '../../components/InArticleAd';
import ArticleContentWithAds from '../../components/ArticleContentWithAds';
import SocialEmbeds from '../../components/SocialEmbeds';
import EmbedProcessor from '../../components/EmbedProcessor';
import Link from 'next/link';
import Breadcrumbs from '../../components/Breadcrumbs';
import './article.css';
import { getPostUrl, getCategoryUrl, getTagUrl } from '../../lib/url-helpers';

type ParamPromise = Promise<{ slug?: string[] }>;

export const revalidate = 60; // ISR: 1 minute for breaking news articles
export const dynamic = 'force-static'; // Use ISR for better performance
export const dynamicParams = true; // Allow new articles dynamically

// Pre-generate most recent and popular posts at build time for instant loading
export async function generateStaticParams() {
  try {
    // Fetch recent posts to pre-generate
    const data = await wpFetch<{ posts: { nodes: Array<{ slug: string; uri: string }> } }>(
      `query RecentPosts {
        posts(first: 100, where: { orderby: { field: DATE, order: DESC } }) {
          nodes {
            slug
            uri
          }
        }
      }`,
      {},
      3600
    );
    
    return (data?.posts?.nodes || [])
      .filter(post => post.uri) // Ensure valid URIs
      .map((post) => {
        // Convert /post-slug/ to { slug: ['post-slug'] }
        const segments = post.uri.split('/').filter(Boolean);
        return { slug: segments };
      });
  } catch (error) {
    console.error('Error generating static params for posts:', error);
    return [];
  }
}

/* ---------------- utilities ---------------- */
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

function plainText(html?: string, max = 160) {
  const text = (html || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return text.slice(0, max);
}

function candidates(segments?: string[]) {
  if (!segments || segments.length === 0) return [];
  const joined = '/' + segments.join('/');
  const set = new Set<string>();
  const addForms = (s: string) => {
    set.add(s);
    set.add(s.endsWith('/') ? s : s + '/');
  };
  addForms(joined);
  addForms(joined.toLowerCase());
  try {
    const dec = decodeURIComponent(joined);
    addForms(dec);
    addForms(dec.toLowerCase());
  } catch {}
  // New permalink support: try .html variant for likely post paths
  // Only apply when it's a single-segment path (post at root) and not taxonomy routes
  const first = segments[0];
  const isTaxonomy = first === 'category' || first === 'tag' || first === 'author' || first === 'pages';
  const last = segments[segments.length - 1] || '';
  const looksLikeFile = /\.[a-z0-9]+$/i.test(last);
  if (!isTaxonomy && segments.length === 1 && !looksLikeFile) {
    const htmlPath = `/${last}.html`;
    addForms(htmlPath);
    addForms(htmlPath.toLowerCase());
  }
  return Array.from(set);
}

async function resolveNode(segments?: string[]) {
  const cs = candidates(segments);

  for (const uri of cs) {
    try {
      const data = await wpFetch<{ nodeByUri: any }>(
        NODE_BY_URI_QUERY,
        { uri },
        revalidate,
        `node:${uri}`
      );
      if (data?.nodeByUri) {
        const n = data.nodeByUri;
        return { node: n, isPost: n.__typename === 'Post' };
      }
    } catch {}
  }
  for (const uri of cs) {
    try {
      const p = await wpFetch<{ post: any }>(
        POST_BY_URI_QUERY,
        { uri },
        revalidate,
        `post:${uri}`
      );
      if (p?.post) return { node: p.post, isPost: true };
    } catch {}
    try {
      const pg = await wpFetch<{ page: any }>(
        PAGE_BY_URI_QUERY,
        { uri },
        revalidate,
        `page:${uri}`
      );
      if (pg?.page) return { node: pg.page, isPost: false };
    } catch {}
  }
  if (segments && segments.length >= 2 && segments[0] === 'category') {
    const categorySlug = segments[1];
    try {
      const catData = await wpFetch<{ category: any }>(
        CATEGORY_BY_SLUG_QUERY,
        { slug: categorySlug },
        revalidate,
        `cat:${categorySlug}`
      );
      if (catData?.category) return { node: catData.category, isPost: false };
    } catch {}
  }
  if (segments && segments.length) {
    const lastSeg = segments[segments.length - 1];
    try {
      const catData = await wpFetch<{ category: any }>(
        CATEGORY_BY_SLUG_QUERY,
        { slug: lastSeg },
        revalidate,
        `cat:${lastSeg}`
      );
      if (catData?.category) return { node: catData.category, isPost: false };
    } catch {}
  }
  return { node: null, isPost: false };
}

  /* ---------------- metadata ---------------- */
  function metaFromNode(node: any, site: string, fallbackPath: string) {
    const canonical = `${site}${node?.uri || fallbackPath}`;
    const title = node?.title || node?.name || 'Article';
    const desc = plainText(
      (node as any)?.excerpt ?? (node as any)?.description ?? node?.content ?? `${title} - Latest news and updates`,
      160
    );
    return { canonical, title, desc };
  }

  export async function generateMetadata(
    { params }: { params: ParamPromise },
    _parent: ResolvingMetadata
  ): Promise<Metadata> {
    const { slug } = await params;
    const { node } = await resolveNode(slug);
    if (!node) return { title: 'Not found' };

    const site = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
    const meta = metaFromNode(node, site, '/' + (slug || []).join('/'));

    return {
      title: `${meta.title} | ${process.env.SITE_NAME || 'Pahari Patrika'}`,
      description: meta.desc,
      alternates: { canonical: meta.canonical },
      robots: {
        index: true, follow: true,
        googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
      },
      openGraph: {
        title: meta.title,
        description: meta.desc,
        url: meta.canonical,
        type: node.__typename === 'Post' ? 'article' : 'website',
        locale: 'hi_IN',
        siteName: process.env.SITE_NAME || 'Pahari Patrika',
        images: node?.featuredImage?.node?.sourceUrl
          ? [{
              url: absoluteUrl(node.featuredImage.node.sourceUrl, site),
              width: 1200, height: 630,
              alt: node.title || (node as any)?.name
            }]
          : [],
        publishedTime: (node as any)?.date,
        modifiedTime: (node as any)?.modified,
        authors: (node as any)?.author?.node?.name ? [(node as any).author.node.name] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: meta.title,
        description: meta.desc,
        images: node?.featuredImage?.node?.sourceUrl
          ? [absoluteUrl(node.featuredImage.node.sourceUrl, site)]
          : [],
      },
    };
  }

  /* -------------- data for sidebars -------------- */
  const RELATED_POSTS_QUERY = `
    query RelatedPosts {
      posts(first: 12) {
        nodes {
          title
          slug
          uri
          date
          featuredImage {
            node {
              sourceUrl
              altText
              mediaDetails {
                sizes { name sourceUrl width height }
              }
            }
          }
        }
      }
    }
  `;

  /* ---------------- page ---------------- */
  export default async function NodePage({ params }: { params: ParamPromise }) {
    const { slug } = await params;
    const { node } = await resolveNode(slug);
    if (!node) notFound();

    // Category listing view
    if (node.__typename === 'Category') {
      const posts = node.posts?.nodes ?? [];
      return (
        <main className="es-page">
          <header className="es-cat-header">
            <div className="es-container">
              <h1 className="es-cat-title">{node.name}</h1>
            </div>
          </header>

          <section className="es-container es-grid es-grid--cards" aria-label={`Posts in ${node.name}`}>
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
                <h3 className="es-card__title">{p.title}</h3>
                {p.excerpt && <div className="es-card__excerpt" dangerouslySetInnerHTML={{ __html: p.excerpt }} />}
              </Link>
            ))}
          </section>
        </main>
      );
    }

    // Related/Latest/Trending
    let relatedPosts: any[] = [];
    try {
      const relatedData = await wpFetch<{ posts: { nodes: any } }>(RELATED_POSTS_QUERY);
      relatedPosts = relatedData?.posts?.nodes || [];
    } catch { relatedPosts = []; }

    const img = node?.featuredImage?.node || null;
    const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
    const canonical = `${site}${node?.uri || '/' + (slug || []).join('/')}`;

    const primaryCategory = node?.categories?.nodes?.[0];
    const breadcrumbs = [
      { name: 'Home', href: '/' },
      ...(primaryCategory?.slug ? [{ name: primaryCategory.name, href: getCategoryUrl(primaryCategory) }] : [])
    ];

    const imgWidth = (img as any)?.mediaDetails?.width || 1200;
    const imgHeight = (img as any)?.mediaDetails?.height || 630;
    // Ensure ISO8601 with timezone for datePublished/dateModified/dateCreated
    const toIsoWithTZ = (d?: string) => d ? new Date(d).toISOString() : undefined;
    const schema = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': node.__typename === 'Post' ? 'NewsArticle' : 'WebPage',
      headline: node.title,
      description: plainText(node?.excerpt ?? node?.content),
      image: img?.sourceUrl ? { 
        '@type': 'ImageObject', 
        url: absoluteUrl(img.sourceUrl, site), 
        width: imgWidth, 
        height: imgHeight,
        caption: plainText(img?.caption || img?.description || '', 240) || (img?.altText || '')
      } : undefined,
      thumbnailUrl: img?.sourceUrl ? absoluteUrl(img.sourceUrl, site) : undefined,
      datePublished: toIsoWithTZ((node as any)?.date),
      dateModified: toIsoWithTZ((node as any)?.modified),
      dateCreated: toIsoWithTZ((node as any)?.date),
      articleBody: plainText(node?.content),
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['.es-title', '.en-content']
      },
      author: node?.author?.node?.name ? { 
        '@type': 'Person', 
        name: node.author.node.name, 
        url: `${site}/author/${node?.author?.node?.slug || 'team'}`,
        description: node.author.node.description || 'संवाददाता',
        image: node.author.node.avatar?.url ? {
          '@type': 'ImageObject',
          url: node.author.node.avatar.url
        } : undefined
      } : undefined,
      publisher: { '@type': 'NewsMediaOrganization', name: process.env.ORGANIZATION_NAME || 'Pahari Patrika Media', logo: { '@type': 'ImageObject', url: `${site}/logo.png`, width: 600, height: 60 } },
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
      url: canonical,
      inLanguage: 'hi-IN',
      articleSection: node?.categories?.nodes?.[0]?.name,
      keywords: node?.tags?.nodes?.map((t: any) => t.name).join(', '),
      wordCount: plainText(node?.content).split(/\s+/).filter(Boolean).length
    });

    // Breadcrumb JSON-LD for Article/Page
    const breadcrumbItems = [
      { '@type': 'ListItem', position: 1, name: 'Home', item: site },
      ...(primaryCategory?.slug ? [{ '@type': 'ListItem', position: 2, name: primaryCategory.name, item: `${site}${getCategoryUrl(primaryCategory)}` }] : []),
    ];
    const articlePosition = breadcrumbItems.length + 1;
    breadcrumbItems.push({ '@type': 'ListItem', position: articlePosition, name: node.title, item: canonical });
    const breadcrumbSchema = JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: breadcrumbItems });

    function wrapTables(content: string): string {
      return content
        .replace(/<table([^>]*)>/gi, '<div class="table-wrapper"><table$1>')
        .replace(/<\/table>/gi, '</table></div>');
    }
    
    // Function to insert ads every 2 paragraphs
    function insertAdsInContent(content: string): string {
      // Split content by paragraphs
      const paragraphs = content.split(/<\/p>/gi);
      let result = '';
      let paragraphCount = 0;
      
      for (let i = 0; i < paragraphs.length; i++) {
        // Add the paragraph back
        if (paragraphs[i].trim()) {
          result += paragraphs[i] + '</p>';
          
          // Check if this is a valid paragraph (not just whitespace or inside other tags)
          if (paragraphs[i].includes('<p')) {
            paragraphCount++;
            
            // Insert ad after every 2 paragraphs
            if (paragraphCount % 2 === 0 && i < paragraphs.length - 1) {
              result += `<div class="article-ad-slot" data-ad-position="${Math.floor(paragraphCount / 2)}"></div>`;
            }
          }
        }
      }
      
      return result;
    }
    
    const processedContent = node.content ? insertAdsInContent(wrapTables(node.content)) : '';

    const dt = new Date((node as any)?.date || Date.now());
    const tz = 'Asia/Kolkata';
    const datePart = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: tz }).format(dt);
    const timePart = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz }).format(dt);
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

    // related buckets
    const sanitizedRelated = relatedPosts.filter((p: any) => p.slug !== node.slug);
    const latestItems = sanitizedRelated.slice(0, 4);
    const trendingItems = sanitizedRelated.slice(4, 8);
    const bottomItems = sanitizedRelated.slice(8, 12);
    const relatedItems = bottomItems.length > 0 ? bottomItems : sanitizedRelated.slice(0, 4);

    // small image picker
    function pickThumb(imgNode?: any): { url?: string; width?: number; height?: number } {
      const sizes: Array<any> = imgNode?.mediaDetails?.sizes || [];
      if (!sizes.length) return { url: imgNode?.sourceUrl };
      const byName = (n: string) => sizes.find((s: any) => (s?.name || '').toLowerCase() === n);
      const t = byName('thumbnail') || byName('medium') ||
        [...sizes].sort((a, b) => (a?.width || 0) - (b?.width || 0))[0];
      return { url: t?.sourceUrl || imgNode?.sourceUrl, width: t?.width, height: t?.height };
    }

    return (
      <>
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema }} />
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
                      <ShareButtons
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

              {img?.sourceUrl && (() => {
                const photoCaption = plainText(img?.caption || img?.description || '', 240) || (img?.altText || '');
                const imageAlt = img?.altText || node.title || 'Article image';
                return (
                  <ImageCaption
                    src={absoluteUrl(img.sourceUrl, site)}
                    alt={imageAlt}
                    width={768}
                    height={432}
                    priority
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="es-hero__img"
                    caption={photoCaption}
                  />
                );
              })()}
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
                          {node.author.node.description.length > 120 
                            ? `${node.author.node.description.substring(0, 120)}...` 
                            : node.author.node.description}
                          {node.author.node.description.length > 120 && node.author.node.slug && (
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
                <ShareButtons 
                  url={canonical} 
                  title={node.title}
                  networks={['facebook', 'twitter', 'whatsapp', 'copy']}
                  variant="pill"
                />
              </div>

              {/* Ad after Share Section - 300x50 */}
              <InArticleAd 
                slot={process.env.NEXT_PUBLIC_ADSENSE_AFTER_SHARE_SLOT || ''} 
                size="300x50"
                className="after-share-ad"
              />

              {/* Related Topics Tags */}
              {Array.isArray(node?.tags?.nodes) && node.tags.nodes.length > 0 && (
                <div className="es-related-topics">
                  <h3 className="es-related-topics__title">Posts On Related Topics <span className="es-slash">/</span></h3>
                  <div className="es-topic-tags">
                    {node.tags.nodes.map((t: any) => (
                      <Link key={t.slug} href={getTagUrl(t)} className="es-topic-tag">
                        {t.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Articles */}
              {relatedItems.length > 0 && (
                <div className="es-related-articles">
                  {relatedItems.slice(0, 3).map((post: any) => {
                    const href = getPostUrl(post);
                    return (
                      <Link href={href} key={post.slug} className="es-related-article" prefetch={false}>
                        {post?.featuredImage?.node?.sourceUrl && (
                          <div className="es-related-article__image">
                            <Image
                              src={absoluteUrl(post.featuredImage.node.sourceUrl, site)}
                              alt={post.featuredImage?.node?.altText || post.title}
                              width={768}
                              height={432}
                              sizes="(max-width: 768px) 100vw, 768px"
                            />
                          </div>
                        )}
                        <h4 className="es-related-article__title">{post.title}</h4>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Ad after Related Articles - 300x250 */}
              <InArticleAd 
                slot={process.env.NEXT_PUBLIC_ADSENSE_AFTER_RELATED_SLOT || ''} 
                size="300x250"
                className="after-related-ad"
              />

              {/* Tags */}
              {Array.isArray(node?.tags?.nodes) && node.tags.nodes.length > 0 && (
                <div className="es-tags">
                  {node.tags.nodes.map((t: any) => (
                    <span key={t.slug} className="es-tag">#{t.name}</span>
                  ))}
                </div>
              )}

              {/* Share row */}
              <div className="es-share es-share--row">
                <ShareButtons url={canonical} title={node.title} />
              </div>

              {/* Related */}
              {relatedItems.length > 0 && (
                <section className="es-related" aria-label="More articles">
                  <h2 className="es-related__title">
                    More from {process.env.SITE_NAME || 'Pahari Patrika'}
                    {primaryCategory?.name ? ` on ${primaryCategory.name}` : ''}
                  </h2>
                  <div className="es-related__grid">
                    {relatedItems.map((post: any) => {
                      const t = pickThumb(post?.featuredImage?.node);
                      const thumbUrl = t?.url ? absoluteUrl(t.url, site) : undefined;
                      const href = getPostUrl(post);
                      return (
                        <Link href={href} key={post.slug} className="es-related__card" prefetch={false}>
                          {thumbUrl && (
                            <span className="es-related__media">
                              <Image
                                src={thumbUrl}
                                alt={post.featuredImage?.node?.altText || post.title}
                                fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 320px"
                              />
                            </span>
                          )}
                          <h3 className="es-related__h3">{post.title}</h3>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}
            </article>

            {/* RIGHT: sidebar */}
            <aside className="es-sidebar">
              {latestItems.length > 0 && (
                <div className="es-panel">
                  <h3 className="es-panel__title">LATEST UPDATES</h3>
                  <ul className="es-list es-list--latest">
                    {latestItems.map((post: any) => {
                      const thumb = pickThumb(post?.featuredImage?.node);
                      const href = getPostUrl(post);
                      return (
                        <li key={`latest-${post.slug}`}>
                          <Link href={href} className="es-list__item" prefetch={false}>
                            {thumb?.url && (
                              <span className="es-list__thumb">
                                <Image src={absoluteUrl(thumb.url, site)} alt={post.featuredImage?.node?.altText || post.title} fill sizes="96px" />
                              </span>
                            )}
                            <span className="es-list__content">
                              <span className="es-list__title">{post.title}</span>
                              <span className="es-list__time">{timeAgo(post.date)}</span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {trendingItems.length > 0 && (
                <div className="es-panel">
                  <h3 className="es-panel__title">TRENDING STORIES</h3>
                  <ul className="es-list es-list--trend">
                    {trendingItems.map((post: any, index: number) => {
                      const thumb = pickThumb(post?.featuredImage?.node);
                      const href = getPostUrl(post);
                      return (
                        <li key={`trending-${post.slug}`}>
                          <Link href={href} className="es-list__item" prefetch={false}>
                            {thumb?.url && (
                              <span className="es-list__thumb es-list__thumb--badge">
                                <Image src={absoluteUrl(thumb.url, site)} alt={post.featuredImage?.node?.altText || post.title} fill sizes="96px" />
                                <span className="es-badge">{(index + 1).toString().padStart(2, '0')}</span>
                              </span>
                            )}
                            <span className="es-list__content">
                              <span className="es-list__title">{post.title}</span>
                              <span className="es-list__time">{timeAgo(post.date)}</span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        </main>
      </>
    );
  }
