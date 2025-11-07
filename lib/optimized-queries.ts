/**
 * Optimized GraphQL Queries
 * 
 * These queries fetch only essential fields to reduce payload size and improve performance.
 * Use these instead of the full queries for better performance.
 */

// Minimal homepage posts query - only essential fields
export const HOMEPAGE_POSTS_MINIMAL_QUERY = `
  query HomepagePostsMinimal {
    posts(first: 15, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        title
        slug
        uri
        date
        featuredImage {
          node {
            sourceUrl
          }
        }
        categories(first: 1) {
          nodes {
            name
            slug
          }
        }
        author {
          node {
            name
            slug
          }
        }
      }
    }
  }
`;

// Minimal categories query for navigation
export const CATEGORIES_MINIMAL_QUERY = `
  query CategoriesMinimal {
    categories(first: 8, where: { orderby: NAME, order: ASC }) {
      nodes {
        name
        slug
      }
    }
  }
`;

// Essential post fields only - for article pages
export const POST_ESSENTIAL_QUERY = `
  query PostEssential($uri: String!) {
    post(id: $uri, idType: URI) {
      id
      title
      content
      slug
      uri
      date
      modified
      status
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      categories {
        nodes {
          name
          slug
        }
      }
      author {
        node {
          name
          slug
          description
          url
        }
      }
      seo {
        title
        metaDesc
        canonical
        opengraphTitle
        opengraphDescription
        opengraphImage {
          sourceUrl
        }
      }
    }
  }
`;

// Minimal category page query
export const CATEGORY_POSTS_MINIMAL_QUERY = `
  query CategoryPostsMinimal($slug: ID!, $first: Int = 20) {
    category(id: $slug, idType: SLUG) {
      id
      name
      slug
      description
      posts(first: $first, where: { orderby: { field: DATE, order: DESC } }) {
        nodes {
          title
          slug
          uri
          date
          excerpt(format: RAW)
          featuredImage {
            node {
              sourceUrl
            }
          }
          author {
            node {
              name
              slug
            }
          }
        }
      }
    }
  }
`;

export const SITE_INFO_MINIMAL_QUERY = `
  query SiteInfoMinimal {
    generalSettings {
      title
      description
      url
    }
  }
`;