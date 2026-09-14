import { Skeleton } from '@/components/ui/Skeleton';

function NotificationRowSkeleton() {
  return (
    <div className="flex w-full gap-3 px-4 py-3">
      <Skeleton className="mt-0.5 size-9 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="mt-1 h-3 w-20" />
      </div>
    </div>
  );
}

type NotificationSkeletonProps = {
  count?: number;
};

export function NotificationSkeleton({ count = 5 }: NotificationSkeletonProps) {
  return (
    <div
      className="divide-y divide-gray/10"
      role="status"
      aria-label="Đang tải thông báo"
    >
      {Array.from({ length: count }, (_, index) => (
        <NotificationRowSkeleton key={index} />
      ))}
      <span className="sr-only">Đang tải thông báo...</span>
    </div>
  );
}
