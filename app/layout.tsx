import './globals.css';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { wpFetch } from '../lib/graphql';
import { CATEGORIES_QUERY } from '../lib/queries';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#b80000',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: `${process.env.SITE_NAME || 'Pahari Patrika'} - ताज़ा खबरें और समाचार`,
    template: `%s | ${process.env.SITE_NAME || 'Pahari Patrika'}`,
  },
  description: 'भारत की ताज़ा खबरें, शिक्षा समाचार, राजनीति, खेल, मनोरंजन और अधिक। हर खबर, हर पल।',
  keywords: ['news', 'hindi news', 'education news', 'india news', 'breaking news', 'ताज़ा खबरें'],
  authors: [{ name: process.env.ORGANIZATION_NAME || 'Pahari Patrika Media' }],
  creator: process.env.ORGANIZATION_NAME || 'Pahari Patrika Media',
  publisher: process.env.ORGANIZATION_NAME || 'Pahari Patrika Media',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || '',
  },
  alternates: {
    canonical: '/',
    languages: {
      'hi-IN': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'hi_IN',
    url: '/',
    siteName: process.env.SITE_NAME || 'Pahari Patrika',
    title: `${process.env.SITE_NAME || 'Pahari Patrika'} - ताज़ा खबरें`,
    description: 'भारत की ताज़ा खबरें और समाचार',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: process.env.SITE_NAME || 'Pahari Patrika',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${process.env.SITE_NAME || 'Pahari Patrika'} - ताज़ा खबरें`,
    description: 'भारत की ताज़ा खबरें और समाचार',
    creator: '@paharipatrika',
    images: ['/og-image.svg'],
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

// Add Organization and WebSite structured data
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const revalidateSeconds = Number(process.env.REVALIDATE_SECONDS ?? 300);

  const catsData = await wpFetch<{ categories:{ nodes:{ name:string; slug:string }[] } }>(
    CATEGORIES_QUERY, 
    { first: 20 }, 
    revalidateSeconds, 
    'layout-cats'
  );
  const categories = catsData?.categories?.nodes || [];

  const logoUrl: string | null = null;
  const siteTitle = 'Pahari Patrika';

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://paharipatrika.in').replace(/\/$/, '');
  const siteName = process.env.SITE_NAME || process.env.NEXT_PUBLIC_SITE_NAME || 'Pahari Patrika';
  const orgName = process.env.ORGANIZATION_NAME || 'Pahari Patrika Media';

  const organizationSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "name": orgName,
    "url": siteUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${siteUrl}/logo.png`,
      "width": 600,
      "height": 60
    },
    "sameAs": [
      // Add your actual social media URLs here
      "https://twitter.com/paharipatrika",
      "https://www.facebook.com/paharipatrika",
      "https://www.youtube.com/@paharipatrika",
      "https://www.instagram.com/paharipatrika"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "editorial",
      "availableLanguage": ["Hindi", "English"]
    }
  });

  const websiteSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteName,
    "url": siteUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "inLanguage": "hi-IN"
  });

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
        {/* Structured Data: Use Script for hydration safety */}
        <Script
          id="org-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: organizationSchema }}
        />
        <Script
          id="website-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: websiteSchema }}
        />
      </head>
      <body>
        <nav aria-label="Main navigation">
          <Header logoUrl={logoUrl} siteTitle={siteTitle} categories={categories} />
        </nav>
        <main role="main">
          {children}
        </main>
        <footer role="contentinfo">
          <Footer />
        </footer>
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
