'use client';

import { useEffect } from 'react';

interface EmbedProcessorProps {
  content: string;
}

export default function EmbedProcessor({ content }: EmbedProcessorProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        processEmbeds();
      } catch (error) {
        console.error('Error processing embeds:', error);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [content]);

  const processEmbeds = () => {
    // Process YouTube embeds
    processYouTubeEmbeds();
    
    // Process Twitter embeds
    processTwitterEmbeds();
    
    // Style generic iframes
    styleIframes();
  };

  const processYouTubeEmbeds = () => {
    const youtubeOembeds = document.querySelectorAll('.wp-block-embed-youtube .wp-block-embed__wrapper');
    
    youtubeOembeds.forEach((embed) => {
      if (embed.querySelector('iframe')) return;
      
      const link = embed.querySelector('a');
      if (link) {
        const url = link.href;
        const videoId = extractYouTubeId(url);
        if (videoId) {
          const iframe = document.createElement('iframe');
          iframe.width = '100%';
          iframe.height = '400';
          iframe.src = `https://www.youtube.com/embed/${videoId}`;
          iframe.frameBorder = '0';
          iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
          iframe.allowFullscreen = true;
          iframe.style.maxWidth = '100%';
          iframe.style.borderRadius = '8px';
          embed.innerHTML = '';
          embed.appendChild(iframe);
        }
      }
    });
  };

  const processTwitterEmbeds = () => {
    // Find all potential Twitter embed containers
    const selectors = [
      '.wp-block-embed-twitter .wp-block-embed__wrapper',
      '.wp-block-embed-x .wp-block-embed__wrapper',
      'figure.wp-block-embed.is-provider-twitter .wp-block-embed__wrapper',
      'figure.wp-block-embed.is-provider-x .wp-block-embed__wrapper'
    ];

    const allTwitterEmbeds: Element[] = [];
    selectors.forEach(selector => {
      const found = document.querySelectorAll(selector);
      found.forEach(el => allTwitterEmbeds.push(el));
    });

    // Also check for any anchor with twitter/x URLs in embed blocks
    const allEmbeds = document.querySelectorAll('figure.wp-block-embed .wp-block-embed__wrapper');
    allEmbeds.forEach(wrapper => {
      const link = wrapper.querySelector('a[href*="twitter.com"], a[href*="x.com"]');
      if (link && !allTwitterEmbeds.includes(wrapper)) {
        allTwitterEmbeds.push(wrapper);
      }
    });

    allTwitterEmbeds.forEach((embed) => {
      // Skip if already processed
      if (embed.querySelector('.twitter-tweet') || embed.querySelector('iframe[src*="twitter"]')) {
        return;
      }
      
      const link = embed.querySelector('a');
      if (link && (link.href.includes('twitter.com') || link.href.includes('x.com'))) {
        const tweetUrl = link.href;
        
        const blockquote = document.createElement('blockquote');
        blockquote.className = 'twitter-tweet';
        blockquote.setAttribute('data-theme', 'dark');
        blockquote.setAttribute('data-dnt', 'true');
        
        const embedLink = document.createElement('a');
        embedLink.href = tweetUrl;
        blockquote.appendChild(embedLink);
        
        embed.innerHTML = '';
        embed.appendChild(blockquote);
      }
    });

    // Try to load Twitter widgets
    setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).twttr?.widgets) {
        (window as any).twttr.widgets.load();
      }
    }, 2000);
  };

  const styleIframes = () => {
    const iframeEmbeds = document.querySelectorAll('figure.wp-block-embed iframe');
    iframeEmbeds.forEach((iframe) => {
      if (iframe instanceof HTMLIFrameElement) {
        iframe.style.maxWidth = '100%';
        iframe.style.borderRadius = '8px';
      }
    });
  };

  return null;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
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
