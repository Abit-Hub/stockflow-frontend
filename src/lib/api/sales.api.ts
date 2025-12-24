import { apiClient } from './client';

interface SaleItem {
  productId: string;
  quantity: number;
}

interface CreateSaleData {
  items: SaleItem[];
  discount?: number;
  discountType?: 'AMOUNT' | 'PERCENTAGE';
  paymentMethod: 'CASH' | 'TRANSFER' | 'POS';
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}

export const salesApi = {
  /**
   * Create sale
   */
  create: async (saleData: CreateSaleData) => {
    const { data } = await apiClient.post('/sales', saleData);
    return data;
  },

  /**
   * Get all sales with filters
   */
  getAll: async (params?: {
    startDate?: string;
    endDate?: string;
    paymentMethod?: string;
    cashierId?: string;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await apiClient.get('/sales', { params });
    return data;
  },

  /**
   * Get sales summary
   */
  getSummary: async (params?: { startDate?: string; endDate?: string }) => {
    const { data } = await apiClient.get('/sales/summary', { params });
    return data;
  },

  /**
   * Get sale by ID
   */
  getById: async (id: string) => {
    const { data } = await apiClient.get(`/sales/${id}`);
    return data;
  },

  /**
   * Void sale
   */
  void: async (id: string, reason: string) => {
    const { data } = await apiClient.post(`/sales/${id}/void`, { reason });
    return data;
  },
};