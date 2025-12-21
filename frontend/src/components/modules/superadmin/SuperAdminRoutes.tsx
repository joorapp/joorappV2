import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SuperAdminDashboard, {
  SuperAdminOverview,
  UserManagement,
  CompanyManagement,
  Reports,
  SystemSettings,
  AuditLogs,
  SuperAdminProfile,
} from './SuperAdminDashboard/SuperAdminDashboard';

const SuperAdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<SuperAdminDashboard />}>        
        <Route index element={<SuperAdminOverview />} />
        <Route path="dashboard" element={<SuperAdminOverview />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="companies" element={<CompanyManagement />} />
        <Route path="reports" element={<Reports />} />
        <Route path="system" element={<SystemSettings />} />
        <Route path="audit" element={<AuditLogs />} />
        <Route path="profile" element={<SuperAdminProfile />} />
        {/* Fallback inside superadmin */}
        <Route path="*" element={<Navigate to="/superadmin" replace />} />
      </Route>
    </Routes>
  );
};

export default SuperAdminRoutes;