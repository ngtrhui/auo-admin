import type { ComponentType } from 'react';

import { cn } from '@/utils/classNames';

export type TimelineItemProps = {
  title: string;
  time: string;
  done: boolean;
  active?: boolean;
  isLast?: boolean;
  icon: ComponentType<{ className?: string }>;
  className?: string;
};

export default function TimelineItem({
  title,
  time,
  done,
  active,
  isLast,
  icon: Icon,
  className,
}: TimelineItemProps) {
  return (
    <div className={cn('relative flex gap-3 pb-6 last:pb-0', className)}>
      {!isLast ? (
        <span
          className={cn(
            'absolute top-8 left-[15px] h-[calc(100%-20px)] w-0.5',
            done ? 'bg-emerald-300' : 'bg-gray/20',
          )}
          aria-hidden
        />
      ) : null}
      <span
        className={cn(
          'relative z-10 inline-flex size-8 shrink-0 items-center justify-center rounded-full border-2',
          done
            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
            : active
              ? 'border-amber-500 bg-amber-50 text-amber-700'
              : 'border-gray/30 bg-white text-gray',
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-sm font-semibold text-black">{title}</p>
        <p className="mt-0.5 text-xs text-gray">{time}</p>
      </div>
    </div>
  );
}
