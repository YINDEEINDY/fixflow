import React from 'react';
import { ChevronDown, Minus, ChevronUp } from 'lucide-react';
import type { Urgency } from '../../types';
import { THAI_TEXT } from '../../constants';

interface UrgencyIndicatorProps {
  urgency: Urgency;
  showLabel?: boolean;
}

export const UrgencyIndicator: React.FC<UrgencyIndicatorProps> = ({ urgency, showLabel = true }) => {
  const getUrgencyConfig = (urgency: Urgency) => {
    switch (urgency) {
      case 'low':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          Icon: ChevronDown,
        };
      case 'medium':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          Icon: Minus,
        };
      case 'high':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          Icon: ChevronUp,
        };
    }
  };

  const config = getUrgencyConfig(urgency);
  const { Icon, color, bgColor } = config;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 ${bgColor} ${
      urgency === 'low' ? 'border-success-300' : urgency === 'medium' ? 'border-warning-300' : 'border-danger-300'
    } shadow-soft`}>
      <Icon className={`w-5 h-5 ${color}`} />
      {showLabel && (
        <span className={`text-sm font-semibold ${color}`}>
          {THAI_TEXT.urgency[urgency]}
        </span>
      )}
    </div>
  );
};
