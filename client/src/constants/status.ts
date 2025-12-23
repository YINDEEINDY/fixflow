// Request Status
export const REQUEST_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  ACCEPTED: 'accepted',
  IN_PROGRESS: 'in_progress',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
} as const;

export type RequestStatus = (typeof REQUEST_STATUS)[keyof typeof REQUEST_STATUS];

// Priority
export const PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export type Priority = (typeof PRIORITY)[keyof typeof PRIORITY];

// Status Colors (for badges)
export const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  accepted: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  on_hold: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

// Status Labels (Thai)
export const STATUS_LABELS: Record<string, string> = {
  pending: 'รอรับเรื่อง',
  assigned: 'มอบหมายแล้ว',
  accepted: 'รับงานแล้ว',
  in_progress: 'กำลังดำเนินการ',
  on_hold: 'รอดำเนินการ',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิก',
  rejected: 'ปฏิเสธ',
};

// Status Icons (lucide-react icon names)
export const STATUS_ICONS: Record<string, string> = {
  pending: 'Clock',
  assigned: 'UserCheck',
  accepted: 'CheckCircle',
  in_progress: 'Loader',
  on_hold: 'PauseCircle',
  completed: 'CheckCircle2',
  cancelled: 'XCircle',
  rejected: 'Ban',
};

// Priority Colors
export const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-gray-500 dark:text-gray-400',
  normal: 'text-blue-500 dark:text-blue-400',
  high: 'text-orange-500 dark:text-orange-400',
  urgent: 'text-red-500 dark:text-red-400',
};

// Priority Labels (Thai)
export const PRIORITY_LABELS: Record<string, string> = {
  low: 'ต่ำ',
  normal: 'ปกติ',
  high: 'สูง',
  urgent: 'เร่งด่วน',
};

// Priority Badge Colors
export const PRIORITY_BADGE_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

// SLA Configuration (in hours)
export const SLA_HOURS: Record<string, number> = {
  low: 72, // 3 days
  normal: 48, // 2 days
  high: 24, // 1 day
  urgent: 4, // 4 hours
};

// Helper functions
export function getStatusColor(status: string): string {
  return STATUS_COLORS[status] || STATUS_COLORS.pending;
}

export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] || status;
}

export function getPriorityColor(priority: string): string {
  return PRIORITY_COLORS[priority] || PRIORITY_COLORS.normal;
}

export function getPriorityLabel(priority: string): string {
  return PRIORITY_LABELS[priority] || priority;
}

export function getPriorityBadgeColor(priority: string): string {
  return PRIORITY_BADGE_COLORS[priority] || PRIORITY_BADGE_COLORS.normal;
}

export function getSLAHours(priority: string): number {
  return SLA_HOURS[priority] || SLA_HOURS.normal;
}

// Calculate SLA deadline
export function calculateSLADeadline(createdAt: Date | string, priority: string): Date {
  const created = new Date(createdAt);
  const hours = getSLAHours(priority);
  return new Date(created.getTime() + hours * 60 * 60 * 1000);
}

// Check if SLA is breached
export function isSLABreached(createdAt: Date | string, priority: string): boolean {
  const deadline = calculateSLADeadline(createdAt, priority);
  return new Date() > deadline;
}

// Get SLA status
export function getSLAStatus(
  createdAt: Date | string,
  priority: string
): 'ok' | 'warning' | 'breached' {
  const deadline = calculateSLADeadline(createdAt, priority);
  const now = new Date();
  const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursLeft < 0) return 'breached';
  if (hoursLeft < getSLAHours(priority) * 0.25) return 'warning'; // 25% time left
  return 'ok';
}

// Format time remaining
export function formatTimeRemaining(createdAt: Date | string, priority: string): string {
  const deadline = calculateSLADeadline(createdAt, priority);
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();

  if (diff < 0) {
    const hoursOver = Math.abs(diff) / (1000 * 60 * 60);
    if (hoursOver < 24) {
      return `เกิน ${Math.floor(hoursOver)} ชั่วโมง`;
    }
    return `เกิน ${Math.floor(hoursOver / 24)} วัน`;
  }

  const hours = diff / (1000 * 60 * 60);
  if (hours < 1) {
    return `${Math.floor(diff / (1000 * 60))} นาที`;
  }
  if (hours < 24) {
    return `${Math.floor(hours)} ชั่วโมง`;
  }
  return `${Math.floor(hours / 24)} วัน ${Math.floor(hours % 24)} ชม.`;
}
