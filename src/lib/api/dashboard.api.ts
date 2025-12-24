import { apiClient } from './client';
import { DashboardStats } from '@/types';

export const dashboardApi = {
  /**
   * Get dashboard statistics
   */
  getStats: async (): Promise<{ success: boolean; data: DashboardStats }> => {
    const { data } = await apiClient.get('/dashboard/stats');
    return data;
  },
};