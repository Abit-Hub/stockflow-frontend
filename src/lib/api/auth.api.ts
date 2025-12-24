import { apiClient } from "./client";
import { AuthResponse } from "@/types";

export const authApi = {
  /**
   * Login user with email and password
   */

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password
    });
    return data;
  },

  /**
   * Register a new user
   */
  register: async (
    email: string,
    password: string,
    name: string,
    role: 'OWNER' | 'MANAGER' | 'TECHNICIAN'
  ): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', {
      email,
      password,
      name,
      role
    });
    return data;
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async (): Promise<AuthResponse> => {
    const { data } = await apiClient.get<AuthResponse>('/auth/me');
    return data;
  },

  /**
   * Refresh authentication token 
   */
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
    return data;
  },

  /** 
   * Logout user
   */

  logout: async (refreshToken: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.post<{ success: boolean; message: string }>('/auth/logout', { refreshToken });
    return data;
  },

  /**
   * logout from all devices
   */
  logoutAllDevices: async (): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.post<{ success: boolean; message: string }>('/auth/logout-all');
    return data;
  }
}