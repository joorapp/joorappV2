import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../components/auth/Login/Login';
import CompanyRoutes from '../components/modules/company/CompanyRoutes';
import SuperAdminRoutes from '../components/modules/superadmin/SuperAdminRoutes';
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'superadmin' | 'company';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, hasRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If user is authenticated (has accessToken), redirect to appropriate dashboard
  if (isAuthenticated) {
    if (user?.role === 'superadmin') {
      return <Navigate to="/superadmin" replace />;
    } else if (user?.role === 'company') {
      return <Navigate to="/company" replace />;
    } else {
      // Fallback: check localStorage for accessToken as additional check
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        // If token exists but role is not set, default to company
        return <Navigate to="/company" replace />;
      }
    }
  }

  return <>{children}</>;
};

const Unauthorized = () => {
  return (
    <div className="unauthorized">
      <div className="unauthorized__container">
        <h1>403 - Unauthorized</h1>
        <p>You don't have permission to access this page.</p>
        <button onClick={() => window.history.back()}>Go Back</button>
      </div>
    </div>
  );
};

const CommonRoutes = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Module Entrypoints */}
      <Route
        path="/company/*"
        element={
          <ProtectedRoute requiredRole="company">
            <CompanyRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/superadmin/*"
        element={
          <ProtectedRoute requiredRole="superadmin">
            <SuperAdminRoutes />
          </ProtectedRoute>
        }
      />

      {/* Root redirect based on auth */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            user?.role === 'superadmin' ? (
              <Navigate to="/superadmin" replace />
            ) : user?.role === 'company' ? (
              <Navigate to="/company" replace />
            ) : (
              <Navigate to="/company" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default CommonRoutes;


