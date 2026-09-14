"use client";

import { cn } from "@/utils/classNames";

interface FieldErrorProps {
  message?: string;
  className?: string;
}

export function FieldError({ message, className }: FieldErrorProps) {
  if (!message) return null;

  return (
    <p className={cn("text-xs font-semibold text-coral", className)} role="alert">
      {message}
    </p>
  );
}
