import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { wpFetch } from '../../lib/graphql';
import {
  NODE_BY_URI_QUERY,
  PAGE_BY_URI_QUERY,
  POST_BY_URI_QUERY,
  CATEGORY_BY_SLUG_QUERY,
} from '../../lib/queries';
import ShareButtons from '../../components/ShareButtons';
import ImageCaption from '../../components/ImageCaption';
import Link from 'next/link';
import Breadcrumbs from '../../components/Breadcrumbs';
import Image from 'next/image';
import './article.css';

type ParamPromise = Promise<{ slug?: string[] }>;

export const revalidate = 60;
export const dynamicParams = true;

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

function readingMinutesFromHtml(html?: string) {
  const text = (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text ? text.split(/\s+/).length : 0;
  return Math.max(1, Math.round(words / 200));
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
      title: `${meta.title} | ${process.env.SITE_NAME || 'EduNews'}`,
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
        siteName: process.env.SITE_NAME || 'EduNews',
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
              <Link href={`/${p.slug}`} key={p.slug} className="es-card">
                {p.featuredImage?.node?.sourceUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.featuredImage.node.sourceUrl} alt={p.featuredImage.node.altText || p.title} />
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
    // Only show Home and Category in breadcrumbs for article page
    const breadcrumbs = [
      { name: 'Home', href: '/' },
      ...(primaryCategory?.slug ? [{ name: primaryCategory.name, href: `/category/${primaryCategory.slug}` }] : [])
    ];

    const schema = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': node.__typename === 'Post' ? 'NewsArticle' : 'WebPage',
      headline: node.title,
      description: plainText(node?.excerpt ?? node?.content),
      image: img?.sourceUrl ? { '@type': 'ImageObject', url: img.sourceUrl, width: 1200, height: 630 } : undefined,
      datePublished: (node as any)?.date,
      dateModified: (node as any)?.modified,
      author: node?.author?.node?.name ? { '@type': 'Person', name: node.author.node.name, url: `${site}/author/${node?.author?.node?.slug || 'team'}` } : undefined,
      publisher: { '@type': 'NewsMediaOrganization', name: process.env.ORGANIZATION_NAME || 'EduNews Media', logo: { '@type': 'ImageObject', url: `${site}/logo.png`, width: 600, height: 60 } },
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
      url: canonical,
      inLanguage: 'hi-IN',
      articleSection: node?.categories?.nodes?.[0]?.name,
      keywords: node?.tags?.nodes?.map((t: any) => t.name).join(', '),
      wordCount: plainText(node?.content).split(/\s+/).filter(Boolean).length
    });

    function wrapTables(content: string): string {
      return content
        .replace(/<table([^>]*)>/gi, '<div class="table-wrapper"><table$1>')
        .replace(/<\/table>/gi, '</table></div>');
    }
    const processedContent = node.content ? wrapTables(node.content) : '';

    const dt = new Date((node as any)?.date || Date.now());
    const tz = 'Asia/Kolkata';
    const datePart = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: tz }).format(dt);
    const timePart = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz }).format(dt);
    const mobDateStr = `${datePart} | ${timePart} IST`;
    const readMins = readingMinutesFromHtml(node?.content);

    // author socials (best-effort)
  const authorNode = (node as any)?.author?.node || {};
  const authorWebsite: string | undefined = authorNode?.url;

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
                            <span className="es-byline__name">
                              By <Link href={`/author/${node.author.node.slug}`}>{node.author.node.name}</Link>
                            </span>
                            {authorWebsite && (
                              <>
                                <span className="es-pipe" style={{ margin: '0 -1px 0 1px', verticalAlign: 'middle' }}>|</span>
                                {authorWebsite.match(/twitter\.com|x\.com/) ? (
                                  <a
                                    href={authorWebsite}
                                    className="es-byline__web"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="X (formerly Twitter) profile"
                                    style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle', marginLeft: 0 }}
                                  >
                                    {/* Official X (Twitter) SVG icon provided by user */}
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      fill="currentColor"
                                      viewBox="0 0 16 16"
                                      style={{ display: 'inline-block', verticalAlign: 'middle' }}
                                    >
                                      <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/>
                                    </svg>
                                  </a>
                                ) : (
                                  <a
                                    href={authorWebsite}
                                    className="es-byline__web"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Author website"
                                    style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle', marginLeft: 0 }}
                                  >
                                    <svg width="16" height="16" viewBox="0 0 16 16" style={{ display: 'block' }}><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M2 8h12M8 2a13 13 0 010 12M8 2a13 13 0 000 12" stroke="currentColor" strokeWidth="1" fill="none"/></svg>
                                  </a>
                                )}
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

              {img?.sourceUrl && (
                <ImageCaption
                  src={absoluteUrl(img.sourceUrl, site)}
                  alt={img?.altText || node.title}
                  width={768}
                  height={432}
                  priority
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="es-hero__img"
                  caption={img?.caption || img?.altText || ''}
                />
              )}
            </div>
          </section>

          {/* ---------- BODY ---------- */}
          <div className="es-container es-layout">
            {/* LEFT: article */}
            <article className="es-article">
              <div className="es-article__body">
                <div className="en-content" dangerouslySetInnerHTML={{ __html: processedContent }} />
              </div>

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

              {/* Related Topics Tags */}
              {Array.isArray(node?.tags?.nodes) && node.tags.nodes.length > 0 && (
                <div className="es-related-topics">
                  <h3 className="es-related-topics__title">Posts On Related Topics <span className="es-slash">/</span></h3>
                  <div className="es-topic-tags">
                    {node.tags.nodes.map((t: any) => (
                      <Link key={t.slug} href={`/tag/${t.slug}`} className="es-topic-tag">
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
                    const href = post.uri || `/${post.slug}`;
                    return (
                      <Link href={href} key={post.slug} className="es-related-article">
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

              {/* Author card */}
              {node.author?.node && (
                <div className="es-author">
                  {node.author.node.avatar?.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={node.author.node.avatar.url} alt={node.author.node.name} className="es-author__img" />
                  )}
                  <div className="es-author__info">
                    <div className="es-author__name">
                      {node.author.node.name}
                      <span className="es-author__sns">
                        {authorWebsite && <a href={authorWebsite} target="_blank" rel="noopener noreferrer" aria-label="Website" className="sns-web" />}
                      </span>
                    </div>
                    <div className="es-author__role">{node.author.node.description || 'संवाददाता'}</div>
                  </div>
                </div>
              )}

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
                    More from {process.env.SITE_NAME || 'EduNews'}
                    {primaryCategory?.name ? ` on ${primaryCategory.name}` : ''}
                  </h2>
                  <div className="es-related__grid">
                    {relatedItems.map((post: any) => {
                      const t = pickThumb(post?.featuredImage?.node);
                      const thumbUrl = t?.url ? absoluteUrl(t.url, site) : undefined;
                      const href = post.uri || `/${post.slug}`;
                      return (
                        <Link href={href} key={post.slug} className="es-related__card">
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
                      const href = post.uri || `/${post.slug}`;
                      return (
                        <li key={`latest-${post.slug}`}>
                          <Link href={href} className="es-list__item">
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
                      const href = post.uri || `/${post.slug}`;
                      return (
                        <li key={`trending-${post.slug}`}>
                          <Link href={href} className="es-list__item">
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
