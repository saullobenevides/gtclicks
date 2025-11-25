"use client";

import { useState } from 'react';

export default function ImageWithFallback({ src, alt, style, className }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666',
        fontSize: '0.8rem'
      }}>
        Erro ao carregar
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      style={style}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
