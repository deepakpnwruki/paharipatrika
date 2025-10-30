import './globals.css';
import type { Metadata, Viewport } from 'next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { wpFetch } from '../lib/graphql';
import { CATEGORIES_QUERY } from '../lib/queries';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#667eea',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: `${process.env.SITE_NAME || 'EduNews'} - ताज़ा खबरें और समाचार`,
    template: `%s | ${process.env.SITE_NAME || 'EduNews'}`,
  },
  description: 'भारत की ताज़ा खबरें, शिक्षा समाचार, राजनीति, खेल, मनोरंजन और अधिक। हर खबर, हर पल।',
  keywords: ['news', 'hindi news', 'education news', 'india news', 'breaking news', 'ताज़ा खबरें'],
  authors: [{ name: process.env.ORGANIZATION_NAME || 'EduNews Media' }],
  creator: process.env.ORGANIZATION_NAME || 'EduNews Media',
  publisher: process.env.ORGANIZATION_NAME || 'EduNews Media',
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
    siteName: process.env.SITE_NAME || 'EduNews',
    title: `${process.env.SITE_NAME || 'EduNews'} - ताज़ा खबरें`,
    description: 'भारत की ताज़ा खबरें और समाचार',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: process.env.SITE_NAME || 'EduNews',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${process.env.SITE_NAME || 'EduNews'} - ताज़ा खबरें`,
    description: 'भारत की ताज़ा खबरें और समाचार',
    creator: '@edunews',
    images: ['/og-image.jpg'],
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

// Add Organization and WebSite structured data
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const revalidate = Number(process.env.REVALIDATE_SECONDS ?? 300);

  const catsData = await wpFetch<{ categories:{ nodes:{ name:string; slug:string }[] } }>(
    CATEGORIES_QUERY, 
    { first: 20 }, 
    revalidate, 
    'layout-cats'
  );
  const categories = catsData?.categories?.nodes || [];

  const logoUrl: string | null = null;
  const siteTitle = 'EduNews';

  const siteUrl = process.env.SITE_URL || 'https://edunews.com';
  const siteName = process.env.SITE_NAME || 'EduNews';
  const orgName = process.env.ORGANIZATION_NAME || 'EduNews Media';

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
      // Add your social media URLs here
      // "https://twitter.com/edunews",
      // "https://facebook.com/edunews"
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
        <meta name="format-detection" content="telephone=no" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: organizationSchema }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: websiteSchema }}
        />
      </head>
      <body>
        <Header logoUrl={logoUrl} siteTitle={siteTitle} categories={categories} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
