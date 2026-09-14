'use client';

import { type TextareaHTMLAttributes, type Ref, ReactNode, useId } from 'react';
import FieldLabel from '@/components/ui/FieldLabel';
import { cn } from '@/utils/classNames';

const resizeClassNames = {
  none: 'resize-none',
  vertical: 'resize-y',
  horizontal: 'resize-x',
  both: 'resize',
} as const;

export interface TextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'children'
> {
  label?: ReactNode;
  labelClassName?: string;
  error?: string;
  fullWidth?: boolean;
  containerClassName?: string;
  /** Default `none`. Use `vertical` to allow height resize via drag handle. */
  resize?: keyof typeof resizeClassNames;
  ref?: Ref<HTMLTextAreaElement>;
}

const Textarea = ({
  className,
  label,
  labelClassName,
  error,
  fullWidth,
  containerClassName,
  resize = 'none',
  id,
  rows = 4,
  ref,
  required,
  ...props
}: TextareaProps) => {
  const generatedId = useId();
  const textareaId =
    id ||
    (typeof label === 'string' && label ? label.toLowerCase().replace(/\s+/g, '-') : generatedId);
  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full', containerClassName)}>
      {label ? (
        <FieldLabel
          htmlFor={textareaId}
          label={label}
          required={required}
          className={labelClassName}
        />
      ) : null}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        required={required}
        className={cn(
          'w-full rounded-lg scrollbar border border-gray/20 bg-transparent px-4 py-3 text-base text-black outline-none transition-all placeholder:text-gray/60 focus:border-primary focus:ring-1 focus:ring-primary focus:shadow-[2px_2px_4px_0px_#0063FF33] disabled:cursor-not-allowed disabled:opacity-50',
          resizeClassNames[resize],
          error ? 'border-coral focus:border-coral focus:ring-coral' : undefined,
          className,
        )}
        {...props}
      />
      {error ? <p className="text-xs text-coral font-semibold">{error}</p> : null}
    </div>
  );
};

Textarea.displayName = 'Textarea';

export { Textarea };
