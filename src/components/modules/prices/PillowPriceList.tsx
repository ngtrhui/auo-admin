"use client";

import { PILLOWS } from "./price.data";
import PriceInput from "@/components/modules/prices/PriceInput";
import type { PriceDraft } from "./price.types";

interface PillowPriceListProps {
  visiblePillows: (typeof PILLOWS)[number][];
  draft: PriceDraft;
  isReady: boolean;
  onPriceChange: (pillowId: string, value: string) => void;
}

export default function PillowPriceList({
  visiblePillows,
  draft,
  isReady,
  onPriceChange,
}: PillowPriceListProps) {
  if (visiblePillows.length === 0) return null;

  return (
    <div className="mt-5 border-t border-slate-200 pt-5">
      <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-slate-200 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        {visiblePillows.map((pillow) => (
          <div
            className="flex items-center justify-between gap-4 px-5 py-4"
            key={pillow.id}
          >
            <span className="text-sm font-medium text-slate-700">
              {pillow.name}
            </span>
            <PriceInput
              disabled={!isReady}
              label={`Giá ${pillow.name}`}
              onChange={(value) => onPriceChange(pillow.id, value)}
              value={draft.pillows[pillow.id] ?? ""}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
