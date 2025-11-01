import Link from 'next/link';

type Crumb = { name: string; href?: string };

export default function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  const cls = ['meta', className].filter(Boolean).join(' ');
  
  // Generate BreadcrumbList structured data
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://edunews.com').replace(/\/$/, '');
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      ...(item.href ? { "item": `${siteUrl}${item.href}` } : {})
    }))
  };
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <nav aria-label="Breadcrumb" className={cls} style={{ margin: '0.5rem 0 1rem' }}>
        {items.map((it, i) => (
          <span key={i}>
            {it.href ? <Link href={it.href}>{it.name}</Link> : <span>{it.name}</span>}
            {i < items.length - 1 ? ' › ' : ''}
          </span>
        ))}
      </nav>
    </>
  );
}
