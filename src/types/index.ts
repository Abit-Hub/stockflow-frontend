/* eslint-disable @typescript-eslint/no-explicit-any */
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'OWNER' | 'MANAGER' | 'TECHNICIAN';
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  costPrice: string;
  sellingPrice: string;
  quantity: number;
  reorderLevel: number;
  imageUrl?: string;
  barcode?: string;
  isActive: boolean;
  category: {
    id: string;
    name: string;
    code: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  today: {
    sales: number;
    profit: number;
    transactions: number;
  };
  inventory: {
    totalProducts: number;
    lowStockCount: number;
    lowStockProducts: Array<{
      id: string;
      name: string;
      sku: string;
      quantity: number;
      reorderLevel: number;
    }>;
  };
  recentSales: Array<any>;
  topProducts: Array<any>;
}