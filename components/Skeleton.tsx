import React from 'react';

interface SkeletonProps {
  height?: number | string;
  width?: number | string;
  style?: React.CSSProperties;
}

export default function Skeleton({ height = 20, width = '100%', style = {} }: SkeletonProps) {
  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.2s infinite linear',
        borderRadius: 4,
        height,
        width,
        ...style,
      }}
      className="skeleton"
    />
  );
}
