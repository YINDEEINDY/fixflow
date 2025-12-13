import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthResponse } from '../types/index';
import { api, setAccessToken } from '../api/client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  loginWithLine: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  department?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        const response = await api.post<AuthResponse>('/auth/login', { email, password });

        if (!response.success || !response.data) {
          throw new Error(response.error?.message || 'Login failed');
        }

        setAccessToken(response.data.accessToken);
        set({ user: response.data.user, isAuthenticated: true });
      },

      register: async (data: RegisterData) => {
        const response = await api.post<AuthResponse>('/auth/register', data);

        if (!response.success || !response.data) {
          throw new Error(response.error?.message || 'Registration failed');
        }

        setAccessToken(response.data.accessToken);
        set({ user: response.data.user, isAuthenticated: true });
      },

      loginWithLine: async (code: string) => {
        const response = await api.post<AuthResponse>('/auth/line', { code });

        if (!response.success || !response.data) {
          throw new Error(response.error?.message || 'LINE login failed');
        }

        setAccessToken(response.data.accessToken);
        set({ user: response.data.user, isAuthenticated: true });
      },

      logout: async () => {
        await api.post('/auth/logout');
        setAccessToken(null);
        set({ user: null, isAuthenticated: false });
      },

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          // Try to refresh token
          const refreshResponse = await api.post<{ accessToken: string }>('/auth/refresh');

          if (refreshResponse.success && refreshResponse.data?.accessToken) {
            setAccessToken(refreshResponse.data.accessToken);

            // Get user info
            const meResponse = await api.get<User>('/auth/me');

            if (meResponse.success && meResponse.data) {
              set({ user: meResponse.data, isAuthenticated: true, isLoading: false });
              return;
            }
          }

          set({ user: null, isAuthenticated: false, isLoading: false });
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
