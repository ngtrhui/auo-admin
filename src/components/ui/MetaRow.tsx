import type { ReactNode } from 'react';

import { cn } from '@/utils/classNames';

export type MetaRowProps = {
  label: string;
  value?: ReactNode;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
};

export default function MetaRow({
  label,
  value,
  className,
  labelClassName,
  valueClassName,
}: MetaRowProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4',
        className,
      )}
    >
      <span className={cn('shrink-0 text-xs font-semibold text-gray', labelClassName)}>
        {label}
      </span>
      <span
        className={cn('break-all text-sm font-medium text-black sm:text-right', valueClassName)}
      >
        {value || '—'}
      </span>
    </div>
  );
}
