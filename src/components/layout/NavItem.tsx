'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  getGroupBadgeKeys,
  isNavGroup,
  isNavGroupActive,
  isNavItemActive,
  toggleExpandedPathMulti,
  type SidebarNavGroup,
  type SidebarNavItem,
  type SidebarNavLink,
} from '@/config/sidebar-nav';
import { formatBadgeLabel, getBadgeCount } from '@/hooks/usePendingBadges';
import { usePendingBadgesStore } from '@/stores/pending-badges.store';
import { cn } from '@/utils/classNames';
import { Button } from '../ui/Button';
import { HiChevronDown } from 'react-icons/hi';
import { motion } from '@/lib/motion';
import { NavIcon } from './NavIcon';

function NavBadge({ count, absolute }: { count: number; absolute?: boolean }) {
  const label = formatBadgeLabel(count);
  if (!label) return null;

  const isPill = label.length > 1;

  return (
    <span
      className={cn(
        'animate-pulse inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-coral text-[10px] font-bold leading-none text-white',
        absolute ? 'absolute top-0 left-0 z-10 translate-x-1/2 -translate-y-1/2' : 'ml-auto',
        isPill && 'w-auto min-w-5 px-1.5',
      )}
      aria-label={`${count} mục chờ xử lý`}
    >
      {label}
    </span>
  );
}

function toPanelId(path: string) {
  return `nav-group-${path.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function CollapsedNavLink({
  item,
  pathname,
}: {
  item: SidebarNavLink;
  pathname: string;
}) {
  const active = isNavItemActive(pathname, item.href);
  const badges = usePendingBadgesStore((state) => state.badges);
  const count = item.badgeKey ? getBadgeCount(badges, item.badgeKey) : 0;

  return (
    <Link
      href={item.href}
      title={item.label}
      aria-label={item.label}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative flex size-12 cursor-pointer items-center justify-center rounded-lg transition-colors',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-black hover:bg-primary-light/30',
      )}
    >
      <span className="relative inline-flex">
        {item.icon && <NavIcon icon={item.icon} active={active} />}
        <NavBadge count={count} absolute />
      </span>
    </Link>
  );
}

function CollapsedNavGroup({
  item,
  pathname,
  path,
  expandedPaths,
}: {
  item: SidebarNavGroup;
  pathname: string;
  path: string;
  expandedPaths: Set<string>;
}) {
  const isActive = isNavGroupActive(pathname, item);
  const badges = usePendingBadgesStore((state) => state.badges);
  const groupBadgeKeys = getGroupBadgeKeys(item);
  const count = groupBadgeKeys.length > 0 ? getBadgeCount(badges, groupBadgeKeys) : 0;

  // State riêng cho flyout: cho phép mở nhiều nhóm sibling cùng lúc
  const [flyoutExpanded, setFlyoutExpanded] = useState(() => new Set(expandedPaths));

  const onToggleFlyoutGroup = (groupPath: string) => {
    setFlyoutExpanded((prev) => toggleExpandedPathMulti(prev, groupPath));
  };

  return (
    <div className="group relative">
      <div
        className={cn(
          'relative flex size-12 cursor-pointer items-center justify-center rounded-lg transition-colors',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-black group-hover:bg-primary-light/30',
        )}
        title={item.label}
        aria-label={item.label}
        aria-haspopup="menu"
      >
        <span className="relative inline-flex">
          {item.icon && <NavIcon icon={item.icon} active={isActive} />}
          <NavBadge count={count} absolute />
        </span>
      </div>

      {/* Bridge + flyout — keep hover when moving pointer to the right */}
      <div
        className={cn(
          'absolute top-0 left-full z-50 pl-1',
          'opacity-0 invisible pointer-events-none',
          'group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto',
        )}
      >
        <div
          role="menu"
          aria-label={item.label}
          className="min-w-56 rounded-lg bg-white py-2 shadow-[0px_4px_4px_0px_#0063FF1A]"
        >
          <div className="px-4 py-1 text-sm font-semibold text-black">{item.label}</div>
          <ul className="flex flex-col gap-0.5">
            {item.children.map((child) => (
              <li key={isNavGroup(child) ? `${path}>${child.label}` : child.href}>
                <NavItem
                  item={child}
                  pathname={pathname}
                  parentPath={path}
                  expandedPaths={flyoutExpanded}
                  onToggleGroup={onToggleFlyoutGroup}
                  isCollapsed={false}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function NavLink({
  item,
  pathname,
  isTopLevel,
  isCollapsed,
}: {
  item: SidebarNavLink;
  pathname: string;
  isTopLevel: boolean;
  isCollapsed?: boolean;
}) {
  const active = isNavItemActive(pathname, item.href);
  const badges = usePendingBadgesStore((state) => state.badges);
  const count = item.badgeKey ? getBadgeCount(badges, item.badgeKey) : 0;

  if (isTopLevel && isCollapsed) {
    return <CollapsedNavLink item={item} pathname={pathname} />;
  }

  if (!isTopLevel) {
    return (
      <Link
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'ml-5 flex items-center gap-2 rounded-l-lg py-2 pr-4 pl-4 text-sm leading-snug transition-colors',
          active
            ? 'bg-primary-light font-semibold text-primary'
            : 'font-medium text-gray/80 hover:bg-gray/10 hover:text-black',
        )}
      >
        <span className="min-w-0 flex-1">{item.label}</span>
        <NavBadge count={count} />
      </Link>
    );
  }

  return (
    <div className="flex w-full items-stretch">
      {active ? (
        <span className="mt-1 mb-1 w-1.5 shrink-0 self-stretch rounded-r-sm bg-primary" aria-hidden />
      ) : (
        <span className="w-1.5 shrink-0" aria-hidden />
      )}
      <Link
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'ml-5 flex min-h-12 flex-1 items-center gap-3 rounded-l-lg py-2 pr-4 pl-4 text-sm leading-snug transition-colors',
          active
            ? 'bg-primary/10 font-semibold text-primary'
            : 'font-medium text-black hover:bg-primary-light/30',
        )}
      >
        {item.icon && <NavIcon icon={item.icon} active={active} />}
        <span className="min-w-0 flex-1">{item.label}</span>
        <NavBadge count={count} />
      </Link>
    </div>
  );
}

function NavGroupHeader({
  item,
  isTopLevel,
  isOpen,
  isActive,
  count,
  panelId,
  onToggle,
}: {
  item: SidebarNavGroup;
  isTopLevel: boolean;
  isOpen: boolean;
  isActive: boolean;
  count: number;
  panelId: string;
  onToggle: () => void;
}) {
  if (isTopLevel) {
    return (
      <div className="flex w-full items-stretch">
        {isActive ? (
          <span className="mt-1 mb-1 w-1.5 shrink-0 self-stretch rounded-r-sm bg-primary" aria-hidden />
        ) : (
          <span className="w-1.5 shrink-0" aria-hidden />
        )}
        <Button
          type="button"
          variant="transparent"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className={cn(
            'ml-5 flex min-h-12 flex-1 items-center gap-3 rounded-none rounded-l-lg py-2 pr-4 pl-4 text-sm leading-snug transition-colors',
            isActive
              ? 'bg-primary/10 font-semibold enabled:hover:text-primary/80 text-primary'
              : 'font-medium text-black enabled:hover:bg-primary-light/30',
          )}
          rightIcon={
            <span className="flex shrink-0 items-center gap-1">
              <NavBadge count={count} />
              <HiChevronDown
                className={cn('size-5 shrink-0 transition-transform duration-200', isOpen && 'rotate-180')}
                aria-hidden
              />
            </span>
          }
          leftIcon={item.icon ? <NavIcon icon={item.icon} active={isActive} /> : undefined}
          contentClassName="w-full text-left"
        >
          {item.label}
        </Button>
      </div>
    );
  }

  // Nhóm ở cấp sâu hơn (level 2, 3, ...): gọn hơn, không icon, không thanh active.
  return (
    <Button
      type="button"
      onClick={onToggle}
      variant="transparent"
      aria-expanded={isOpen}
      aria-controls={panelId}
      className={cn(
        'ml-5 flex w-[calc(100%-1.25rem)] items-center gap-2 rounded-l-lg py-2 pr-4 pl-4 text-left text-sm leading-snug transition-colors',
        isActive
          ? 'bg-primary-light font-semibold text-primary'
          : 'font-medium text-gray/80 hover:bg-gray/10 hover:text-black',
      )}
      rightIcon={
        <span className="flex shrink-0 items-center gap-1">
          <NavBadge count={count} />
          <HiChevronDown
            className={cn('size-4 shrink-0 transition-transform duration-200', isOpen && 'rotate-180')}
            aria-hidden
          />
        </span>
      }
      contentClassName="w-full text-left"

    >
      {item.label}
    </Button>
  );
}

function NavGroup({
  item,
  pathname,
  path,
  isOpen,
  onToggle,
  expandedPaths,
  onToggleGroup,
  isCollapsed,
}: {
  item: SidebarNavGroup;
  pathname: string;
  path: string;
  isOpen: boolean;
  onToggle: () => void;
  expandedPaths: Set<string>;
  onToggleGroup: (path: string) => void;
  isCollapsed?: boolean;
}) {
  const isTopLevel = !path.includes('>');
  const isActive = isNavGroupActive(pathname, item);
  const badges = usePendingBadgesStore((state) => state.badges);
  const groupBadgeKeys = getGroupBadgeKeys(item);
  const count = groupBadgeKeys.length > 0 ? getBadgeCount(badges, groupBadgeKeys) : 0;
  const panelId = toPanelId(path);

  if (isTopLevel && isCollapsed) {
    return (
      <CollapsedNavGroup
        item={item}
        pathname={pathname}
        path={path}
        expandedPaths={expandedPaths}
      />
    );
  }

  return (
    <div className="flex w-full flex-col">
      <NavGroupHeader
        item={item}
        isTopLevel={isTopLevel}
        isOpen={isOpen}
        isActive={isActive}
        count={count}
        panelId={panelId}
        onToggle={onToggle}
      />

      <motion.div
        id={panelId}
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        style={{ overflow: 'hidden' }}
      >
        <ul className="flex flex-col gap-0.5 py-1 pl-5">
          {item.children.map((child) => (
            <li key={isNavGroup(child) ? `${path}>${child.label}` : child.href}>
              <NavItem
                item={child}
                pathname={pathname}
                parentPath={path}
                expandedPaths={expandedPaths}
                onToggleGroup={onToggleGroup}
              />
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}

export function NavItem({
  item,
  pathname,
  parentPath = '',
  expandedPaths,
  onToggleGroup,
  isCollapsed = false,
}: {
  item: SidebarNavItem;
  pathname: string;
  /** Chuỗi label các nhóm cha, nối bằng '>' — rỗng nghĩa là item đang ở top-level. */
  parentPath?: string;
  expandedPaths: Set<string>;
  onToggleGroup: (path: string) => void;
  isCollapsed?: boolean;
}) {
  const isTopLevel = parentPath === '';

  if (isNavGroup(item)) {
    const path = isTopLevel ? item.label : `${parentPath}>${item.label}`;
    return (
      <NavGroup
        item={item}
        pathname={pathname}
        path={path}
        isOpen={expandedPaths.has(path)}
        onToggle={() => onToggleGroup(path)}
        expandedPaths={expandedPaths}
        onToggleGroup={onToggleGroup}
        isCollapsed={isCollapsed}
      />
    );
  }

  return (
    <NavLink
      item={item}
      pathname={pathname}
      isTopLevel={isTopLevel}
      isCollapsed={isCollapsed}
    />
  );
}
