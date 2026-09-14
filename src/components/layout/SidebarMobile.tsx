'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  MAIN_NAV_ITEMS,
  filterNavByRole,
  getActiveGroupPaths,
  isNavGroup,
  toggleExpandedPath,
} from '@/config/sidebar-nav';
import SlidePanel from '@/components/ui/SlidePanel';
import { NavItem } from './NavItem';

interface SidebarMobileProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SidebarMobile({ isOpen, onClose }: SidebarMobileProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const mainItems = filterNavByRole(MAIN_NAV_ITEMS, role);

  const activePaths = useMemo(
    () => getActiveGroupPaths(mainItems, pathname),
    [mainItems, pathname],
  );

  const [manual, setManual] = useState<{ pathname: string; paths: Set<string> } | null>(null);

  const expandedPaths = manual?.pathname === pathname ? manual.paths : new Set(activePaths);

  const onToggleGroup = (path: string) => {
    const current = manual?.pathname === pathname ? manual.paths : new Set(activePaths);
    setManual({ pathname, paths: toggleExpandedPath(current, path) });
  };


  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      side="left"
      className="w-[320px] md:w-[320px] lg:w-[320px] max-w-[85vw]"
      contentClassName="flex h-full min-h-0 flex-col"
      title={
        <Link
          href="/"
          onClick={onClose}
          className="flex h-14 shrink-0 items-center justify-center rounded-lg bg-white p-2 shadow-[0px_4px_4px_0px_#0063FF1A]"
        >
          <Image
            src="/images/logo/auo_logo.png"
            alt="Ầu Ơ Bedding"
            width={285}
            height={100}
            className="aspect-[2.85/1] h-full w-auto max-w-35 object-contain"
          />
        </Link>
      }
      titleClassName="border-b-0"
    >
      {mainItems.map((item) => (
        // <NavItem
        //   key={isNavGroup(item) ? item.label : item.href}
        //   item={item}
        //   pathname={pathname}
        //   expandedGroupKey={expandedGroupKey}
        //   onToggleGroup={onToggleGroup}
        // />

        <NavItem
          key={isNavGroup(item) ? item.label : item.href}
          item={item}
          pathname={pathname}
          expandedPaths={expandedPaths}
          onToggleGroup={onToggleGroup}
        />
      ))}
    </SlidePanel>
  );
}
