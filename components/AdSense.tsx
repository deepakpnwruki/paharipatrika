'use client';

import { useEffect, useRef } from 'react';

interface AdSenseProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function AdSense({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  style,
  className = ''
}: AdSenseProps) {
  const insRef = useRef<HTMLElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!adSlot || !process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID) {
      return;
    }
    if (insRef.current && !loadedRef.current) {
      try {
        // @ts-expect-error - adsbygoogle is injected by Google AdSense script
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        loadedRef.current = true;
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, [adSlot]);

  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const hasSlot = typeof adSlot === 'string' && adSlot.trim().length > 0;
  const hasClient = typeof clientId === 'string' && clientId.trim().length > 0;
  if (!hasSlot || !hasClient) {
    return null;
  }
  return (
    <div className={`adsense-container ${className}`} style={style}>
      <ins
  ref={insRef as any}
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-client={clientId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
}
