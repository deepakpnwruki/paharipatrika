import Link from 'next/link';

type Crumb = { name: string; href?: string };

export default function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  const cls = ['meta', 'breadcrumbs', className].filter(Boolean).join(' ');

  // Only Yoast schema will be injected via generateMetadata. No static or custom schema here.

  return (
    <nav
      aria-label="Breadcrumb"
      className={cls}
      style={{
        margin: '0.5rem 0 1rem',
        fontSize: '0.85rem', // smaller font size
        fontWeight: 500,
        color: '#666',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'nowrap',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none', // IE/Edge
      }}
    >
      <style>{`
        .breadcrumbs::-webkit-scrollbar { display: none; }
        .breadcrumbs a {
          color: #5bbcff;
          text-decoration: none;
          transition: color 0.2s;
        }
        .breadcrumbs a:hover {
          color: #005fa3;
          text-decoration: underline;
        }
      `}</style>
      {items.map((it, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
          {it.href ? (
            <Link
              href={it.href}
              style={{
                color: i === 0 || i === 1 ? '#5bbcff' : '#0070f3',
                whiteSpace: 'nowrap',
              }}
            >
              {it.name}
            </Link>
          ) : (
            <span style={{ whiteSpace: 'nowrap' }}>{it.name}</span>
          )}
          {i < items.length - 1 && (
            <span style={{ margin: '0 0.5em', color: '#bbb', fontSize: '1.1em' }} aria-hidden="true">›</span>
          )}
        </span>
      ))}
    </nav>
  );
}
