import Link from 'next/link';
import Image from 'next/image';

export default function PostCard({ post }: { post: any }) {
  const img = post?.featuredImage?.node;
  const href = post?.uri || ('/' + post?.slug);
  const title = post.title || 'Untitled';
  const altText = img?.altText || title;
  return (
    <div className="related-article-card">
      {img?.sourceUrl ? (
        <Link href={href} className="related-article-img-link" tabIndex={-1} aria-label={title}>
          <div className="related-article-img-wrap">
            <Image
              src={img.sourceUrl}
              alt={altText}
              width={72}
              height={72}
              className="related-article-img"
              style={{objectFit:'cover', borderRadius:'7px'}}
              loading="lazy"
            />
          </div>
        </Link>
      ) : (
        <div className="related-article-img-placeholder" />
      )}
      <div className="related-article-content">
        <Link href={href} className="related-article-title">
          {title}
        </Link>
      </div>
    </div>
  );
}
