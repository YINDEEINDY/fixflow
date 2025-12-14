import { create } from 'zustand';
import type { Request, Category, Location, Technician, Priority, RequestStatus } from '../types/index';
import { requestsApi, type CreateRequestInput, type UpdateRequestInput, type ListRequestsParams } from '../api/requests';

interface RequestState {
  // Data
  requests: Request[];
  currentRequest: Request | null;
  categories: Category[];
  locations: Location[];
  technicians: Technician[];

  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Filters
  filters: {
    status?: RequestStatus;
    priority?: Priority;
    categoryId?: string;
    search?: string;
  };

  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;

  // Actions
  fetchCategories: () => Promise<void>;
  fetchLocations: () => Promise<void>;
  fetchTechnicians: () => Promise<void>;
  fetchRequests: (params?: ListRequestsParams) => Promise<void>;
  fetchMyRequests: (params?: Omit<ListRequestsParams, 'userId'>) => Promise<void>;
  fetchRequestById: (id: string) => Promise<void>;
  createRequest: (input: CreateRequestInput) => Promise<Request>;
  updateRequest: (id: string, input: UpdateRequestInput) => Promise<void>;
  cancelRequest: (id: string, reason?: string) => Promise<void>;
  assignRequest: (id: string, technicianId: string, note?: string) => Promise<void>;
  acceptRequest: (id: string) => Promise<void>;
  rejectRequest: (id: string, reason: string) => Promise<void>;
  startRequest: (id: string) => Promise<void>;
  completeRequest: (id: string, note?: string) => Promise<void>;
  setFilters: (filters: RequestState['filters']) => void;
  setPage: (page: number) => void;
  clearCurrentRequest: () => void;
}

export const useRequestStore = create<RequestState>((set, get) => ({
  requests: [],
  currentRequest: null,
  categories: [],
  locations: [],
  technicians: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {},
  isLoading: false,
  isSubmitting: false,

  fetchCategories: async () => {
    const response = await requestsApi.getCategories();
    if (response.success && response.data) {
      set({ categories: response.data });
    }
  },

  fetchLocations: async () => {
    const response = await requestsApi.getLocations();
    if (response.success && response.data) {
      set({ locations: response.data });
    }
  },

  fetchTechnicians: async () => {
    try {
      const response = await requestsApi.getTechnicians();
      console.log('Technicians API response:', response);
      if (response.success && response.data) {
        set({ technicians: response.data });
      }
    } catch (error) {
      console.error('Failed to fetch technicians:', error);
    }
  },

  fetchRequests: async (params = {}) => {
    set({ isLoading: true });
    try {
      const { pagination, filters } = get();
      const response = await requestsApi.getAll({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        ...params,
      });

      if (response.success && response.data) {
        set({
          requests: response.data.items,
          pagination: response.data.pagination,
        });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMyRequests: async (params = {}) => {
    set({ isLoading: true });
    try {
      const { pagination, filters } = get();
      const response = await requestsApi.getMy({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        ...params,
      });

      if (response.success && response.data) {
        set({
          requests: response.data.items,
          pagination: response.data.pagination,
        });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  fetchRequestById: async (id: string) => {
    set({ isLoading: true });
    try {
      const response = await requestsApi.getById(id);
      if (response.success && response.data) {
        set({ currentRequest: response.data });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  createRequest: async (input: CreateRequestInput) => {
    set({ isSubmitting: true });
    try {
      const response = await requestsApi.create(input);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to create request');
      }
      return response.data;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateRequest: async (id: string, input: UpdateRequestInput) => {
    set({ isSubmitting: true });
    try {
      const response = await requestsApi.update(id, input);
      if (response.success && response.data) {
        set({ currentRequest: response.data });
      } else {
        throw new Error(response.error?.message || 'Failed to update request');
      }
    } finally {
      set({ isSubmitting: false });
    }
  },

  cancelRequest: async (id: string, reason?: string) => {
    set({ isSubmitting: true });
    try {
      const response = await requestsApi.cancel(id, reason);
      if (response.success && response.data) {
        set({ currentRequest: response.data });
      } else {
        throw new Error(response.error?.message || 'Failed to cancel request');
      }
    } finally {
      set({ isSubmitting: false });
    }
  },

  assignRequest: async (id: string, technicianId: string, note?: string) => {
    set({ isSubmitting: true });
    try {
      const response = await requestsApi.assign(id, technicianId, note);
      if (response.success && response.data) {
        set({ currentRequest: response.data });
      } else {
        throw new Error(response.error?.message || 'Failed to assign request');
      }
    } finally {
      set({ isSubmitting: false });
    }
  },

  acceptRequest: async (id: string) => {
    set({ isSubmitting: true });
    try {
      const response = await requestsApi.accept(id);
      if (response.success && response.data) {
        set({ currentRequest: response.data });
      } else {
        throw new Error(response.error?.message || 'Failed to accept request');
      }
    } finally {
      set({ isSubmitting: false });
    }
  },

  rejectRequest: async (id: string, reason: string) => {
    set({ isSubmitting: true });
    try {
      const response = await requestsApi.reject(id, reason);
      if (response.success && response.data) {
        set({ currentRequest: response.data });
      } else {
        throw new Error(response.error?.message || 'Failed to reject request');
      }
    } finally {
      set({ isSubmitting: false });
    }
  },

  startRequest: async (id: string) => {
    set({ isSubmitting: true });
    try {
      const response = await requestsApi.start(id);
      if (response.success && response.data) {
        set({ currentRequest: response.data });
      } else {
        throw new Error(response.error?.message || 'Failed to start request');
      }
    } finally {
      set({ isSubmitting: false });
    }
  },

  completeRequest: async (id: string, note?: string) => {
    set({ isSubmitting: true });
    try {
      const response = await requestsApi.complete(id, note);
      if (response.success && response.data) {
        set({ currentRequest: response.data });
      } else {
        throw new Error(response.error?.message || 'Failed to complete request');
      }
    } finally {
      set({ isSubmitting: false });
    }
  },

  setFilters: (filters) => {
    set({ filters, pagination: { ...get().pagination, page: 1 } });
  },

  setPage: (page) => {
    set({ pagination: { ...get().pagination, page } });
  },

  clearCurrentRequest: () => {
    set({ currentRequest: null });
  },
}));
