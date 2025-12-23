import { api } from './client';

export interface Rating {
  id: string;
  requestId: string;
  userId: string;
  score: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export const ratingApi = {
  getRating: (requestId: string) => api.get<Rating | null>(`/requests/${requestId}/rating`),

  createRating: (requestId: string, score: number, comment?: string) =>
    api.post<Rating>(`/requests/${requestId}/rating`, { score, comment }),
};
