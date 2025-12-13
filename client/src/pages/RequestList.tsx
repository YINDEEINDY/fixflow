import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { useRequestStore } from '../stores/request.store';
import { useAuthStore } from '../stores/auth.store';
import type { RequestStatus, Priority } from '../types/index';

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

const priorityLabels: Record<string, string> = {
  low: 'ต่ำ',
  normal: 'ปกติ',
  high: 'สูง',
  urgent: 'ด่วนมาก',
};

export default function RequestList() {
  const { user } = useAuthStore();
  const {
    requests,
    pagination,
    filters,
    isLoading,
    categories,
    fetchMyRequests,
    fetchRequests,
    fetchCategories,
    setFilters,
    setPage,
  } = useRequestStore();

  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (isAdmin) {
      fetchRequests();
    } else {
      fetchMyRequests();
    }
  }, [isAdmin, fetchRequests, fetchMyRequests, pagination.page, filters]);

  const handleSearch = () => {
    setFilters({ ...filters, search: searchInput || undefined });
  };

  const handleStatusFilter = (status: RequestStatus | undefined) => {
    setFilters({ ...filters, status });
  };

  const handlePriorityFilter = (priority: Priority | undefined) => {
    setFilters({ ...filters, priority });
  };

  const handleCategoryFilter = (categoryId: string | undefined) => {
    setFilters({ ...filters, categoryId });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'รายการแจ้งซ่อมทั้งหมด' : 'รายการแจ้งซ่อมของฉัน'}
          </h1>
          <p className="text-gray-600">
            ทั้งหมด {pagination.total} รายการ
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

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="ค้นหาตามเลขที่หรือหัวข้อ..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button variant="outline" onClick={handleSearch}>
                <Search className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              ตัวกรอง
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  สถานะ
                </label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={filters.status || ''}
                  onChange={(e) =>
                    handleStatusFilter(e.target.value as RequestStatus || undefined)
                  }
                >
                  <option value="">ทั้งหมด</option>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ความเร่งด่วน
                </label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={filters.priority || ''}
                  onChange={(e) =>
                    handlePriorityFilter(e.target.value as Priority || undefined)
                  }
                >
                  <option value="">ทั้งหมด</option>
                  {Object.entries(priorityLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  หมวดหมู่
                </label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={filters.categoryId || ''}
                  onChange={(e) =>
                    handleCategoryFilter(e.target.value || undefined)
                  }
                >
                  <option value="">ทั้งหมด</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameTh}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-600">กำลังโหลด...</p>
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">ไม่พบรายการแจ้งซ่อม</p>
            {user?.role === 'user' && (
              <Link to="/requests/new">
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  แจ้งซ่อมใหม่
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Link key={request.id} to={`/requests/${request.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-500">
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
                      <h3 className="font-medium text-gray-900 truncate">
                        {request.title}
                      </h3>
                      <div className="mt-1 text-sm text-gray-500 space-x-2">
                        <span>{request.category.nameTh}</span>
                        <span>•</span>
                        <span>
                          {request.location.building}
                          {request.location.room && ` ห้อง ${request.location.room}`}
                        </span>
                        <span>•</span>
                        <span>{formatDate(request.createdAt)}</span>
                      </div>
                      {isAdmin && (
                        <div className="mt-1 text-sm text-gray-500">
                          ผู้แจ้ง: {request.user.name}
                          {request.technician && (
                            <span> • ช่าง: {request.technician.user.name}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle
                        className={`w-5 h-5 ${priorityColors[request.priority]}`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => setPage(pagination.page - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-600">
            หน้า {pagination.page} จาก {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPage(pagination.page + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
