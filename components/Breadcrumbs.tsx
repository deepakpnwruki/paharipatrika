import Link from 'next/link';
export default function Breadcrumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="meta" style={{margin:'0.5rem 0 1rem'}}>
      {items.map((it, i) => (
        <span key={i}>
          {it.href ? <Link href={it.href}>{it.name}</Link> : <span>{it.name}</span>}
          {i < items.length - 1 ? ' › ' : ''}
        </span>
      ))}
    </nav>
  );
}
