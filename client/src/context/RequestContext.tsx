import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { MaintenanceRequest, CreateRequestDTO, UpdateRequestDTO } from '../types';
import { apiClient, API_ENDPOINTS } from '../config/api';

interface RequestContextType {
  requests: MaintenanceRequest[];
  loading: boolean;
  error: string | null;
  fetchRequests: () => Promise<void>;
  createRequest: (data: CreateRequestDTO) => Promise<MaintenanceRequest>;
  updateRequest: (id: string, data: UpdateRequestDTO) => Promise<MaintenanceRequest>;
  deleteRequest: (id: string) => Promise<void>;
}

const RequestContext = createContext<RequestContextType | undefined>(undefined);

export const useRequests = () => {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error('useRequests must be used within RequestProvider');
  }
  return context;
};

interface RequestProviderProps {
  children: ReactNode;
}

export const RequestProvider: React.FC<RequestProviderProps> = ({ children }) => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<MaintenanceRequest[]>(API_ENDPOINTS.requests);
      // Convert date strings to Date objects
      const parsed = data.map((req: any) => ({
        ...req,
        createdAt: new Date(req.createdAt),
        updatedAt: new Date(req.updatedAt),
        completedAt: req.completedAt ? new Date(req.completedAt) : undefined,
      }));
      setRequests(parsed);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const createRequest = async (data: CreateRequestDTO): Promise<MaintenanceRequest> => {
    setLoading(true);
    setError(null);
    try {
      const newRequest = await apiClient.post<MaintenanceRequest>(API_ENDPOINTS.requests, data);
      // Convert date strings to Date objects
      const parsed = {
        ...newRequest,
        createdAt: new Date(newRequest.createdAt),
        updatedAt: new Date(newRequest.updatedAt),
        completedAt: newRequest.completedAt ? new Date(newRequest.completedAt) : undefined,
      };
      setRequests(prev => [...prev, parsed]);
      return parsed;
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการสร้างคำขอ');
      console.error('Error creating request:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRequest = async (id: string, data: UpdateRequestDTO): Promise<MaintenanceRequest> => {
    setLoading(true);
    setError(null);
    try {
      const updatedRequest = await apiClient.patch<MaintenanceRequest>(
        `${API_ENDPOINTS.requests}/${id}`,
        data
      );
      // Convert date strings to Date objects
      const parsed = {
        ...updatedRequest,
        createdAt: new Date(updatedRequest.createdAt),
        updatedAt: new Date(updatedRequest.updatedAt),
        completedAt: updatedRequest.completedAt ? new Date(updatedRequest.completedAt) : undefined,
      };
      setRequests(prev => prev.map(r => (r.id === id ? parsed : r)));
      return parsed;
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการอัปเดตคำขอ');
      console.error('Error updating request:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRequest = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`${API_ENDPOINTS.requests}/${id}`);
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการลบคำขอ');
      console.error('Error deleting request:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const value: RequestContextType = {
    requests,
    loading,
    error,
    fetchRequests,
    createRequest,
    updateRequest,
    deleteRequest,
  };

  return <RequestContext.Provider value={value}>{children}</RequestContext.Provider>;
};
