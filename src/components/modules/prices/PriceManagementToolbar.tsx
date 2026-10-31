"use client";

import { FiRotateCcw, FiSave } from "react-icons/fi";
import { Button } from "@/components/ui/Button";

interface PriceManagementToolbarProps {
  isDirty: boolean;
  isDefault: boolean;
  isReady: boolean;
  onReset: () => void;
  onSave: () => void;
}

export default function PriceManagementToolbar({
  isDirty,
  isDefault,
  isReady,
  onReset,
  onSave,
}: PriceManagementToolbarProps) {
  return (
    <header className="flex flex-col gap-3 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
        Quản lý bảng giá
      </h1>

      <div className="flex flex-col items-start gap-3 sm:items-end">
        {/* <span
          aria-live="polite"
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
            isDirty
              ? "bg-amber-50 text-amber-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${isDirty ? "bg-amber-500" : "bg-emerald-500"}`}
          />
          {isDirty ? "Có thay đổi chưa lưu" : "Bảng giá đã lưu"}
        </span> */}
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <Button
            variant="outline"
            size="md"
            className="flex-1 sm:flex-none"
            disabled={!isReady || isDefault}
            leftIcon={<FiRotateCcw aria-hidden className="size-4" />}
            onClick={onReset}
          >
            Khôi phục mặc định
          </Button>
          <Button
            size="md"
            className="flex-1 sm:flex-none"
            disabled={!isReady || !isDirty}
            leftIcon={<FiSave aria-hidden className="size-4" />}
            onClick={onSave}
          >
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </header>
  );
}
