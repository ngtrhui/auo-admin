import { format, subDays, subMonths } from 'date-fns';

export type DashboardDatePreset = 'today' | '7d' | '30d' | '3m' | '6m' | '1y' | 'custom';

export type DashboardFixedDatePreset = Exclude<DashboardDatePreset, 'custom'>;

export const DASHBOARD_FIXED_DATE_PRESETS = [
  'today',
  '7d',
  '30d',
  '3m',
  '6m',
  '1y',
] as const satisfies readonly DashboardFixedDatePreset[];

export const DASHBOARD_DATE_PRESETS = [
  ...DASHBOARD_FIXED_DATE_PRESETS,
  'custom',
] as const satisfies readonly DashboardDatePreset[];

export const DASHBOARD_DATE_PRESET_OPTIONS: {
  id: DashboardDatePreset;
  label: string;
}[] = [
  { id: 'today', label: 'Hôm nay' },
  { id: '7d', label: '7 ngày' },
  { id: '30d', label: '30 ngày' },
  { id: '3m', label: '3 tháng' },
  { id: '6m', label: '6 tháng' },
  { id: '1y', label: '1 năm' },
  { id: 'custom', label: 'Tùy chọn' },
];

const MONTH_PRESET_BACK: Record<'3m' | '6m' | '1y', number> = {
  '3m': 3,
  '6m': 6,
  '1y': 12,
};

function todayYmd(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/** Khoảng ngày cố định cho dashboard — `yyyy-MM-dd`, theo giờ local. */
export function getDashboardPresetRange(preset: DashboardFixedDatePreset): {
  from: string;
  to: string;
} {
  const to = todayYmd();
  if (preset === 'today') {
    return { from: to, to };
  }
  if (preset === '3m' || preset === '6m' || preset === '1y') {
    const from = format(subMonths(new Date(), MONTH_PRESET_BACK[preset]), 'yyyy-MM-dd');
    return { from, to };
  }
  const daysBack = preset === '7d' ? 6 : 29;
  const from = format(subDays(new Date(), daysBack), 'yyyy-MM-dd');
  return { from, to };
}

export function resolveDashboardDateRange(
  preset: DashboardDatePreset | null,
  customRange: { from: string; to: string },
): { from: string; to: string } | null {
  if (preset === null) return null;
  if (preset === 'custom') {
    const from = customRange.from.trim();
    const to = customRange.to.trim();
    return from && to ? { from, to } : null;
  }
  return getDashboardPresetRange(preset);
}

export function inferDashboardDatePreset(range: { from: string; to: string }): DashboardDatePreset {
  for (const preset of DASHBOARD_FIXED_DATE_PRESETS) {
    const candidate = getDashboardPresetRange(preset);
    if (candidate.from === range.from && candidate.to === range.to) return preset;
  }
  return 'custom';
}
