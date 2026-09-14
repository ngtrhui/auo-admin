// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { HiOutlineArrowTopRightOnSquare } from 'react-icons/hi2';

// import { Button } from '@/components/ui/Button';
// import DetailField from '@/components/ui/DetailField';
// import SlidePanel from '@/components/ui/SlidePanel';
// import { showToast } from '@/components/ui/Toaster';
// import type { NotificationItem } from '@/types/notification';
// import { cn } from '@/utils/classNames';
// import { copyToClipboard } from '@/utils/json-ld';
// import {
//   formatNotificationDateTime,
//   formatNotificationTime,
//   getNotificationCategoryLabel,
//   getNotificationMetadataEntries,
//   getNotificationReferenceLink,
//   getNotificationTypeLabel,
//   getReferenceTypeLabel,
// } from '@/utils/notification';

// type NotificationDetailDrawerProps = {
//   notification: NotificationItem | null;
//   open: boolean;
//   onClose: () => void;
// };

// export function NotificationDetailDrawer({
//   notification,
//   open,
//   onClose,
// }: NotificationDetailDrawerProps) {
//   return (
//     <NotificationDetailDrawerView
//       key={notification?.id ?? 'closed'}
//       notification={notification}
//       open={open}
//       onClose={onClose}
//     />
//   );
// }

// function NotificationDetailDrawerView({
//   notification,
//   open,
//   onClose,
// }: NotificationDetailDrawerProps) {
//   const router = useRouter();
//   const [copiedField, setCopiedField] = useState<'id' | 'referenceId' | null>(null);

//   const categoryLabel = notification ? getNotificationCategoryLabel(notification.type) : '';
//   const typeLabel = notification ? getNotificationTypeLabel(notification.type) : '';
//   const referenceLink = notification
//     ? getNotificationReferenceLink(notification.referenceType, notification.referenceId)
//     : null;
//   const metadataEntries = getNotificationMetadataEntries(notification?.metadata);
//   const createdAtLabel = notification ? formatNotificationDateTime(notification.createdAt) : '';
//   const relativeTime = notification ? formatNotificationTime(notification.createdAt) : '';

//   const handleCopy = async (value: string, field: 'id' | 'referenceId') => {
//     try {
//       await copyToClipboard(value);
//       setCopiedField(field);
//       showToast('success', 'Đã sao chép');
//       window.setTimeout(() => setCopiedField(null), 2000);
//     } catch {
//       showToast('error', 'Không thể sao chép');
//     }
//   };

//   return (
//     <SlidePanel
//       isOpen={open && Boolean(notification)}
//       onClose={onClose}
//       title="Chi tiết thông báo"
//       width="md"
//       contentClassName="bg-second-gray/30"
//       footerClassName="px-4 py-3 sm:px-5"
//       footer={
//         referenceLink ? (
//           <Button
//             type="button"
//             variant="primary"
//             size="md"
//             className="w-full gap-2"
//             onClick={() => {
//               onClose();
//               router.push(referenceLink.href);
//             }}
//           >
//             {referenceLink.label}
//             <HiOutlineArrowTopRightOnSquare className="size-4" />
//           </Button>
//         ) : null
//       }
//     >
//       {notification ? (
//         <div className="space-y-4 p-4 sm:p-5">
//           <section className="rounded-xl border border-gray/15 bg-white p-4 shadow-[0px_3px_8px_#0063FF1A]">
//             <div className="min-w-0 flex-1">
//               <div className="flex flex-wrap items-center gap-1.5">
//                 <span className="inline-flex rounded-md bg-primary-light px-2 py-0.5 text-[11px] font-semibold text-primary">
//                   {categoryLabel}
//                 </span>
//                 <span
//                   className={cn(
//                     'inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold',
//                     notification.isRead ? 'bg-gray/10 text-gray' : 'bg-coral/10 text-coral',
//                   )}
//                 >
//                   {notification.isRead ? 'Đã đọc' : 'Chưa đọc'}
//                 </span>
//               </div>

//               <h3 className="mt-2 text-base font-semibold leading-6 text-black">
//                 {notification.title}
//               </h3>

//               <p className="mt-1.5 text-xs text-gray flex items-center gap-2">
//                 <span className="capitalize">{relativeTime}</span>
//                 {createdAtLabel ? (
//                   <>
//                     <span className="bg-gray/40 inline-block w-1 h-1 rounded-full" />
//                     <span>{createdAtLabel}</span>
//                   </>
//                 ) : null}
//               </p>
//             </div>
//             {notification.body ? (
//               <div className="mt-4 border-t border-gray/10 pt-4">
//                 <p className="text-xs font-semibold tracking-wide text-gray uppercase">Nội dung</p>
//                 <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-black">
//                   {notification.body}
//                 </p>
//               </div>
//             ) : null}
//           </section>

//           <section className="rounded-xl border border-gray/15 bg-white p-4 shadow-[0px_3px_8px_#0063FF1A]">
//             <h4 className="text-sm font-bold text-black">Thông tin</h4>
//             <dl className="mt-1">
//               <DetailField
//                 label="Loại"
//                 value={typeLabel}
//               />
//               <DetailField
//                 label="Mã loại"
//                 value={notification.type}
//                 mono
//               />
//               <DetailField
//                 label="Tạo lúc"
//                 value={createdAtLabel || '—'}
//               />
//               <DetailField
//                 label="Đã đọc lúc"
//                 value={
//                   notification.isRead
//                     ? formatNotificationDateTime(notification.readAt) || 'Đã đọc'
//                     : 'Chưa đọc'
//                 }
//               />
//               {notification.referenceType ? (
//                 <DetailField
//                   label="Tham chiếu"
//                   value={getReferenceTypeLabel(notification.referenceType)}
//                 />
//               ) : null}
//               {notification.referenceId ? (
//                 <DetailField
//                   label="ID tham chiếu"
//                   value={notification.referenceId}
//                   mono
//                   copied={copiedField === 'referenceId'}
//                   onCopy={() => void handleCopy(notification.referenceId!, 'referenceId')}
//                 />
//               ) : null}
//             </dl>
//           </section>

//           {metadataEntries.length > 0 ? (
//             <section className="rounded-xl border border-gray/15 bg-white p-4 shadow-[0px_3px_8px_#0063FF1A]">
//               <h4 className="text-sm font-bold text-black">Metadata</h4>
//               <dl className="mt-1">
//                 {metadataEntries.map((entry) => (
//                   <DetailField
//                     key={entry.key}
//                     label={entry.key}
//                     value={entry.value}
//                     mono
//                   />
//                 ))}
//               </dl>
//             </section>
//           ) : null}
//         </div>
//       ) : null}
//     </SlidePanel>
//   );
// }
