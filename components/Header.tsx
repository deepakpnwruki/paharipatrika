import Link from 'next/link';
import Image from 'next/image';

interface Category {
  name: string;
  slug: string;
}

interface HeaderProps {
  logoUrl?: string | null;
  siteTitle?: string;
  categories?: Category[];
}

export default function Header({ logoUrl, siteTitle, categories }: HeaderProps) {
  const siteName = siteTitle || 'News हिंदी';

  return (
    <header className="en-header-wrapper" role="banner">
      <div className="en-primary-nav">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="en-logo-container">
            {logoUrl ? (
              <Link href="/" aria-label={`${siteName} - होम पेज पर जाएं`}>
                <Image 
                  src={logoUrl} 
                  alt={siteName}
                  width={120}
                  height={28}
                  priority
                />
              </Link>
            ) : (
              <Link href="/" className="en-brand-text" aria-label="होम पेज पर जाएं">
                {siteName}
              </Link>
            )}
          </div>
          {/* Search Icon */}
          <button className="en-header-search-btn" aria-label="Search" style={{ background: 'none', border: 'none', padding: 0, marginLeft: 'auto', cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>
      </div>

      <nav className="en-nav-bar" role="navigation" aria-label="मुख्य नेविगेशन">
        <div className="container en-nav-container">
          <div className="en-nav-menu">
            <Link href="/" aria-current="page">मुख्य</Link>
            {Array.isArray(categories) && categories.map((c: Category) => (
              <Link 
                key={c.slug} 
                href={`/category/${encodeURIComponent(c.slug)}`}
                aria-label={`${c.name} कैटेगरी देखें`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
