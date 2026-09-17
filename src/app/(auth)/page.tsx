'use client';

import ChartCard from '@/components/ui/ChartCard';
// import DonutChartCard from '@/components/ui/DonutChartCard';
import { FiUsers, FiFileText } from 'react-icons/fi';
import StatCard from '@/components/ui/StatCard';
import { useDashboard } from '@/hooks/useDashboard';
import DashboardDateRangeFilter from '@/components/modules/dashboard/DashboardDateRangeFilter';
import { useMemo, useState } from 'react';
import {
  getDashboardPresetRange,
  resolveDashboardDateRange,
  type DashboardDatePreset,
} from '@/utils/dashboard-date-range';
import {
  ChartCardSkeleton,
  DashboardStatsSkeleton,
} from '@/components/modules/dashboard/DashboardPageSkeleton';

const DashboardPage = () => {
  const [preset, setPreset] = useState<DashboardDatePreset>('7d');
  const [customRange, setCustomRange] = useState({ from: '', to: '' });
  const [committedRange, setCommittedRange] = useState(() => getDashboardPresetRange('7d'));

  const dateRange = useMemo(
    () => resolveDashboardDateRange(preset, customRange),
    [preset, customRange],
  );

  if (dateRange && (dateRange.from !== committedRange.from || dateRange.to !== committedRange.to)) {
    setCommittedRange(dateRange);
  }

  const request = useMemo(
    () => ({ startDate: committedRange.from, endDate: committedRange.to }),
    [committedRange],
  );

  const { summary, chart, isLoading, isFetching, exportExcel, isExporting } = useDashboard(request);

  const showSkeleton = isLoading || (isFetching && summary === undefined);

  return (
    <div className="h-fit rounded-lg flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm font-medium text-gray">Chào mừng bạn đến với Ầu Ơ Admin!</p>
        </div>
        <DashboardDateRangeFilter
          className="w-full md:w-auto"
          preset={preset}
          customRange={customRange}
          onPresetChange={setPreset}
          onCustomRangeChange={setCustomRange}
          onExport={() => exportExcel.mutate()}
          isExporting={isExporting}
        />
      </div>

      <div className="flex flex-col gap-5">
        {showSkeleton ? (
          <DashboardStatsSkeleton />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              variant="primary-light"
              title="Tổng người dùng"
              value={summary?.totalUsers.total ?? 0}
              growth={summary?.totalUsers.change ?? 0}
              icon={FiUsers}
            />

            <StatCard
              variant="green-light"
              title="Tổng CV"
              value={summary?.totalCvs.total ?? 0}
              growth={summary?.totalCvs.change ?? 0}
              icon={FiFileText}
            />

            <StatCard
              variant="violet-light"
              title="Tổng đơn ứng tuyển"
              value={summary?.totalApplications.total ?? 0}
              growth={summary?.totalApplications.change ?? 0}
              icon={'/images/icons/icon_send.webp'}
            />

            <StatCard
              variant="orange-light"
              title="Tổng doanh thu"
              value={summary?.totalRevenue.total ?? 0}
              growth={summary?.totalRevenue.change ?? 0}
              unit="VNĐ"
              icon="/images/icons/icon_coin.webp"
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-5">
          {showSkeleton ? (
            <ChartCardSkeleton />
          ) : (
            <ChartCard
              title="Biểu đồ người dùng"
              data={chart ?? []}
              labelMode={preset === 'today' ? 'time' : 'date'}
            />
          )}
        </div>
        {/* <div className="xl:col-span-1">
            <DonutChartCard
              title="Nguồn ứng viên"
              data={candidateSourceData}
            />
          </div> */}
      </div>
    </div>
  );
};

export default DashboardPage;
