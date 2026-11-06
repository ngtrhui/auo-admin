"use client";

import { useState } from "react";
import {
  FiDollarSign,
  FiPackage,
  FiShoppingCart,
} from "react-icons/fi";

import DashboardDateRangeFilter from "@/components/modules/dashboard/DashboardDateRangeFilter";
import ChartCard from "@/components/ui/ChartCard";
import StatCard from "@/components/ui/StatCard";
import type { DashboardChartItem, DashboardSummary } from "@/types/dashboard";
import type { DashboardDatePreset } from "@/utils/dashboard-date-range";

type PreviewSummary = {
  products: DashboardSummary;
  orders: DashboardSummary;
  revenue: DashboardSummary;
};

const previewSummary: PreviewSummary = {
  products: { total: 86, change: 8.4, unit: "percentage" },
  orders: { total: 2471, change: 16.2, unit: "percentage" },
  revenue: { total: 48650000, change: -3.6, unit: "percentage" },
};

const previewChart: DashboardChartItem[] = [
  { label: "2026-10-31T12:00:00", users: 32, cvs: 24, applications: 47 },
  { label: "2026-11-01T12:00:00", users: 41, cvs: 29, applications: 58 },
  { label: "2026-11-02T12:00:00", users: 36, cvs: 31, applications: 52 },
  { label: "2026-11-03T12:00:00", users: 55, cvs: 38, applications: 73 },
  { label: "2026-11-04T12:00:00", users: 48, cvs: 35, applications: 69 },
  { label: "2026-11-05T12:00:00", users: 67, cvs: 44, applications: 86 },
  { label: "2026-11-06T12:00:00", users: 61, cvs: 51, applications: 92 },
];

const DashboardPage = () => {
  const [preset, setPreset] = useState<DashboardDatePreset>("7d");
  const [customRange, setCustomRange] = useState({ from: "", to: "" });

  return (
    <div className="flex h-fit flex-col gap-5">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black sm:text-3xl">
            Tổng quan kinh doanh
          </h1>
          <p className="mt-1 text-sm text-gray">
            Theo dõi hoạt động kinh doanh drap, chăn và vỏ gối.
          </p>
        </div>
        <DashboardDateRangeFilter
          className="w-full md:w-auto"
          preset={preset}
          customRange={customRange}
          onPresetChange={setPreset}
          onCustomRangeChange={setCustomRange}
        />
      </section>

      <section
        aria-labelledby="dashboard-stats-title"
        className="flex flex-col gap-3"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            className="rounded-2xl border border-black/5 p-5 shadow-sm"
            variant="green-light"
            title="Sản phẩm đang kinh doanh"
            value={previewSummary.products.total}
            growth={previewSummary.products.change}
            icon={FiPackage}
          />
          <StatCard
            className="rounded-2xl border border-black/5 p-5 shadow-sm"
            variant="violet-light"
            title="Tổng đơn hàng"
            value={previewSummary.orders.total}
            growth={previewSummary.orders.change}
            icon={FiShoppingCart}
          />
          <StatCard
            className="rounded-2xl border border-black/5 p-5 shadow-sm"
            variant="orange-light"
            title="Tổng doanh thu"
            value={previewSummary.revenue.total}
            growth={previewSummary.revenue.change}
            unit="VNĐ"
            icon={FiDollarSign}
          />
        </div>
      </section>

      <ChartCard
        className="rounded-2xl border border-black/5 p-5 shadow-sm sm:p-6"
        title="Hoạt động kinh doanh"
        description="Số đơn hàng mới, đơn hàng đã duyệt và đơn hàng đã hủy trong khoảng đã chọn."
        data={previewChart}
        seriesLabels={{
          users: "Đơn hàng mới",
          cvs: "Đơn hàng đã duyệt",
          applications: "Đơn hàng đã hủy",
        }}
        seriesColors={{ applications: "#dc2626" }}
        labelMode={preset === "today" ? "time" : "date"}
      />
    </div>
  );
};

export default DashboardPage;
