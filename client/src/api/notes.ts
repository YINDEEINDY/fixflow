import { api } from './client';
import type { JobNote } from '../types/index';

export interface CreateNoteInput {
  note: string;
  photos?: string[];
  materials?: Record<string, unknown>;
  timeSpentMinutes?: number;
}

export const notesApi = {
  getByRequestId: (requestId: string) =>
    api.get<JobNote[]>(`/requests/${requestId}/notes`),

  create: (requestId: string, input: CreateNoteInput) =>
    api.post<JobNote>(`/requests/${requestId}/notes`, input),

  delete: (noteId: string) =>
    api.delete<{ message: string }>(`/notes/${noteId}`),
};
