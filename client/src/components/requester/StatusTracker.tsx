import React, { useState } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import type { MaintenanceRequest } from '../../types';
import { useRequests } from '../../context/RequestContext';
import { THAI_TEXT } from '../../constants';
import { StatusBadge } from '../shared/StatusBadge';
import { UrgencyIndicator } from '../shared/UrgencyIndicator';

export const StatusTracker: React.FC = () => {
  const { requests } = useRequests();
  const [requestId, setRequestId] = useState('');
  const [searchResult, setSearchResult] = useState<MaintenanceRequest | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setNotFound(false);
    setSearchResult(null);

    if (!requestId.trim()) {
      return;
    }

    const found = requests.find(r => r.id === requestId.trim());
    if (found) {
      setSearchResult(found);
    } else {
      setNotFound(true);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="bg-white rounded-2xl shadow-strong p-8 max-w-2xl mx-auto animate-slide-up border border-gray-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-gradient-to-br from-secondary-500 to-secondary-700 p-3 rounded-xl shadow-glow-secondary">
          <Search className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            {THAI_TEXT.requester.statusTrackerTitle}
          </h2>
          <p className="text-sm text-gray-500 mt-1">ตรวจสอบสถานะคำขอของคุณได้ทันที</p>
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-3">
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
            </div>
            <input
              type="text"
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
              placeholder="ระบุหมายเลขคำขอ (เช่น MR-20241212-001)"
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-primary-400 focus:ring-4 focus:ring-primary-100 focus:outline-none transition-all duration-200"
            />
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white font-semibold px-8 py-4 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-medium hover:shadow-strong hover:scale-[1.02] active:scale-[0.98]"
          >
            <Search className="w-5 h-5" />
            <span className="hidden sm:inline">ค้นหา</span>
          </button>
        </div>
      </form>

      {/* Not Found Message */}
      {notFound && (
        <div className="p-5 bg-gradient-to-r from-warning-50 to-warning-100 border-2 border-warning-300 rounded-xl flex items-center gap-3 text-warning-800 animate-scale-in shadow-soft">
          <div className="bg-warning-500 p-2 rounded-full">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold">ไม่พบข้อมูล</p>
            <p className="text-sm">ไม่พบคำขอหมายเลข "{requestId}" กรุณาตรวจสอบหมายเลขอีกครั้ง</p>
          </div>
        </div>
      )}

      {/* Search Result */}
      {searchResult && (
        <div className="border-2 border-gray-200 rounded-2xl p-8 space-y-6 bg-gradient-to-br from-white to-gray-50 animate-scale-in shadow-medium">
          <div className="flex items-center justify-between pb-4 border-b-2 border-gray-200">
            <div>
              <p className="text-sm text-gray-500 mb-1">หมายเลขคำขอ</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {searchResult.id}
              </h3>
            </div>
            <StatusBadge status={searchResult.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">ผู้แจ้ง</p>
              <p className="font-medium text-gray-800">{searchResult.requesterName}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">แผนก</p>
              <p className="font-medium text-gray-800">
                {THAI_TEXT.department[searchResult.department]}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">อุปกรณ์</p>
              <p className="font-medium text-gray-800">{searchResult.equipment}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">ความเร่งด่วน</p>
              <UrgencyIndicator urgency={searchResult.urgency} />
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">รายละเอียดปัญหา</p>
            <p className="text-gray-800">{searchResult.description}</p>
          </div>

          {searchResult.imageUrl && (
            <div>
              <p className="text-sm text-gray-500 mb-2">รูปภาพประกอบ</p>
              <img
                src={searchResult.imageUrl}
                alt="Request"
                className="max-h-64 rounded-lg border border-gray-200"
              />
            </div>
          )}

          {searchResult.assignedTechnician && (
            <div>
              <p className="text-sm text-gray-500">ช่างผู้รับผิดชอบ</p>
              <p className="font-medium text-gray-800">{searchResult.assignedTechnician}</p>
            </div>
          )}

          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">วันที่แจ้ง: </span>
                <span className="text-gray-700">{formatDate(searchResult.createdAt)}</span>
              </div>
              {searchResult.completedAt && (
                <div>
                  <span className="text-gray-500">วันที่เสร็จสิ้น: </span>
                  <span className="text-gray-700">{formatDate(searchResult.completedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status Description */}
          <div className={`p-5 rounded-xl border-2 ${
            searchResult.status === 'pending'
              ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300'
              : searchResult.status === 'in_progress'
              ? 'bg-gradient-to-r from-primary-50 to-primary-100 border-primary-300'
              : 'bg-gradient-to-r from-success-50 to-success-100 border-success-300'
          }`}>
            <p className="font-semibold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">
                {searchResult.status === 'pending' && '📋'}
                {searchResult.status === 'in_progress' && '🔧'}
                {searchResult.status === 'completed' && '✅'}
              </span>
              <span>
                {searchResult.status === 'pending' && 'คำขอของคุณอยู่ระหว่างรอดำเนินการ'}
                {searchResult.status === 'in_progress' && 'กำลังดำเนินการซ่อมแซม'}
                {searchResult.status === 'completed' && 'ดำเนินการเสร็จสิ้นแล้ว'}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
