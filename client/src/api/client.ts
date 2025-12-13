import type { ApiResponse } from '../types/index';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

async function refreshToken(): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as ApiResponse<{ accessToken: string }>;
    if (data.success && data.data?.accessToken) {
      accessToken = data.data.accessToken;
      return accessToken;
    }

    return null;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  // If unauthorized, try to refresh token
  if (response.status === 401 && accessToken) {
    const newToken = await refreshToken();
    if (newToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });
    }
  }

  const data = (await response.json()) as ApiResponse<T>;
  return data;
}

export async function apiFormDataRequest<T>(
  endpoint: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;

  const headers: HeadersInit = {};

  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
    credentials: 'include',
  });

  // If unauthorized, try to refresh token
  if (response.status === 401 && accessToken) {
    const newToken = await refreshToken();
    if (newToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      });
    }
  }

  const data = (await response.json()) as ApiResponse<T>;
  return data;
}

export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'DELETE' }),

  postFormData: <T>(endpoint: string, formData: FormData) =>
    apiFormDataRequest<T>(endpoint, formData),
};
