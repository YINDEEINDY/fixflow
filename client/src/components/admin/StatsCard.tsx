import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  subtitle?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBgColor,
  subtitle,
}) => {
  return (
    <div className="group bg-white rounded-2xl shadow-medium hover:shadow-strong p-6 flex items-start gap-4 border border-gray-100 transition-all duration-300 hover:scale-105 hover:-translate-y-1 animate-scale-in">
      <div className={`${iconBgColor} p-4 rounded-xl shadow-soft group-hover:shadow-medium transition-all duration-300 group-hover:scale-110`}>
        <Icon className={`w-7 h-7 ${iconColor}`} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-500 mb-2">{title}</p>
        <p className="text-4xl font-bold text-gray-800 tracking-tight">{value}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-2">{subtitle}</p>}
      </div>
    </div>
  );
};
