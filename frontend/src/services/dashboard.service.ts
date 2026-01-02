import { apiClient } from '@/lib/api-client';
import type { DashboardStats } from '@/types';

export const dashboardService = {
  // Get dashboard statistics (manager/accountant)
  getStats: async (role: 'manager' | 'accountant' = 'manager'): Promise<DashboardStats> => {
    const endpoint = role === 'accountant' ? '/accountants/stats' : '/managers/stats';
    const response = await apiClient.get<{ stats: DashboardStats }>(endpoint);
    return response.data.stats;
  },
};
