import Link from 'next/link';

type Crumb = { name: string; href?: string };

export default function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  const cls = ['meta', className].filter(Boolean).join(' ');
  
  // Only Yoast schema will be injected via generateMetadata. No static or custom schema here.
  
  return (
    <nav aria-label="Breadcrumb" className={cls} style={{ margin: '0.5rem 0 1rem' }}>
      {items.map((it, i) => (
        <span key={i}>
          {it.href ? <Link href={it.href}>{it.name}</Link> : <span>{it.name}</span>}
          {i < items.length - 1 ? '  ' : ''}
        </span>
      ))}
    </nav>
  );
}
