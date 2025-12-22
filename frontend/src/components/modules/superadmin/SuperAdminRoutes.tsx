import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SuperAdminDashboard, {
  SuperAdminOverview,
  // UserManagement,
  // CompanyManagement,
  // Reports,
  // SystemSettings,
  // AuditLogs,
  // SuperAdminProfile,
  NewClients,
  ActiveClients,
  UserList,
} from './SuperAdminDashboard/SuperAdminDashboard';

const SuperAdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<SuperAdminDashboard />}>        
        <Route index element={<SuperAdminOverview />} />
        <Route path="dashboard" element={<SuperAdminOverview />} />
        <Route path="NewClient" element={<NewClients />} />
        <Route path="ActiveClients" element={<ActiveClients />} />
        <Route path="UserList" element={<UserList />} />
        {/* Fallback inside superadmin */}
        <Route path="*" element={<Navigate to="/superadmin" replace />} />
      </Route>
    </Routes>
  );
};

export default SuperAdminRoutes;