// 'use client';

// import { useState } from 'react';
// import { HiOutlineBellAlert, HiOutlineDevicePhoneMobile } from 'react-icons/hi2';
// import { Button } from '@/components/ui/Button';
// import { showToast } from '@/components/ui/Toaster';
// import { WEB_PUSH_STATUS_HINT } from '@/constants/web-push';
// import { registerWebPush } from '@/lib/web-push/register';
// import type { WebPushUiPermission } from '@/types/web-push-notification';
// import { getInitialWebPushPermission } from '@/utils/web-push';

// export function EnableNotificationsButton() {
//   const [permission, setPermission] = useState<WebPushUiPermission>(getInitialWebPushPermission);
//   const [loading, setLoading] = useState(false);

//   if (permission === 'granted' || permission === 'unsupported') {
//     return null;
//   }

//   if (permission === 'needs-install') {
//     return (
//       <div className="border-t border-gray/15 px-4 py-3">
//         <div className="flex items-start gap-2.5">
//           <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
//             <HiOutlineDevicePhoneMobile
//               className="size-4"
//               aria-hidden
//             />
//           </span>
//           <div className="min-w-0 flex-1">
//             <p className="text-xs font-semibold text-black">
//               Cài đặt Home Screen để nhận thông báo
//             </p>
//             <ol className="mt-1.5 list-decimal space-y-1 pl-3.5 text-[11px] leading-relaxed text-gray">
//               <li>Nhấn nút Share trên thanh Safari</li>
//               <li>Chọn &quot;Add to Home Screen&quot; / &quot;Thêm vào Màn hình chính&quot;</li>
//               <li>Mở app từ icon vừa thêm, đăng nhập, rồi bật thông báo tại đây</li>
//             </ol>
//             <p className="mt-2 text-[11px] text-gray">Yêu cầu iOS 16.4 trở lên.</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   async function onClick() {
//     setLoading(true);
//     try {
//       const result = await registerWebPush();
//       setPermission(result === 'unsupported' ? 'unsupported' : result);

//       if (result === 'granted') {
//         showToast('success', WEB_PUSH_STATUS_HINT.granted);
//       } else {
//         showToast('error', WEB_PUSH_STATUS_HINT[result]);
//       }
//     } catch (error) {
//       console.error(error);
//       showToast('error', 'Không thể bật thông báo. Vui lòng thử lại.');
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="border-t border-gray/15 px-4 py-3">
//       <Button
//         type="button"
//         variant="outline"
//         size="sm"
//         fullWidth
//         loading={loading}
//         disabled={loading || permission === 'denied'}
//         onClick={() => void onClick()}
//         leftIcon={
//           <HiOutlineBellAlert
//             className="size-4 shrink-0"
//             aria-hidden
//           />
//         }
//       >
//         {permission === 'denied' ? 'Thông báo đã bị chặn' : 'Bật thông báo trình duyệt'}
//       </Button>
//       {permission === 'denied' ? (
//         <p className="mt-2 text-center text-[11px] text-gray">
//           Hãy cho phép thông báo trong cài đặt trình duyệt rồi tải lại trang.
//         </p>
//       ) : null}
//     </div>
//   );
// }
