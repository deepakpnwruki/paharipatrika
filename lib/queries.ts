// Related posts by category or tag (limit 6, exclude current post by ID)
export const RELATED_POSTS_QUERY = `
  query RelatedPosts($categoryIds: [ID!], $tagIds: [ID!], $excludeIds: [ID!]) {
    posts(
      first: 6,
      where: {
        categoryIn: $categoryIds
        tagIn: $tagIds
        notIn: $excludeIds
        orderby: { field: DATE, order: DESC }
        status: PUBLISH
      }
    ) {
      nodes {
        id
        title
        slug
        uri
        date
        excerpt
        featuredImage { node { sourceUrl altText } }
        categories { nodes { name slug id } }
        tags { nodes { name slug id } }
        author { node { name } }
      }
    }
  }
`;
// Query for author details and their posts by slug
export const AUTHOR_BY_SLUG_QUERY = `
  query AuthorBySlug($slug: ID!, $first: Int = 10, $after: String) {
    user(id: $slug, idType: SLUG) {
      id
      name
      slug
      description
      url
      avatar {
        url
      }
      posts(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        nodes {
          id
          title
          excerpt
          slug
          date
          uri
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

// Query to get total post count for an author (fetch in batches due to WP limits)
export const AUTHOR_POST_COUNT_QUERY = `
  query AuthorPostCount($slug: ID!, $first: Int = 100, $after: String) {
    user(id: $slug, idType: SLUG) {
      id
      posts(first: $first, after: $after, where: { status: PUBLISH }) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
        }
      }
    }
  }
`;
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
            mediaDetails { width height }
            caption
            description
          }
        }
        author {
          node {
            name
            description
            slug
            url
            avatar {
              url
            }
            ... on User {
              linkedin: databaseId
              facebook: databaseId
              twitter: databaseId
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
        seo {
          title
          metaDesc
          metaRobotsNoindex
          metaRobotsNofollow
          canonical
          opengraphTitle
          opengraphDescription
          opengraphImage { sourceUrl }
          twitterTitle
          twitterDescription
          twitterImage { sourceUrl }
          schema { raw }
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
            mediaDetails { width height }
          }
        }
        seo {
          title
          metaDesc
          metaRobotsNoindex
          metaRobotsNofollow
          canonical
          opengraphTitle
          opengraphDescription
          opengraphImage { sourceUrl }
          twitterTitle
          twitterDescription
          twitterImage { sourceUrl }
          schema { raw }
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
      seo {
        title
        metaDesc
        metaRobotsNoindex
        metaRobotsNofollow
        canonical
        opengraphTitle
        opengraphDescription
        opengraphImage { sourceUrl }
        twitterTitle
        twitterDescription
        twitterImage { sourceUrl }
        schema { raw }
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
          mediaDetails { width height }
          caption
          description
        }
      }
      author {
        node {
          name
          description
          slug
          url
          avatar {
            url
          }
          ... on User {
            linkedin: databaseId
            facebook: databaseId
            twitter: databaseId
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
      seo {
        title
        metaDesc
        metaRobotsNoindex
        metaRobotsNofollow
        canonical
        opengraphTitle
        opengraphDescription
        opengraphImage { sourceUrl }
        twitterTitle
        twitterDescription
        twitterImage { sourceUrl }
        schema { raw }
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
          mediaDetails { width height }
        }
      }
      seo {
        title
        metaDesc
        metaRobotsNoindex
        metaRobotsNofollow
        canonical
        opengraphTitle
        opengraphDescription
        opengraphImage { sourceUrl }
        twitterTitle
        twitterDescription
        twitterImage { sourceUrl }
        schema { raw }
      }
    }
  }
`;

// Add: used by app/category/[slug]/page.tsx
export const CATEGORY_BY_SLUG_QUERY = `
  query CategoryBySlug($slug: ID!, $first: Int = 20, $after: String) {
    category(id: $slug, idType: SLUG) {
      id
      name
      description
      slug
      uri
      count
      seo {
        title
        metaDesc
        metaRobotsNoindex
        metaRobotsNofollow
        canonical
        opengraphTitle
        opengraphDescription
        opengraphImage { sourceUrl }
        twitterTitle
        twitterDescription
        twitterImage { sourceUrl }
        schema { raw }
      }
      posts(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
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

export const TAG_BY_SLUG_QUERY = `
  query TagBySlug($slug: ID!, $first: Int = 20, $after: String) {
    tag(id: $slug, idType: SLUG) {
      id
      name
      description
      slug
      uri
      count
      posts(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        nodes {
          id
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
              mediaDetails {
                sizes { name sourceUrl width height }
              }
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

// Footer menu queries (WPGraphQL)
// Prefer fetching by location if your theme registers menu locations
export const FOOTER_MENU_BY_LOCATION_QUERY = /* GraphQL */ `
  query FooterMenuByLocation($location: MenuLocationEnum!) {
    menuItems(where: { location: $location }, first: 100) {
      nodes {
        id
        label
        url
        path
        parentId
        connectedNode {
          node {
            __typename
            ... on ContentNode { uri }
            ... on TermNode { uri }
          }
        }
      }
    }
  }
`;

// Fallback: fetch by menu slug/name if locations are not set in WP
export const FOOTER_MENU_BY_SLUG_QUERY = /* GraphQL */ `
  query FooterMenuBySlug($slug: ID!, $idType: MenuNodeIdTypeEnum = SLUG) {
    menu(id: $slug, idType: $idType) {
      id
      name
      menuItems(first: 100) {
        nodes {
          id
          label
          url
          path
          parentId
          connectedNode {
            node {
              __typename
              ... on ContentNode { uri }
              ... on TermNode { uri }
            }
          }
        }
      }
    }
  }
`;
