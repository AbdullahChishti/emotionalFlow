import React, { CSSProperties } from 'react';

interface ArtisticSplashProps {
  className?: string;
  style?: CSSProperties;
  color: string;
  [key: string]: any;
}

export function ArtisticSplash({ className, style, color, ...props }: ArtisticSplashProps) {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      className={className}
      style={style}
      {...props}
    >
      <path
        d="M100,300 Q200,350 300,300 Q350,200 300,100 Q200,50 100,100 Q50,200 100,300 Z"
        fill={color}
        opacity="0.5"
      />
    </svg>
  );
} 