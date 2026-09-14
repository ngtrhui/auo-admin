// session-events.ts
type SessionExpiredHandler = () => void | Promise<void>;

let onSessionExpired: SessionExpiredHandler | null = null;
// ✅ Queue các lần gọi notify trước khi handler được đăng ký
let pendingNotification = false;

export function setSessionExpiredHandler(handler: SessionExpiredHandler | null) {
  onSessionExpired = handler;
  // Nếu có notification pending → chạy ngay khi handler vừa được đăng ký
  if (handler && pendingNotification) {
    pendingNotification = false;
    void handler();
  }
}

export async function notifySessionExpired() {
  if (onSessionExpired) {
    await onSessionExpired();
  } else {
    // Handler chưa sẵn sàng → đánh dấu pending, chờ setSessionExpiredHandler
    pendingNotification = true;
  }
}
