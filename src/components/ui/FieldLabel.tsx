import type { ReactNode } from 'react';

import { cn } from '@/utils/classNames';

interface RequiredMarkProps {
  className?: string;
}

export function RequiredMark({ className }: RequiredMarkProps) {
  return (
    <span
      className={cn('ml-0.5 font-bold text-coral', className)}
      aria-hidden="true"
    >
      *
    </span>
  );
}

interface FieldLabelProps {
  htmlFor?: string;
  label: ReactNode;
  required?: boolean;
  className?: string;
}

export default function FieldLabel({
  htmlFor,
  label,
  required = false,
  className,
}: FieldLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn('text-sm font-bold text-black', className)}
    >
      {label}
      {required ? <RequiredMark /> : null}
    </label>
  );
}

interface FieldLegendProps {
  label: ReactNode;
  required?: boolean;
  className?: string;
}

/** Section heading label (no `htmlFor`). */
export function FieldLegend({ label, required = false, className }: FieldLegendProps) {
  return (
    <span className={cn('text-sm font-bold text-black', className)}>
      {label}
      {required ? <RequiredMark /> : null}
    </span>
  );
}
