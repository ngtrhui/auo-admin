'use client';

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type Ref } from 'react';
import { HiMinus, HiOutlineCheck } from 'react-icons/hi';
import { cn } from '@/utils/classNames';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  error?: string;
  containerClassName?: string;
  /** Khi ô đang checked: dùng gạch ngang thay cho dấu check. */
  checkedGlyph?: 'check' | 'minus';
}

const Checkbox = forwardRef(function Checkbox(
  {
    id,
    label,
    error,
    className,
    containerClassName,
    disabled,
    checked,
    defaultChecked,
    checkedGlyph = 'check',
    ...props
  }: CheckboxProps,
  ref: Ref<HTMLInputElement>,
) {
  const uid = useId();
  const inputId = id ?? uid;

  return (
    <div className={cn('flex flex-col gap-1 w-fit', disabled && 'opacity-60', containerClassName)}>
      <label
        htmlFor={inputId}
        className={cn(
          'group inline-flex cursor-pointer items-start gap-2.5',
          disabled && 'cursor-not-allowed',
        )}
      >
        <span className="relative mt-px inline-flex shrink-0">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            disabled={disabled}
            checked={checked}
            defaultChecked={defaultChecked}
            className={cn('peer sr-only', 'focus-visible:outline-none', className)}
            {...props}
          />
          <span
            aria-hidden
            className={cn(
              'flex h-[18px] w-[18px] items-center justify-center rounded border border-gray/40 bg-white transition-colors',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2',
              'peer-checked:border-primary peer-checked:bg-primary',
              'peer-checked:[&>.checkbox-glyph]:opacity-100',
              error && 'border-coral peer-checked:border-coral peer-checked:bg-coral',
            )}
          >
            {checkedGlyph === 'minus' ? (
              <HiMinus
                aria-hidden
                className="checkbox-glyph size-3.5 text-white opacity-0 transition-opacity"
              />
            ) : (
              <HiOutlineCheck
                aria-hidden
                className="checkbox-glyph size-3.5 text-white opacity-0 transition-opacity"
                strokeWidth={2.5}
              />
            )}
          </span>
        </span>
        {label ? (
          <span
            className={cn(
              'min-w-0 text-sm select-none leading-snug text-black',
              error && 'text-coral',
            )}
          >
            {label}
          </span>
        ) : null}
      </label>
      {error ? <p className="text-xs text-coral">{error}</p> : null}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export { Checkbox };
