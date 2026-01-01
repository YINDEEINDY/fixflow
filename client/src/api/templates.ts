import { api } from './client';
import type { Priority } from '../types/index';
// Force rebuild

export interface RequestTemplate {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  title: string;
  content?: string;
  priority: Priority;
  isActive: boolean;
  isPublic: boolean;
  usageCount: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    nameTh: string;
    icon?: string;
    color?: string;
  };
  creator?: {
    id: string;
    name: string;
  };
}

export interface CreateTemplateInput {
  name: string;
  description?: string;
  categoryId: string;
  title: string;
  content?: string;
  priority?: Priority;
  isPublic?: boolean;
}

export interface UpdateTemplateInput {
  name?: string;
  description?: string;
  categoryId?: string;
  title?: string;
  content?: string;
  priority?: Priority;
  isPublic?: boolean;
  isActive?: boolean;
}

export const templatesApi = {
  // Get all templates (includes user's private templates if authenticated)
  getAll: () => api.get<RequestTemplate[]>('/templates'),

  // Get popular templates (public only)
  getPopular: (limit: number = 5) => api.get<RequestTemplate[]>(`/templates/popular?limit=${limit}`),

  // Get template by ID
  getById: (id: string) => api.get<RequestTemplate>(`/templates/${id}`),

  // Get templates by category
  getByCategory: (categoryId: string) =>
    api.get<RequestTemplate[]>(`/templates/category/${categoryId}`),

  // Create template
  create: (input: CreateTemplateInput) => api.post<RequestTemplate>('/templates', input),

  // Update template
  update: (id: string, input: UpdateTemplateInput) =>
    api.put<RequestTemplate>(`/templates/${id}`, input),

  // Delete template (soft delete)
  delete: (id: string) => api.delete<{ message: string }>(`/templates/${id}`),

  // Use template (increment usage count and get template data)
  use: (id: string) => api.post<RequestTemplate>(`/templates/${id}/use`),
};
