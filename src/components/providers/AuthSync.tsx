'use client';

import { signOut, useSession } from 'next-auth/react';
import { useEffect, useLayoutEffect } from 'react';
import { useAuthUIStore } from '@/stores/auth-ui.store';
import { forceLogoutDueToExpiredSession, resetSessionExpired } from '@/lib/axiosInstance';
import { setSessionExpiredHandler } from '@/lib/session-events';
import { showToast } from '../ui/Toaster';

export default function AuthSync() {
  const { data: session } = useSession();
  const setAccessToken = useAuthUIStore((state) => state.setAccessToken);

  useLayoutEffect(() => {
    setSessionExpiredHandler(async () => {
      showToast('error', 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', 3000);
      setTimeout(() => {
        void signOut();
      }, 3000);
    });

    return () => {
      setSessionExpiredHandler(null);
    };
  }, []);

  useEffect(() => {
    if (session?.error === 'RefreshAccessTokenError') {
      void forceLogoutDueToExpiredSession();
      return;
    }

    if (session?.token?.accessToken) {
      resetSessionExpired();
      setAccessToken(session.token.accessToken);
    } else {
      setAccessToken(null);
    }
  }, [session, setAccessToken]);

  return null;
}
