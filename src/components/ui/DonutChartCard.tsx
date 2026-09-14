'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

import { cn } from '@/utils/classNames';
import { formatNumber, formatPercent } from '@/utils/format';

export const DONUT_CHART_COLORS = [
  '#FF8F8F',
  '#46C3E2',
  '#8A7CFF',
  '#FFB054',
  '#0063FF',
  '#16A34A',
  '#CE21A9',
  '#8A63F6',
  '#FF514B',
  '#E0710B',
] as const;

export type DonutChartItem = {
  label: string;
  value: number;
  color?: string;
};

type ResolvedDonutItem = DonutChartItem & { color: string };

type CustomTooltipProps = {
  active?: boolean;
  payload?: {
    name: string;
    value: number;
  }[];
};

export type DonutChartCardProps = {
  data: DonutChartItem[];
  title?: string;
  height?: number;
  innerRadius?: number | string;
  outerRadius?: number | string;
  showLegend?: boolean;
  legendLayout?: 'side' | 'bottom';
  centerTitle?: string;
  centerValue?: string | number;
  className?: string;
  paddingAngle?: number;
};

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const item = payload[0];

    return (
      <div className="rounded-md bg-white px-3 py-1 shadow-primary">
        <p className="text-xs font-medium text-black">
          {item.name} : {formatNumber(item.value)}
        </p>
      </div>
    );
  }

  return null;
};

const resolveChartData = (data: DonutChartItem[]): ResolvedDonutItem[] =>
  data.map((item, index) => ({
    ...item,
    color: item.color ?? DONUT_CHART_COLORS[index % DONUT_CHART_COLORS.length],
  }));

const LegendList = ({
  data,
  total,
  layout,
}: {
  data: ResolvedDonutItem[];
  total: number;
  layout: 'side' | 'bottom';
}) => {
  if (layout === 'bottom') {
    return (
      <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
        {data.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-1.5"
          >
            <div
              className="size-3 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs font-medium text-black">{item.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex min-w-0 w-full flex-1 flex-col justify-center gap-5">
      {data.map((item) => {
        const percent = total > 0 ? (item.value / total) * 100 : 0;

        return (
          <div
            key={item.label}
            className="flex min-w-0 items-center justify-between gap-3"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate text-xs font-medium text-black">{item.label}</span>
            </div>
            <span className="shrink-0 whitespace-nowrap text-xs text-black">
              <span className="font-bold">{formatNumber(item.value)}</span>
              <span className="font-medium"> ({formatPercent(percent)})</span>
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default function DonutChartCard({
  data,
  title,
  height = 220,
  innerRadius = '50%',
  outerRadius = '82%',
  showLegend = true,
  legendLayout = 'side',
  centerTitle,
  centerValue,
  className,
  paddingAngle = 2,
}: DonutChartCardProps) {
  const chartData = resolveChartData(data);
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const formattedCenterValue =
    typeof centerValue === 'number' ? formatNumber(centerValue) : centerValue;

  const chartBlock = (
    <div
      className="relative mx-auto w-full max-w-full"
      style={{ height }}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="label"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={paddingAngle}
            cx="50%"
            cy="50%"
            stroke="#fff"
            strokeWidth={2}
          >
            {chartData.map((item) => (
              <Cell
                key={item.label}
                fill={item.color}
                stroke="#fff"
                strokeWidth={1}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-2">
        {centerTitle ? (
          <span className="text-center text-xs font-medium text-black">{centerTitle}</span>
        ) : null}
        {formattedCenterValue != null ? (
          <span className="text-center text-base font-bold text-black">{formattedCenterValue}</span>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className={cn('w-full min-w-0 overflow-hidden rounded-lg bg-white p-5', className)}>
      {title ? <h3 className="mb-5 truncate text-base font-semibold text-black">{title}</h3> : null}

      {showLegend && legendLayout === 'side' ? (
        <div className="flex min-w-0 flex-col items-stretch gap-6 sm:flex-row sm:items-center">
          <div className="w-full min-w-0 shrink-0 sm:w-[45%]">{chartBlock}</div>
          <LegendList
            data={chartData}
            total={total}
            layout="side"
          />
        </div>
      ) : (
        <>
          {chartBlock}
          {showLegend ? (
            <LegendList
              data={chartData}
              total={total}
              layout="bottom"
            />
          ) : null}
        </>
      )}
    </div>
  );
}
