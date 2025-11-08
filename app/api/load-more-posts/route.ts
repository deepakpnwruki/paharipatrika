import { NextRequest, NextResponse } from 'next/server';
import { wpFetch } from '@/lib/graphql';
import { AUTHOR_BY_SLUG_QUERY, TAG_BY_SLUG_QUERY, CATEGORY_BY_SLUG_QUERY } from '@/lib/queries';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { authorSlug, tagSlug, categorySlug, after, first = 20 } = body;

    let data: any = null;
    let posts: any[] = [];
    let hasNextPage = false;
    let endCursor: string | null = null;

    if (authorSlug) {
      data = await wpFetch<{ user: any }>(
        AUTHOR_BY_SLUG_QUERY,
        { slug: authorSlug, first, after },
        0 // No cache for API routes
      );
      posts = data?.user?.posts?.nodes || [];
      hasNextPage = data?.user?.posts?.pageInfo?.hasNextPage || false;
      endCursor = data?.user?.posts?.pageInfo?.endCursor || null;
    } else if (tagSlug) {
      data = await wpFetch<{ tag: any }>(
        TAG_BY_SLUG_QUERY,
        { slug: tagSlug, first, after },
        0
      );
      posts = data?.tag?.posts?.nodes || [];
      hasNextPage = data?.tag?.posts?.pageInfo?.hasNextPage || false;
      endCursor = data?.tag?.posts?.pageInfo?.endCursor || null;
    } else if (categorySlug) {
      data = await wpFetch<{ category: any }>(
        CATEGORY_BY_SLUG_QUERY,
        { slug: categorySlug, first, after },
        0
      );
      posts = data?.category?.posts?.nodes || [];
      hasNextPage = data?.category?.posts?.pageInfo?.hasNextPage || false;
      endCursor = data?.category?.posts?.pageInfo?.endCursor || null;
    }

    return NextResponse.json({
      posts,
      hasNextPage,
      endCursor,
    });
  } catch {
  // ...existing code...
    return NextResponse.json(
      { error: 'Failed to load posts' },
      { status: 500 }
    );
  }
}
