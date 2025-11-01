import { notFound } from 'next/navigation';
import Link from 'next/link';
import { wpFetch } from '../../../lib/graphql';
import { CATEGORY_BY_SLUG_QUERY } from '../../../lib/queries';

interface CategoryData {
  categories: {
    nodes: Array<{
      name: string;
      slug: string;
      title: string;
      excerpt: string;
      featuredImage: {
        node: {
          sourceUrl: string;
          altText: string;
        };
      };
      posts?: {
        nodes: Array<{
          slug: string;
          title: string;
          excerpt: string;
          featuredImage: {
            node: {
              sourceUrl: string;
              altText: string;
            };
          };
        }>;
      };
    }>;
  };
}

export const revalidate = 300;

export default async function CategoryPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: slugArray } = await params;
  const slug = slugArray[slugArray.length - 1]; // Get last segment
  const data = await wpFetch<CategoryData>(CATEGORY_BY_SLUG_QUERY, { slug });
  const category = data?.categories?.nodes?.[0];

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
          <Link href={`/${post.slug}`} key={post.slug} className="bbc-post-card">
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
