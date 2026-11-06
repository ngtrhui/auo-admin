"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { HeaderNotifications } from '@/components/layout/HeaderNotifications';
import { HeaderUserMenu } from "@/components/layout/HeaderUserMenu";
// import { usePackageFormBreadcrumbLabel } from "@/hooks/usePackageFormBreadcrumbLabel";
import { getBreadcrumbItems } from "@/utils/breadcrumbFromPath";
import { SidebarMobile } from "@/components/layout/SidebarMobile";
import { useSidebarUIStore } from "@/stores/sidebar-ui.store";
import { TbMenu2 } from "react-icons/tb";
import { LuPanelLeftClose, LuPanelLeftOpen } from "react-icons/lu";

export function Header() {
  const pathname = usePathname();
  // const packageFormLabel = usePackageFormBreadcrumbLabel();
  const isSidebarCollapsed = useSidebarUIStore((state) => state.isCollapsed);
  const toggleSidebar = useSidebarUIStore((state) => state.toggleCollapsed);
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
              // maxVisible={2}
              className="min-w-0"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <HeaderNotifications />
            <HeaderUserMenu />
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden h-16 items-center gap-3 px-6 xl:flex">
          <Button
            variant="transparent"
            onClick={toggleSidebar}
            aria-label={
              isSidebarCollapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"
            }
            title={
              isSidebarCollapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"
            }
            className="size-8 shrink-0 p-0"
          >
            {isSidebarCollapsed ? (
              <LuPanelLeftOpen className="size-5 text-neutral-400" />
            ) : (
              <LuPanelLeftClose className="size-5 text-neutral-400" />
            )}
          </Button>

          <div className="min-w-0 flex-1">
            <Breadcrumb
              items={breadcrumbItems}
              truncateLast
              className="min-w-0"
            />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <HeaderNotifications />

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
