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
import UserList from './UserList/UserList';
import SettingsProjectTypes from './Setting/SettingsProjectTypes';
import SettingsProjectCategories from './Setting/SettingsProjectCategories';
import SettingsJobTitles from './Setting/SettingsJobTitles';

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
        {/* <Route path="UserList" element={<UserList />} />   */}
        <Route path="Loglist" element={<LogLists />} />
        <Route path="SubscriptionPlans" element={<SubscriptionPlans />} />
        <Route path="Tickets" element={<Tickets />} />
        <Route path="Profile" element={<Profile />} />
        <Route path="Notifications" element={<NotificationList />} />
        {/* Fallback inside superadmin */}
        <Route path="*" element={<Navigate to="/superadmin" replace />} />
        <Route path="Settings/project-types" element={<SettingsProjectTypes />} />
        <Route path="Settings/project-categories" element={<SettingsProjectCategories />} />
        <Route path="Settings/job-titles" element={<SettingsJobTitles />} />
      </Route>
    </Routes>
  );
};

export default SuperAdminRoutes;