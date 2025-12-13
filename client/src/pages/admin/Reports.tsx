import { useEffect, useState } from 'react';
import {
  BarChart3,
  FileText,
  Loader2,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { adminApi, type ReportStats, type MonthlyTrend } from '../../api/admin';
import { getAccessToken } from '../../api/client';

const statusLabels: Record<string, string> = {
  pending: 'รอดำเนินการ',
  assigned: 'มอบหมายแล้ว',
  accepted: 'รับงานแล้ว',
  rejected: 'ปฏิเสธ',
  in_progress: 'กำลังดำเนินการ',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิก',
};

const statusColors: Record<string, string> = {
  pending: '#F59E0B',
  assigned: '#3B82F6',
  accepted: '#8B5CF6',
  rejected: '#EF4444',
  in_progress: '#10B981',
  completed: '#059669',
  cancelled: '#6B7280',
};

const priorityLabels: Record<string, string> = {
  low: 'ต่ำ',
  medium: 'ปานกลาง',
  high: 'สูง',
  urgent: 'เร่งด่วน',
};

const priorityColors: Record<string, string> = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#F97316',
  urgent: '#EF4444',
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function Reports() {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [trend, setTrend] = useState<MonthlyTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, trendRes] = await Promise.all([
        adminApi.reports.getStats(dateRange.startDate || undefined, dateRange.endDate || undefined),
        adminApi.reports.getTrend(6),
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (trendRes.success && trendRes.data) {
        setTrend(trendRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilter = () => {
    fetchData();
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const url = `${API_URL}/export/${format}?${params.toString()}`;
      const token = getAccessToken();

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const filename = `fixflow-report-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`;

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Export error:', err);
      alert('ไม่สามารถส่งออกรายงานได้');
    } finally {
      setIsExporting(false);
    }
  };

  const maxTrendValue = Math.max(...trend.flatMap((t) => [t.created, t.completed]), 1);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            รายงาน
          </h1>
          <p className="text-gray-600">สรุปข้อมูลคำร้องซ่อมในระบบ</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport('excel')}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 mr-2" />
            )}
            Excel
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            PDF
          </Button>
        </div>
      </div>

      {/* Date Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่มต้น</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่สิ้นสุด</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              />
            </div>
            <Button onClick={handleFilter}>กรองข้อมูล</Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">คำร้องทั้งหมด</p>
                <p className="text-2xl font-bold">{stats?.totalRequests || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">เสร็จสิ้น</p>
                <p className="text-2xl font-bold">
                  {stats?.byStatus.find((s) => s.status === 'completed')?.count || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">รอดำเนินการ</p>
                <p className="text-2xl font-bold">
                  {stats?.byStatus.find((s) => s.status === 'pending')?.count || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">เร่งด่วน</p>
                <p className="text-2xl font-bold">
                  {stats?.byPriority.find((p) => p.priority === 'urgent')?.count || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>สถานะคำร้อง</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.byStatus && stats.byStatus.length > 0 ? (
              <div className="space-y-3">
                {stats.byStatus.map((item) => {
                  const percentage = stats.totalRequests > 0
                    ? Math.round((item.count / stats.totalRequests) * 100)
                    : 0;
                  return (
                    <div key={item.status}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {statusLabels[item.status] || item.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {item.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: statusColors[item.status] || '#6B7280',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">ไม่มีข้อมูล</p>
            )}
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>ระดับความเร่งด่วน</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.byPriority && stats.byPriority.length > 0 ? (
              <div className="space-y-3">
                {stats.byPriority.map((item) => {
                  const percentage = stats.totalRequests > 0
                    ? Math.round((item.count / stats.totalRequests) * 100)
                    : 0;
                  return (
                    <div key={item.priority}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {priorityLabels[item.priority] || item.priority}
                        </span>
                        <span className="text-sm text-gray-500">
                          {item.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: priorityColors[item.priority] || '#6B7280',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">ไม่มีข้อมูล</p>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>หมวดหมู่คำร้อง</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.byCategory && stats.byCategory.length > 0 ? (
              <div className="space-y-3">
                {stats.byCategory.map((item, index) => {
                  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
                  const percentage = stats.totalRequests > 0
                    ? Math.round((item.count / stats.totalRequests) * 100)
                    : 0;
                  return (
                    <div key={item.categoryId}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{item.category}</span>
                        <span className="text-sm text-gray-500">
                          {item.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: colors[index % colors.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">ไม่มีข้อมูล</p>
            )}
          </CardContent>
        </Card>

        {/* Top Technicians */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              ช่างที่ทำงานมากที่สุด
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.topTechnicians && stats.topTechnicians.length > 0 ? (
              <div className="space-y-4">
                {stats.topTechnicians.map((tech, index) => (
                  <div key={tech.technicianId} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0
                          ? 'bg-yellow-500'
                          : index === 1
                          ? 'bg-gray-400'
                          : index === 2
                          ? 'bg-amber-600'
                          : 'bg-gray-300'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{tech.name}</p>
                      <p className="text-sm text-gray-500">
                        {tech.completedJobs} งานที่เสร็จสิ้น
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">ไม่มีข้อมูล</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            แนวโน้มรายเดือน
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trend.length > 0 ? (
            <div className="space-y-4">
              {/* Legend */}
              <div className="flex items-center gap-6 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded" />
                  <span className="text-sm text-gray-600">คำร้องใหม่</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded" />
                  <span className="text-sm text-gray-600">เสร็จสิ้น</span>
                </div>
              </div>

              {/* Chart */}
              <div className="flex items-end gap-4 h-48 px-4">
                {trend.map((item) => (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex items-end justify-center gap-1 h-40">
                      <div
                        className="w-1/3 bg-blue-500 rounded-t transition-all"
                        style={{
                          height: `${(item.created / maxTrendValue) * 100}%`,
                          minHeight: item.created > 0 ? '8px' : '0',
                        }}
                        title={`คำร้องใหม่: ${item.created}`}
                      />
                      <div
                        className="w-1/3 bg-green-500 rounded-t transition-all"
                        style={{
                          height: `${(item.completed / maxTrendValue) * 100}%`,
                          minHeight: item.completed > 0 ? '8px' : '0',
                        }}
                        title={`เสร็จสิ้น: ${item.completed}`}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{item.month}</span>
                  </div>
                ))}
              </div>

              {/* Numbers */}
              <div className="grid grid-cols-6 gap-4 text-center border-t pt-4">
                {trend.map((item) => (
                  <div key={item.month} className="text-xs">
                    <p className="text-blue-600 font-medium">{item.created}</p>
                    <p className="text-green-600 font-medium">{item.completed}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">ไม่มีข้อมูล</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
