import Link from 'next/link';
import Image from 'next/image';

export default function PostCard({ post }: { post: any }) {
  const img = post?.featuredImage?.node;
  const href = post?.uri || ('/' + post?.slug);
  const title = post.title || 'Untitled';
  const altText = img?.altText || title;
  
  return (
    <article className="post" itemScope itemType="https://schema.org/Article">
      {img?.sourceUrl ? (
        <div className="post-image">
          <Image 
            src={img.sourceUrl} 
            alt={altText}
            width={400}
            height={250}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            // loading removed
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
        </div>
      ) : (
        <div className="post-image-placeholder" aria-hidden="true" />
      )}
      <div className="post-content">
        <h3 style={{margin:'0 0 .25rem 0'}} itemProp="headline">
          <Link href={href} aria-label={`Read more about ${title}`}>
            {title}
          </Link>
        </h3>
        <div className="meta">
          <time dateTime={post.date} itemProp="datePublished">
            {new Date(post.date).toLocaleDateString('hi-IN')}
          </time>
        </div>
        {post.excerpt && (
          <div 
            className="excerpt" 
            itemProp="description"
            dangerouslySetInnerHTML={{ __html: post.excerpt }} 
          />
        )}
      </div>
    </article>
  );
}
