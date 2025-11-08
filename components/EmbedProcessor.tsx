'use client';

import { useEffect } from 'react';

interface EmbedProcessorProps {
  content: string;
}

export default function EmbedProcessor({ content }: EmbedProcessorProps) {
  // DEBUG variable removed (unused)

  useEffect(() => {
    // (embed processing logic can be added here if needed)
  }, [content]);
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
