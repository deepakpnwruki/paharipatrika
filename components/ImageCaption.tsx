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
  caption = 'Imago'
}: ImageCaptionProps) {
  const [showCaption, setShowCaption] = useState(false);

  return (
    <div className="es-hero__media-wrapper">
      <div className="es-hero__media">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes={sizes}
          className={className}
          style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }}
        />
        <div className={`es-hero__caption${showCaption ? ' is-active' : ''}`} style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <span className="es-caption__text" style={{ flex: 1, opacity: showCaption ? 1 : 0, visibility: showCaption ? 'visible' : 'hidden', transition: 'opacity 0.3s, visibility 0.3s', textAlign: 'left' }}>{caption}</span>
          <button
            className={`es-caption__info${showCaption ? ' is-active' : ''}`}
            onClick={() => setShowCaption(!showCaption)}
            aria-label={showCaption ? 'Hide image information' : 'Show image information'}
            type="button"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s', transform: showCaption ? 'rotate(20deg) scale(1.1)' : 'none' }}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
