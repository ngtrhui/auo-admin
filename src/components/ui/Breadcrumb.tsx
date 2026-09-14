import React from 'react';
import Link from 'next/link';
import { cn } from '@/utils/classNames';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
  /** `true` (mặc định): mục cuối màu xám. `false`: mục cuối cùng tông với link (đen). */
  lastItemMuted?: boolean;
  /** Cắt bớt nhãn mục cuối khi hẹp — container cha cần `min-w-0` / `overflow-hidden`. */
  truncateLast?: boolean;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = '/',
  className = '',
  lastItemMuted = true,
  truncateLast = false,
}) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'flex items-center text-[11px] sm:text-xs md:text-sm',
        truncateLast && 'min-w-0 flex-1 overflow-hidden',
        className,
      )}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const labelClassName = cn(
          'font-semibold',
          truncateLast && isLast && 'block min-w-0 truncate',
        );

        return (
          <span
            key={index}
            className={cn(
              'flex min-w-0 items-center',
              truncateLast && isLast && 'min-w-0 flex-1 overflow-hidden',
              truncateLast && !isLast && 'shrink-0',
            )}
          >
            {item.path ? (
              <Link
                href={item.path}
                className={cn(
                  labelClassName,
                  'transition-colors hover:underline',
                  isLast && lastItemMuted ? 'text-gray/80 hover:text-black' : 'text-black',
                )}
                title={truncateLast && isLast ? item.label : undefined}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  labelClassName,
                  isLast ? (lastItemMuted ? 'text-gray/80' : 'text-black') : 'text-gray/80',
                )}
                title={truncateLast && isLast ? item.label : undefined}
              >
                {item.label}
              </span>
            )}

            {!isLast && (
              <span className="shrink-0 font-semibold text-black md:mx-2">{separator}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
