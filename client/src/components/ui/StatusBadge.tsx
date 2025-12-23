import { cn } from '../../utils/cn';
import {
  getStatusColor,
  getStatusLabel,
  getPriorityBadgeColor,
  getPriorityLabel,
  getSLAStatus,
  formatTimeRemaining,
} from '../../constants/status';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        getStatusColor(status),
        sizeClasses[size],
        className
      )}
    >
      {getStatusLabel(status)}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function PriorityBadge({
  priority,
  size = 'md',
  showIcon = false,
  className,
}: PriorityBadgeProps) {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-2.5 py-1 text-sm',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        getPriorityBadgeColor(priority),
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <AlertTriangle className={iconSizes[size]} />}
      {getPriorityLabel(priority)}
    </span>
  );
}

interface SLABadgeProps {
  createdAt: Date | string;
  priority: string;
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SLABadge({ createdAt, priority, status, size = 'md', className }: SLABadgeProps) {
  // Don't show SLA for completed/cancelled/rejected requests
  if (['completed', 'cancelled', 'rejected'].includes(status)) {
    return null;
  }

  const slaStatus = getSLAStatus(createdAt, priority);
  const timeRemaining = formatTimeRemaining(createdAt, priority);

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-2.5 py-1 text-sm',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  const statusStyles = {
    ok: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    breached: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  const Icon = slaStatus === 'ok' ? CheckCircle : slaStatus === 'warning' ? Clock : AlertTriangle;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        statusStyles[slaStatus],
        sizeClasses[size],
        className
      )}
      title={`SLA: ${timeRemaining}`}
    >
      <Icon className={iconSizes[size]} />
      <span>{timeRemaining}</span>
    </span>
  );
}

export default StatusBadge;
