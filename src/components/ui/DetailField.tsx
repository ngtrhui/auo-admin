import type { ReactNode } from 'react';
import { HiOutlineClipboard, HiOutlineClipboardDocumentCheck } from 'react-icons/hi2';

import { cn } from '@/utils/classNames';

export type DetailFieldProps = {
  label: string;
  value?: ReactNode;
  mono?: boolean;
  onCopy?: () => void;
  copied?: boolean;
  className?: string;
};

export default function DetailField({
  label,
  value,
  mono,
  onCopy,
  copied,
  className,
}: DetailFieldProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-[112px_minmax(0,1fr)] items-start gap-3 border-b border-gray/10 py-3 last:border-b-0',
        className,
      )}
    >
      <dt className="pt-0.5 text-xs font-medium text-gray">{label}</dt>
      <dd className="min-w-0">
        <div className="flex items-start gap-2">
          <div
            className={cn(
              'min-w-0 flex-1 text-sm leading-5 break-words text-black',
              mono && 'font-mono text-xs sm:text-[13px]',
            )}
          >
            {value || '—'}
          </div>
          {onCopy ? (
            <button
              type="button"
              className="mt-0.5 shrink-0 rounded-md p-1 text-primary transition-colors hover:bg-primary-light"
              aria-label={`Sao chép ${label}`}
              onClick={onCopy}
            >
              {copied ? (
                <HiOutlineClipboardDocumentCheck className="size-4 text-green" />
              ) : (
                <HiOutlineClipboard className="size-4" />
              )}
            </button>
          ) : null}
        </div>
      </dd>
    </div>
  );
}
