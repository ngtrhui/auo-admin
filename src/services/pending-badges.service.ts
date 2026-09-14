import axiosInstance from '@/lib/axiosInstance';
import { API_CONFIG } from '@/config/api-config';
import type { SuccessResponse } from '@/types/api';
import type { AdminPendingBadges } from '@/types/pending-badges';

export const pendingBadgesService = {
  getPendingBadges: async (): Promise<SuccessResponse<AdminPendingBadges>> => {
    const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.ADMIN.PENDING_BADGES);
    return response.data;
  },
};
