// import { NotificationItem } from '@/types/notification';
// import { cn } from '@/utils/classNames';
// import { formatNotificationTime, NotificationTypeIcon } from '@/utils/notification';

// export function NotificationRow({
//   item,
//   onSelect,
// }: {
//   item: NotificationItem;
//   onSelect: (item: NotificationItem) => void;
// }) {
//   return (
//     <button
//       type="button"
//       role="menuitem"
//       onClick={() => onSelect(item)}
//       className={cn(
//         'flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-primary-light/40 cursor-pointer',
//         !item.isRead && 'bg-primary-light/20',
//       )}
//     >
//       <div className="relative mt-0.5 shrink-0">
//         <span
//           className={cn(
//             'flex size-9 items-center justify-center rounded-full',
//             item.isRead ? 'bg-gray/10 text-gray' : 'bg-primary/10 text-primary',
//           )}
//         >
//           <NotificationTypeIcon
//             type={item.type}
//             className="size-4"
//           />
//         </span>
//         {!item.isRead ? (
//           <span
//             className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-primary ring-2 ring-white"
//             aria-hidden
//           />
//         ) : null}
//       </div>
//       <div className="min-w-0 flex-1">
//         <p className="line-clamp-1 text-sm font-semibold text-black">{item.title}</p>
//         <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-gray">{item.body}</p>
//         <p className="mt-2 text-xs font-medium text-gray/80 capitalize">
//           {formatNotificationTime(item.createdAt)}
//         </p>
//       </div>
//     </button>
//   );
// }
