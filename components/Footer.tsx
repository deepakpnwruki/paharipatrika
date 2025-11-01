import React from 'react';
import Link from 'next/link';
import { wpFetch } from '../lib/graphql';
import { PAGES_QUERY, FOOTER_MENU_BY_LOCATION_QUERY, FOOTER_MENU_BY_SLUG_QUERY } from '../lib/queries';

type MenuItem = { label: string; href: string };

function trimSlashes(s: string) {
  return s.replace(/^\/+|\/+$/g, '');
}

function toInternalHref(uri: string, typename?: string): string {
  const clean = '/' + trimSlashes(uri || '/');
  if (typename === 'Page') {
    // Our Next.js pages are served via /pages/[...slug]
    return '/pages' + clean;
  }
  // Posts, categories, tags, etc. use their native URIs
  return clean;
}

export default async function Footer() {
  const revalidateSeconds = Number(process.env.REVALIDATE_SECONDS ?? 300);
  const footerMenuLocation = process.env.FOOTER_MENU_LOCATION;
  const footerMenuSlug = process.env.FOOTER_MENU_SLUG;
  const footerEnvLinks = process.env.FOOTER_MENU_LINKS;

  let menuItems: MenuItem[] = [];

  // 1) Try WPGraphQL by location
  if (footerMenuLocation) {
    try {
      const data = await wpFetch<any>(
        FOOTER_MENU_BY_LOCATION_QUERY,
        { location: footerMenuLocation },
        revalidateSeconds,
        'footer-menu:location'
      );
      const nodes = data?.menuItems?.nodes || [];
      menuItems = nodes.map((n: any) => {
        const connectedUri = n?.connectedNode?.node?.uri as string | undefined;
        const typename = n?.connectedNode?.node?.__typename as string | undefined;
        const path = connectedUri || n?.path || (n?.url ? new URL(n.url).pathname : '/');
        return { label: n.label, href: toInternalHref(path || '/', typename) };
      });
    } catch (e) {
      console.error('Error fetching footer menu by location:', e);
    }
  }

  // 2) Fallback: try by menu slug
  if (menuItems.length === 0 && footerMenuSlug) {
    try {
      const data = await wpFetch<any>(
        FOOTER_MENU_BY_SLUG_QUERY,
        { slug: footerMenuSlug },
        revalidateSeconds,
        'footer-menu:slug'
      );
      const nodes = data?.menu?.menuItems?.nodes || [];
      menuItems = nodes.map((n: any) => {
        const connectedUri = n?.connectedNode?.node?.uri as string | undefined;
        const typename = n?.connectedNode?.node?.__typename as string | undefined;
        const path = connectedUri || n?.path || (n?.url ? new URL(n.url).pathname : '/');
        return { label: n.label, href: toInternalHref(path || '/', typename) };
      });
    } catch (e) {
      console.error('Error fetching footer menu by slug:', e);
    }
  }

  // 3) Fallback: use env FOOTER_MENU_LINKS (comma-separated slugs)
  if (menuItems.length === 0 && footerEnvLinks) {
    const slugs = footerEnvLinks.split(',').map(s => trimSlashes(s.trim())).filter(Boolean);
    menuItems = slugs.map(slug => ({ label: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), href: `/pages/${slug}` }));
  }

  // 4) Last resort: pull a few WordPress pages
  if (menuItems.length === 0) {
    try {
      const data = await wpFetch<any>(PAGES_QUERY, { first: 10 }, revalidateSeconds, 'footer-pages');
      const pages = data?.pages?.nodes || [];
      menuItems = pages.map((p: any) => ({ label: p.title, href: `/pages/${trimSlashes(p.slug)}` }));
    } catch (e) {
      console.error('Error fetching fallback footer pages:', e);
    }
  }

  const year = new Date().getFullYear();
  const siteName = process.env.SITE_NAME || 'Pahari Patrika';
  const showSocial = String(process.env.ENABLE_SOCIAL_FOOTER || '').toLowerCase() === 'true';
  const socials = [
    { key: 'SOCIAL_FACEBOOK', label: 'Facebook', href: process.env.SOCIAL_FACEBOOK, icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-3h2.5V9.5A3.5 3.5 0 0 1 14 6h3v3h-3a1 1 0 0 0-1 1V12H17l-.5 3h-3v7A10 10 0 0 0 22 12Z"/>
      </svg>
    )},
    { key: 'SOCIAL_TWITTER', label: 'Twitter', href: process.env.SOCIAL_TWITTER, icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M22 5.8c-.7.3-1.4.5-2.1.6.8-.5 1.3-1.2 1.6-2.1-.7.4-1.6.8-2.5 1C18.3 4.5 17.2 4 16 4c-2.3 0-4.1 1.9-4.1 4.2 0 .3 0 .6.1.9-3.4-.2-6.5-1.8-8.5-4.2-.4.7-.6 1.4-.6 2.2 0 1.5.7 2.9 1.9 3.7-.6 0-1.2-.2-1.8-.5v.1c0 2.1 1.4 3.8 3.3 4.3-.3.1-.7.1-1 .1-.2 0-.5 0-.7-.1.5 1.7 2.1 3 4 3.1-1.5 1.2-3.3 1.9-5.3 1.9h-1c1.9 1.2 4.2 1.9 6.6 1.9 8 0 12.4-6.7 12.4-12.5v-.6c.8-.6 1.4-1.2 1.9-2z"/>
      </svg>
    )},
    { key: 'SOCIAL_INSTAGRAM', label: 'Instagram', href: process.env.SOCIAL_INSTAGRAM, icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Zm0 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm5-2.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z"/>
      </svg>
    )},
    { key: 'SOCIAL_YOUTUBE', label: 'YouTube', href: process.env.SOCIAL_YOUTUBE, icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M23 7.5c0-1.7-1.3-3-3-3H4c-1.7 0-3 1.3-3 3v9c0 1.7 1.3 3 3 3h16c1.7 0 3-1.3 3-3v-9Zm-13 8V8l7 3.75L10 15.5Z"/>
      </svg>
    )},
    { key: 'SOCIAL_LINKEDIN', label: 'LinkedIn', href: process.env.SOCIAL_LINKEDIN, icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M4.98 3.5C4.98 4.6 4.1 5.5 3 5.5S1 4.6 1 3.5 1.9 1.5 3 1.5s1.98.9 1.98 2ZM2 8h2v13H2V8Zm6 0h2v1.7h.1c.3-.6 1.1-1.7 2.9-1.7 3.1 0 3.7 2 3.7 4.6V21H15v-6.5c0-1.5 0-3.3-2-3.3-2 0-2.3 1.6-2.3 3.2V21H8V8Z"/>
      </svg>
    )},
  ].filter(s => !!s.href);

  return (
    <footer className="en-footer" role="contentinfo">
      <div className="container en-footer-inner">
        <div className="en-footer-top">
          <nav className="en-footer-nav" aria-label="footer">
            {menuItems.length > 0 ? (
              menuItems.map((item, idx) => (
                <Link key={`${item.href}-${idx}`} href={item.href}>
                  {item.label}
                </Link>
              ))
            ) : (
              <>
                <Link href="/pages/about">About Us</Link>
                <Link href="/pages/contact">Contact</Link>
                <Link href="/pages/privacy-policy">Privacy Policy</Link>
                <Link href="/pages/terms">Terms</Link>
                <Link href="/pages/disclaimer">Disclaimer</Link>
                <Link href="/pages/feedback">Feedback</Link>
              </>
            )}
          </nav>
          {showSocial && socials.length > 0 && (
            <div className="en-footer-social" aria-label="social">
              {socials.map(s => (
                <Link key={s.key} href={s.href as string} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="en-footer-social-link">
                  {s.icon}
                </Link>
              ))}
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
