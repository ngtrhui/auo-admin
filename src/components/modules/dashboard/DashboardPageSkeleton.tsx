import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/utils/classNames';

export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('flex items-center gap-3 rounded-lg bg-white p-4 shadow-primary', className)}
      aria-hidden
    >
      <Skeleton className="size-12 shrink-0 rounded-lg" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton className="h-3 w-24" />
        <div className="flex items-end justify-between gap-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-6 w-14 shrink-0 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4"
      role="status"
      aria-label="Đang tải thống kê"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <StatCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function ChartCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-5 rounded-lg bg-white p-5 shadow-[0px_4px_8px_#0063FF33]',
        className,
      )}
      role="status"
      aria-label="Đang tải biểu đồ"
    >
      <Skeleton className="h-7 w-48" />
      <div className="flex flex-wrap items-center gap-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="h-70 w-full rounded-lg sm:h-80" />
    </div>
  );
}

export function DashboardContentSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <DashboardStatsSkeleton />
      <div className="grid grid-cols-1 gap-5">
        <ChartCardSkeleton />
      </div>
    </div>
  );
}
