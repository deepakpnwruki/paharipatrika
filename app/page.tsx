import Link from 'next/link';
import type { Metadata } from 'next';
import { wpFetch } from '../lib/graphql';
import { LATEST_POSTS_QUERY } from '../lib/queries';
import './homepage.css';

export const metadata: Metadata = {
  title: 'ताज़ा खबरें, टॉप स्टोरीज़ और न्यूज़ अपडेट्स',
  description: 'ब्रेकिंग न्यूज़, टॉप स्टोरीज़ और लेटेस्ट अपडेट्स। राजनीति, देश-विदेश, मनोरंजन और खेल से जुड़ी हर खबर।',
  openGraph: {
    title: 'ताज़ा खबरें, टॉप स्टोरीज़ और न्यूज़ अपडेट्स',
    description: 'ब्रेकिंग न्यूज़, टॉप स्टोरीज़ और लेटेस्ट अपडेट्स।',
    type: 'website',
  },
};

function timeAgo(dateString: string) {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffH = Math.floor((now - then) / (1000 * 60 * 60));
  if (diffH < 1) return 'अभी';
  if (diffH < 24) return `${diffH} घंटे पहले`;
  const d = Math.floor(diffH / 24);
  if (d === 1) return 'कल';
  if (d < 7) return `${d} दिन पहले`;
  return new Intl.DateTimeFormat('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(dateString));
}

export default async function HomePage() {
  const data = await wpFetch<{ posts: { nodes: any[] } }>(LATEST_POSTS_QUERY);
  const posts = data?.posts?.nodes ?? [];
  const hero = posts[0] || null;
  const heroTrio = posts.slice(1, 4);
  const topHeadlines = posts.slice(4, 14);
  const topStories = posts.slice(6, 14);
  const latest = posts.slice(14, 26);

  const structuredData = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: posts.slice(0, 10).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: p.uri || `/${p.slug}`,
      name: p.title,
    })),
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
      <main className="homepage">
        <div className="container">
          {/* Breaking Bar */}
          <section className="hp-breaking" aria-label="Breaking News">
            <div className="hp-brk-label">
              <span>BREAKING</span>
              <span>NEWS</span>
            </div>
            <div className="hp-brk-head">
              {hero && (
                <Link href={hero.uri || `/${hero.slug}`}>{hero.title}</Link>
              )}
            </div>
          </section>

          {/* HERO SECTION: split hero + trio + right headlines */}
          <section className="hb-surface">
            <div className="hb-board">
              <div className="hb-left">
                {hero && (
                  <article className="hb-feature">
                    <Link href={hero.uri || `/${hero.slug}`} className="hb-feature-link">
                      {hero.featuredImage?.node?.sourceUrl && (
                        <div className="hb-media" data-cat={hero.categories?.nodes?.[0]?.slug || 'news'}>
                          <img
                            src={hero.featuredImage.node.sourceUrl}
                            alt={hero.featuredImage.node.altText || hero.title}
                            loading="eager"
                          />
                        </div>
                      )}
                      <div className="hb-content">
                        {hero.categories?.nodes?.[0]?.name && (
                          <span
                            className="hb-cat"
                            data-cat={hero.categories.nodes[0].slug || 'news'}
                          >
                            {hero.categories.nodes[0].name}
                          </span>
                        )}
                        <h1 className="hb-title">{hero.title}</h1>
                        <div className="hb-meta">
                          <span className="hb-author">{hero.author?.node?.name || 'Staff'}</span>
                          <span className="hb-dot" aria-hidden>•</span>
                          <time dateTime={hero.date}>{timeAgo(hero.date)}</time>
                        </div>
                      </div>
                    </Link>
                  </article>
                )}

                {heroTrio.length > 0 && (
                  <div className="hb-trio">
                    {heroTrio.map((p) => (
                      <article className="hb-mini" key={p.slug}>
                        <Link href={p.uri || `/${p.slug}`} className="hb-mini-link">
                          {p.featuredImage?.node?.sourceUrl && (
                            <div className="hb-mini-media" aria-hidden="true">
                              <img src={p.featuredImage.node.sourceUrl} alt={p.title} loading="lazy" />
                            </div>
                          )}
                          <div className="hb-mini-body">
                            {p.categories?.nodes?.[0]?.name && (
                              <span
                                className="hb-mini-cat"
                                data-cat={p.categories.nodes[0].slug || 'news'}
                              >
                                {p.categories.nodes[0].name}
                              </span>
                            )}
                            <h3 className="hb-mini-title">{p.title}</h3>
                            <div className="hb-mini-meta">
                              <span className="hb-author">{p.author?.node?.name || 'Staff'}</span>
                              <span className="hb-dot" aria-hidden>•</span>
                              <time>{timeAgo(p.date)}</time>
                            </div>
                          </div>
                        </Link>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              <aside className="hb-right">
                <h2 className="hb-right-title">Top Headlines</h2>
                <ul className="hb-right-list">
                  {topHeadlines.map((p) => (
                    <li key={p.slug} className="hb-right-item">
                      <Link href={p.uri || `/${p.slug}`}>{p.title}</Link>
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </section>

          {/* Top Stories */}
          {topStories.length > 0 && (
            <section className="hp-block">
              <h2 className="hp-sec-title">टॉप स्टोरीज़</h2>
              <div className="hp-grid">
                {topStories.map((p) => (
                  <article key={p.slug} className="hp-card">
                    <Link href={p.uri || `/${p.slug}`} className="hp-card-link">
                      {p.featuredImage?.node?.sourceUrl && (
                        <div className="hp-card-media">
                          <img src={p.featuredImage.node.sourceUrl} alt={p.title} loading="lazy" />
                        </div>
                      )}
                      <div className="hp-card-body">
                        {p.categories?.nodes?.[0]?.name && <span className="hp-badge">{p.categories.nodes[0].name}</span>}
                        <h3 className="hp-card-title">{p.title}</h3>
                        <time className="hp-card-time">{timeAgo(p.date)}</time>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Latest */}
          {latest.length > 0 && (
            <section className="hp-block">
              <h2 className="hp-sec-title">लेटेस्ट</h2>
              <div className="hp-grid">
                {latest.map((p) => (
                  <article key={p.slug} className="hp-card">
                    <Link href={p.uri || `/${p.slug}`} className="hp-card-link">
                      {p.featuredImage?.node?.sourceUrl && (
                        <div className="hp-card-media">
                          <img src={p.featuredImage.node.sourceUrl} alt={p.title} loading="lazy" />
                        </div>
                      )}
                      <div className="hp-card-body">
                        {p.categories?.nodes?.[0]?.name && <span className="hp-badge">{p.categories.nodes[0].name}</span>}
                        <h3 className="hp-card-title">{p.title}</h3>
                        <time className="hp-card-time">{timeAgo(p.date)}</time>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
