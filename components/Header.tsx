"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getCategoryUrl } from '@/lib/url-helpers';

interface Category {
  name: string;
  slug: string;
}

interface HeaderProps {
  logoUrl?: string | null;
  siteTitle?: string;
  categories?: Category[];
}

export default function Header({ logoUrl: _logoUrl, siteTitle, categories }: HeaderProps) {
  const [isSticky, setIsSticky] = useState(false);
  const siteName = siteTitle || process.env.SITE_NAME || 'Pahari Patrika';
  const logoSrc = _logoUrl || process.env.NEXT_PUBLIC_SITE_LOGO || process.env.SITE_LOGO_URL || '/logo.svg';
  const logoWidth = Number(process.env.NEXT_PUBLIC_LOGO_WIDTH || 180);
  const logoHeight = Number(process.env.NEXT_PUBLIC_LOGO_HEIGHT || 40);
  const isSvgLogo = typeof logoSrc === 'string' && /\.svg($|\?)/i.test(logoSrc);

  useEffect(() => {
    // Only run on mobile
    if (window.innerWidth > 768) return;

    const handleScroll = () => {
      const scrollPosition = window.pageYOffset;
      setIsSticky(scrollPosition > 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="en-header-wrapper" role="banner">
      {/* Top Bar with Logo and Search */}
      <div className="en-top-bar">
        <div className="en-header-content">
          <div className="en-left-group">
            <button
              type="button"
              className="en-menu-btn"
              aria-label="मेनू"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true" focusable="false">
                <path d="M3 6.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.25Zm0 5.75c0-.414.336-.75.75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Zm.75 5a.75.75 0 0 0 0 1.5h16.5a.75.75 0 0 0 0-1.5H3.75Z"/>
              </svg>
            </button>
            {/* Logo always visible on all screen sizes */}
            <div className="en-logo-section" style={{ marginLeft: 12 }}>
              <Link href="/" aria-label={`${siteName} - होम पेज पर जाएं`}>
                <div className="en-logo-wrapper">{isSvgLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoSrc}
                      alt={siteName}
                      width={logoWidth}
                      height={logoHeight}
                      className="en-logo-img"
                      loading="eager"
                      decoding="async"
                    />
                  ) : (
                    <Image
                      src={logoSrc}
                      alt={siteName}
                      width={logoWidth}
                      height={logoHeight}
                      priority
                      className="en-logo-img"
                    />
                  )}
                </div>
              </Link>
            </div>
          </div>
          
          <div className="en-header-actions">
            <Link href="/live" className="en-live-badge" aria-label="लाइव">
              <span className="en-live-dot" aria-hidden="true"></span>
              LIVE
            </Link>
            
            <Link href="/account" className="en-profile-btn" aria-label="प्रोफ़ाइल">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-label="प्रोफ़ाइल आइकन" focusable="false">
                <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M12 2.5C6.75329 2.5 2.5 6.75329 2.5 12C2.5 17.2467 6.75329 21.5 12 21.5C17.2467 21.5 21.5 17.2467 21.5 12C21.5 6.75329 17.2467 2.5 12 2.5ZM1.5 12C1.5 6.20101 6.20101 1.5 12 1.5C17.799 1.5 22.5 6.20101 22.5 12C22.5 17.799 17.799 22.5 12 22.5C6.20101 22.5 1.5 17.799 1.5 12Z" />
                <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M12 6.5C10.6193 6.5 9.5 7.61929 9.5 9C9.5 10.3807 10.6193 11.5 12 11.5C13.3807 11.5 14.5 10.3807 14.5 9C14.5 7.61929 13.3807 6.5 12 6.5zM8.5 9C8.5 7.067 10.067 5.5 12 5.5C13.933 5.5 15.5 7.067 15.5 9C15.5 10.933 13.933 12.5 12 12.5C10.067 12.5 8.5 10.933 8.5 9zM12.0004 14.5C8.95014 14.5 6.38947 16.6015 5.6896 19.4364L4.71875 19.1967C5.52627 15.9258 8.47943 13.5 12.0004 13.5C15.5214 13.5 18.4746 15.9258 19.2821 19.1967L18.3112 19.4364C17.6114 16.6015 15.0507 14.5 12.0004 14.5z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <div className="en-header-divider" aria-hidden="true"></div>

      {/* Navigation Bar */}
      <nav 
        className="en-nav-bar"
        data-sticky={isSticky}
        role="navigation" 
        aria-label="मुख्य नेविगेशन"
      >
        <div className="en-nav-menu">
          <Link href="/" className="en-nav-link" aria-current="page" aria-label="होम">
            <svg className="en-nav-icon en-nav-icon--home" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
              <path d="M3 11l9-7 9 7" />
              <path d="M5 12v8a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-8" />
            </svg>
            होम
          </Link>
          {Array.isArray(categories) && categories.length > 0 && categories.slice(0, 8).map((c: Category) => (
            <Link 
              key={c.slug} 
              href={getCategoryUrl(c)}
              className="en-nav-link"
              aria-label={`${c.name} कैटेगरी देखें`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}