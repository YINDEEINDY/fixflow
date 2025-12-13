import { api } from './client';
import type { Priority, RequestStatus } from '../types/index';

export interface UserStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}

export interface TechnicianStats {
  assigned: number;
  inProgress: number;
  completedToday: number;
  rating: number;
}

export interface AdminStats {
  totalToday: number;
  pending: number;
  inProgress: number;
  completed: number;
  avgResolutionTime: string;
}

export interface RecentRequest {
  id: string;
  requestNumber: string;
  title: string;
  status: RequestStatus;
  priority: Priority;
  category: string;
  createdAt: string;
}

export const dashboardApi = {
  getStats: <T = UserStats | TechnicianStats | AdminStats>() =>
    api.get<T>('/dashboard/stats'),

  getRecentRequests: (limit = 5) =>
    api.get<RecentRequest[]>(`/dashboard/recent?limit=${limit}`),
};
