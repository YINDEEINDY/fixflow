export type Role = 'user' | 'technician' | 'admin';

export type Priority = 'low' | 'normal' | 'high' | 'urgent';

export type RequestStatus =
  | 'pending'
  | 'assigned'
  | 'accepted'
  | 'in_progress'
  | 'on_hold'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export interface User {
  id: string;
  email: string | null;
  name: string;
  role: Role;
  avatarUrl: string | null;
  phone: string | null;
  department: string | null;
  lineId: string | null;
  isActive?: boolean;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  nameTh: string;
  icon: string | null;
  color: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface Location {
  id: string;
  building: string;
  floor: string | null;
  room: string | null;
  isActive: boolean;
}

export interface Technician {
  id: string;
  user: Pick<User, 'id' | 'name' | 'avatarUrl' | 'phone'>;
  specialty: string[];
  isAvailable: boolean;
}

export interface Request {
  id: string;
  requestNumber: string;
  title: string;
  description: string | null;
  status: RequestStatus;
  priority: Priority;
  photos: string[];
  preferredDate: string | null;
  preferredTime: string | null;
  category: Category;
  location: Location;
  user: Pick<User, 'id' | 'name' | 'avatarUrl' | 'email' | 'phone' | 'department'>;
  technician: Technician | null;
  assignedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RequestLog {
  id: string;
  action: string;
  oldStatus: string | null;
  newStatus: string | null;
  note: string | null;
  createdBy: Pick<User, 'id' | 'name'>;
  createdAt: string;
}

export interface JobNote {
  id: string;
  note: string;
  photos: string[];
  materials: unknown;
  timeSpentMinutes: number | null;
  technician: {
    id: string;
    user: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  };
  createdAt: string;
}

export interface Rating {
  id: string;
  score: number;
  comment: string | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  isNewUser?: boolean;
}
