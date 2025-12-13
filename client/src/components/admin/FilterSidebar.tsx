import React from 'react';
import { X, Filter } from 'lucide-react';
import type { Department, Urgency, Status } from '../../types';
import { THAI_TEXT, DEPARTMENTS, URGENCY_LEVELS } from '../../constants';

export interface FilterOptions {
  status: Status[];
  urgency: Urgency[];
  department: Department[];
  dateFrom: string;
  dateTo: string;
}

interface FilterSidebarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onReset: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const handleStatusToggle = (status: Status) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];
    onFilterChange({ ...filters, status: newStatuses });
  };

  const handleUrgencyToggle = (urgency: Urgency) => {
    const newUrgencies = filters.urgency.includes(urgency)
      ? filters.urgency.filter((u) => u !== urgency)
      : [...filters.urgency, urgency];
    onFilterChange({ ...filters, urgency: newUrgencies });
  };

  const handleDepartmentToggle = (department: Department) => {
    const newDepartments = filters.department.includes(department)
      ? filters.department.filter((d) => d !== department)
      : [...filters.department, department];
    onFilterChange({ ...filters, department: newDepartments });
  };

  const handleDateFromChange = (date: string) => {
    onFilterChange({ ...filters, dateFrom: date });
  };

  const handleDateToChange = (date: string) => {
    onFilterChange({ ...filters, dateTo: date });
  };

  const statuses: Status[] = ['pending', 'in_progress', 'completed'];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-800">กรองข้อมูล</h3>
        </div>
        <button
          onClick={onReset}
          className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          ล้างตัวกรอง
        </button>
      </div>

      {/* Status Filter */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">สถานะ</h4>
        <div className="space-y-2">
          {statuses.map((status) => (
            <label key={status} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.status.includes(status)}
                onChange={() => handleStatusToggle(status)}
                className="mr-2 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">{THAI_TEXT.status[status]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Urgency Filter */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">ความเร่งด่วน</h4>
        <div className="space-y-2">
          {URGENCY_LEVELS.map((urgency) => (
            <label key={urgency} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.urgency.includes(urgency)}
                onChange={() => handleUrgencyToggle(urgency)}
                className="mr-2 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">{THAI_TEXT.urgency[urgency]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Department Filter */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">แผนก</h4>
        <div className="space-y-2">
          {DEPARTMENTS.map((department) => (
            <label key={department} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.department.includes(department)}
                onChange={() => handleDepartmentToggle(department)}
                className="mr-2 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">
                {THAI_TEXT.department[department]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Date Range Filter */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">ช่วงวันที่</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-500">ตั้งแต่</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleDateFromChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">ถึง</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleDateToChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
