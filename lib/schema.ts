interface ArticleSchemaProps {
  title: string;
  description: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  url: string;
  siteName: string;
}

export function generateArticleSchema({
  title,
  description,
  image,
  datePublished,
  dateModified,
  authorName,
  url,
  siteName: _siteName,
}: ArticleSchemaProps): string {
  const siteUrl = process.env.SITE_URL || 'https://paharipatrika.in';
  const orgName = process.env.ORGANIZATION_NAME || 'Pahari Patrika Media';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description: description,
    image: image,
    datePublished: datePublished,
    dateModified: dateModified,
    author: {
      '@type': 'Person',
      name: authorName || 'Editorial Team',
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: orgName,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    url: url,
  };

  return JSON.stringify(schema);
}
