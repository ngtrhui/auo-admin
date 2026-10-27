import type { ReactNode } from "react";

interface ProductFormFieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
}

export default function ProductFormField({
  label,
  required,
  children,
}: ProductFormFieldProps) {
  return (
    <label className="block min-w-0 space-y-1.5">
      <span className="block text-xs font-semibold text-black">
        {label}
        {required ? <span className="ml-0.5 text-[#C86F5E]">*</span> : null}
      </span>
      {children}
    </label>
  );
}
