import { MaintenanceRequest, CreateRequestDTO, UpdateRequestDTO } from '../types';

export interface StorageService {
  getRequests(): Promise<MaintenanceRequest[]>;
  getRequestById(id: string): Promise<MaintenanceRequest | null>;
  createRequest(data: CreateRequestDTO): Promise<MaintenanceRequest>;
  updateRequest(id: string, data: UpdateRequestDTO): Promise<MaintenanceRequest>;
  deleteRequest(id: string): Promise<void>;
}
