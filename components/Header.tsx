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
        <div className="container">
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
