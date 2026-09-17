"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  MAIN_NAV_ITEMS,
  filterNavByRole,
  getActiveGroupPaths,
  isNavGroup,
  toggleExpandedPath,
} from "@/config/sidebar-nav";
import { usePendingBadges } from "@/hooks/usePendingBadges";
import { NavItem } from "./NavItem";
import { HiChevronDoubleLeft } from "react-icons/hi2";
import { Button } from "../ui/Button";
import { cn } from "@/utils/classNames";
import { UserRole } from "@/types/user";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;
  // const role = 'Admin' as UserRole;

  usePendingBadges();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const mainItems = filterNavByRole(MAIN_NAV_ITEMS, role);

  const activePaths = useMemo(
    () => getActiveGroupPaths(mainItems, pathname),
    [mainItems, pathname],
  );

  const [manual, setManual] = useState<{
    pathname: string;
    paths: Set<string>;
  } | null>(null);

  const expandedPaths =
    manual?.pathname === pathname ? manual.paths : new Set(activePaths);

  const onToggleGroup = (path: string) => {
    const current =
      manual?.pathname === pathname ? manual.paths : new Set(activePaths);
    setManual({ pathname, paths: toggleExpandedPath(current, path) });
  };

  return (
    <aside
      className={cn(
        "relative hidden xl:flex h-full min-h-0 w-70 max-w-[90vw] shrink-0 flex-col overflow-y-visible bg-white py-4 shadow-sm self-stretch",
        "transition-all duration-300 ease-out",
        isCollapsed && "w-20",
      )}
    >
      <div className="z-50 absolute top-[7%] right-0 translate-x-1/2 -translate-y-1/2">
        <Button
          variant="transparent"
          className="size-8 p-0 bg-white shadow-primary"
          onClick={toggleSidebar}
        >
          <HiChevronDoubleLeft
            className={cn(
              "size-4 shrink-0 transition-transform duration-400 ease-out",
              isCollapsed && "rotate-180",
            )}
          />
        </Button>
      </div>
      <div className={cn("pt-8 pb-6", isCollapsed ? "px-2" : "px-6")}>
        <Link href="/" className="flex justify-center items-center">
          <Image
            src="/images/logo/auo_logo.png"
            alt="Ầu Ơ Bedding"
            width={132}
            height={54}
            className={cn(
              "w-auto object-contain transition-all duration-300",
              isCollapsed ? "h-8" : "h-14",
            )}
            priority
          />
        </Link>
      </div>

      <nav
        className={cn(
          "flex flex-1 flex-col gap-1 pb-6",
          isCollapsed
            ? "overflow-visible items-center px-2"
            : "overflow-y-auto scrollbar",
        )}
        aria-label="Menu chính"
      >
        {mainItems.map((item) => (
          <NavItem
            key={isNavGroup(item) ? item.label : item.href}
            item={item}
            pathname={pathname}
            expandedPaths={expandedPaths}
            onToggleGroup={onToggleGroup}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>
    </aside>
  );
}
