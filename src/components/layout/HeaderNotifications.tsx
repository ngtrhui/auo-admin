// 'use client';

// import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import { HiOutlineBell } from 'react-icons/hi2';
// import Dropdown from '@/components/ui/Dropdown';
// import { Button } from '@/components/ui/Button';
// import { useNotifications } from '@/hooks/useNotifications';
// import type { NotificationItem } from '@/types/notification';
// import { isProvisionalNotificationId, useNotificationStore } from '@/stores/notification.store';
// import { EnableNotificationsButton } from '@/components/web-push/EnableNotificationsButton';
// import { groupNotificationsByDate } from '@/utils/notification';
// import { NotificationDetailDrawer } from './NotificationDetailDrawer';
// import { NotificationRow } from './NotificationRow';
// import { NotificationSkeleton } from './NotificationSkeleton';

// export function HeaderNotifications() {
//   const listRef = useRef<HTMLDivElement | null>(null);
//   const sentinelRef = useRef<HTMLDivElement | null>(null);
//   const observerCleanupRef = useRef<(() => void) | null>(null);
//   const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

//   const {
//     notifications,
//     unreadCount,
//     isLoading,
//     markRead,
//     markAllRead,
//     isMarkingAllRead,
//     hasNextPage,
//     isFetchingNextPage,
//     fetchNextPage,
//   } = useNotifications({ perPage: 10, enabled: isDropdownOpen });

//   const bindLoadMoreObserver = useCallback(() => {
//     observerCleanupRef.current?.();
//     observerCleanupRef.current = null;

//     const root = listRef.current;
//     const sentinel = sentinelRef.current;
//     if (!root || !sentinel) return;

//     const observer = new IntersectionObserver(
//       (entries) => {
//         if (!entries[0]?.isIntersecting) return;
//         if (!hasNextPage || isFetchingNextPage) return;
//         void fetchNextPage();
//       },
//       // root = scroll container: fires when sentinel is visible, including when the
//       // list does not overflow (small perPage) so infinite load still continues.
//       { root, rootMargin: '80px 0px', threshold: 0 },
//     );

//     observer.observe(sentinel);
//     observerCleanupRef.current = () => observer.disconnect();
//   }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

//   const setListNode = useCallback(
//     (node: HTMLDivElement | null) => {
//       listRef.current = node;
//       if (node) {
//         // Portal menu mounts without re-rendering this component — bind on attach.
//         queueMicrotask(() => bindLoadMoreObserver());
//       } else {
//         observerCleanupRef.current?.();
//         observerCleanupRef.current = null;
//       }
//     },
//     [bindLoadMoreObserver],
//   );

//   const setSentinelNode = useCallback(
//     (node: HTMLDivElement | null) => {
//       sentinelRef.current = node;
//       if (node) {
//         queueMicrotask(() => bindLoadMoreObserver());
//       }
//     },
//     [bindLoadMoreObserver],
//   );

//   useEffect(() => {
//     bindLoadMoreObserver();
//     return () => {
//       observerCleanupRef.current?.();
//       observerCleanupRef.current = null;
//     };
//   }, [bindLoadMoreObserver, hasNextPage, isFetchingNextPage, notifications.length]);

//   const handleSelectNotification = (item: NotificationItem) => {
//     const nextItem = item.isRead
//       ? item
//       : { ...item, isRead: true, readAt: item.readAt ?? new Date().toISOString() };

//     setSelectedNotification(nextItem);

//     if (item.isRead) return;

//     if (isProvisionalNotificationId(item.id)) {
//       const store = useNotificationStore.getState();
//       store.patchLiveNotification(item.id, {
//         isRead: true,
//         readAt: nextItem.readAt,
//       });
//       store.setUnreadCount(Math.max(0, store.unreadCount - 1));
//       return;
//     }

//     markRead.mutate({ id: item.id, isRead: true });
//   };

//   const handleCloseDetail = () => {
//     setSelectedNotification(null);
//   };

//   const handleMarkAllRead = () => {
//     markAllRead.mutate();
//   };

//   const badgeLabel = useMemo(() => {
//     if (unreadCount <= 0) return null;
//     return unreadCount > 9 ? '9+' : String(unreadCount);
//   }, [unreadCount]);

//   const notificationGroups = useMemo(
//     () => groupNotificationsByDate(notifications),
//     [notifications],
//   );

//   return (
//     <>
//       <Dropdown
//         placement="bottom"
//         align="right"
//         usePortal
//         showArrow={false}
//         closeOnItemClick
//         ariaLabel="Thông báo"
//         className="w-[min(100vw-2rem,380px)] overflow-hidden"
//         onOpenChange={setIsDropdownOpen}
//         trigger={({ triggerProps }) => (
//           <Button
//             variant="transparent"
//             size="sm"
//             className="relative size-10 p-0 text-gray hover:bg-primary-light/50 hover:text-primary"
//             contentClassName="relative"
//             aria-label="Thông báo"
//             {...triggerProps}
//           >
//             <HiOutlineBell
//               className="size-8"
//               aria-hidden
//             />
//             {badgeLabel ? (
//               <span className="absolute top-0 right-0 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold leading-none text-white">
//                 {badgeLabel}
//               </span>
//             ) : null}
//           </Button>
//         )}
//       >
//         <div className="flex items-center justify-between border-b border-gray/15 px-4 py-3">
//           <div>
//             <p className="text-sm font-bold text-black">Thông báo</p>
//             {unreadCount > 0 ? (
//               <p className="text-xs text-gray">{unreadCount} chưa đọc</p>
//             ) : (
//               <p className="text-xs text-gray">Bạn đã xem hết</p>
//             )}
//           </div>
//           {unreadCount > 0 ? (
//             <button
//               type="button"
//               className="text-xs font-semibold text-primary transition-colors hover:text-primary-secondary disabled:opacity-50 cursor-pointer"
//               onClick={handleMarkAllRead}
//               disabled={isMarkingAllRead}
//             >
//               Đọc tất cả
//             </button>
//           ) : null}
//         </div>

//         <div
//           ref={setListNode}
//           className="max-h-[min(60vh,420px)] overflow-y-auto scrollbar"
//         >
//           {isLoading ? (
//             <NotificationSkeleton count={5} />
//           ) : notifications.length === 0 ? (
//             <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
//               <span className="flex size-12 items-center justify-center rounded-full bg-primary-light text-primary">
//                 <HiOutlineBell
//                   className="size-5"
//                   aria-hidden
//                 />
//               </span>
//               <p className="text-sm font-semibold text-black">Không có thông báo</p>
//               <p className="text-xs text-gray">Các cập nhật mới sẽ hiển thị tại đây.</p>
//             </div>
//           ) : (
//             <>
//               {notificationGroups.map((group) => (
//                 <section
//                   key={group.key}
//                   aria-label={group.label}
//                 >
//                   <div className="sticky top-0 z-1 border-b border-gray/10 bg-white/95 px-4 py-2 backdrop-blur-sm">
//                     <p className="text-[11px] font-semibold tracking-wide text-gray uppercase">
//                       {group.label}
//                     </p>
//                   </div>
//                   <div className="divide-y divide-gray/10">
//                     {group.items.map((item) => (
//                       <NotificationRow
//                         key={item.id}
//                         item={item}
//                         onSelect={handleSelectNotification}
//                       />
//                     ))}
//                   </div>
//                 </section>
//               ))}
//               {isFetchingNextPage ? <NotificationSkeleton count={2} /> : null}
//               {hasNextPage ? (
//                 <div
//                   ref={setSentinelNode}
//                   className="h-1 w-full shrink-0"
//                   aria-hidden
//                 />
//               ) : notifications.length > 0 ? (
//                 <p className="px-4 py-3 text-center text-xs text-gray/70">Đã hết thông báo</p>
//               ) : null}
//             </>
//           )}
//         </div>

//         <EnableNotificationsButton />
//       </Dropdown>

//       <NotificationDetailDrawer
//         notification={selectedNotification}
//         open={Boolean(selectedNotification)}
//         onClose={handleCloseDetail}
//       />
//     </>
//   );
// }
