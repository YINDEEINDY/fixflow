import { apiClient, ApiResponse } from './client';

export interface RequestTemplate {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  title: string;
  content?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
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
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  isPublic?: boolean;
}

export interface UpdateTemplateInput {
  name?: string;
  description?: string;
  categoryId?: string;
  title?: string;
  content?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  isPublic?: boolean;
  isActive?: boolean;
}

export const templateApi = {
  // Get all templates
  getAll: async (): Promise<ApiResponse<RequestTemplate[]>> => {
    const response = await apiClient.get<ApiResponse<RequestTemplate[]>>('/templates');
    return response.data;
  },

  // Get popular templates
  getPopular: async (limit: number = 5): Promise<ApiResponse<RequestTemplate[]>> => {
    const response = await apiClient.get<ApiResponse<RequestTemplate[]>>(
      `/templates/popular?limit=${limit}`
    );
    return response.data;
  },

  // Get template by ID
  getById: async (id: string): Promise<ApiResponse<RequestTemplate>> => {
    const response = await apiClient.get<ApiResponse<RequestTemplate>>(`/templates/${id}`);
    return response.data;
  },

  // Get templates by category
  getByCategory: async (categoryId: string): Promise<ApiResponse<RequestTemplate[]>> => {
    const response = await apiClient.get<ApiResponse<RequestTemplate[]>>(
      `/templates/category/${categoryId}`
    );
    return response.data;
  },

  // Create template
  create: async (input: CreateTemplateInput): Promise<ApiResponse<RequestTemplate>> => {
    const response = await apiClient.post<ApiResponse<RequestTemplate>>('/templates', input);
    return response.data;
  },

  // Update template
  update: async (id: string, input: UpdateTemplateInput): Promise<ApiResponse<RequestTemplate>> => {
    const response = await apiClient.put<ApiResponse<RequestTemplate>>(`/templates/${id}`, input);
    return response.data;
  },

  // Delete template
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/templates/${id}`);
    return response.data;
  },

  // Use template (increment usage count and get template data)
  use: async (id: string): Promise<ApiResponse<RequestTemplate>> => {
    const response = await apiClient.post<ApiResponse<RequestTemplate>>(`/templates/${id}/use`);
    return response.data;
  },
};

export default templateApi;
