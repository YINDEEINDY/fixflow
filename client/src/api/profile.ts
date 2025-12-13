import { api } from './client';
import type { User } from '../types/index';

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  department?: string;
  avatarUrl?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface UserStats {
  // For regular users
  totalRequests?: number;
  pendingRequests?: number;
  completedRequests?: number;
  // For technicians
  totalJobs?: number;
  completedJobs?: number;
  inProgressJobs?: number;
  rating?: number | null;
  specialty?: string[];
}

export const profileApi = {
  getProfile: () => api.get<User>('/profile'),

  updateProfile: (input: UpdateProfileInput) => api.put<User>('/profile', input),

  changePassword: (input: ChangePasswordInput) =>
    api.post<{ message: string }>('/profile/change-password', input),

  getStats: () => api.get<UserStats>('/profile/stats'),
};
