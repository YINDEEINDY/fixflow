import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  MapPin,
  Calendar,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { useRequestStore } from '../stores/request.store';
import { useAuthStore } from '../stores/auth.store';
import type { Request } from '../types/index';

const statusColors: Record<string, string> = {
  assigned: 'bg-blue-100 text-blue-800',
  accepted: 'bg-indigo-100 text-indigo-800',
  in_progress: 'bg-purple-100 text-purple-800',
  on_hold: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  assigned: 'รอรับงาน',
  accepted: 'รับงานแล้ว',
  in_progress: 'กำลังดำเนินการ',
  on_hold: 'รอดำเนินการ',
  completed: 'เสร็จสิ้น',
  rejected: 'ปฏิเสธ',
};

const priorityColors: Record<string, string> = {
  low: 'text-gray-500',
  normal: 'text-blue-500',
  high: 'text-orange-500',
  urgent: 'text-red-500',
};

type TabType = 'pending' | 'active' | 'completed';

export default function TechnicianJobs() {
  const { user } = useAuthStore();
  const { requests, isLoading, fetchRequests } = useRequestStore();
  const [activeTab, setActiveTab] = useState<TabType>('pending');

  useEffect(() => {
    // Fetch all requests - will filter on frontend based on technician
    fetchRequests({ limit: 100 });
  }, [fetchRequests]);

  // Filter requests for current technician
  const myJobs = requests.filter(
    (r) => r.technician?.user.id === user?.id
  );

  const pendingJobs = myJobs.filter((r) => r.status === 'assigned');
  const activeJobs = myJobs.filter((r) =>
    ['accepted', 'in_progress', 'on_hold'].includes(r.status)
  );
  const completedJobs = myJobs.filter((r) =>
    ['completed', 'rejected'].includes(r.status)
  );

  const getJobsByTab = (): Request[] => {
    switch (activeTab) {
      case 'pending':
        return pendingJobs;
      case 'active':
        return activeJobs;
      case 'completed':
        return completedJobs;
      default:
        return [];
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const tabs = [
    { id: 'pending' as TabType, label: 'รอรับงาน', count: pendingJobs.length, icon: Clock },
    { id: 'active' as TabType, label: 'กำลังทำ', count: activeJobs.length, icon: Play },
    { id: 'completed' as TabType, label: 'เสร็จแล้ว', count: completedJobs.length, icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Wrench className="w-6 h-6" />
          งานของฉัน
        </h1>
        <p className="text-gray-600">จัดการงานซ่อมที่ได้รับมอบหมาย</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{pendingJobs.length}</p>
            <p className="text-sm text-gray-500">รอรับงาน</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">{activeJobs.length}</p>
            <p className="text-sm text-gray-500">กำลังทำ</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{completedJobs.length}</p>
            <p className="text-sm text-gray-500">เสร็จแล้ว</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Job List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-600">กำลังโหลด...</p>
        </div>
      ) : getJobsByTab().length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {activeTab === 'pending' && 'ไม่มีงานที่รอรับ'}
              {activeTab === 'active' && 'ไม่มีงานที่กำลังทำ'}
              {activeTab === 'completed' && 'ยังไม่มีงานที่เสร็จ'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {getJobsByTab().map((job) => (
            <Link key={job.id} to={`/requests/${job.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-500">
                          {job.requestNumber}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[job.status]
                          }`}
                        >
                          {statusLabels[job.status]}
                        </span>
                        <AlertTriangle
                          className={`w-4 h-4 ${priorityColors[job.priority]}`}
                        />
                      </div>
                      <h3 className="font-medium text-gray-900">{job.title}</h3>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location.building}
                          {job.location.room && ` ห้อง ${job.location.room}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(job.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        ผู้แจ้ง: {job.user.name}
                      </p>
                    </div>
                    {activeTab === 'pending' && (
                      <Button size="sm">รับงาน</Button>
                    )}
                    {activeTab === 'active' && job.status === 'accepted' && (
                      <Button size="sm">เริ่มงาน</Button>
                    )}
                    {activeTab === 'active' && job.status === 'in_progress' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        เสร็จงาน
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
