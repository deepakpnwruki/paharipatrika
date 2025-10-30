'use client';

import Link from 'next/link';
import { useState } from 'react';

interface MobileArticleProps {
  node: any;
  canonical: string;
  mobDateStr: string;
  dt: Date;
  primaryCategory: any;
  img: any;
}

export default function MobileArticle({
  node,
  canonical,
  mobDateStr,
  dt,
  primaryCategory,
  img
}: MobileArticleProps) {
  const shareUrl = encodeURIComponent(canonical);
  const shareTitle = encodeURIComponent(node.title || '');
  const inlineShare = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    x: `https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`,
    whatsapp: `https://wa.me/?text=${shareTitle}%20${shareUrl}`,
  };

  // Use WordPress image caption or alt as credit (fallback to Hindi "छवि")
  const imageCredit = img?.caption || img?.altText || 'छवि';
  const fullCredit = img?.description || img?.caption || img?.altText || 'No additional information available';

  // State to toggle credit info display
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="mobile-article-wrapper">
      <header className="mobile-article-header">
        <nav className="mobile-breadcrumb" aria-label="Breadcrumb">
          <ol>
            <li><Link href="/">Home</Link></li>
            <li aria-hidden="true" className="crumb-sep">/</li>
            {primaryCategory?.name && (
              <li><Link href={`/category/${primaryCategory.slug}`}>{primaryCategory.name}</Link></li>
            )}
          </ol>
        </nav>

        <h1 className="mobile-title">{node.title}</h1>

        <div className="mobile-meta">
          <div className="mobile-meta-main">
            <span className="mobile-by">By <strong>{node.author?.node?.name || 'Staff'}</strong></span>
            <span className="sep" aria-hidden="true">|</span>
            <time dateTime={dt.toISOString()}>{mobDateStr}</time>
          </div>

          <div className="mobile-share" role="group" aria-label="Share">
            <a className="sbtn fb" href={inlineShare.facebook} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" />
            <a className="sbtn x" href={inlineShare.x} target="_blank" rel="noopener noreferrer" aria-label="Share on X" />
            <a className="sbtn wa" href={inlineShare.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp" />
          </div>
        </div>
      </header>

      {img?.sourceUrl && (
        <figure className="mobile-hero-media">
          <img
            src={img.sourceUrl}
            alt={img?.altText || node.title}
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          <figcaption className="mobile-media-credit">
            <span className="credit-label">{imageCredit}</span>
            <button
              className="info-btn"
              aria-label="Show image info"
              type="button"
              onClick={() => setShowInfo(!showInfo)}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="7.5" stroke="white" strokeWidth="1" />
                <path d="M8 4V8M8 11H8.01" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </figcaption>
          {showInfo && (
            <div className="mobile-credit-tooltip">
              <p>{fullCredit}</p>
              <button
                className="close-btn"
                onClick={() => setShowInfo(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
          )}
        </figure>
      )}
    </div>
  );
}
