import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';

type RouteType = 'public' | 'protected' | 'admin' | 'technician';

interface RouteGuardProps {
  children: React.ReactNode;
  type: RouteType;
  redirectTo?: string;
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500 mx-auto" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">กำลังโหลด...</p>
      </div>
    </div>
  );
}

export function RouteGuard({ children, type, redirectTo }: RouteGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  // Show loading while checking auth
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Public routes - redirect to home if already authenticated
  if (type === 'public') {
    if (isAuthenticated) {
      return <Navigate to={redirectTo || '/'} replace />;
    }
    return <>{children}</>;
  }

  // Protected routes - redirect to login if not authenticated
  if (type === 'protected') {
    if (!isAuthenticated) {
      return <Navigate to={redirectTo || '/login'} replace />;
    }
    return <>{children}</>;
  }

  // Admin routes - must be authenticated AND have admin role
  if (type === 'admin') {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    if (user?.role !== 'admin') {
      return <Navigate to={redirectTo || '/'} replace />;
    }
    return <>{children}</>;
  }

  // Technician routes - must be authenticated AND have technician or admin role
  if (type === 'technician') {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    if (user?.role !== 'technician' && user?.role !== 'admin') {
      return <Navigate to={redirectTo || '/'} replace />;
    }
    return <>{children}</>;
  }

  return <>{children}</>;
}

// Convenience components for cleaner usage
export function PublicRoute({ children }: { children: React.ReactNode }) {
  return <RouteGuard type="public">{children}</RouteGuard>;
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <RouteGuard type="protected">{children}</RouteGuard>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  return <RouteGuard type="admin">{children}</RouteGuard>;
}

export function TechnicianRoute({ children }: { children: React.ReactNode }) {
  return <RouteGuard type="technician">{children}</RouteGuard>;
}

export default RouteGuard;
