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
import Link from 'next/link';
import './mobile-article.css';
import MobileArticle from './mobile-article';
import Image from 'next/image';

type ParamPromise = Promise<{ slug?: string[] }>;

export const revalidate = 300;
export const dynamicParams = true;

/* ---------- helpers ---------- */
// Make relative WP URLs absolute based on site URL
function absoluteUrl(url?: string, site?: string) {
  if (!url) return url as any;
  if (/^https?:\/\//i.test(url)) return url;
  const base = (site || process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
}

function formatDate(dateString: string) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

// Add: estimate reading time from content
function readingMinutesFromHtml(html?: string) {
  // Count words from full HTML (not truncated)
  const text = (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text ? text.split(/\s+/).length : 0;
  return Math.max(1, Math.round(words / 200)); // ~200 WPM
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

  // Try nodeByUri on multiple candidate URIs
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

  // REMOVE: slug-based fallback that causes GraphQL type mismatch
  // const last = segments && segments.length ? segments[segments.length - 1] : undefined;
  // if (last) {
  //   try {
  //     const data = await wpFetch<{ post: any }>(
  //       POST_BY_SLUG_QUERY,
  //       { slug: last },
  //       revalidate,
  //       `postslug:${last}`
  //     );
  //     if (data?.post) return { node: data.post, isPost: true };
  //   } catch {}
  // }

  // Try specific post/page by URI
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

  // Fallback: category by slug
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

  // Final fallback: last segment as category slug
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

function plainText(html?: string, max = 160) {
  const text = (html || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return text.slice(0, max);
}
function metaFromNode(node: any, site: string, fallbackPath: string) {
  const canonical = `${site}${node?.uri || fallbackPath}`;
  const title = node?.title || node?.name || 'Article';
  const desc = plainText(
    (node as any)?.excerpt ?? (node as any)?.description ?? node?.content ?? `${title} - Latest news and updates`,
    160
  );
  return { canonical, title, desc };
}
/* ---------- metadata ---------- */
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
      title: meta.title,
      description: meta.desc,
      url: meta.canonical,
      type: node.__typename === 'Post' ? 'article' : 'website',
      locale: 'hi_IN',
      siteName: process.env.SITE_NAME || 'EduNews',
      images: node?.featuredImage?.node?.sourceUrl
        ? [{
            url: absoluteUrl(node.featuredImage.node.sourceUrl, site),
            width: 1200,
            height: 630,
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

/* ---------- page ---------- */
// CHANGED: include mediaDetails.sizes so we can use a valid generated size URL
const RELATED_POSTS_QUERY = `
  query RelatedPosts {
    posts(first: 4) {
      nodes {
        title
        slug
        featuredImage {
          node {
            sourceUrl
            altText
            mediaDetails {
              sizes {
                name
                sourceUrl
                width
                height
              }
            }
          }
        }
      }
    }
  }
`;
export default async function NodePage({ params }: { params: ParamPromise }) {
  const { slug } = await params;
  const { node } = await resolveNode(slug);
  if (!node) notFound();

  // If WP returned a Category node, render a category listing page
  if (node.__typename === 'Category') {
    const posts = node.posts?.nodes ?? [];
    return (
      <main>
        <header className="en-category-header">
          <div className="container">
            <h1 className="en-category-title">{node.name}</h1>
          </div>
        </header>

        <section className="container en-posts-grid" aria-label={`Posts in ${node.name}`}>
          {posts.map((p: any) => (
            <Link href={`/${p.slug}`} key={p.slug} className="en-post-card">
              {p.featuredImage?.node?.sourceUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.featuredImage.node.sourceUrl}
                  alt={p.featuredImage.node.altText || p.title}
                  loading="lazy"
                  decoding="async"
                />
              )}
              <h3>{p.title}</h3>
              {p.excerpt && <div dangerouslySetInnerHTML={{ __html: p.excerpt }} />}
            </Link>
          ))}
        </section>
      </main>
    );
  }

  // Fetch related posts before using them
  let relatedPosts: any[] = [];
  try {
    const relatedData = await wpFetch<{ posts: { nodes: any } }>(RELATED_POSTS_QUERY);
    relatedPosts = relatedData?.posts?.nodes || [];
  } catch (error) {
    console.error('Error fetching related posts:', error);
    relatedPosts = [];
  }
  const lastSegment = Array.isArray(slug) && slug.length ? slug[slug.length - 1] : '';

  // FIX: clean duplicates and syntax here
  const img = node?.featuredImage?.node || null;
  const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
  const canonical = `${site}${node?.uri || '/' + (slug || []).join('/')}`;

  // Compute reading time and primary category
  const readingMinutes = readingMinutesFromHtml(node?.content || node?.excerpt);
  const primaryCategory = node?.categories?.nodes?.[0];

  // FIX: valid schema JSON
  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': node.__typename === 'Post' ? 'NewsArticle' : 'WebPage',
    headline: node.title,
    description: plainText(node?.excerpt ?? node?.content),
    image: node?.featuredImage?.node?.sourceUrl
      ? { '@type': 'ImageObject', url: node.featuredImage.node.sourceUrl, width: 1200, height: 630 }
      : undefined,
    datePublished: (node as any)?.date,
    dateModified: (node as any)?.modified,
    author: node?.author?.node?.name
      ? {
          '@type': 'Person',
          name: node.author.node.name,
          url: `${site}/author/${node?.author?.node?.slug || 'team'}`,
        }
      : undefined,
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: process.env.ORGANIZATION_NAME || 'EduNews Media',
      logo: { '@type': 'ImageObject', url: `${site}/logo.png`, width: 600, height: 60 },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    url: canonical,
    inLanguage: 'hi-IN',
    articleSection: node?.categories?.nodes?.[0]?.name,
    keywords: node?.tags?.nodes?.map((tag: any) => tag.name).join(', '),
    wordCount: plainText(node?.content).split(/\s+/).filter(Boolean).length,
    timeRequired: `PT${readingMinutes}M`,
  });

  // FIX: wrapTables restored
  function wrapTables(content: string): string {
    return content
      .replace(/<table([^>]*)>/gi, '<div class="table-wrapper"><table$1>')
      .replace(/<\/table>/gi, '</table></div>');
  }

  const processedContent = node.content ? wrapTables(node.content) : '';

  // Remove unused inlineShare to avoid build errors
  // const shareUrl = encodeURIComponent(canonical);
  // const shareTitle = encodeURIComponent(node.title || '');
  // const inlineShare = {
  //   facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
  //   x: `https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`,
  //   whatsapp: `https://wa.me/?text=${shareTitle}%20${shareUrl}`,
  // };

  // FIX: date formatting (IST)
  const dt = new Date((node as any)?.date || Date.now());
  let mobDateStr = '';
  try {
    const tz = 'Asia/Kolkata';
    const datePart = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: tz,
    }).format(dt);
    const timePart = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: tz,
    }).format(dt);
    // Explicitly show IST to avoid "GMT+5:30" labels
    mobDateStr = `${datePart} | ${timePart} IST`;
  } catch {
    mobDateStr = (node as any)?.date || '';
  }

  // Helper: derive WP sized image URL like -150x150 before extension
  function wpSized(url?: string, w = 150, h = 150) {
    if (!url) return url as any;
    try {
      const [base, query = ''] = url.split('?');
      if (base.match(new RegExp(`-${w}x${h}\\.[a-zA-Z0-9]+$`))) return url;
      return base.replace(/(\.[a-zA-Z0-9]+)$/, `-${w}x${h}$1`) + (query ? `?${query}` : '');
    } catch {
      return url;
    }
  }

  // Helper: pick a valid small image from WP sizes (thumbnail > medium > any smallest)
  function pickThumb(imgNode?: any): { url?: string; width?: number; height?: number } {
    const sizes: Array<any> = imgNode?.mediaDetails?.sizes || [];
    if (!sizes.length) return { url: imgNode?.sourceUrl };
    // Prefer 'thumbnail' (usually 150x150), then 'medium'
    const byName = (n: string) => sizes.find(s => (s?.name || '').toLowerCase() === n);
    const thumbnail = byName('thumbnail');
    const medium = byName('medium');
    if (thumbnail?.sourceUrl) return { url: thumbnail.sourceUrl, width: thumbnail.width, height: thumbnail.height };
    if (medium?.sourceUrl) return { url: medium.sourceUrl, width: medium.width, height: medium.height };
    // Otherwise, pick the smallest by width
    const smallest = [...sizes].sort((a, b) => (a?.width || 0) - (b?.width || 0))[0];
    return { url: smallest?.sourceUrl || imgNode?.sourceUrl, width: smallest?.width, height: smallest?.height };
  }

  // NEW: resolve possible author social links from common WP fields (if available)
  const authorNode = (node as any)?.author?.node || {};
  const authorFacebook: string | undefined =
    authorNode?.facebook ||
    authorNode?.social?.facebook ||
    authorNode?.userMeta?.facebook ||
    (typeof authorNode?.url === 'string' && authorNode.url.includes('facebook.com') ? authorNode.url : undefined);
  const authorTwitter: string | undefined =
    authorNode?.x ||
    authorNode?.twitter ||
    authorNode?.social?.x ||
    authorNode?.social?.twitter ||
    authorNode?.userMeta?.x ||
    authorNode?.userMeta?.twitter;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />
      {/* Mobile-only component for non-category nodes */}
      {node.__typename !== 'Category' && (
        <MobileArticle
          node={node}
          canonical={canonical}
          mobDateStr={mobDateStr}
          dt={dt}
          primaryCategory={primaryCategory}
          img={img}
        />
      )}

      <article className="en-article">
        {/* Desktop hero (hidden on mobile) */}
        {img?.sourceUrl && (
          <figure className="en-hero">
            <Image
              src={absoluteUrl(img.sourceUrl, site)}
              alt={img?.altText || node.title}
              width={960}
              height={640}
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              style={{ width: '100%', height: 'auto' }}
            />
          </figure>
        )}

        {/* Desktop category chip and meta */}
        <div className="en-category">
          {primaryCategory?.name || 'न्यूज़'}
        </div>
        <h1>{node.title}</h1>
        <div className="en-meta">
          <div className="en-timestamp">
            <time dateTime={new Date(node.date).toISOString()}>
              {formatDate(node.date)} अपडेट किया गया
            </time>
            <span aria-hidden="true" style={{margin: '0 0.5rem'}}>•</span>
            <span>{readingMinutes} मिनट पढ़ने का समय</span>
          </div>
        </div>

        {/* Content */}
        <div className="en-content" dangerouslySetInnerHTML={{ __html: processedContent }} />

        {/* Author box - unchanged (icons added inline with name) */}
        {node.author?.node && (
          <div className="en-author">
            {node.author.node.avatar?.url && (
              <img 
                src={node.author.node.avatar.url}
                alt={node.author.node.name}
                className="en-author-image"
              />
            )}
            <div>
              <div className="en-author-name">
                {node.author.node.name}
                {(authorFacebook || authorTwitter) && (
                  <span className="en-author-social">
                    {authorFacebook && (
                      <a
                        href={authorFacebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sns fb"
                        aria-label="Facebook profile"
                        title="Facebook"
                      />
                    )}
                    {authorTwitter && (
                      <a
                        href={authorTwitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sns x"
                        aria-label="X profile"
                        title="X"
                      />
                    )}
                  </span>
                )}
              </div>
              <div className="en-author-role">{node.author.node.description || 'संवाददाता'}</div>
            </div>
          </div>
        )}

        {/* Tags */}
        {Array.isArray(node?.tags?.nodes) && node.tags.nodes.length > 0 && (
          <div className="en-tags" style={{ margin: '1.25rem 0' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {node.tags.nodes.map((t: any) => (
                <span
                  key={t.slug}
                  className="en-tag-chip"
                  style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.6rem',
                    borderRadius: 999,
                    background: '#edf2f7',
                    color: '#1a1a1a',
                    fontSize: '.85rem',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  #{t.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ADD: Mobile-only "More from ..." list (now below tags) */}
        {relatedPosts.length > 0 && (
          <section className="mobile-more-articles" aria-label="More articles">
            <h2 className="mm-heading">
              More from {process.env.SITE_NAME || 'EduNews'}
              {primaryCategory?.name ? ` on ${primaryCategory.name}` : ''}
            </h2>
            <ul className="mm-list">
              {relatedPosts
                .filter((post: any) => post.slug !== lastSegment)
                .slice(0, 4)
                .map((post: any) => {
                  const imgNode = post?.featuredImage?.node;
                  const t = pickThumb(imgNode);
                  const thumbUrl = t?.url ? absoluteUrl(t.url, site) : undefined;
                  return (
                    <li className="mm-item" key={post.slug}>
                      <a className="mm-link" href={`/${post.slug}`}>
                        {thumbUrl && (
                          <Image
                            className="mm-thumb"
                            src={thumbUrl}
                            alt={imgNode?.altText || post.title}
                            width={72}
                            height={72}
                            loading="lazy"
                            sizes="72px"
                            style={{ borderRadius: 6, objectFit: 'cover', background: '#000' }}
                          />
                        )}
                        <h3 className="mm-title">{post.title}</h3>
                      </a>
                    </li>
                  );
                })}
            </ul>
          </section>
        )}

        {/* Share buttons - desktop only now */}
        <div className="desktop-share">
          <ShareButtons url={canonical} title={node.title} />
        </div>

        {/* Desktop related posts (hidden on mobile) */}
        {relatedPosts.length > 0 && (
          <div className="en-related">
            <h2 className="en-related-title">और भी पढ़ें</h2>
            <div className="en-related-grid">
              {relatedPosts
                .filter((post: any) => post.slug !== lastSegment)
                .slice(0, 3)
                .map((post: any) => (
                  <a href={`/${post.slug}`} key={post.slug} className="en-related-item">
                    {post.featuredImage?.node?.sourceUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={absoluteUrl(wpSized(post.featuredImage.node.sourceUrl, 150, 150) || post.featuredImage.node.sourceUrl, site)}
                        alt={post.featuredImage.node.altText || post.title}
                        width={150}
                        height={150}
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                    <h3>{post.title}</h3>
                  </a>
                ))}
            </div>
          </div>
        )}
      </article>

      <style>{`
        /* Desktop hero image styling (hidden on mobile) */
        @media (min-width: 769px) {
          .en-hero { margin: 0 0 1rem; }
          .en-hero img {
            width: 100%;
            height: auto;
            display: block;
            aspect-ratio: 3 / 2; /* match mobile hero aspect */
            object-fit: cover;
            object-position: center;
            background: #000;
            border-radius: 12px;
          }
          /* Hide mobile list on desktop */
          .mobile-more-articles { display: none !important; }
        }

        @media (max-width: 768px) {
          .en-hero { display: none; }
          /* Hide desktop share + desktop related on mobile */
          .desktop-share,
          .en-related { display: none !important; }

          /* Mobile "More from ..." list - FULL WIDTH + COMPACT */
          .mobile-more-articles { 
            display: block;
            /* full-bleed section */
            margin: 0 calc(50% - 50vw) 1.25rem;
            width: 100vw;
            /* inner gutter */
            padding: 0 1rem 1rem;
            background: #ffffff;
          }
          .mm-heading {
            margin: 0;
            padding: .75rem 0 .5rem;
            font-size: 1rem;
            font-weight: 800;
            color: #111827;
          }
          .mm-list { list-style: none; margin: 0; padding: 0; }
          .mm-item { padding: .65rem 0; border-top: 1px solid #e5e7eb; }
          .mm-item:first-child { border-top: 0; }
          .mm-link {
            display: grid;
            grid-template-columns: 72px 1fr; /* compact thumbnail */
            gap: .6rem;
            align-items: center;
            text-decoration: none;
            color: inherit;
          }
          .mm-thumb {
            width: 72px;
            height: 72px;
            border-radius: 6px;
            object-fit: cover;
            object-position: center;
            display: block;
            background: #000;
            flex-shrink: 0;
          }
          .mm-title {
            font-size: .95rem;      /* compact title */
            line-height: 1.25;
            font-weight: 800;
          }
        }

        /* Ensure card and related images show as thumbnails */
        .en-post-card img,
        .en-related-item img {
          width: 150px;
          height: 150px;
          display: block;
          object-fit: cover;
          object-position: center;
          background: #000;
          border-radius: 8px;
        }

        /* Author social icons inline with name */
        .en-author-name {
          display: inline-flex;
          align-items: center;
          gap: .5rem;
          flex-wrap: wrap;
        }
        .en-author-social {
          display: inline-flex;
          align-items: center;
          gap: .35rem;
        }
        .en-author-social .sns {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: background .2s, border-color .2s;
        }
        .en-author-social .sns:hover {
          background: #e5e7eb;
          border-color: #d1d5db;
        }
        .en-author-social .sns::before {
          content: '';
          width: 16px;
          height: 16px;
          display: block;
          background-repeat: no-repeat;
          background-position: center;
          background-size: 16px 16px;
        }
        .en-author-social .fb::before {
          background-image: url('data:image/svg+xml;utf8,<svg fill="%231f2937" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 12.06C22 6.48 17.52 2 11.94 2S2 6.48 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9V12.1h2.54V9.9c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.45h-1.25c-1.23 0-1.62.77-1.62 1.56v1.87h2.76l-.44 2.87h-2.32v7.03C18.34 21.24 22 17.08 22 12.06z"/></svg>');
        }
        .en-author-social .x::before {
          background-image: url('data:image/svg+xml;utf8,<svg fill="%231f2937" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18 2h3l-7.5 8.56L22 22h-6.9l-4.5-5.76L4.6 22H2l8.1-9.26L2 2h7l4 5.2L18 2z"/></svg>');
        }

        @media (max-width: 768px) {
          /* Ensure touch target is ok on mobile */
          .en-author-social .sns { width: 30px; height: 30px; }
          .en-author-social .sns::before { width: 18px; height: 18px; background-size: 18px 18px; }
        }
      `}</style>
    </>
  );
}
