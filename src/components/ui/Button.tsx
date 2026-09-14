"use client";

import { type ButtonHTMLAttributes, type Ref } from "react";
import { cn } from "@/utils/classNames";

const buttonVariants = {
  variant: {
    primary:
      "bg-primary text-white hover:bg-primary-secondary/20 hover:text-primary active:bg-primary/80 active:text-white disabled:bg-gray disabled:opacity-60",
    white: "bg-white text-primary hover:bg-primary-light active:bg-primary-light/80 disabled:text-gray",
    secondary:
      "bg-primary-light text-primary hover:bg-primary-light/60 active:bg-primary-light/80 disabled:bg-gray/20 disabled:opacity-60",
    outline:
      "border-2 border-[#E3E3E3] bg-white text-primary hover:text-primary hover:bg-primary-light active:bg-primary-light/80 disabled:border-gray disabled:text-gray",
    outlinePrimary:
      "border-2 border-primary bg-white text-primary hover:text-primary hover:bg-primary-light active:bg-primary-light/80 disabled:border-gray disabled:text-gray",
    ghost:
      "bg-transparent text-primary hover:bg-primary-light active:bg-primary-light/80 disabled:text-gray",
    danger:
      "bg-coral text-white hover:bg-coral/90 active:bg-coral/80 disabled:bg-gray disabled:opacity-60",
    transparent:
      "bg-transparent text-gray hover:text-black disabled:text-gray",
    black:
      "bg-black text-white hover:bg-black/80 active:bg-black/90 disabled:bg-gray disabled:opacity-60",
    orange:
      "bg-orange text-white hover:bg-orange/90 active:bg-orange/80 disabled:bg-gray disabled:opacity-60",
    green:
      "bg-green text-white hover:bg-green/90 active:bg-green/80 disabled:bg-gray disabled:opacity-60",
  },
  size: {
    sm: "h-8 px-3 text-sm rounded-md gap-1.5",
    md: "h-10 px-4 text-sm rounded-lg gap-2",
    lg: "h-12 px-6 text-base rounded-lg gap-2.5",
  },
} as const;

export type ButtonVariant = keyof typeof buttonVariants.variant;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: keyof typeof buttonVariants.size;
  loading?: boolean;
  contentClassName?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

const Button = ({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  contentClassName,
  leftIcon,
  rightIcon,
  fullWidth,
  disabled,
  children,
  type = "button",
  ref,
  ...props
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={cn(
        "inline-flex font-bold items-center justify-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none",
        "cursor-pointer",
        (isDisabled || loading) && "cursor-not-allowed",
        buttonVariants.variant[variant],
        buttonVariants.size[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading ? (
        <span
          className="size-5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      ) : (
        leftIcon
      )}
      {children ? <span className={cn(contentClassName)}>{children}</span> : null}
      {!loading ? rightIcon : null}
    </button>
  );
};

Button.displayName = "Button";

export { Button };
