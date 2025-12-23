import { api } from './client';
import type {
  Request,
  Category,
  Location,
  Technician,
  PaginatedResponse,
  Priority,
  RequestStatus,
} from '../types/index';

export interface CreateRequestInput {
  categoryId: string;
  locationId: string;
  title: string;
  description?: string;
  photos?: string[];
  priority?: Priority;
  preferredDate?: string;
  preferredTime?: string;
}

export interface UpdateRequestInput {
  title?: string;
  description?: string;
  photos?: string[];
  priority?: Priority;
  preferredDate?: string;
  preferredTime?: string;
}

export interface ListRequestsParams {
  page?: number;
  limit?: number;
  status?: RequestStatus;
  priority?: Priority;
  categoryId?: string;
  locationId?: string;
  userId?: string;
  technicianId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

function buildQueryString(params: ListRequestsParams | Omit<ListRequestsParams, 'userId'>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  const str = query.toString();
  return str ? `?${str}` : '';
}

export const requestsApi = {
  // Categories & Locations
  getCategories: () => api.get<Category[]>('/requests/categories'),

  getLocations: () => api.get<Location[]>('/requests/locations'),

  getTechnicians: () => api.get<Technician[]>('/requests/technicians'),

  // Request CRUD
  create: (input: CreateRequestInput) => api.post<Request>('/requests', input),

  getAll: (params: ListRequestsParams = {}) =>
    api.get<PaginatedResponse<Request>>(`/requests${buildQueryString(params)}`),

  getMy: (params: Omit<ListRequestsParams, 'userId'> = {}) =>
    api.get<PaginatedResponse<Request>>(`/requests/my${buildQueryString(params)}`),

  getById: (id: string) => api.get<Request>(`/requests/${id}`),

  update: (id: string, input: UpdateRequestInput) => api.put<Request>(`/requests/${id}`, input),

  cancel: (id: string, reason?: string) => api.post<Request>(`/requests/${id}/cancel`, { reason }),

  // Admin actions
  assign: (id: string, technicianId: string, note?: string) =>
    api.post<Request>(`/requests/${id}/assign`, { technicianId, note }),

  // Technician actions
  accept: (id: string) => api.post<Request>(`/requests/${id}/accept`),

  reject: (id: string, reason: string) => api.post<Request>(`/requests/${id}/reject`, { reason }),

  start: (id: string) => api.post<Request>(`/requests/${id}/start`),

  complete: (id: string, note?: string) => api.post<Request>(`/requests/${id}/complete`, { note }),
};
