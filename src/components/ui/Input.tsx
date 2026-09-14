'use client';

import { type InputHTMLAttributes, type ReactNode, type Ref, useId } from 'react';
import { cn } from '@/utils/classNames';
import FieldLabel, { RequiredMark } from './FieldLabel';

const inputVariants = {
  outlined:
    'peer w-full rounded-md border border-gray/40 bg-transparent px-3 py-3 text-base text-black outline-none transition-all placeholder-transparent focus:border-primary focus:ring-1 focus:ring-primary focus:shadow-[2px_2px_4px_0px_#0063FF33] disabled:cursor-not-allowed disabled:opacity-50',
  standard:
    'w-full rounded-lg border border-gray/20 bg-transparent px-4 py-3 text-base text-black outline-none transition-all placeholder:text-gray focus:border-primary focus:ring-1 focus:ring-primary focus:shadow-[2px_2px_4px_0px_#0063FF33] disabled:cursor-not-allowed disabled:opacity-50',
} as const;

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: ReactNode;
  labelClassName?: string;
  variant?: keyof typeof inputVariants;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  containerClassName?: string;
  ref?: Ref<HTMLInputElement>;
}

const Input = ({
  className,
  label,
  labelClassName,
  variant = 'outlined',
  error,
  leftIcon,
  rightIcon,
  fullWidth,
  containerClassName,
  id,
  ref,
  placeholder,
  required,
  ...props
}: InputProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const outlinedPlaceholder =
    typeof label === 'string' ? label || placeholder || ' ' : placeholder || ' ';

  if (variant === 'standard') {
    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full', containerClassName)}>
        {label ? (
          <FieldLabel
            htmlFor={inputId}
            label={label}
            required={required}
            className={labelClassName}
          />
        ) : null}
        <div className="relative">
          {leftIcon ? (
            <span className="absolute inset-y-0 left-3 flex items-center text-gray">
              {leftIcon}
            </span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            placeholder={placeholder}
            required={required}
            className={cn(
              inputVariants.standard,
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error ? 'border-coral focus:border-coral focus:ring-coral' : undefined,
              className,
            )}
            {...props}
          />
          {rightIcon ? (
            <span className="absolute inset-y-0 right-3 flex items-center text-gray">
              {rightIcon}
            </span>
          ) : null}
        </div>
        {error ? <p className="text-xs font-semibold text-coral">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-1', fullWidth && 'w-full', containerClassName)}>
      <div className="relative">
        {leftIcon ? (
          <span className="absolute inset-y-0 left-3 z-10 flex items-center text-gray">
            {leftIcon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          placeholder={outlinedPlaceholder}
          required={required}
          className={cn(
            inputVariants.outlined,
            leftIcon && 'pl-8',
            rightIcon && 'pr-10',
            error ? 'border-coral focus:border-coral focus:ring-coral' : undefined,
            className,
          )}
          {...props}
        />
        {label ? (
          <label
            htmlFor={inputId}
            className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 cursor-text bg-white px-1 text-sm text-gray transition-all',
              'peer-focus:top-0 peer-focus:text-xs peer-focus:text-primary',
              'peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-xs',
              error && 'peer-focus:text-coral',
              leftIcon && 'left-10',
              labelClassName,
            )}
          >
            {label}
            {required ? <RequiredMark /> : null}
          </label>
        ) : null}
        {rightIcon ? (
          <span className="absolute inset-y-0 right-3 flex items-center text-gray">
            {rightIcon}
          </span>
        ) : null}
      </div>
      {error ? <p className="text-xs font-semibold text-coral">{error}</p> : null}
    </div>
  );
};

Input.displayName = 'Input';

export { Input };
