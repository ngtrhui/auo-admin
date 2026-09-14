'use client';

import React, { useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { cn } from '@/utils/classNames';

export const IMAGE_FALLBACK_DEFAULT = '/images/camera-off.png';

export interface ImageWithFallbackProps extends Omit<ImageProps, 'onError'> {
  /** URL ảnh chính */
  src: string;
  /** URL ảnh fallback khi load lỗi hoặc src rỗng */
  fallbackSrc?: string;
  imageClassName?: string;
}

/**
 * Component Image của Next.js với fallback về ảnh "no photo" khi load lỗi.
 */
export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc = IMAGE_FALLBACK_DEFAULT,
  alt,
  className,
  unoptimized,
  imageClassName,
  ...props
}) => {
  const [error, setError] = useState(false);
  const isFallback = !src || error;
  const displaySrc = isFallback ? fallbackSrc : src;
  const shouldUnoptimize = unoptimized ?? displaySrc.startsWith('data:');

  if (isFallback) {
    return (
      <div
        className={`flex items-center justify-center bg-coral/20 ${className ?? ''}`}
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        <Image
          {...props}
          src={displaySrc}
          alt={alt}
          className={cn('object-contain max-w-[50%]', imageClassName)}
          unoptimized={shouldUnoptimize}
          onError={() => setError(true)}
        />
      </div>
    );
  }

  return (
    <Image
      {...props}
      src={displaySrc}
      alt={alt}
      className={className}
      unoptimized={shouldUnoptimize}
      onError={() => setError(true)}
    />
  );
};
