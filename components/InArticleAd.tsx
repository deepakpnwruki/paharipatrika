'use client';

import AdSense from './AdSense';

interface InArticleAdProps {
  slot: string;
  size?: '300x250' | '300x50';
  className?: string;
}

export default function InArticleAd({ slot, size = '300x250', className = '' }: InArticleAdProps) {
  const isLarge = size === '300x250';
  const hasSlot = typeof slot === 'string' && slot.trim().length > 0;
  return (
    <div className={`in-article-ad ${isLarge ? 'in-article-ad--large' : 'in-article-ad--horizontal'} ${className}`}>
      <div className="in-article-ad__header">
        <div className="in-article-ad__label">ADVERTISEMENT</div>
        <div className="in-article-ad__subtitle">Article continues below this ad</div>
      </div>
      {hasSlot && (
        <AdSense
          adSlot={slot}
          adFormat="auto"
          fullWidthResponsive={false}
          style={{
            display: 'block',
            width: size === '300x250' ? '300px' : '300px',
            height: size === '300x250' ? '250px' : '50px',
            margin: '0 auto'
          }}
        />
      )}
    </div>
  );
}
