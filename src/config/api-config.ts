export const API_CONFIG = {
  SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
  BASE_URL: process.env.NEXT_PUBLIC_API_URL,
  // Server-side URL (dùng cho NextAuth, chạy trong Docker container)
  INTERNAL_URL: process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/staff/login',
      REGISTER: '/auth/register',
      OAUTH_CALLBACK: '/auth/oauth',
      REFRESH_TOKEN: '/auth/refresh-token',
      LOGOUT: '/auth/logout',
      VERIFY_EMAIL: '/auth/verify-email',
      RESEND_OTP: '/auth/resend-otp',
      VERIFY_OTP: '/auth/verify-otp',
      RESET_PASSWORD: '/auth/reset-password',
      CHANGE_PASSWORD: '/auth/change-password',
    },
    FILES: {
      UPLOAD_FILE: '/files/upload-url',
      CONFIRM_UPLOAD_FILE: '/files/confirm',
      DOWNLOAD_FILE: (id: string) => `/files/${id}/download`,
    },
    ADMIN: {
      PENDING_BADGES: '/admin/pending-badges',
    },
    NOTIFICATIONS: {
      LIST: '/notifications',
      UNREAD_COUNT: '/notifications/unread-count',
      MARK_READ: (id: string) => `/notifications/${id}/mark-read`,
      MARK_ALL_READ: '/notifications/mark-read',
      DELETE: (id: string) => `/notifications/${id}`,
      PUSH_VAPID_PUBLIC_KEY: '/notifications/push/vapid-public-key',
      PUSH_SUBSCRIBE: '/notifications/push/subscribe',
      PUSH_UNSUBSCRIBE: '/notifications/push/unsubscribe',
    },
    DASHBOARD: {
      GET_DASHBOARD: '/admin/dashboard',
      EXPORT: '/admin/dashboard/export',
    }
  }
};
