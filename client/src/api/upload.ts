import { api } from './client';

export interface UploadedFile {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
}

export interface UploadResponse {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
}

export interface MultiUploadResponse {
  files: UploadedFile[];
}

export const uploadApi = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.postFormData<UploadResponse>('/upload/image', formData);
  },

  uploadImages: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    return api.postFormData<MultiUploadResponse>('/upload/images', formData);
  },

  deleteFile: (filename: string) => api.delete<{ message: string }>(`/upload/${filename}`),
};
