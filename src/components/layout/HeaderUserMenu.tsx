'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { FaRegUser } from 'react-icons/fa6';
import { HiOutlineLogout } from 'react-icons/hi';
import Dropdown from '@/components/ui/Dropdown';
import { showToast } from '@/components/ui/Toaster';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Button } from '@/components/ui/Button';
import { isNavItemActive } from '@/config/sidebar-nav';
// import { unregisterWebPush } from '@/lib/web-push/unsubscribe';
import { cn } from '@/utils/classNames';

export function HeaderUserMenu() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const displayName = user?.name?.trim() || user?.role || 'Admin';
  const [isSigningOut, setIsSigningOut] = useState(false);

  const onSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      // Best-effort: never block logout if push cleanup hangs or fails
      await Promise.race([
        // unregisterWebPush().catch((error) => {
        //   console.error('Failed to unregister web push on logout', error);
        // }),
        new Promise<void>((resolve) => setTimeout(resolve, 2000)),
      ]);
      await signOut();
      showToast('success', 'Đăng xuất thành công');
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <Dropdown
      placement="bottom"
      align="right"
      usePortal
      showArrow={false}
      ariaLabel="Tài khoản"
      className="min-w-50"
      trigger={({ arrow, triggerProps }) => (
        <Button
          variant="transparent"
          size="sm"
          className="h-auto gap-2.5 px-2 py-1.5 text-black hover:bg-primary-light/50 flex items-center"
          rightIcon={arrow}
          disabled={isSigningOut}
          {...triggerProps}
        >
          <div className="flex items-center gap-2">
            <div className="relative size-9 shrink-0 overflow-hidden rounded-full border border-gray/15">
              <ImageWithFallback
                src={user?.avatar || ''}
                alt={displayName}
                width={36}
                height={36}
                className="size-full object-cover"
              />
            </div>
            <div className="hidden min-w-0 text-left sm:block">
              <p className="truncate text-sm font-semibold leading-tight">{displayName}</p>
              <p className="truncate text-xs text-gray">{user?.role ?? 'Admin'}</p>
            </div>
          </div>
        </Button>
      )}
    >
      <div className="flex w-full flex-col divide-y divide-gray/15">
        <Link
          href="/profile"
          role="menuitem"
          aria-disabled={isSigningOut}
          tabIndex={isSigningOut ? -1 : undefined}
          className={cn(
            'flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-primary-light/50',
            isNavItemActive(pathname, '/profile') &&
            'bg-primary-light/50 font-semibold text-primary',
            isSigningOut && 'pointer-events-none opacity-50',
          )}
        >
          <FaRegUser className="size-4 shrink-0" />
          Hồ sơ
        </Link>
        <Button
          type="button"
          variant="transparent"
          fullWidth
          disabled={isSigningOut}
          loading={isSigningOut}
          className="justify-start rounded-none font-semibold text-coral hover:bg-coral/10 hover:text-coral/80 disabled:opacity-60"
          onClick={() => void onSignOut()}
          leftIcon={
            <HiOutlineLogout
              className="size-4 shrink-0"
              aria-hidden
            />
          }
        >
          Đăng xuất
        </Button>
      </div>
    </Dropdown>
  );
}
