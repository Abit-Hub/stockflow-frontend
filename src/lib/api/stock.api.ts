import { apiClient } from './client';

export const stockApi = {
  /**
   * Adjust stock
   */
  adjust: async (adjustmentData: {
    productId: string;
    quantity: number;
    type: 'IN' | 'OUT' | 'ADJUSTMENT';
    reason: string;
    notes?: string;
  }) => {
    const { data } = await apiClient.post('/stock/adjust', adjustmentData);
    return data;
  },

  /**
   * Restock product
   */
  restock: async (restockData: {
    productId: string;
    quantity: number;
    costPrice?: number;
    notes?: string;
  }) => {
    const { data } = await apiClient.post('/stock/restock', restockData);
    return data;
  },

  /**
   * Get stock logs
   */
  getLogs: async (params?: {
    productId?: string;
    startDate?: string;
    endDate?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await apiClient.get('/stock/logs', { params });
    return data;
  },

  /**
   * Get product stock history
   */
  getProductHistory: async (productId: string) => {
    const { data } = await apiClient.get(`/stock/logs/${productId}`);
    return data;
  },
};