import { create } from 'zustand';
import type { Notification } from '../types/index';
import { notificationsApi } from '../api/notifications';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;

  fetchNotifications: (unreadOnly?: boolean) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async (unreadOnly = false) => {
    set({ isLoading: true });
    try {
      const response = await notificationsApi.getAll(unreadOnly);
      if (response.success && response.data) {
        set({ notifications: response.data });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await notificationsApi.getUnreadCount();
      if (response.success && response.data) {
        set({ unreadCount: response.data.count });
      }
    } catch {
      // Silent fail
    }
  },

  markAsRead: async (id: string) => {
    try {
      const response = await notificationsApi.markAsRead(id);
      if (response.success) {
        const { notifications } = get();
        set({
          notifications: notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, get().unreadCount - 1),
        });
      }
    } catch {
      // Silent fail
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await notificationsApi.markAllAsRead();
      if (response.success) {
        const { notifications } = get();
        set({
          notifications: notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        });
      }
    } catch {
      // Silent fail
    }
  },
}));
