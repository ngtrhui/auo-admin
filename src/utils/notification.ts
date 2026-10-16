
import { createElement, type ComponentProps } from 'react';
import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
} from 'date-fns';
import { vi } from 'date-fns/locale';
import type { IconType } from 'react-icons';
import {
  HiOutlineArrowPath,
  HiOutlineBell,
  HiOutlineCheckBadge,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCreditCard,
  HiOutlineMegaphone,
  HiOutlineNoSymbol,
  HiOutlineShoppingBag,
  HiOutlineTag,
  HiOutlineTruck,
  HiOutlineUserCircle,
  HiOutlineXCircle,
} from 'react-icons/hi2';

import type {
  NotificationItem,
  NotificationReferenceType,
  NotificationType,
} from '@/types/notification';
import { formatDate } from '@/utils/format';

export type NotificationIconCategory =
  | 'order'
  | 'payment'
  | 'product'
  | 'promotion'
  | 'account'
  | 'system';

const NOTIFICATION_TYPE_ICONS: Partial<
  Record<NotificationType, IconType>
> = {
  ORDER_CREATED: HiOutlineShoppingBag,
  ORDER_CONFIRMED: HiOutlineCheckCircle,
  ORDER_PROCESSING: HiOutlineArrowPath,
  ORDER_SHIPPED: HiOutlineTruck,
  ORDER_DELIVERED: HiOutlineTruck,
  ORDER_COMPLETED: HiOutlineCheckBadge,
  ORDER_CANCELLED: HiOutlineNoSymbol,
  ORDER_STATUS_CHANGED: HiOutlineArrowPath,

  PAYMENT_SUCCESS: HiOutlineCheckCircle,
  PAYMENT_FAILED: HiOutlineXCircle,
  PAYMENT_REFUNDED: HiOutlineArrowPath,
  PAYMENT_PENDING: HiOutlineClock,

  PROMOTION: HiOutlineMegaphone,
  PRODUCT_BACK_IN_STOCK: HiOutlineShoppingBag,
  PRICE_DROP: HiOutlineTag,

  ACCOUNT_SECURITY: HiOutlineUserCircle,
  ACCOUNT_UPDATE: HiOutlineUserCircle,

  SYSTEM_ANNOUNCEMENT: HiOutlineMegaphone,
};

const CATEGORY_FALLBACK_ICONS: Record<
  NotificationIconCategory,
  IconType
> = {
  order: HiOutlineShoppingBag,
  payment: HiOutlineCreditCard,
  product: HiOutlineShoppingBag,
  promotion: HiOutlineTag,
  account: HiOutlineUserCircle,
  system: HiOutlineBell,
};

const NOTIFICATION_CATEGORY_LABELS: Record<
  NotificationIconCategory,
  string
> = {
  order: 'Đơn hàng',
  payment: 'Thanh toán',
  product: 'Sản phẩm',
  promotion: 'Khuyến mãi',
  account: 'Tài khoản',
  system: 'Hệ thống',
};

export function getNotificationIconCategory(
  type: NotificationType | string,
): NotificationIconCategory {
  if (type.startsWith('ORDER_')) return 'order';
  if (type.startsWith('PAYMENT_')) return 'payment';
  if (type.startsWith('PRODUCT_') || type === 'PRICE_DROP') {
    return 'product';
  }
  if (type === 'PROMOTION') return 'promotion';
  if (type.startsWith('ACCOUNT_')) return 'account';

  return 'system';
}

export function getNotificationIcon(
  type: NotificationType | string,
): IconType {
  if (type in NOTIFICATION_TYPE_ICONS) {
    const icon =
      NOTIFICATION_TYPE_ICONS[type as NotificationType];

    if (icon) return icon;
  }

  return CATEGORY_FALLBACK_ICONS[
    getNotificationIconCategory(type)
  ];
}

/** Render icon component without defining a component dynamically. */
export function NotificationTypeIcon({
  type,
  className,
}: {
  type: NotificationType | string;
  className?: string;
}) {
  return createElement(getNotificationIcon(type), {
    className,
    'aria-hidden': true,
  } satisfies ComponentProps<'svg'>);
}

export function getNotificationCategoryLabel(
  type: NotificationType | string,
): string {
  return NOTIFICATION_CATEGORY_LABELS[
    getNotificationIconCategory(type)
  ];
}

const NOTIFICATION_TYPE_LABELS: Partial<
  Record<NotificationType, string>
> = {
  ORDER_CREATED: 'Đơn hàng mới',
  ORDER_CONFIRMED: 'Đơn hàng đã xác nhận',
  ORDER_PROCESSING: 'Đơn hàng đang được xử lý',
  ORDER_SHIPPED: 'Đơn hàng đang giao',
  ORDER_DELIVERED: 'Đơn hàng đã giao',
  ORDER_COMPLETED: 'Đơn hàng hoàn tất',
  ORDER_CANCELLED: 'Đơn hàng đã hủy',
  ORDER_STATUS_CHANGED: 'Cập nhật trạng thái đơn hàng',

  PAYMENT_SUCCESS: 'Thanh toán thành công',
  PAYMENT_FAILED: 'Thanh toán thất bại',
  PAYMENT_REFUNDED: 'Đã hoàn tiền',
  PAYMENT_PENDING: 'Thanh toán đang chờ xử lý',

  PROMOTION: 'Ưu đãi và khuyến mãi',
  PRODUCT_BACK_IN_STOCK: 'Sản phẩm đã có hàng trở lại',
  PRICE_DROP: 'Sản phẩm giảm giá',

  ACCOUNT_SECURITY: 'Cảnh báo bảo mật tài khoản',
  ACCOUNT_UPDATE: 'Cập nhật tài khoản',

  SYSTEM_ANNOUNCEMENT: 'Thông báo hệ thống',
};

const REFERENCE_TYPE_LABELS: Record<
  NotificationReferenceType,
  string
> = {
  ORDER: 'Đơn hàng',
  PRODUCT: 'Sản phẩm',
  PAYMENT: 'Thanh toán',
  PROMOTION: 'Khuyến mãi',
};

const REFERENCE_HREF: Record<
  NotificationReferenceType,
  string
> = {
  ORDER: '/orders',
  PRODUCT: '/products',
  PAYMENT: '/payments',
  PROMOTION: '/promotions',
};

const REFERENCE_CTA_LABELS: Record<
  NotificationReferenceType,
  string
> = {
  ORDER: 'Xem đơn hàng',
  PRODUCT: 'Xem sản phẩm',
  PAYMENT: 'Xem thanh toán',
  PROMOTION: 'Xem khuyến mãi',
};

export function getNotificationTypeLabel(
  type: NotificationType | string,
): string {
  if (type in NOTIFICATION_TYPE_LABELS) {
    const label =
      NOTIFICATION_TYPE_LABELS[type as NotificationType];

    if (label) return label;
  }

  return getNotificationCategoryLabel(type);
}

export function getReferenceTypeLabel(
  referenceType?: NotificationReferenceType | string | null,
): string {
  if (!referenceType) return '';

  if (referenceType in REFERENCE_TYPE_LABELS) {
    return REFERENCE_TYPE_LABELS[
      referenceType as NotificationReferenceType
    ];
  }

  return referenceType;
}

export function getNotificationReferenceLink(
  referenceType?: NotificationReferenceType | string | null,
  referenceId?: string | null,
): { href: string; label: string } | null {
  if (!referenceType || !referenceId) return null;
  if (!(referenceType in REFERENCE_HREF)) return null;

  const typed = referenceType as NotificationReferenceType;

  return {
    href: `${REFERENCE_HREF[typed]}/${encodeURIComponent(referenceId)}`,
    label: REFERENCE_CTA_LABELS[typed],
  };
}

export function formatNotificationTime(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return '';

  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: vi,
  });
}

export function formatNotificationDateTime(
  iso: string | null | undefined,
): string {
  if (!iso) return '';

  const { date, time } = formatDate(iso);

  if (!date) return '';

  return time ? `${date} ${time}` : date;
}

export function getNotificationMetadataEntries(
  metadata?: Record<string, unknown> | null,
): Array<{ key: string; value: string }> {
  if (!metadata) return [];

  return Object.entries(metadata)
    .filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== '',
    )
    .map(([key, value]) => ({
      key,
      value:
        typeof value === 'string'
          ? value
          : JSON.stringify(value) ?? String(value),
    }));
}

export type NotificationDateGroup = {
  key: string;
  label: string;
  items: NotificationItem[];
};

export function getNotificationDateGroupLabel(
  iso: string,
): { key: string; label: string } {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return { key: 'unknown', label: 'Khác' };
  }

  const key = format(date, 'yyyy-MM-dd');

  if (isToday(date)) return { key, label: 'Hôm nay' };
  if (isYesterday(date)) return { key, label: 'Hôm qua' };

  return {
    key,
    label: format(date, 'EEEE, dd/MM/yyyy', {
      locale: vi,
    }),
  };
}

/** Group newest-first notifications by calendar day. */
export function groupNotificationsByDate(
  items: NotificationItem[],
): NotificationDateGroup[] {
  const groups: NotificationDateGroup[] = [];
  const indexByKey = new Map<string, number>();

  for (const item of items) {
    const { key, label } = getNotificationDateGroupLabel(
      item.createdAt,
    );
    const existingIndex = indexByKey.get(key);

    if (existingIndex === undefined) {
      indexByKey.set(key, groups.length);
      groups.push({ key, label, items: [item] });
      continue;
    }

    groups[existingIndex].items.push(item);
  }

  return groups;
}
