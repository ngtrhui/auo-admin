'use client';

import { toast } from 'sonner';
import { FaXmark } from 'react-icons/fa6';
import { cn } from '@/utils/classNames';
import { getNotificationCategoryLabel, NotificationTypeIcon } from '@/utils/notification';

type NotificationToastPayload = {
  type: string;
  title: string;
  body: string;
};

const TOAST_DURATION_MS = 5500;

function NotificationToastCard({
  id,
  payload,
}: {
  id: string | number;
  payload: NotificationToastPayload;
}) {
  const categoryLabel = getNotificationCategoryLabel(payload.type);

  return (
    <div
      className={cn(
        'pointer-events-auto relative w-[min(100vw-2rem,360px)] overflow-hidden',
        'rounded-xl border border-gray/15 bg-white shadow-primary',
      )}
      style={{ animation: 'notification-toast-in 280ms ease-out both' }}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
          <NotificationTypeIcon
            type={payload.type}
            className="size-4"
          />
        </span>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm leading-5 font-semibold text-black line-clamp-2">
              {payload.title}
            </p>
            <button
              type="button"
              aria-label="Đóng thông báo"
              className="-mr-1 -mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md text-gray transition-colors hover:bg-gray/10 hover:text-black"
              onClick={() => toast.dismiss(id)}
            >
              <FaXmark className="size-3" />
            </button>
          </div>

          {payload.body ? (
            <p className="line-clamp-3 text-xs leading-5 text-gray">{payload.body}</p>
          ) : null}

          <div className="flex items-center gap-2 pt-0.5">
            <span className="inline-flex items-center rounded-md bg-primary-light px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary">
              {categoryLabel}
            </span>
            <span className="text-[11px] leading-4 text-gray/80">Vừa xong</span>
          </div>
        </div>
      </div>

      <div
        className="h-[3px] w-full overflow-hidden bg-primary-light/50"
        aria-hidden
      >
        <div
          className="h-full w-full origin-left rounded-r-full bg-primary"
          style={{
            animation: `notification-toast-progress ${TOAST_DURATION_MS}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
}

export function showNotificationToast(payload: NotificationToastPayload) {
  if (!payload.title && !payload.body) return;

  toast.custom(
    (id) => (
      <NotificationToastCard
        id={id}
        payload={payload}
      />
    ),
    {
      duration: TOAST_DURATION_MS,
    },
  );
}
