'use client';

import { useEffect, useRef, useState } from 'react';

interface MgidNativeAdProps {
  widgetId: string;
  className?: string;
  lazy?: boolean;
}

export default function MgidNativeAd({ 
  widgetId, 
  className = '', 
  lazy = true 
}: MgidNativeAdProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(!lazy);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!lazy) {
      loadMgidAd();
      return;
    }

    // Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px', // Load 100px before the ad comes into view
        threshold: 0.1,
      }
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isVisible]);

  useEffect(() => {
    if (isVisible && !isLoaded) {
      loadMgidAd();
    }
  }, [isVisible, isLoaded]);

  const loadMgidAd = () => {
    if (typeof window !== 'undefined' && window._mgq && !isLoaded) {
      try {
        // Trigger MGID widget load
        window._mgq.push(['_mgc.load']);
        setIsLoaded(true);
      } catch {
        // Silently handle MGID loading errors
      }
    } else if (typeof window !== 'undefined' && !window._mgq) {
      // Initialize _mgq if it doesn't exist
      window._mgq = window._mgq || [];
      window._mgq.push(['_mgc.load']);
      setIsLoaded(true);
    }
  };

  return (
    <div 
      ref={adRef}
      className={`mgid-native-ad ${className}`}
      style={{ minHeight: '200px' }}
    >
      {isVisible && (
        <>
          <div 
            data-type="_mgwidget" 
            data-widget-id={widgetId}
          />
          <script 
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,q){
                  w[q]=w[q]||[];
                  w[q].push(["_mgc.load"]);
                })(window,"_mgq");
              `
            }}
          />
        </>
      )}
    </div>
  );
}

// Extend window type for TypeScript
declare global {
  interface Window {
    _mgq: any[];
  }
}