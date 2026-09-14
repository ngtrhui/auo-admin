'use client';

import Image from 'next/image';

import { cn } from '@/utils/classNames';

export type EmptyStateProps = {
  imageSrc: string;
  imageAlt?: string;
  title: string;
  description?: string;
  className?: string;
  imageClassName?: string;
};

export default function EmptyState({
  imageSrc,
  imageAlt = '',
  title,
  description,
  className,
  imageClassName,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-gray/30 bg-gray-50 px-4 py-10 text-center',
        className,
      )}
    >
      <Image
        src={imageSrc}
        alt={imageAlt || title}
        width={160}
        height={160}
        className={cn('size-32 shrink-0 object-contain sm:size-40', imageClassName)}
      />
      <p className="mt-4 text-sm font-semibold text-black">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm text-gray">{description}</p> : null}
    </div>
  );
}
