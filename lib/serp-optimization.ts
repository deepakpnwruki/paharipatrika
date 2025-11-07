/**
 * Advanced SERP Ranking Optimizations
 * Additional strategies to boost search engine rankings
 */

// Add FAQ schema for articles with questions
export function generateFAQSchema(article: any) {
  // Extract common question patterns from content
  const questionPatterns = [
    /क्या.*\?/g, // "What is..." in Hindi
    /कैसे.*\?/g, // "How to..." in Hindi
    /कब.*\?/g,   // "When..." in Hindi
    /क्यों.*\?/g, // "Why..." in Hindi
  ];
  
  const questions: Array<{
    "@type": string;
    name: string;
    acceptedAnswer: {
      "@type": string;
      text: string;
    };
  }> = [];
  const content = article.content || '';
  
  questionPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach((question: string) => {
        // Find the paragraph containing the answer
        const questionIndex = content.indexOf(question);
        const nextParagraph = content.substring(questionIndex, questionIndex + 300);
        
        questions.push({
          "@type": "Question",
          "name": question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": nextParagraph.replace(/<[^>]*>/g, '').trim().substring(0, 200)
          }
        });
      });
    }
  });
  
  if (questions.length > 0) {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": questions.slice(0, 5) // Limit to 5 questions
    };
  }
  
  return null;
}

// Enhanced article schema with more rich data
export function generateEnhancedArticleSchema(article: any) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.excerpt || article.metaDesc,
    "image": article.featuredImage?.node?.sourceUrl,
    "datePublished": article.date,
    "dateModified": article.modified || article.date,
    "author": {
      "@type": "Person",
      "name": article.author?.node?.name,
      "url": article.author?.node?.slug ? `${process.env.NEXT_PUBLIC_SITE_URL}/author/${article.author.node.slug}` : null
    },
    "publisher": {
      "@type": "Organization",
      "name": "Pahari Patrika",
      "logo": {
        "@type": "ImageObject",
        "url": `${process.env.NEXT_PUBLIC_SITE_URL}/android-chrome-192x192.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_SITE_URL}${article.uri}`
    },
    // Add keywords from categories and tags
    "keywords": [
      ...(article.categories?.nodes?.map((cat: any) => cat.name) || []),
      ...(article.tags?.nodes?.map((tag: any) => tag.name) || [])
    ].join(', '),
    // Add article section for better categorization
    "articleSection": article.categories?.nodes?.[0]?.name,
    // Add word count for reading time
    "wordCount": article.content ? article.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0,
    // Add language
    "inLanguage": "hi-IN"
  };
}

// Breadcrumb schema for better navigation understanding
export function generateBreadcrumbSchema(breadcrumbs: Array<{name: string, href: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.href ? `${process.env.NEXT_PUBLIC_SITE_URL}${crumb.href}` : undefined
    }))
  };
}

// Organization schema with enhanced data
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "name": "Pahari Patrika",
    "alternateName": ["पहाड़ी पत्रिका", "Pahari News", "Hill News"],
    "url": process.env.NEXT_PUBLIC_SITE_URL,
    "logo": `${process.env.NEXT_PUBLIC_SITE_URL}/android-chrome-192x192.png`,
    "foundingDate": "2020",
    "description": "Leading Hindi news portal covering Uttarakhand, Himachal Pradesh and hill region news",
    "publishingPrinciples": `${process.env.NEXT_PUBLIC_SITE_URL}/editorial-guidelines`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-XXXXXXXXXX",
      "contactType": "editorial",
      "email": "editor@paharipatrika.in"
    },
    "sameAs": [
      "https://www.facebook.com/paharipatrika",
      "https://twitter.com/paharipatrika",
      "https://www.youtube.com/c/paharipatrika",
      "https://www.instagram.com/paharipatrika"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN",
      "addressRegion": "Uttarakhand"
    },
    // Add knowledge graph signals
    "knowsAbout": [
      "Uttarakhand News",
      "Himachal Pradesh News",
      "Hill Station News",
      "Mountain Region News",
      "Hindi News",
      "Regional News India"
    ]
  };
}

// Enhanced WebSite schema with search functionality
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Pahari Patrika",
    "alternateName": "पहाड़ी पत्रिका",
    "url": process.env.NEXT_PUBLIC_SITE_URL,
    "description": "Latest Hindi news from Uttarakhand, Himachal Pradesh and hill regions",
    "inLanguage": "hi-IN",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${process.env.NEXT_PUBLIC_SITE_URL}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    // Add RSS feed reference
    "dataFeed": {
      "@type": "DataFeed",
      "dataFeedElement": [
        {
          "@type": "URL",
          "url": `${process.env.NEXT_PUBLIC_SITE_URL}/feed.xml`
        }
      ]
    }
  };
}

// SEO performance monitoring
export function generateSEOInsights(page: any) {
  const insights = {
    titleLength: page.title?.length || 0,
    descriptionLength: page.description?.length || 0,
    hasImage: !!page.featuredImage,
    hasAuthor: !!page.author,
    hasCategories: !!page.categories?.nodes?.length,
    hasTags: !!page.tags?.nodes?.length,
    contentLength: page.content ? page.content.replace(/<[^>]*>/g, '').length : 0,
    readingTime: page.content ? Math.ceil(page.content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200) : 0,
    
    // SEO Score calculation
    score: 0
  };
  
  // Calculate SEO score
  let score = 0;
  if (insights.titleLength >= 30 && insights.titleLength <= 60) score += 20;
  if (insights.descriptionLength >= 120 && insights.descriptionLength <= 160) score += 20;
  if (insights.hasImage) score += 15;
  if (insights.hasAuthor) score += 10;
  if (insights.hasCategories) score += 10;
  if (insights.hasTags) score += 5;
  if (insights.contentLength >= 300) score += 20;
  
  insights.score = score;
  
  return insights;
}

export const SERP_OPTIMIZATION = {
  // Target keywords for better ranking
  primaryKeywords: [
    'उत्तराखंड समाचार',
    'हिमाचल प्रदेश न्यूज़',
    'पहाड़ी समाचार',
    'हिंदी न्यूज़',
    'पर्वतीय क्षेत्र समाचार'
  ],
  
  // Long-tail keywords for voice search
  longTailKeywords: [
    'उत्तराखंड की आज की ताजा खबर',
    'हिमाचल प्रदेश में क्या हो रहा है',
    'पहाड़ों की खबरें हिंदी में',
    'देहरादून समाचार आज',
    'शिमला समाचार हिंदी'
  ],
  
  // Content optimization guidelines
  contentGuidelines: {
    minLength: 300,
    maxLength: 2000,
    keywordDensity: '1-2%',
    headingStructure: 'H1 > H2 > H3',
    imageAltText: 'Required',
    internalLinks: 'Minimum 2-3',
    externalLinks: 'Maximum 1-2'
  }
};