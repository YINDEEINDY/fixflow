import React from 'react';
import type { Status } from '../../types';
import { THAI_TEXT } from '../../constants';

interface StatusBadgeProps {
  status: Status;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (status: Status) => {
    switch (status) {
      case 'pending':
        return {
          bg: 'bg-gradient-to-r from-gray-100 to-gray-200',
          text: 'text-gray-800',
          border: 'border-gray-300',
          icon: '⏱️',
        };
      case 'in_progress':
        return {
          bg: 'bg-gradient-to-r from-primary-100 to-primary-200',
          text: 'text-primary-800',
          border: 'border-primary-300',
          icon: '🔄',
        };
      case 'completed':
        return {
          bg: 'bg-gradient-to-r from-success-100 to-success-200',
          text: 'text-success-800',
          border: 'border-success-300',
          icon: '✅',
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-100 to-gray-200',
          text: 'text-gray-800',
          border: 'border-gray-300',
          icon: '⏱️',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border-2 ${config.bg} ${config.text} ${config.border} shadow-soft`}>
      <span>{config.icon}</span>
      <span>{THAI_TEXT.status[status]}</span>
    </span>
  );
};
