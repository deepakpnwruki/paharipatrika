'use client';

import { useEffect } from 'react';

export default function SocialEmbeds() {
  useEffect(() => {
    // Simple approach - just wait and try to load
    const loadTwitter = () => {
      if (typeof window !== 'undefined' && (window as any).twttr?.widgets) {
        (window as any).twttr.widgets.load();
      }
    };

    // Try multiple times with increasing delays
    const timeouts = [1000, 2000, 3000, 5000, 7000, 10000];
    const timers = timeouts.map(delay => 
      setTimeout(loadTwitter, delay)
    );

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []);

  return null;
}

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (element?: HTMLElement) => void;
      };
      ready?: (callback: () => void) => void;
    };
  }
}
