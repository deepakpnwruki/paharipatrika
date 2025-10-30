import React from 'react';
import Link from 'next/link';
import { wpFetch } from '../lib/graphql';
import { PAGES_QUERY } from '../lib/queries';

export const revalidate = Number(process.env.REVALIDATE_SECONDS ?? 300);

export default async function Footer() {
  let pages: any[] = [];
  try {
    const data = await wpFetch<any>(PAGES_QUERY, { first: 10 }, revalidate, 'footer-pages');
    pages = data?.pages?.nodes || [];
  } catch (e) {
    console.error('Error fetching footer pages:', e);
  }

  return (
    <footer className="en-footer" role="contentinfo">
      <div className="container en-footer-inner">
        <div className="en-footer-top">
          <nav className="en-footer-nav" aria-label="footer">
            {pages.length > 0 ? (
              pages.map((p: any) => (
                <Link key={p.slug} href={`/pages/${p.slug}`}>
                  {p.title}
                </Link>
              ))
            ) : (
              <>
                <Link href="/pages/about">About</Link>
                <Link href="/pages/contact">Contact</Link>
                <Link href="/pages/terms">Terms</Link>
                <Link href="/pages/privacy">Privacy</Link>
              </>
            )}
          </nav>
        </div>

        <div className="en-footer-bottom">
          <div className="en-footer-copy">
            © {new Date().getFullYear()} News हिन्दी — All rights reserved
          </div>
          <div className="en-footer-links">
            <a href="https://www.facebook.com" target="_blank" rel="noreferrer">
              Facebook
            </a>
            <a href="https://www.twitter.com" target="_blank" rel="noreferrer">
              Twitter
            </a>
            <a href="https://www.youtube.com" target="_blank" rel="noreferrer">
              YouTube
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
