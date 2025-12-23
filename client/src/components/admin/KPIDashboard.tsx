import React, { useEffect, useState } from 'react';
import { ClipboardList, Clock, Settings, TrendingUp } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { apiClient, API_ENDPOINTS } from '../../config/api';

interface KPIMetrics {
  totalRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  averageCompletionTime: number;
}

export const KPIDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<KPIMetrics>({
    totalRequests: 0,
    pendingRequests: 0,
    inProgressRequests: 0,
    averageCompletionTime: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<KPIMetrics>(API_ENDPOINTS.kpiMetrics);
      setMetrics(data);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      console.error('Error fetching KPI metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">{error}</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">สรุปภาพรวม</h2>
        <button
          onClick={fetchMetrics}
          className="text-sm text-primary hover:text-blue-700 flex items-center gap-1"
        >
          <TrendingUp className="w-4 h-4" />
          รีเฟรช
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="คำขอทั้งหมด"
          value={metrics.totalRequests}
          icon={ClipboardList}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
        />

        <StatsCard
          title="รอดำเนินการ"
          value={metrics.pendingRequests}
          icon={Clock}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-50"
        />

        <StatsCard
          title="กำลังดำเนินการ"
          value={metrics.inProgressRequests}
          icon={Settings}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-50"
        />

        <StatsCard
          title="เวลาเฉลี่ยในการแก้ไข"
          value={metrics.averageCompletionTime > 0 ? `${metrics.averageCompletionTime}` : '-'}
          icon={TrendingUp}
          iconColor="text-green-600"
          iconBgColor="bg-green-50"
          subtitle={metrics.averageCompletionTime > 0 ? 'ชั่วโมง' : 'ยังไม่มีข้อมูล'}
        />
      </div>
    </div>
  );
};
