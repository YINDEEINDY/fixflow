import { api } from './client';
import type { Notification } from '../types/index';

export const notificationsApi = {
  getAll: (unreadOnly = false) =>
    api.get<Notification[]>(`/notifications${unreadOnly ? '?unreadOnly=true' : ''}`),

  getUnreadCount: () =>
    api.get<{ count: number }>('/notifications/unread-count'),

  markAsRead: (id: string) =>
    api.put<Notification>(`/notifications/${id}/read`),

  markAllAsRead: () =>
    api.put<{ message: string }>('/notifications/read-all'),
};
