import { notFound } from 'next/navigation';
import Link from 'next/link';
import { wpFetch } from '../../../lib/graphql';
import { CATEGORY_BY_SLUG_QUERY } from '../../../lib/queries';
import { getPostUrl } from '../../../lib/url-helpers';

interface CategoryData {
  category: {
    id: string;
    name: string;
    description: string;
    slug: string;
    uri: string;
    count: number;
    posts?: {
      nodes: Array<{
        slug: string;
        title: string;
        excerpt: string;
        date: string;
        uri: string;
        author?: { node: { name: string } };
        featuredImage?: {
          node: {
            sourceUrl: string;
            altText: string;
          };
        };
        categories?: { nodes: Array<{ name: string; slug: string }> };
      }>;
      pageInfo?: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        startCursor: string;
        endCursor: string;
      };
    };
  };
}

export const revalidate = 300;

export default async function CategoryPage(props: { params: { slug: string[] } }) {
  const slugArray = props.params.slug;
  const slug = slugArray[slugArray.length - 1]; // Get last segment
  const data = await wpFetch<CategoryData>(CATEGORY_BY_SLUG_QUERY, { slug });
  const category = data?.category;

  if (!category) notFound();

  return (
    <div className="bbc-category-page">
      <div className="bbc-category-header">
        <div className="container">
          <h1 className="bbc-category-title">{category.name}</h1>
        </div>
      </div>

      <div className="container bbc-posts-grid">
        {category.posts?.nodes?.map((post: any) => (
          <Link href={getPostUrl(post)} key={post.slug} className="bbc-post-card">
            {post.featuredImage?.node?.sourceUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.featuredImage.node.sourceUrl}
                alt={post.featuredImage.node.altText || post.title}
              />
            )}
            <div className="bbc-post-content">
              <h3>{post.title}</h3>
              {post.excerpt && (
                <div className="bbc-post-excerpt" 
                  dangerouslySetInnerHTML={{ __html: post.excerpt }}
                />
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
