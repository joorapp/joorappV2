import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login/Login';
import CompanyRoutes from './components/modules/company/CompanyRoutes';
import SuperAdminRoutes from './components/modules/superadmin/SuperAdminRoutes';
import './App.scss';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'superadmin' | 'company';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
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

// Unauthorized Component
const Unauthorized: React.FC = () => {
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

// Main App Routes Component
const AppRoutes: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show loading screen while checking authentication
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
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Direct dashboard routes for testing */}
      <Route path="/company" element={<CompanyRoutes />} />
      <Route path="/company/*" element={<CompanyRoutes />} />
      <Route path="/superadmin" element={<SuperAdminRoutes />} />
      <Route path="/superadmin/*" element={<SuperAdminRoutes />} />
      
      {/* Default redirects */}
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
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
