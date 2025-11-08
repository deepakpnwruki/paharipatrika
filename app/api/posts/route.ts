import { NextResponse } from 'next/server';
import { wpFetch } from '../../../lib/graphql';

const HOMEPAGE_POSTS_QUERY = `
  query HomepagePosts {
    posts(first: 25) {
      nodes {
        title
        slug
        uri
        date
        excerpt
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
          }
        }
      }
    }
  }
`;

export const revalidate = 300;

export async function GET() {
  try {
    const data = await wpFetch<{ posts: { nodes: any[] } }>(
      HOMEPAGE_POSTS_QUERY,
      {},
      revalidate
    );
    return NextResponse.json({
      posts: data?.posts?.nodes || []
    });
  } catch {
    return NextResponse.json(
      { posts: [] },
      { status: 500 }
    );
  }
}



