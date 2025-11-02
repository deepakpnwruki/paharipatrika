'use client';

import { useEffect, useRef } from 'react';

interface ArticleContentWithAdsProps {
  content: string;
  inArticleAdSlot: string;
}

export default function ArticleContentWithAds({ content, inArticleAdSlot }: ArticleContentWithAdsProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const DEBUG = process.env.NEXT_PUBLIC_ADS_DEBUG === 'true';

  useEffect(() => {
    if (!contentRef.current || !inArticleAdSlot) return;

    // Get client ID from window (set by layout)
    const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
    if (!clientId) {
      console.warn('AdSense Client ID not found');
      return;
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      // Find all ad slot placeholders
      const adSlots = contentRef.current?.querySelectorAll('.article-ad-slot');
      
      if (!adSlots || adSlots.length === 0) {
        DEBUG && console.warn('[Ads] No ad slots found in content');
        return;
      }
      DEBUG && console.log(`[Ads] Found ${adSlots.length} ad slots`);
      
      adSlots.forEach((slot, index) => {
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
        
        const ins = document.createElement('ins');
        ins.className = 'adsbygoogle';
        ins.style.cssText = 'display:block';
        ins.setAttribute('data-ad-client', clientId);
        ins.setAttribute('data-ad-slot', inArticleAdSlot);
        ins.setAttribute('data-ad-format', 'auto');
        ins.setAttribute('data-full-width-responsive', 'false');
        
        adsenseContainer.appendChild(ins);
        adContainer.appendChild(header);
        adContainer.appendChild(adsenseContainer);
        
        slot.innerHTML = '';
        slot.appendChild(adContainer);
        
        // Push ad to AdSense
        try {
          DEBUG && console.log(`[Ads] Pushing ad ${index + 1} to AdSense`);
          // @ts-expect-error - adsbygoogle is injected by Google AdSense script
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
          console.error('[Ads] AdSense error:', err);
        }
      });
    }, 100); // Small delay to ensure DOM is ready

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
