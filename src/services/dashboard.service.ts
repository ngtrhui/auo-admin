import { API_CONFIG } from '@/config/api-config';
import axiosInstance from '@/lib/axiosInstance';
import { SuccessResponse } from '@/types/api';
import { DashboardResponse, DashboardSummaryRequest } from '@/types/dashboard';
import { downloadExcelExport } from '@/utils/downloadExcelExport';

export const getDashboard = async (
  request: DashboardSummaryRequest,
): Promise<SuccessResponse<DashboardResponse>> => {
  const response = await axiosInstance.get<SuccessResponse<DashboardResponse>>(
    API_CONFIG.ENDPOINTS.DASHBOARD.GET_DASHBOARD,
    {
      params: request,
    },
  );

  return response.data;
};

export const exportDashboardExcel = async (
  request: DashboardSummaryRequest,
): Promise<{ blob: Blob; filename: string }> =>
  downloadExcelExport(API_CONFIG.ENDPOINTS.DASHBOARD.EXPORT, 'BAO_CAO_TONG_QUAN.xlsx', request);
