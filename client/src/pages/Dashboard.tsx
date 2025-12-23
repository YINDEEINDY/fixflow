import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Loader2,
  Star,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useAuthStore } from '../stores/auth.store';
import {
  dashboardApi,
  type UserStats,
  type TechnicianStats,
  type AdminStats,
  type RecentRequest,
} from '../api/dashboard';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-blue-100 text-blue-800',
  accepted: 'bg-indigo-100 text-indigo-800',
  in_progress: 'bg-purple-100 text-purple-800',
  on_hold: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
  rejected: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  pending: 'รอรับเรื่อง',
  assigned: 'มอบหมายแล้ว',
  accepted: 'รับงานแล้ว',
  in_progress: 'กำลังดำเนินการ',
  on_hold: 'รอดำเนินการ',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิก',
  rejected: 'ปฏิเสธ',
};

const priorityColors: Record<string, string> = {
  low: 'text-gray-500',
  normal: 'text-blue-500',
  high: 'text-orange-500',
  urgent: 'text-red-500',
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<UserStats | TechnicianStats | AdminStats | null>(null);
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [statsRes, recentRes] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getRecentRequests(5),
        ]);

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }
        if (recentRes.success && recentRes.data) {
          setRecentRequests(recentRes.data);
        }
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'เมื่อกี้';
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
    if (days < 7) return `${days} วันที่แล้ว`;
    return date.toLocaleDateString('th-TH');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const userStats = stats as UserStats;
  const techStats = stats as TechnicianStats;
  const adminStats = stats as AdminStats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">สวัสดี, {user?.name}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {user?.role === 'admin'
              ? 'ภาพรวมระบบแจ้งซ่อม'
              : user?.role === 'technician'
                ? 'งานของคุณวันนี้'
                : 'จัดการคำร้องแจ้งซ่อมของคุณ'}
          </p>
        </div>
        {user?.role === 'user' && (
          <Link to="/requests/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              แจ้งซ่อมใหม่
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {user?.role === 'user' && stats && (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ทั้งหมด</p>
                    <p className="text-2xl font-bold">{userStats.total}</p>
                  </div>
                  <ClipboardList className="w-8 h-8 text-primary-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">รอดำเนินการ</p>
                    <p className="text-2xl font-bold text-yellow-600">{userStats.pending}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">กำลังดำเนินการ</p>
                    <p className="text-2xl font-bold text-blue-600">{userStats.inProgress}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">เสร็จสิ้น</p>
                    <p className="text-2xl font-bold text-green-600">{userStats.completed}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {user?.role === 'technician' && stats && (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">รอรับงาน</p>
                    <p className="text-2xl font-bold text-yellow-600">{techStats.assigned}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">กำลังทำ</p>
                    <p className="text-2xl font-bold text-blue-600">{techStats.inProgress}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">เสร็จวันนี้</p>
                    <p className="text-2xl font-bold text-green-600">{techStats.completedToday}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">คะแนนเฉลี่ย</p>
                    <p className="text-2xl font-bold">{techStats.rating?.toFixed(1) || '-'}</p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {user?.role === 'admin' && stats && (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">แจ้งวันนี้</p>
                    <p className="text-2xl font-bold">{adminStats.totalToday}</p>
                  </div>
                  <ClipboardList className="w-8 h-8 text-primary-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">รอมอบหมาย</p>
                    <p className="text-2xl font-bold text-yellow-600">{adminStats.pending}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">กำลังดำเนินการ</p>
                    <p className="text-2xl font-bold text-blue-600">{adminStats.inProgress}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">เวลาเฉลี่ย</p>
                    <p className="text-2xl font-bold">{adminStats.avgResolutionTime}</p>
                  </div>
                  <Clock className="w-8 h-8 text-gray-500" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Recent Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>รายการล่าสุด</CardTitle>
          <Link to="/requests" className="text-sm text-primary-600 hover:text-primary-500">
            ดูทั้งหมด
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {recentRequests.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              ยังไม่มีรายการแจ้งซ่อม
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentRequests.map((request) => (
                <Link
                  key={request.id}
                  to={`/requests/${request.id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {request.requestNumber}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          statusColors[request.status]
                        }`}
                      >
                        {statusLabels[request.status]}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {request.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {request.category} • {formatTime(request.createdAt)}
                    </p>
                  </div>
                  <AlertTriangle className={`w-5 h-5 ${priorityColors[request.priority]}`} />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
