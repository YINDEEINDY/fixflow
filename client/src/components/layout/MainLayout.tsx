import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Wrench,
  Home,
  FileText,
  LogOut,
  Menu,
  X,
  User,
  ClipboardList,
  BarChart3,
  Users,
  FolderOpen,
  MapPin,
  Settings,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../stores/auth.store';
import { cn } from '../../utils/cn';
import NotificationDropdown from '../NotificationDropdown';
import { ThemeToggle } from '../ThemeToggle';

const navigation = {
  user: [
    { name: 'หน้าหลัก', href: '/', icon: Home },
    { name: 'แจ้งซ่อม', href: '/requests/new', icon: FileText },
    { name: 'รายการแจ้งซ่อม', href: '/requests', icon: ClipboardList },
  ],
  technician: [
    { name: 'หน้าหลัก', href: '/', icon: Home },
    { name: 'งานของฉัน', href: '/jobs', icon: ClipboardList },
    { name: 'รายการทั้งหมด', href: '/requests', icon: FileText },
  ],
  admin: [
    { name: 'หน้าหลัก', href: '/', icon: Home },
    { name: 'รายการแจ้งซ่อม', href: '/requests', icon: ClipboardList },
    { name: 'จัดการผู้ใช้', href: '/admin/users', icon: Users },
    { name: 'หมวดหมู่', href: '/admin/categories', icon: FolderOpen },
    { name: 'สถานที่', href: '/admin/locations', icon: MapPin },
    { name: 'รายงาน', href: '/admin/reports', icon: BarChart3 },
    { name: 'ตั้งค่า', href: '/admin/settings', icon: Settings },
  ],
};

export default function MainLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = user ? navigation[user.role] || navigation.user : navigation.user;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">FixFlow</span>
          </Link>
          <button
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            to="/profile"
            className="flex items-center space-x-3 mb-3 p-2 -m-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full" />
              ) : (
                <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || user?.department}</p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 transition-colors duration-200">
          <div className="flex items-center justify-between h-full px-4">
            <button
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1" />

            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <NotificationDropdown />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
