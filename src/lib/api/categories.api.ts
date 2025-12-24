import { apiClient } from './client';

interface Category {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export const categoriesApi = {
  /**
   * Get all categories
   */
  getAll: async (): Promise<{ success: boolean; data: { categories: Category[] } }> => {
    const { data } = await apiClient.get('/categories');
    return data;
  },

  /**
   * Get category by ID
   */
  getById: async (id: string): Promise<{ success: boolean; data: { category: Category } }> => {
    const { data } = await apiClient.get(`/categories/${id}`);
    return data;
  },

  /**
   * Create category
   */
  create: async (categoryData: { name: string; code: string }): Promise<{ success: boolean; data: { category: Category } }> => {
    const { data } = await apiClient.post('/categories', categoryData);
    return data;
  },

  /**
   * Update category
   */
  update: async (
    id: string,
    categoryData: { name?: string; code?: string }
  ): Promise<{ success: boolean; data: { category: Category } }> => {
    const { data } = await apiClient.put(`/categories/${id}`, categoryData);
    return data;
  },

  /**
   * Delete category
   */
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.delete(`/categories/${id}`);
    return data;
  },
};