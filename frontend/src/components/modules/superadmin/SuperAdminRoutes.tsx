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
  Roles,
  EmployeeLists,
  LogLists,
  SubscriptionPlans,
  RolePermissions,
  Tickets,
  Profile,
  NotificationList,
} from './SuperAdminDashboard/SuperAdminDashboard';

const SuperAdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<SuperAdminDashboard />}>        
        <Route index element={<SuperAdminOverview />} />
        <Route path="dashboard" element={<SuperAdminOverview />} />
        <Route path="NewClient" element={<NewClients />} />
        <Route path="ActiveClients" element={<ActiveClients />} />
        <Route path="RolesList" element={<Roles />} />
        <Route path="RolePermissions" element={<RolePermissions />} />
        <Route path="UserList" element={<EmployeeLists />} />
        <Route path="Loglist" element={<LogLists />} />
        <Route path="SubscriptionPlans" element={<SubscriptionPlans />} />
        <Route path="Tickets" element={<Tickets />} />
        <Route path="Profile" element={<Profile />} />
        <Route path="Notifications" element={<NotificationList />} />
        {/* Fallback inside superadmin */}
        <Route path="*" element={<Navigate to="/superadmin" replace />} />
      </Route>
    </Routes>
  );
};

export default SuperAdminRoutes;