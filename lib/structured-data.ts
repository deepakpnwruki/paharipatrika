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
      // Add your social media URLs for E-E-A-T
      // "https://facebook.com/yourpage",
      // "https://twitter.com/yourhandle",
      // "https://linkedin.com/company/yourcompany"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "editorial",
      "email": "editorial@paharipatrika.in",
      "availableLanguage": ["Hindi", "English"]
    },
    // Enhanced E-E-A-T signals
    "description": "Trusted news source providing accurate and timely news coverage",
    "foundingDate": "2020",
    "knowsAbout": ["Education", "News", "Current Affairs", "Hindi News"],
    "publishingPrinciples": `${siteUrl}/about/editorial-policy`,
    "ethicsPolicy": `${siteUrl}/about/ethics`,
    "correctionsPolicy": `${siteUrl}/about/corrections`,
    "diversityPolicy": `${siteUrl}/about/diversity`,
    "verificationFactCheckingPolicy": `${siteUrl}/about/fact-checking`
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
    "description": "Latest news, updates and educational content in Hindi",
    "inLanguage": "hi-IN",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    // Enhanced for SGE
    "publisher": {
      "@type": "NewsMediaOrganization",
      "name": process.env.ORGANIZATION_NAME || siteName
    }
  };
}

export function generateNewsArticleSchema(post: any) {
  const siteUrl = process.env.SITE_URL!;
  const orgName = process.env.ORGANIZATION_NAME!;

  // Enhanced E-E-A-T signals for SGE/AEO
  const authorSchema = {
    "@type": "Person",
    "name": post.author?.node?.name || "Editorial Team",
    "url": post.author?.node?.slug ? `${siteUrl}/author/${post.author.node.slug}` : undefined,
    "description": post.author?.node?.description || undefined,
    "sameAs": [
      post.author?.node?.userSocial?.facebook,
      post.author?.node?.userSocial?.twitter,
      post.author?.node?.userSocial?.linkedin,
    ].filter(Boolean),
    "jobTitle": "Journalist",
    "worksFor": {
      "@type": "NewsMediaOrganization",
      "name": orgName
    }
  };

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": post.title,
    "description": post.excerpt?.replace(/<[^>]*>/g, ''),
    "image": post.featuredImage?.node?.sourceUrl ? {
      "@type": "ImageObject",
      "url": post.featuredImage.node.sourceUrl,
      "width": 1200,
      "height": 630,
      "caption": post.featuredImage.node.caption || post.title
    } : undefined,
    "datePublished": post.date,
    "dateModified": post.modified,
    "dateCreated": post.date,
    "author": authorSchema,
    "publisher": {
      "@type": "NewsMediaOrganization",
      "name": orgName,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.png`,
        "width": 600,
        "height": 60
      },
      "url": siteUrl,
      "sameAs": [
        // Add social profiles for E-E-A-T
      ]
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${siteUrl}${post.uri}`
    },
    "articleSection": post.categories?.nodes?.[0]?.name,
    "keywords": post.tags?.nodes?.map((tag: any) => tag.name).join(", "),
    "wordCount": post.content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0,
    "inLanguage": "hi-IN",
    "isAccessibleForFree": true,
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": [".es-title", ".en-content"]
    },
    // SGE optimization: Add about/mentions for entity recognition
    "about": post.categories?.nodes?.map((cat: any) => ({
      "@type": "Thing",
      "name": cat.name
    })),
    "mentions": post.tags?.nodes?.map((tag: any) => ({
      "@type": "Thing",
      "name": tag.name
    }))
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
    "inLanguage": "hi-IN",
    "isPartOf": {
      "@type": "WebSite",
      "name": siteName,
      "url": siteUrl
    },
    "datePublished": page.date,
    "dateModified": page.modified,
    "author": page.author?.node ? {
      "@type": "Person",
      "name": page.author.node.name
    } : {
      "@type": "Organization",
      "name": siteName
    },
    "publisher": {
      "@type": "NewsMediaOrganization",
      "name": process.env.ORGANIZATION_NAME || siteName,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.png`
      }
    }
  };
}

// AEO/GEO: FAQ Schema for answer-based search
export function generateFAQSchema(faqs: Array<{question: string, answer: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

// SGE: Enhanced author profile schema
export function generateAuthorProfileSchema(author: any, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": author.name,
      "description": author.description || `${author.name} is a journalist at ${process.env.ORGANIZATION_NAME}`,
      "url": `${siteUrl}/author/${author.slug}`,
      "image": author.avatar?.url,
      "jobTitle": "Journalist",
      "worksFor": {
        "@type": "NewsMediaOrganization",
        "name": process.env.ORGANIZATION_NAME,
        "url": siteUrl
      },
      "sameAs": [
        author.userSocial?.facebook,
        author.userSocial?.twitter,
        author.userSocial?.linkedin,
        author.userSocial?.instagram
      ].filter(Boolean),
      "knowsAbout": author.categories || ["News", "Journalism"],
      // E-E-A-T: Credentials and expertise
      "hasCredential": author.credentials || undefined,
      "award": author.awards || undefined
    }
  };
}
