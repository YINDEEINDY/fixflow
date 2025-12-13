import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/shared/Header';
import { LoginModal } from '../components/admin/LoginModal';
import { KPIDashboard } from '../components/admin/KPIDashboard';
import { TaskTable } from '../components/admin/TaskTable';
import { FilterSidebar } from '../components/admin/FilterSidebar';
import type { FilterOptions } from '../components/admin/FilterSidebar';
import { useAuth } from '../context/AuthContext';
import { useRequests } from '../context/RequestContext';
import type { MaintenanceRequest } from '../types';
import { THAI_TEXT } from '../constants';

export const AdminPage: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const { requests } = useRequests();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  const [filters, setFilters] = useState<FilterOptions>({
    status: [],
    urgency: [],
    department: [],
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    }
  }, [isAuthenticated]);

  const handleLoginClose = () => {
    if (!isAuthenticated) {
      // If user closes modal without logging in, redirect to home
      navigate('/');
    } else {
      setShowLoginModal(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleResetFilters = () => {
    setFilters({
      status: [],
      urgency: [],
      department: [],
      dateFrom: '',
      dateTo: '',
    });
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((request: MaintenanceRequest) => {
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(request.status)) {
        return false;
      }

      // Urgency filter
      if (filters.urgency.length > 0 && !filters.urgency.includes(request.urgency)) {
        return false;
      }

      // Department filter
      if (filters.department.length > 0 && !filters.department.includes(request.department)) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (request.createdAt < fromDate) {
          return false;
        }
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (request.createdAt > toDate) {
          return false;
        }
      }

      return true;
    });
  }, [requests, filters]);

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              กำลังโหลด...
            </h1>
          </div>
        </div>
        <LoginModal isOpen={showLoginModal} onClose={handleLoginClose} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-60 -right-20 w-96 h-96 bg-secondary-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-success-200/20 rounded-full blur-3xl"></div>
      </div>

      <Header />
      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {THAI_TEXT.admin.dashboardTitle}
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            ออกจากระบบ
          </button>
        </div>

        <div className="space-y-6">
          <KPIDashboard />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <FilterSidebar
                filters={filters}
                onFilterChange={setFilters}
                onReset={handleResetFilters}
              />
            </div>

            <div className="lg:col-span-3">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  รายการคำขอทั้งหมด
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({filteredRequests.length} รายการ)
                  </span>
                </h2>
              </div>
              <TaskTable requests={filteredRequests} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
