import { api } from './client';

// Types
export interface TechnicianFeedback {
  id: string;
  requestId: string;
  technicianId: string;
  adminId: string;
  score: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  request: {
    id: string;
    requestNumber: string;
    title: string;
  };
  technician: {
    id: string;
    user: {
      id: string;
      name: string;
      avatarUrl: string | null;
    };
  };
  admin: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface CreateTechnicianFeedbackInput {
  score: number;
  comment?: string;
}

export interface TechnicianFeedbackStats {
  totalFeedbacks: number;
  averageScore: number;
  scoreDistribution: {
    score: number;
    count: number;
  }[];
  recentFeedbacks: TechnicianFeedback[];
}

export interface PaginatedFeedbacks {
  feedbacks: TechnicianFeedback[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FeedbackQueryParams {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'score';
  sortOrder?: 'asc' | 'desc';
}

// API Functions
export const technicianFeedbackApi = {
  // Create feedback for a request (admin only)
  createFeedback: (requestId: string, input: CreateTechnicianFeedbackInput) =>
    api.post<TechnicianFeedback>(`/requests/${requestId}/technician-feedback`, input),

  // Get feedback for a specific request
  getFeedbackByRequestId: (requestId: string) =>
    api.get<TechnicianFeedback | null>(`/requests/${requestId}/technician-feedback`),

  // Get my feedbacks (for technicians)
  getMyFeedbacks: (params?: FeedbackQueryParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    const queryString = queryParams.toString();
    return api.get<PaginatedFeedbacks>(`/technician-feedbacks/my${queryString ? `?${queryString}` : ''}`);
  },

  // Get feedbacks for a specific technician
  getTechnicianFeedbacks: (technicianId: string, params?: FeedbackQueryParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    const queryString = queryParams.toString();
    return api.get<PaginatedFeedbacks>(`/technicians/${technicianId}/feedbacks${queryString ? `?${queryString}` : ''}`);
  },

  // Get all feedbacks (admin only)
  getAllFeedbacks: (params?: FeedbackQueryParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    const queryString = queryParams.toString();
    return api.get<PaginatedFeedbacks>(`/technician-feedbacks${queryString ? `?${queryString}` : ''}`);
  },

  // Get feedback statistics
  getStats: () => api.get<TechnicianFeedbackStats>('/technician-feedbacks/stats'),
};
