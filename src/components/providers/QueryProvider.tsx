'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import axios, { isAxiosError } from 'axios';
// import { AppBadgeSync } from '@/components/web-push/AppBadgeSync';

export function shouldRetry(failureCount: number, error: unknown, max: number) {
  // Request đã bị huỷ chủ động bởi axios interceptor (session hết hạn) → không retry.
  if (axios.isCancel(error)) return false;
  if (isAxiosError(error)) {
    const status = error.response?.status;

    // auth
    if (status === 401 || status === 403) {
      return false;
    }

    // server error
    if ((status && status >= 500) || error.code === 'ECONNABORTED') {
      return failureCount < max;
    }
  }
  return false;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
            refetchOnWindowFocus: true,
            refetchOnMount: false,
            retry: (failureCount, error) => shouldRetry(failureCount, error, 1),
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      {/* <AppBadgeSync /> */}
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
