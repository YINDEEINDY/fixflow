import { api } from './client';
import type { User, Category, Location, Role, PaginatedResponse } from '../types/index';

// ============ TYPES ============

export interface AdminUser extends User {
  technician?: {
    id: string;
    specialty: string[];
    isAvailable: boolean;
    rating: number | null;
  } | null;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role: Role;
  phone?: string;
  department?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  role?: Role;
  isActive?: boolean;
}

export interface CategoryInput {
  name: string;
  nameTh: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface LocationInput {
  building: string;
  floor?: string;
  room?: string;
  isActive?: boolean;
}

export interface ReportStats {
  totalRequests: number;
  byStatus: { status: string; count: number }[];
  byCategory: { categoryId: string; category: string; count: number }[];
  byPriority: { priority: string; count: number }[];
  topTechnicians: { technicianId: string; name: string; completedJobs: number }[];
}

export interface MonthlyTrend {
  month: string;
  created: number;
  completed: number;
}

// ============ API ============

export const adminApi = {
  // User Management
  users: {
    getAll: (params: {
      page?: number;
      limit?: number;
      role?: Role;
      search?: string;
      isActive?: boolean;
    } = {}) => {
      const query = new URLSearchParams();
      if (params.page) query.set('page', String(params.page));
      if (params.limit) query.set('limit', String(params.limit));
      if (params.role) query.set('role', params.role);
      if (params.search) query.set('search', params.search);
      if (typeof params.isActive === 'boolean') query.set('isActive', String(params.isActive));
      return api.get<PaginatedResponse<AdminUser>>(`/admin/users?${query}`);
    },

    getById: (id: string) => api.get<AdminUser>(`/admin/users/${id}`),

    create: (input: CreateUserInput) => api.post<AdminUser>('/admin/users', input),

    update: (id: string, input: UpdateUserInput) =>
      api.put<AdminUser>(`/admin/users/${id}`, input),

    delete: (id: string) => api.delete<{ message: string }>(`/admin/users/${id}`),
  },

  // Category Management
  categories: {
    getAll: () => api.get<Category[]>('/admin/categories'),

    create: (input: CategoryInput) => api.post<Category>('/admin/categories', input),

    update: (id: string, input: Partial<CategoryInput>) =>
      api.put<Category>(`/admin/categories/${id}`, input),

    delete: (id: string) => api.delete<{ message: string }>(`/admin/categories/${id}`),
  },

  // Location Management
  locations: {
    getAll: () => api.get<Location[]>('/admin/locations'),

    create: (input: LocationInput) => api.post<Location>('/admin/locations', input),

    update: (id: string, input: Partial<LocationInput>) =>
      api.put<Location>(`/admin/locations/${id}`, input),

    delete: (id: string) => api.delete<{ message: string }>(`/admin/locations/${id}`),
  },

  // Reports
  reports: {
    getStats: (startDate?: string, endDate?: string) => {
      const query = new URLSearchParams();
      if (startDate) query.set('startDate', startDate);
      if (endDate) query.set('endDate', endDate);
      return api.get<ReportStats>(`/admin/reports/stats?${query}`);
    },

    getTrend: (months = 6) =>
      api.get<MonthlyTrend[]>(`/admin/reports/trend?months=${months}`),
  },
};
