'use client';

import React, { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { getNiceYAxis } from '@/utils/chartAxis';
import { cn } from '@/utils/classNames';
import { formatDate, formatLargeNumber, formatNumber } from '@/utils/format';

export type TimeChartPoint = {
  label: string;
  users: number;
  cvs: number;
  applications: number;
};

export type ChartLabelMode = 'date' | 'time';

export type ChartCardProps = {
  title: string;
  description?: string;
  headerRight?: React.ReactNode;
  toolbar?: React.ReactNode;
  data: TimeChartPoint[];
  /** `time`: formatDate.time (hôm nay); `date`: formatDate.date (các range khác) */
  labelMode?: ChartLabelMode;
  className?: string;
};

/** Chuẩn hóa label API `yyyy-MM-dd HH:mm:ss` → ISO-like để parse ổn định. */
function toParseableDateLabel(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) return trimmed;
  if (trimmed.includes('T')) return trimmed;
  return trimmed.replace(' ', 'T');
}

function formatChartLabel(label: string, mode: ChartLabelMode): string {
  const formatted = formatDate(toParseableDateLabel(label));
  if (mode === 'time') return formatted.time || label;
  return formatted.date || label;
}

const COLORS = {
  users: '#0063ff',
  cvs: '#16a34a',
  applications: '#8a63f6',
} as const;

const CHART_MARGIN = {
  top: 12,
  /** Chừa chỗ cho label X neo middle ở hai mép (tránh cắt chữ). */
  right: 36,
  left: 8,
  bottom: 8,
} as const;

const TICK_STYLE = {
  fontSize: 12,
  fill: '#000000',
  fontWeight: 500,
} as const;

const X_AXIS_TICK_STYLE = {
  fontSize: 12,
  fill: '#000000',
  fontWeight: 500,
} as const;

const X_AXIS_TICK_MARGIN = 12;

const GRID_STROKE = '#E3E3E3';

const Y_AXIS_WIDTH = 48;

type XAxisTickRendererProps = {
  x?: string | number;
  y?: string | number;
  payload?: { value?: number | string };
};

/** Tick X luôn neo middle — tránh start/end tràn vào tick kế gây chồng chữ. */
function XAxisTick({ x = 0, y = 0, payload }: XAxisTickRendererProps) {
  const label = String(payload?.value ?? '');
  if (!label) return null;

  const xPos = typeof x === 'number' ? x : Number(x);
  const yPos = typeof y === 'number' ? y : Number(y);
  if (!Number.isFinite(xPos) || !Number.isFinite(yPos)) return null;

  return (
    <text
      x={xPos}
      y={yPos}
      dy={X_AXIS_TICK_MARGIN}
      textAnchor="middle"
      {...X_AXIS_TICK_STYLE}
    >
      {label}
    </text>
  );
}

type SeriesKey = keyof typeof COLORS;

type SeriesConfig = {
  key: SeriesKey;
  label: string;
  color: string;
  tooltipClassName: string;
};

const SERIES_CONFIG: SeriesConfig[] = [
  {
    key: 'users',
    label: 'Người dùng',
    color: COLORS.users,
    tooltipClassName: 'bg-primary/10 text-primary',
  },
  {
    key: 'cvs',
    label: 'CV',
    color: COLORS.cvs,
    tooltipClassName: 'bg-green/10 text-green',
  },
  {
    key: 'applications',
    label: 'Đơn ứng tuyển',
    color: COLORS.applications,
    tooltipClassName: 'bg-violet/10 text-violet',
  },
];

const SERIES_BY_KEY: Record<SeriesKey, SeriesConfig> = {
  users: SERIES_CONFIG[0],
  cvs: SERIES_CONFIG[1],
  applications: SERIES_CONFIG[2],
};

type TooltipPayloadItem = {
  dataKey?: string | number;
  value?: number;
  payload?: TimeChartPoint;
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;

  const displayLabel = payload[0]?.payload?.label ?? label ?? '';

  return (
    <div className="rounded-xl border border-gray/20 bg-white px-3 py-2 shadow-[0px_4px_8px_#0063FF33]">
      <div className="mb-2 border-b border-gray/20 pb-1 text-xs font-semibold text-black">
        {displayLabel}
      </div>

      {payload.map((item) => {
        const key = String(item.dataKey) as SeriesKey;
        const series = SERIES_BY_KEY[key];

        return (
          <div
            key={key}
            className="mt-1 flex items-center gap-2 text-xs"
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: series?.color ?? '#9CA3AF' }}
            />
            <span className="text-gray">{series?.label ?? key}</span>
            <div className={cn('font-semibold text-black')}>{formatNumber(item.value || 0)}</div>
          </div>
        );
      })}
    </div>
  );
};

const ChartCard: React.FC<ChartCardProps> = React.memo(
  ({ title, description, headerRight, toolbar, data, labelMode = 'date', className }) => {
    const chartData = useMemo(
      () =>
        data.map((point) => ({
          ...point,
          label: formatChartLabel(point.label, labelMode),
        })),
      [data, labelMode],
    );

    const { domain: yDomain, ticks: yTicks } = useMemo(
      () =>
        getNiceYAxis(
          chartData.flatMap((item) => [item.users, item.cvs, item.applications]),
          5,
          { integerOnly: true },
        ),
      [chartData],
    );

    return (
      <div
        className={cn(
          'rounded-lg bg-white p-5 shadow-[0px_4px_8px_#0063FF33]',
          'flex flex-col gap-5',
          className,
        )}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <h2 className="text-xl font-bold text-black">{title}</h2>
          {headerRight ? <div className="flex flex-wrap gap-2">{headerRight}</div> : null}
        </div>

        <div className="flex flex-col gap-3">
          {description ? <p className="text-sm text-gray-500">{description}</p> : null}

          <div className="flex flex-wrap items-center gap-6">
            {SERIES_CONFIG.map((series) => (
              <div
                key={series.key}
                className="flex items-center gap-2"
              >
                <div
                  className="size-3 rounded-full"
                  style={{ backgroundColor: series.color }}
                />
                <span className="text-sm font-medium text-black">{series.label}</span>
              </div>
            ))}
          </div>
        </div>

        {toolbar}

        <div className="h-80 w-full overflow-visible">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={chartData}
              margin={CHART_MARGIN}
            >
              <CartesianGrid
                vertical
                horizontal={false}
                stroke={GRID_STROKE}
                strokeDasharray="0"
              />

              <XAxis
                dataKey="label"
                interval="preserveStartEnd"
                minTickGap={24}
                axisLine={{ stroke: GRID_STROKE, strokeWidth: 1 }}
                tickLine={false}
                tickMargin={X_AXIS_TICK_MARGIN}
                padding={{ left: 0, right: 0 }}
                tick={XAxisTick}
              />

              <YAxis
                domain={yDomain}
                ticks={yTicks}
                axisLine={false}
                tickLine={false}
                tickMargin={12}
                width={Y_AXIS_WIDTH}
                tick={TICK_STYLE}
                tickFormatter={formatLargeNumber}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: '#D1D5DB',
                  strokeDasharray: '5 5',
                }}
              />

              {SERIES_CONFIG.map((series) => (
                <Line
                  key={series.key}
                  type="monotone"
                  dataKey={series.key}
                  stroke={series.color}
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: series.color,
                    stroke: '#fff',
                    strokeWidth: 3,
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  },
);

ChartCard.displayName = 'ChartCard';

export default ChartCard;
