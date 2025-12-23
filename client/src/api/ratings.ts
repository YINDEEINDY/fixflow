import { api } from './client';
import type { Rating } from '../types/index';

export interface CreateRatingInput {
  score: number;
  comment?: string;
}

export const ratingsApi = {
  getByRequestId: (requestId: string) => api.get<Rating | null>(`/requests/${requestId}/rating`),

  create: (requestId: string, input: CreateRatingInput) =>
    api.post<Rating>(`/requests/${requestId}/rating`, input),

  getByTechnicianId: (technicianId: string) =>
    api.get<Rating[]>(`/technicians/${technicianId}/ratings`),
};
