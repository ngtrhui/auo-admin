import {
  MAIN_NAV_ITEMS,
  isNavGroup,
  isNavItemActive,
  type SidebarNavItem,
} from '@/config/sidebar-nav';
import type { BreadcrumbItem } from '@/components/ui/Breadcrumb';

const DASHBOARD: BreadcrumbItem = { label: 'Bảng điều khiển', path: '/' };

function findNavTrail(items: SidebarNavItem[], pathname: string): SidebarNavItem[] | null {
  for (const item of items) {
    if (isNavGroup(item)) {
      const childTrail = findNavTrail(item.children, pathname);
      if (childTrail) return [item, ...childTrail];
      continue;
    }

    if (isNavItemActive(pathname, item.href)) {
      return [item];
    }
  }

  return null;
}

function findFirstHref(items: SidebarNavItem[]): string | undefined {
  for (const item of items) {
    if (isNavGroup(item)) {
      const found = findFirstHref(item.children);
      if (found) return found;
    } else {
      return item.href;
    }
  }
  return undefined;
}

function getExtraSegments(pathname: string, baseHref: string): BreadcrumbItem[] {
  const normalizedBase = baseHref === '/' ? '' : baseHref;
  if (!pathname.startsWith(normalizedBase)) return [];

  const rest = pathname.slice(normalizedBase.length).replace(/^\//, '');
  if (!rest) return [];

  const segments = rest.split('/').filter(Boolean);

  if (baseHref === '/blog') {
    if (segments[0] === 'new') {
      return [{ label: 'Tạo mới', path: `${baseHref}/new` }];
    }
    if (segments[0] === 'preview') {
      return [{ label: 'Xem trước', path: pathname }];
    }
    return [{ label: 'Chỉnh sửa', path: pathname }];
  }

  if (baseHref === '/seo-links/header' || baseHref === '/seo-links/footer') {
    return [];
  }

  const last = segments[segments.length - 1];
  if (!last) return [];

  return [{ label: decodeURIComponent(last), path: pathname }];
}

export function getBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  if (pathname === '/') {
    return [DASHBOARD];
  }

  const trail = findNavTrail(MAIN_NAV_ITEMS, pathname);

  if (!trail) {
    const label = decodeURIComponent(pathname.split('/').filter(Boolean).pop() ?? pathname);
    return [DASHBOARD, { label, path: pathname }];
  }

  const items: BreadcrumbItem[] = [DASHBOARD];
  let leafHref = '/';

  for (const node of trail) {
    if (isNavGroup(node)) {
      items.push({ label: node.label, path: findFirstHref(node.children) });
    } else {
      leafHref = node.href;
      items.push({ label: node.label, path: node.href });
    }
  }

  return [...items, ...getExtraSegments(pathname, leafHref)];
}