"use client";

import React from "react";

import { cn } from "@/utils/classNames";
import { formatNumber } from "@/utils/format";

export type FunnelItem = {
  id: number;
  title: string;
  description: string;
  value: number;
  conversionRate: number;
  color: string;
};

export type FunnelChartCardProps = {
  title: string;
  headerRight?: React.ReactNode;
  data: FunnelItem[];
  className?: string;
};

const FunnelChartCard: React.FC<FunnelChartCardProps> = ({
  title,
  headerRight,
  data,
  className,
}) => {
  const maxValue = Math.max(...data.map((item) => item.value));

  return (
    <div
      className={cn(
        "rounded-lg bg-white p-5 shadow-[0px_4px_8px_#0063FF33]",
        className,
      )}
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-black">{title}</h2>

        {headerRight}
      </div>

      <div className="mb-4 grid grid-cols-[1.2fr_1fr_140px_140px] items-center">
        <div />
        <div />
        <div className="text-sm font-medium text-black">Quantity</div>
        <div className="text-sm font-medium text-black">Conversion rate</div>
      </div>

      <div className="space-y-6">
        {data.map((item) => {
          const widthPercent = (item.value / maxValue) * 100;

          return (
            <div
              key={item.id}
              className="grid grid-cols-[1.2fr_1fr_140px_140px] items-center gap-4"
            >
              {/* Left */}
              <div className="flex items-center gap-4">
                <div
                  className="flex size-8 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{
                    backgroundColor: item.color,
                  }}
                >
                  {item.id}
                </div>

                <div>
                  <div className="font-semibold text-black">{item.title}</div>

                  <div className="text-xs text-gray">{item.description}</div>
                </div>
              </div>

              {/* Funnel */}
              <div className="flex justify-center">
                <div
                  className="flex h-10 items-center justify-center text-lg font-bold text-white transition-all"
                  style={{
                    width: `${widthPercent}%`,
                    minWidth: 100,
                    backgroundColor: item.color,
                    clipPath: "polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)",
                  }}
                >
                  {formatNumber(item.value)}
                </div>
              </div>

              {/* Quantity */}
              <div className="font-semibold text-black">
                {formatNumber(item.value)}
              </div>

              {/* Conversion */}
              <div className="font-semibold text-black">
                {item.conversionRate}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FunnelChartCard;
