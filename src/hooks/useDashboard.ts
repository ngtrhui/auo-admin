'use client';

import { useMutation, useQuery } from '@tanstack/react-query';

import { showToast } from '@/components/ui/Toaster';
import { exportDashboardExcel, getDashboard } from '@/services/dashboard.service';
import { DashboardSummaryRequest } from '@/types/dashboard';
import { triggerBlobDownload } from '@/utils/downloadBlob';
import { getErrorMessage } from '@/utils/helper';

export const useDashboard = (request: DashboardSummaryRequest, enabled = true) => {
  const query = useQuery({
    queryKey: ['dashboard', request],
    queryFn: () => getDashboard(request),
    enabled,
  });

  const exportExcel = useMutation({
    mutationFn: () => exportDashboardExcel(request),
    onSuccess: ({ blob, filename }) => {
      triggerBlobDownload(blob, filename);
      showToast('success', 'Tải xuống Excel thành công');
    },
    onError: (error: unknown) => {
      showToast('error', getErrorMessage(error, 'Tải xuống Excel thất bại'));
    },
  });

  const result = query.data?.result;

  return {
    summary: result?.summary,
    chart: result?.chart,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    exportExcel,
    isExporting: exportExcel.isPending,
  };
};
