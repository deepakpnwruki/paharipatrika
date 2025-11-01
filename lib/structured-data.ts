export function generateOrganizationSchema() {
  const siteUrl = process.env.SITE_URL!;
  const _siteName = process.env.SITE_NAME!;
  const orgName = process.env.ORGANIZATION_NAME!;

  return {
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
      // Add your social media URLs
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "editorial",
      "email": "editorial@edunews.com"
    }
  };
}

export function generateWebsiteSchema() {
  const siteUrl = process.env.SITE_URL!;
  const siteName = process.env.SITE_NAME!;

  return {
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
    }
  };
}

export function generateNewsArticleSchema(post: any) {
  const siteUrl = process.env.SITE_URL!;
  const orgName = process.env.ORGANIZATION_NAME!;

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": post.title,
    "description": post.excerpt?.replace(/<[^>]*>/g, ''),
    "image": post.featuredImage?.node?.sourceUrl,
    "datePublished": post.date,
    "dateModified": post.modified,
    "author": {
      "@type": "Person",
      "name": post.author?.node?.name || "Editorial Team"
    },
    "publisher": {
      "@type": "NewsMediaOrganization",
      "name": orgName,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${siteUrl}${post.uri}`
    },
    "articleSection": post.categories?.nodes?.[0]?.name,
    "keywords": post.tags?.nodes?.map((tag: any) => tag.name).join(", ")
  };
}

export function generateBreadcrumbSchema(breadcrumbs: Array<{name: string, url: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

export function generateWebPageSchema(page: any) {
  const siteUrl = process.env.SITE_URL!;
  const siteName = process.env.SITE_NAME!;

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": page.title,
    "description": page.excerpt?.replace(/<[^>]*>/g, ''),
    "url": `${siteUrl}${page.uri}`,
    "isPartOf": {
      "@type": "WebSite",
      "name": siteName,
      "url": siteUrl
    },
    "datePublished": page.date,
    "dateModified": page.modified
  };
}
