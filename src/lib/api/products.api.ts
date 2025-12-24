import { apiClient } from './client';
import { Product } from '@/types';

interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

interface CreateProductData {
  name: string;
  description?: string;
  categoryId: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  reorderLevel?: number;
  imageUrl?: string;
}

export const productsApi = {
  /**
   * Get all products with filters
   */
  getAll: async (params?: {
    categoryId?: string;
    search?: string;
    isActive?: boolean;
    lowStock?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ProductsResponse> => {
    const { data } = await apiClient.get('/products', { params });
    return data;
  },

  /**
   * Get low stock products
   */
  getLowStock: async (): Promise<{ success: boolean; data: { products: Product[]; count: number } }> => {
    const { data } = await apiClient.get('/products/low-stock');
    return data;
  },

  /**
   * Get product by ID
   */
  getById: async (id: string): Promise<{ success: boolean; data: { product: Product } }> => {
    const { data } = await apiClient.get(`/products/${id}`);
    return data;
  },

  /**
   * Create product
   */
  create: async (productData: CreateProductData): Promise<{ success: boolean; data: { product: Product } }> => {
    const { data } = await apiClient.post('/products', productData);
    return data;
  },

  /**
   * Update product
   */
  update: async (
    id: string,
    productData: Partial<CreateProductData> & { isActive?: boolean }
  ): Promise<{ success: boolean; data: { product: Product } }> => {
    const { data } = await apiClient.put(`/products/${id}`, productData);
    return data;
  },

  /**
   * Delete product (soft delete)
   */
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.delete(`/products/${id}`);
    return data;
  },
};