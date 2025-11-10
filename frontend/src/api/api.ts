import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { User, UserRole } from '../context/AuthContext';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface DashboardData {
  statistics: {
    totalUsers?: number;
    totalCompanies?: number;
    totalOrders?: number;
    revenue?: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

// API Functions
export const authAPI = {
  // Login user
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },

  // Logout user
  logout: async (): Promise<ApiResponse> => {
    try {
      const response = await api.post<ApiResponse>('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Logout API error:', error);
      throw error;
    }
  },

  // Get current user profile
  getProfile: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await api.get<ApiResponse<User>>('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Get profile API error:', error);
      throw error;
    }
  },

  // Refresh token
  refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
    try {
      const response = await api.post<ApiResponse<{ token: string }>>('/auth/refresh');
      return response.data;
    } catch (error) {
      console.error('Refresh token API error:', error);
      throw error;
    }
  },
};

export const dashboardAPI = {
  // Get dashboard data for superadmin
  getSuperAdminDashboard: async (): Promise<ApiResponse<DashboardData>> => {
    try {
      const response = await api.get<ApiResponse<DashboardData>>('/dashboard/superadmin');
      return response.data;
    } catch (error) {
      console.error('Super admin dashboard API error:', error);
      throw error;
    }
  },

  // Get dashboard data for company
  getCompanyDashboard: async (companyId: string): Promise<ApiResponse<DashboardData>> => {
    try {
      const response = await api.get<ApiResponse<DashboardData>>(`/dashboard/company/${companyId}`);
      return response.data;
    } catch (error) {
      console.error('Company dashboard API error:', error);
      throw error;
    }
  },
};

export const userManagementAPI = {
  // Get all users (superadmin only)
  getUsers: async (): Promise<ApiResponse<User[]>> => {
    try {
      const response = await api.get<ApiResponse<User[]>>('/users');
      return response.data;
    } catch (error) {
      console.error('Get users API error:', error);
      throw error;
    }
  },

  // Create new user (superadmin only)
  createUser: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      const response = await api.post<ApiResponse<User>>('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Create user API error:', error);
      throw error;
    }
  },

  // Update user (superadmin only)
  updateUser: async (userId: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      const response = await api.put<ApiResponse<User>>(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Update user API error:', error);
      throw error;
    }
  },

  // Delete user (superadmin only)
  deleteUser: async (userId: string): Promise<ApiResponse> => {
    try {
      const response = await api.delete<ApiResponse>(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Delete user API error:', error);
      throw error;
    }
  },
};

export const companyAPI = {
  // Get company profile
  getCompanyProfile: async (companyId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get<ApiResponse<any>>(`/companies/${companyId}`);
      return response.data;
    } catch (error) {
      console.error('Get company profile API error:', error);
      throw error;
    }
  },

  // Update company profile
  updateCompanyProfile: async (companyId: string, companyData: any): Promise<ApiResponse<any>> => {
    try {
      const response = await api.put<ApiResponse<any>>(`/companies/${companyId}`, companyData);
      return response.data;
    } catch (error) {
      console.error('Update company profile API error:', error);
      throw error;
    }
  },
};

// Utility function to handle API errors
export const handleApiError = (error: AxiosError): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export default api;
