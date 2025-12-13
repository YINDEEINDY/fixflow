import type { MaintenanceRequest, KPIMetrics } from '../types';

// T013: Generate unique request ID (format: MR-YYYYMMDD-XXX)
export const generateRequestId = (): string => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `MR-${date}-${random}`;
};

// T016: Validation functions
export const validateRequesterName = (name: string): string | null => {
  if (!name || name.trim().length < 2) {
    return 'ชื่อผู้แจ้งต้องมีอย่างน้อย 2 ตัวอักษร';
  }
  if (name.length > 100) {
    return 'ชื่อผู้แจ้งต้องไม่เกิน 100 ตัวอักษร';
  }
  return null;
};

export const validateDescription = (description: string): string | null => {
  if (!description || description.trim().length < 10) {
    return 'รายละเอียดปัญหาต้องมีอย่างน้อย 10 ตัวอักษร';
  }
  if (description.length > 2000) {
    return 'รายละเอียดปัญหาต้องไม่เกิน 2000 ตัวอักษร';
  }
  return null;
};

export const validateEquipment = (equipment: string): string | null => {
  if (!equipment || equipment.trim().length < 1) {
    return 'กรุณากรอกอุปกรณ์หรือพื้นที่';
  }
  if (equipment.length > 200) {
    return 'อุปกรณ์/พื้นที่ต้องไม่เกิน 200 ตัวอักษร';
  }
  return null;
};

export const validateImageFile = (file: File): string | null => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (file.size > maxSize) {
    return 'ไฟล์มีขนาดเกิน 5MB';
  }

  if (!allowedTypes.includes(file.type)) {
    return 'รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, GIF, WebP)';
  }

  return null;
};

// Convert file to Base64 for localStorage
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Format date for display
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

// Truncate description to max length
export const truncateDescription = (description: string, maxLength: number = 50): string => {
  if (description.length <= maxLength) {
    return description;
  }
  return description.substring(0, maxLength - 3) + '...';
};

// Calculate KPI metrics from requests
export const calculateKPIMetrics = (requests: MaintenanceRequest[]): KPIMetrics => {
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const inProgressRequests = requests.filter(r => r.status === 'in_progress').length;

  const completedRequests = requests.filter(r => r.status === 'completed');
  const averageCompletionTime = completedRequests.length > 0
    ? completedRequests.reduce((sum, r) => {
        if (!r.completedAt) return sum;
        const createdAt = typeof r.createdAt === 'string' ? new Date(r.createdAt) : r.createdAt;
        const completedAt = typeof r.completedAt === 'string' ? new Date(r.completedAt) : r.completedAt;
        const duration = (completedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        return sum + duration;
      }, 0) / completedRequests.length
    : 0;

  return {
    totalRequests,
    pendingRequests,
    inProgressRequests,
    averageCompletionTime: Math.round(averageCompletionTime * 10) / 10, // Round to 1 decimal
  };
};
