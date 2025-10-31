export const POSTS_QUERY = /* GraphQL */ `
  query Posts($first: Int!, $after: String) {
    posts(first: $first, after: $after, where: { orderby: { field: DATE, order: DESC } }) {
      nodes { id slug uri date modified title excerpt content author { node { name } } author { node { name } }
        featuredImage { node { sourceUrl altText caption description } }
        categories(first: 5) { nodes { name slug } }
      }
    }
  }
`;

export const NODE_BY_URI_QUERY = `
  query NodeByUri($uri: String!) {
    nodeByUri(uri: $uri) {
      __typename
      uri
      ... on Post {
        id
        title
        content
        excerpt
        slug
        date
        modified
        featuredImage {
          node {
            sourceUrl
            altText
            caption
            description
          }
        }
        author {
          node {
            name
            description
            avatar {
              url
            }
          }
        }
        categories {
          nodes {
            name
            slug
          }
        }
        tags {
          nodes {
            name
            slug
          }
        }
      }
      ... on Page {
        id
        title
        content
        slug
        date
        modified
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
      }
      ... on Category {
        id
        name
        description
        slug
        posts(first: 20) {
          nodes {
            title
            excerpt
            slug
            date
            featuredImage {
              node {
                sourceUrl
                altText
              }
            }
          }
        }
      }
    }
  }
`;

// Ensure: use ID! for slug lookups with idType: SLUG
export const POST_BY_SLUG_QUERY = `
  query PostBySlug($slug: String!) {
    post(id: $slug, idType: SLUG) {
      id
      title
      content
      excerpt
      date
      modified
      slug
      uri
      featuredImage {
        node {
          sourceUrl
          altText
          caption
          description
        }
      }
      author {
        node {
          name
          slug
          avatar {
            url
          }
          description
        }
      }
      categories {
        nodes {
          name
          slug
        }
      }
      tags {
        nodes {
          name
          slug
        }
      }
    }
  }
`;

// Ensure: use ID! for URI lookups with idType: URI
export const POST_BY_URI_QUERY = `
  query PostByUri($uri: ID!) {
    post(id: $uri, idType: URI) {
      id
      title
      content
      excerpt
      slug
      uri
      date
      modified
      featuredImage {
        node {
          sourceUrl
          altText
          caption
          description
        }
      }
      author {
        node {
          name
          description
          avatar {
            url
          }
        }
      }
      categories {
        nodes {
          name
          slug
        }
      }
      tags {
        nodes {
          name
          slug
        }
      }
    }
  }
`;

export const PAGE_BY_URI_QUERY = `
  query PageByUri($uri: ID!) {
    page(id: $uri, idType: URI) {
      id
      title
      content
      slug
      uri
      date
      modified
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
    }
  }
`;

// Add: used by app/category/[slug]/page.tsx
export const CATEGORY_BY_SLUG_QUERY = `
  query CategoryBySlug($slug: ID!) {
    category(id: $slug, idType: SLUG) {
      id
      name
      description
      slug
      uri
      posts(first: 20) {
        nodes {
          title
          excerpt
          slug
          date
          uri
          author { node { name } }
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
        }
      }
    }
  }
`;

// Ensure these exist (used by layout/Footer); add only if missing
export const CATEGORIES_QUERY = `
  query Categories {
    categories(first: 10) {
      nodes {
        id
        name
        slug
        uri
      }
    }
  }
`;

export const PAGES_QUERY = `
  query Pages {
    pages(first: 10) {
      nodes {
        id
        title
        slug
        uri
      }
    }
  }
`;

export const LATEST_POSTS_QUERY = `
  query LatestPosts {
    posts(first: 26) {
      nodes {
        title
        slug
        uri
        date
        excerpt
        author { node { name } }
        featuredImage { node { sourceUrl altText } }
        categories(first: 1) { nodes { name slug } }
      }
    }
  }
`;
