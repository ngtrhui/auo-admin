"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { syncDeviceHeadersToCookies } from "@/lib/client-device";
import AuthSync from "./AuthSync";
// import { NotificationSocketProvider } from './NotificationSocketProvider';
// import { WebPushProvider } from '@/components/web-push/WebPushProvider';
import { CustomToaster } from "../ui/Toaster";

type SessionShellClientProps = {
  children: React.ReactNode;
  session: Session | null;
};

export function SessionShellClient({
  children,
  session,
}: SessionShellClientProps) {
  useEffect(() => {
    syncDeviceHeadersToCookies();
  }, []);

  return (
    <SessionProvider
      session={session}
      refetchOnWindowFocus={true}
      refetchInterval={5 * 60 * 1000}
    >
      <CustomToaster />
      <AuthSync />
      {/* <NotificationSocketProvider>
        <WebPushProvider> */}
      {children}
      {/* </WebPushProvider>
      </NotificationSocketProvider> */}
    </SessionProvider>
  );
}
