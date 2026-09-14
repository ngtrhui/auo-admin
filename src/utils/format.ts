import { TZDate } from '@date-fns/tz';
import { differenceInCalendarDays, format, isValid, parse } from 'date-fns';
export const formatMinMaxSalary = (minValue: number, maxValue: number) => {
  const unit = getUnit(maxValue);
  const min = stripUnit(minValue);
  const max = stripUnit(maxValue);
  return `${min} - ${max} ${unit}`;
};

/**
 * Format candidate salary range. Values are always VND in "triệu" units
 * (e.g. 22 → "22 triệu", 22–50 → "22 - 50 triệu").
 */
export const formatCandidateSalaryRange = (
  range?: { min?: number | null; max?: number | null } | null,
  options?: { currency?: string | null; isDeal?: boolean },
): string => {
  if (options?.isDeal) return 'Thỏa thuận';
  if (!range) return '—';

  const { min, max } = range;
  const hasMin = min != null;
  const hasMax = max != null;

  if (hasMin && hasMax) {
    if (min === max) return `${min} triệu`;
    return `${min} - ${max} triệu`;
  }
  if (!hasMin && hasMax) return `Tới ${max} triệu`;
  if (hasMin && !hasMax) return `Từ ${min} triệu`;
  return '—';
};

const getUnit = (value: number) => {
  if (value >= 1_000_000) return 'triệu';
  if (value >= 1_000) return 'K';
  return '';
};

const stripUnit = (value: number) => {
  if (value >= 1_000_000) return value / 1_000_000;
  if (value >= 1_000) return value / 1_000;
  return value;
};

export const formatSalary = (value: number) => {
  if (value >= 1_000_000) return `${value / 1_000_000} triệu`;
  if (value >= 1_000) return `${value / 1_000}K`;
  return value.toString();
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/** Rút gọn số với tối đa 1 chữ thập phân (vd. 1245 → "1.2K", 1000 → "1K"). */
function abbreviateLarge(value: number, divisor: number, suffix: string): string {
  const n = Math.round((value / divisor) * 10) / 10;
  const s = Number.isInteger(n) ? String(n) : n.toFixed(1);
  return `${s}${suffix}`;
}

export const formatJobSalaryDisplay = (salary: {
  isDeal?: boolean;
  min?: number | null;
  max?: number | null;
}) => {
  if (salary.isDeal) return 'Thỏa thuận';

  const { min, max } = salary;
  const hasMin = min != null;
  const hasMax = max != null;

  if (hasMin && hasMax) {
    return `${min} - ${max} triệu`;
  }
  if (!hasMin && hasMax) {
    return `Tới ${max} triệu`;
  }
  if (hasMin && !hasMax) {
    return `Từ ${min} triệu`;
  }
  return '-';
};

/** Format phần trăm (vd. 20 → "20%", 15.02 → "15.02%"). */
export const formatPercent = (value: number, fractionDigits = 2): string => {
  if (!Number.isFinite(value)) return '—';
  if (Number.isInteger(value)) return `${value}%`;
  return `${value.toFixed(fractionDigits)}%`;
};

export const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/** Rút gọn số lớn: K / M / B. Nếu ≥ 1000B thì dùng formatNumber cho hệ số (vd. 10,000B). */
export const formatLargeNumber = (value: number) => {
  if (value >= 1_000_000_000) {
    const billions = value / 1_000_000_000;
    if (billions >= 1000) {
      return `${formatNumber(billions)}B`;
    }
    return abbreviateLarge(value, 1_000_000_000, 'B');
  }
  if (value >= 1_000_000) return abbreviateLarge(value, 1_000_000, 'M');
  if (value >= 1_000) return abbreviateLarge(value, 1_000, 'K');
  return value.toString();
};

export type FormattedDateTime = {
  date: string;
  time: string;
};

const VN_TIMEZONE = 'Asia/Ho_Chi_Minh';

export function formatYmdToDisplay(ymd: string): string {
  const t = ymd.trim();
  if (!t) return '';
  const d = parse(t, 'yyyy-MM-dd', new Date());
  return isValid(d) ? format(d, 'dd/MM/yyyy') : '';
}

/**
 * ISO-8601 (vd. `2026-03-28T19:30:00Z`) → hiển thị theo **giờ Việt Nam** (UTC+7):
 * `date`: DD/MM/YYYY, `time`: HH:mm (24h)
 */
export const formatDate = (iso: string): FormattedDateTime => {
  const instant = new Date(iso);
  if (!isValid(instant)) {
    return { date: '', time: '' };
  }

  const z = new TZDate(instant, VN_TIMEZONE);

  return {
    date: format(z, 'dd/MM/yyyy'),
    time: format(z, 'HH:mm'),
  };
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  const raw = phoneNumber?.trim() ?? '';
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('84') && digits.length >= 10) {
    return `0${digits.slice(2, 11)}`;
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return digits;
  }
  if (digits.length === 9) {
    return `0${digits}`;
  }
  return digits.startsWith('0') ? digits : `0${digits}`;
};

export type RemainingDaysTranslateFn = (
  key: 'remainingDaysPositive' | 'remainingDaysToday' | 'remainingDaysPast',
  values?: { count: number },
) => string;
export function formatRemainingDaysLabel(expiredAt: string, t: RemainingDaysTranslateFn): string {
  const expiredDate = new Date(expiredAt);
  if (!isValid(expiredDate)) return '';

  const remainingDays = differenceInCalendarDays(expiredDate, new Date());
  if (remainingDays > 0) {
    return t('remainingDaysPositive', { count: remainingDays });
  }
  if (remainingDays === 0) return t('remainingDaysToday');
  return t('remainingDaysPast');
}

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};
