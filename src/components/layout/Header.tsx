"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
// import { HeaderNotifications } from '@/components/layout/HeaderNotifications';
import { HeaderUserMenu } from "@/components/layout/HeaderUserMenu";
import { getBreadcrumbItems } from "@/utils/breadcrumbFromPath";
import { SidebarMobile } from "@/components/layout/SidebarMobile";
import { TbMenu2 } from "react-icons/tb";

export function Header() {
  const pathname = usePathname();
  const breadcrumbItems = useMemo(
    () => getBreadcrumbItems(pathname),
    [pathname],
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray/15 bg-white">
        {/* Mobile */}
        <div className="flex h-14 items-center justify-between xl:hidden px-4">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Button
              variant="transparent"
              onClick={() => setIsSidebarOpen(true)}
              className="p-0 h-auto shrink-0 text-primary enabled:hover:text-primary/80"
            >
              <TbMenu2 className="size-7" />
            </Button>

            <Breadcrumb
              items={breadcrumbItems}
              truncateLast
              className="min-w-0"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* <HeaderNotifications /> */}
            <HeaderUserMenu />
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden h-16 items-center gap-3 px-6 xl:flex lg:px-8">
          <div className="min-w-0 flex-1">
            <Breadcrumb
              items={breadcrumbItems}
              truncateLast
              className="min-w-0"
            />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            {/* <HeaderNotifications /> */}

            <span className="h-6 w-px bg-gray/20" aria-hidden />

            <HeaderUserMenu />
          </div>
        </div>
      </header>

      <SidebarMobile
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </>
  );
}
