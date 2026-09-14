'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { cn } from '@/utils/classNames';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

type ImagePreviewProps = {
  src: string;
  alt: string;
  viewImageAria: string;
  previewAria: string;
  aspectClass?: string;
  imageClassName?: string;
  className?: string;
  modalClassName?: string;
};

export function ImagePreview({
  src,
  alt,
  viewImageAria,
  previewAria,
  aspectClass = 'aspect-3/2',
  imageClassName = 'w-full h-full object-cover transition duration-500 group-hover:scale-105',
  className,
}: ImagePreviewProps) {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={cn(
          'relative block flex-items-center justify-center w-full shrink-0 cursor-zoom-in overflow-hidden border-0 bg-transparent p-0',
          aspectClass,
          className,
        )}
        aria-label={viewImageAria}
        onClick={() => setPreviewOpen(true)}
      >
        <ImageWithFallback
          src={src}
          alt={alt}
          fill
          className={imageClassName}
          imageClassName={'max-w-none'}
          sizes="(max-width: 896px) 100vw, 896px"
        />
      </button>

      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        aria-label={previewAria}
        className="w-full lg:max-w-4xl"
      >
        <ImageWithFallback
          src={src}
          alt={alt}
          width={1600}
          height={900}
          className="h-auto w-full object-contain"
          sizes="(max-width: 896px) 100vw, 896px"
        />
      </Modal>
    </>
  );
}
