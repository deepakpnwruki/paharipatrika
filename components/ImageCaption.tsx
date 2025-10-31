'use client';

import { useState } from 'react';
import Image from 'next/image';

type ImageCaptionProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  sizes?: string;
  className?: string;
  caption?: string;
};

export default function ImageCaption({
  src,
  alt,
  width,
  height,
  priority,
  sizes,
  className,
  caption
}: ImageCaptionProps) {
  const [showCaption, setShowCaption] = useState(false);

  return (
    <div className="es-hero__media">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        className={className}
      />
      <div className={`es-hero__caption ${showCaption ? 'is-active' : ''}`}>
  <span className="es-caption__text">{(caption || alt)?.replace(/^<p>|<\/p>$/gi, '').replace(/<p>/gi, '').replace(/<\/p>/gi, '')}</span>
        <button
          className="es-caption__info"
          onClick={() => setShowCaption(!showCaption)}
          aria-label={showCaption ? 'Hide image information' : 'Show image information'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
