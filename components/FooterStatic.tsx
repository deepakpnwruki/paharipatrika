import React from 'react';
import Link from 'next/link';

export default function FooterStatic() {
  const year = new Date().getFullYear();
  const siteName = process.env.SITE_NAME || 'Pahari Patrika';

  // Static social links from environment
  const socials = [
    process.env.SOCIAL_FACEBOOK && {
      key: 'SOCIAL_FACEBOOK',
      label: 'Facebook',
      href: process.env.SOCIAL_FACEBOOK,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-3h2.5V9.5A3.5 3.5 0 0 1 14 6h3v3h-3a1 1 0 0 0-1 1V12H17l-.5 3h-3v7A10 10 0 0 0 22 12Z"/>
        </svg>
      ),
    },
    process.env.SOCIAL_TWITTER && {
      key: 'SOCIAL_TWITTER',
      label: 'Twitter',
      href: process.env.SOCIAL_TWITTER,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M22 5.8c-.7.3-1.4.5-2.1.6.8-.5 1.3-1.2 1.6-2.1-.7.4-1.6.8-2.5 1C18.3 4.5 17.2 4 16 4c-2.3 0-4.1 1.9-4.1 4.2 0 .3 0 .6.1.9-3.4-.2-6.5-1.8-8.5-4.2-.4.7-.6 1.4-.6 2.2 0 1.5.7 2.9 1.9 3.7-.6 0-1.2-.2-1.8-.5v.1c0 2.1 1.4 3.8 3.3 4.3-.3.1-.7.1-1 .1-.2 0-.5 0-.7-.1.5 1.7 2.1 3 4 3.1-1.5 1.2-3.3 1.9-5.3 1.9h-1c1.9 1.2 4.2 1.9 6.6 1.9 8 0 12.4-6.7 12.4-12.5v-.6c.8-.6 1.4-1.2 1.9-2z"/>
        </svg>
      ),
    },
    process.env.SOCIAL_INSTAGRAM && {
      key: 'SOCIAL_INSTAGRAM',
      label: 'Instagram',
      href: process.env.SOCIAL_INSTAGRAM,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Zm0 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm5-2.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z"/>
        </svg>
      ),
    },
    process.env.SOCIAL_YOUTUBE && {
      key: 'SOCIAL_YOUTUBE',
      label: 'YouTube',
      href: process.env.SOCIAL_YOUTUBE,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M23 7.5c0-1.7-1.3-3-3-3H4c-1.7 0-3 1.3-3 3v9c0 1.7 1.3 3 3 3h16c1.7 0 3-1.3 3-3v-9Zm-13 8V8l7 3.75L10 15.5Z"/>
        </svg>
      ),
    },
    process.env.SOCIAL_LINKEDIN && {
      key: 'SOCIAL_LINKEDIN',
      label: 'LinkedIn',
      href: process.env.SOCIAL_LINKEDIN,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M4.98 3.5C4.98 4.6 4.1 5.5 3 5.5S1 4.6 1 3.5 1.9 1.5 3 1.5s1.98.9 1.98 2ZM2 8h2v13H2V8Zm6 0h2v1.7h.1c.3-.6 1.1-1.7 2.9-1.7 3.1 0 3.7 2 3.7 4.6V21H15v-6.5c0-1.5 0-3.3-2-3.3-2 0-2.3 1.6-2.3 3.2V21H8V8Z"/>
        </svg>
      ),
    },
  ].filter(Boolean);

  return (
    <footer className="en-footer" role="contentinfo">
      <div className="container en-footer-inner">
        <div className="en-footer-top">
          {/* Static navigation - no API calls */}
          <nav className="en-footer-nav" aria-label="footer">
            <Link href="/pages/about">About Us</Link>
            <Link href="/pages/contact">Contact</Link>
            <Link href="/pages/privacy-policy">Privacy Policy</Link>
            <Link href="/pages/terms">Terms</Link>
            <Link href="/pages/disclaimer">Disclaimer</Link>
            <Link href="/pages/feedback">Feedback</Link>
          </nav>
          
          {/* Social links from environment variables */}
          {socials.length > 0 && (
            <div className="en-footer-social" aria-label="social">
              {socials.map(s => {
                if (!s || typeof s !== 'object') return null;
                return (
                  <Link key={s.key} href={s.href as string} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="en-footer-social-link">
                    {s.icon}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="en-footer-sep" aria-hidden="true" />

        <p className="en-footer-ethics">This website follows the DNPA Code of Ethics</p>
        <p className="en-footer-copy">© Copyright {siteName} {year}. All rights reserved.</p>
      </div>
    </footer>
  );
}