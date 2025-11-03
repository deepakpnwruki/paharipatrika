'use client';

import { useEffect, useRef } from 'react';

interface ArticleContentWithAdsProps {
  content: string;
  inArticleAdSlot: string;
}

export default function ArticleContentWithAds({ content, inArticleAdSlot }: ArticleContentWithAdsProps) {
  const contentRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (!contentRef.current || !inArticleAdSlot) return;

    const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const adSlots = contentRef.current?.querySelectorAll('.article-ad-slot');
      if (!adSlots || typeof adSlots.length !== 'number' || adSlots.length === 0) {
        return;
      }
  Array.from(adSlots).forEach((slot, _index) => {
        // Remove any previous content
        slot.innerHTML = '';
        // Create ad container
        const adContainer = document.createElement('div');
        adContainer.className = 'in-article-ad in-article-ad--large article-inline-ad';

        const header = document.createElement('div');
        header.className = 'in-article-ad__header';
        header.innerHTML = `
          <div class="in-article-ad__label">ADVERTISEMENT</div>
          <div class="in-article-ad__subtitle">Article continues below this ad</div>
        `;

        const adsenseContainer = document.createElement('div');
        adsenseContainer.className = 'adsense-container';
        adsenseContainer.style.cssText = 'display: inline-block; width: 300px; height: 250px; margin: 0 auto; background: #f7f7f7; padding: 8px;';

  let _adInjected = false;
        if (clientId) {
          const ins = document.createElement('ins');
          ins.className = 'adsbygoogle';
          ins.style.cssText = 'display:block';
          ins.setAttribute('data-ad-client', clientId);
          ins.setAttribute('data-ad-slot', inArticleAdSlot);
          ins.setAttribute('data-ad-format', 'auto');
          ins.setAttribute('data-full-width-responsive', 'false');
          adsenseContainer.appendChild(ins);
          _adInjected = true;
        }

        adContainer.appendChild(header);
        adContainer.appendChild(adsenseContainer);
        slot.appendChild(adContainer);

        // Push ad to AdSense if clientId exists
        if (clientId) {
          try {
            // @ts-expect-error - adsbygoogle is injected by Google AdSense script
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } catch (err) {
            console.error('[Ads] AdSense error:', err);
          }
        }

      });
    }, 100);
    return () => clearTimeout(timer);
  }, [content, inArticleAdSlot]);

  return (
    <div 
      ref={contentRef}
      className="en-content" 
      dangerouslySetInnerHTML={{ __html: content }} 
    />
  );
}
