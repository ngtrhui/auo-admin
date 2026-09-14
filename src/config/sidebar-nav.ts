import type { IconType } from 'react-icons';
import { HiOutlineCog6Tooth } from 'react-icons/hi2';
import { TbCategory } from 'react-icons/tb';
import type { AdminPendingCategory } from '@/types/pending-badges';
import type { UserRole } from '@/types/user';

export type SidebarReactIcon = {
  type: 'react';
  icon: IconType;
};

export type SidebarImageIcon = {
  type: 'image';
  /** Đường dẫn public, vd. `/images/icon/dashboard.svg` */
  src: string;
};

export type SidebarIcon = SidebarReactIcon | SidebarImageIcon;

export function reactNavIcon(icon: IconType): SidebarReactIcon {
  return { type: 'react', icon };
}

export function imageNavIcon(src: string): SidebarImageIcon {
  return { type: 'image', src };
}

export type SidebarNavChild = {
  label: string;
  href: string;
  /** Mặc định kế thừa roles của nhóm cha */
  roles?: readonly UserRole[];
  badgeKey?: AdminPendingCategory;
};

export type SidebarNavItem =
  | {
      label: string;
      href: string;
      icon?: SidebarIcon;
      roles?: readonly UserRole[];
      badgeKey?: AdminPendingCategory;
      children?: never;
    }
  | {
      label: string;
      icon?: SidebarIcon;
      roles?: readonly UserRole[];
      badgeKey?: AdminPendingCategory;
      children: SidebarNavItem[];
      href?: never;
    };

export type SidebarNavGroup = Extract<SidebarNavItem, { children: SidebarNavItem[] }>;
export type SidebarNavLink = Exclude<SidebarNavItem, SidebarNavGroup>;

export const MAIN_NAV_ITEMS: SidebarNavItem[] = [
  {
    label: 'Bảng điều khiển',
    href: '/',
    icon: imageNavIcon('/images/icons/icon_home.webp'),
    roles: ['Admin'],
  },
  {
    label: 'Người dùng',
    icon: imageNavIcon('/images/icons/icon_users.webp'),
    roles: ['Admin'],
    children: [
      { label: 'Ứng viên', href: '/users' },
      { label: 'Quy trình phỏng vấn', href: '/recruitment-pipeline' },
    ],
  },
  {
    label: 'Danh mục hệ thống',
    icon: reactNavIcon(TbCategory),
    roles: ['Admin'],
    children: [
      { label: 'Quản lý chuyên ngành', href: '/employer-major' },
      { label: 'Quản lý danh mục công việc', href: '/job-categories' },
      { label: 'Quản lý vị trí công việc', href: '/job-roles' },
      { label: 'Quản lý cấp bậc', href: '/employee-levels' },
      { label: 'Quản lý quốc gia', href: '/country' },
      { label: 'Quản lý thành phố', href: '/cities' },
      { label: 'Quản lý quận/huyện', href: '/districts' },
      { label: 'Từ khóa việc làm', href: '/seo-keyword-link' },
    ],
  },
];

export function isNavGroup(item: SidebarNavItem): item is SidebarNavGroup {
  return 'children' in item && Array.isArray(item.children);
}

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

// export function isNavGroupActive(pathname: string, item: SidebarNavGroup): boolean {
//   return item.children.some((child) => isNavItemActive(pathname, child.href));
// }

/** Đệ quy: 1 nhóm được coi là active nếu có bất kỳ link con/cháu nào đang active. */
export function isNavGroupActive(pathname: string, item: SidebarNavGroup): boolean {
  return item.children.some((child) =>
    isNavGroup(child) ? isNavGroupActive(pathname, child) : isNavItemActive(pathname, child.href),
  );
}

/**
 * Đệ quy: nếu nhóm có badgeKey riêng thì dùng đúng key đó;
 * nếu không thì gom badgeKey của mọi link con/cháu bên trong nhóm.
 */
export function getGroupBadgeKeys(item: SidebarNavGroup): AdminPendingCategory[] {
  if (item.badgeKey) return [item.badgeKey];

  const keys: AdminPendingCategory[] = [];
  for (const child of item.children) {
    if (isNavGroup(child)) {
      keys.push(...getGroupBadgeKeys(child));
    } else if (child.badgeKey) {
      keys.push(child.badgeKey);
    }
  }
  return keys;
}

/** Đệ quy: lọc theo role, roles của item con kế thừa roles của item cha nếu không khai báo riêng. */
export function filterNavByRole(
  items: SidebarNavItem[],
  role: UserRole | undefined,
  inheritedRoles?: readonly UserRole[],
): SidebarNavItem[] {
  if (!role) return [];

  const result: SidebarNavItem[] = [];

  for (const item of items) {
    const roles = item.roles ?? inheritedRoles;
    if (!roles || !roles.includes(role)) continue;

    if (isNavGroup(item)) {
      const children = filterNavByRole(item.children, role, roles);
      if (children.length === 0) continue;
      result.push({ ...item, children });
      continue;
    }

    result.push(item);
  }

  return result;
}

/**
 * Đệ quy: trả về danh sách "path" (dạng "Nhóm A>Nhóm con B") của tất cả
 * nhóm cha đang chứa route active — dùng để mặc định mở đúng nhánh khi
 * user vào thẳng 1 trang con sâu nhiều cấp.
 */
export function getActiveGroupPaths(
  items: SidebarNavItem[],
  pathname: string,
  parentPath = '',
): string[] {
  const paths: string[] = [];

  for (const item of items) {
    if (!isNavGroup(item) || !isNavGroupActive(pathname, item)) continue;

    const path = parentPath ? `${parentPath}>${item.label}` : item.label;
    paths.push(path, ...getActiveGroupPaths(item.children, pathname, path));
  }

  return paths;
}

/** Lấy path của nhóm cha trực tiếp (phần trước dấu '>' cuối cùng). '' nghĩa là top-level. */
function getParentPath(path: string): string {
  const idx = path.lastIndexOf('>');
  return idx === -1 ? '' : path.slice(0, idx);
}

/**
 * Toggle 1 path trong tập expandedPaths — accordion theo TỪNG CẤP (sibling),
 * áp dụng đệ quy cho mọi tầng, không riêng top-level:
 * - Nếu path đang mở -> đóng path đó và toàn bộ path con cháu của nó.
 * - Nếu path đang đóng -> đóng các "anh em" của nó (path khác có cùng
 *   nhóm cha trực tiếp) cùng toàn bộ con cháu của chúng, rồi mới mở path này.
 *   Nhờ vậy các nhóm không cùng cha (khác nhánh) vẫn mở song song bình thường.
 */
export function toggleExpandedPath(current: Set<string>, path: string): Set<string> {
  const next = new Set(current);

  if (next.has(path)) {
    for (const p of next) {
      if (p === path || p.startsWith(`${path}>`)) {
        next.delete(p);
      }
    }
    return next;
  }

  const parent = getParentPath(path);
  for (const p of Array.from(next)) {
    if (p !== path && getParentPath(p) === parent) {
      for (const q of Array.from(next)) {
        if (q === p || q.startsWith(`${p}>`)) {
          next.delete(q);
        }
      }
    }
  }

  next.add(path);
  return next;
}

/**
 * Toggle nhiều nhóm song song (không đóng sibling) — dùng cho flyout khi sidebar collapse.
 * Đóng thì gỡ path + con cháu; mở thì chỉ add path.
 */
export function toggleExpandedPathMulti(current: Set<string>, path: string): Set<string> {
  const next = new Set(current);

  if (next.has(path)) {
    for (const p of next) {
      if (p === path || p.startsWith(`${path}>`)) {
        next.delete(p);
      }
    }
    return next;
  }

  next.add(path);
  return next;
}
