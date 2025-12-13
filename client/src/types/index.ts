export type Department = 'IT' | 'HR' | 'Finance' | 'Production' | 'Warehouse' | 'Other';

export type Urgency = 'low' | 'medium' | 'high';

export type Status = 'pending' | 'in_progress' | 'completed';

export interface MaintenanceRequest {
  id: string;
  requesterName: string;
  department: Department;
  equipment: string;
  imageUrl?: string;
  description: string;
  urgency: Urgency;
  status: Status;
  assignedTechnician?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface CreateRequestDTO {
  requesterName: string;
  department: Department;
  equipment: string;
  imageUrl?: string;
  description: string;
  urgency: Urgency;
}

export interface UpdateRequestDTO {
  status?: Status;
  assignedTechnician?: string;
}

export interface RequestFilterDTO {
  statuses?: Status[];
  urgencies?: Urgency[];
  assignedTechnician?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface KPIMetrics {
  totalRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  averageCompletionTime: number;
}

export interface RequestSummary {
  id: string;
  submittedDate: string;
  description: string;
  status: Status;
}
