import './globals.css';
import type { Viewport } from 'next';
import Script from 'next/script';
import Header from '../components/Header';
import FooterStatic from '../components/FooterStatic';
import { wpFetch } from '../lib/graphql';
import { CATEGORIES_QUERY } from '../lib/queries';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#b80000',
};

// Static metadata removed. Only Yoast SEO will be used.

// Add Organization and WebSite structured data
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const revalidateSeconds = Number(process.env.REVALIDATE_SECONDS ?? 900); // Increased to 15 minutes

  const catsData = await wpFetch<{ categories:{ nodes:{ name:string; slug:string }[] } }>(
    CATEGORIES_QUERY, 
    { first: 8 }, // Reduced from 20 to 8 categories 
    revalidateSeconds, 
    'layout-cats'
  );
  const categories = catsData?.categories?.nodes || [];

  const logoUrl: string | null = null;
  const siteTitle = 'Pahari Patrika';

  // ...existing code...

  // Static organization and website schema removed. Only Yoast schema will be used.

  return (
  <html lang="hi" dir="ltr">
  <head>
        <link rel="alternate" type="application/rss+xml" title="RSS Feed" href="/feed.xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#b80000" />
        <link rel="preconnect" href={process.env.WP_GRAPHQL_ENDPOINT?.replace('/graphql', '') || ''} />
        {/* Speed up DNS/TLS to CMS and media hosts */}
        <link rel="dns-prefetch" href="https://cms.paharipatrika.in" />
        <link rel="preconnect" href="https://cms.paharipatrika.in" crossOrigin="" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="" />
        <meta name="format-detection" content="telephone=no" />
        {/* Google AdSense */}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        {/* Google One Tap Sign-In */}
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
        {/* Structured Data: Use Script for hydration safety */}
        {/* Static schema removed. Only Yoast schema will be injected by page-level metadata. */}
      </head>
  <body>
        <nav aria-label="Main navigation">
          <Header logoUrl={logoUrl} siteTitle={siteTitle} categories={categories} />
        </nav>
        <main role="main">
          {children}
        </main>
        <footer role="contentinfo">
          <FooterStatic />
        </footer>
        {/* Google One Tap global init */}
        {/* Google One Tap global init and persistence */}
        <Script
          id="google-one-tap-global"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              function parseJwt(token) {
                try {
                  return JSON.parse(atob(token.split('.')[1]));
                } catch {
                  return null;
                }
              }
              function setUserProfile(profile) {
                try {
                  localStorage.setItem('pp_google_user', JSON.stringify(profile));
                } catch {}
              }
              function getUserProfile() {
                try {
                  return JSON.parse(localStorage.getItem('pp_google_user'));
                } catch { return null; }
              }
              function clearUserProfile() {
                try { localStorage.removeItem('pp_google_user'); } catch {}
              }
              window.onGoogleOneTapLoad = function() {
                if (window.google && window.google.accounts && window.google.accounts.id) {
                  // Only show One Tap if not signed in
                  var user = getUserProfile();
                  if (user && user.email) return;
                  window.google.accounts.id.initialize({
                    client_id: '995344648059-mcie9n87elmccoa4fb75tk8se87h1ft1.apps.googleusercontent.com',
                    callback: function(response) {
                      const payload = parseJwt(response.credential);
                      if (payload && payload.email) {
                        // Persist user info
                        setUserProfile({
                          email: payload.email,
                          name: payload.name,
                          picture: payload.picture,
                          sub: payload.sub
                        });
                        // Send to backend
                        fetch('/api/account/google-signup', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            email: payload.email,
                            name: payload.name,
                            sub: payload.sub,
                            picture: payload.picture
                          })
                        });
                        // Hide One Tap
                        window.google.accounts.id.cancel();
                        // Optionally, trigger a custom event for React hydration
                        window.dispatchEvent(new CustomEvent('pp-google-user', { detail: { user: payload } }));
                      }
                    },
                  });
                  window.google.accounts.id.prompt();
                }
              };
              if (window.google && window.google.accounts && window.google.accounts.id) {
                window.onGoogleOneTapLoad();
              } else {
                window.addEventListener('load', function() {
                  setTimeout(window.onGoogleOneTapLoad, 500);
                });
              }
            `
          }}
        />
        {/* Google Analytics 4 (GA4) */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <Script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            strategy="afterInteractive"
          />
        )}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <Script
            id="ga4-inline-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `,
            }}
          />
        )}
        {/* Twitter/X Embeds Script */}
        <Script
          src="https://platform.twitter.com/widgets.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
