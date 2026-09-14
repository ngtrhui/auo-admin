import { CompanySize } from '@/types/enum';
import { isAxiosError } from 'axios';
import { format, isValid, parseISO } from 'date-fns';

export function getProfileYearsMonths() {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  return { years, months };
}

export const getIsActive = (href: string, pathname: string) => {
  return href === pathname;
};

export function getLocale() {
  return 'vi';
}

function messageFromPlainApiError(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const m = (value as { message?: unknown }).message;
  if (typeof m === 'string' && m.trim()) return m;
  if (Array.isArray(m)) {
    const normalized = m
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean);
    if (normalized.length > 0) return normalized.join('\n');
  }
  return undefined;
}

export function getErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const fromBody = messageFromPlainApiError(err.response?.data);
    if (fromBody) return fromBody;
    if (err.message) return err.message;
  }
  const fromRejected = messageFromPlainApiError(err);
  if (fromRejected) return fromRejected;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export function isoToYmd(iso: string): string {
  const t = iso?.trim();
  if (!t) return '';
  const d = parseISO(t);
  return isValid(d) ? format(d, 'yyyy-MM-dd') : '';
}

export function getLocalizedName(name: { vi: string; en: string; ko: string }, locale: string) {
  if (name == null) return '';
  if (locale === 'vi') return name.vi ?? '';
  if (locale === 'en') return name.en ?? '';
  if (locale === 'ko') return name.ko ?? '';
  return name.vi ?? '';
}

const COMPANY_SIZE_VALUES = new Set<string>(Object.values(CompanySize));

export function isCompanySizeValue(v: unknown): v is CompanySize {
  return typeof v === 'string' && COMPANY_SIZE_VALUES.has(v);
}

export function numberToCompanySizeRange(n: number): CompanySize | '' {
  if (!Number.isFinite(n) || n <= 0) return '';
  if (n <= 10) return CompanySize.RANGE_1_10;
  if (n <= 50) return CompanySize.RANGE_11_50;
  if (n <= 200) return CompanySize.RANGE_51_200;
  if (n <= 500) return CompanySize.RANGE_201_500;
  if (n <= 1000) return CompanySize.RANGE_501_1000;
  if (n <= 5000) return CompanySize.RANGE_1001_5000;
  return CompanySize.RANGE_5001_PLUS;
}

export function normalizeCompanySizeForForm(size: number | CompanySize | undefined | null): string {
  if (size == null) return '';
  if (isCompanySizeValue(size)) return size;
  if (typeof size === 'number') return numberToCompanySizeRange(size);
  return '';
}

/** Initials from the last up to two name parts (e.g. "Mr Bean" → "MB"). */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return parts
    .slice(-2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function formatStatusTabLabel(label: string, count: number): string {
  return `${label} (${count})`;
}
