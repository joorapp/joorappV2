import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CompanyDashboard, {
  CompanyOverview,
  CompanyProfile,
  CompanyOrders,
  CompanyProducts,
  CompanyCustomers,
  CompanyAnalytics,
  CompanySettings,
} from './CompanyDashboard/CompanyDashboard';

const CompanyRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<CompanyDashboard />}>        
        <Route index element={<CompanyOverview />} />
        <Route path="dashboard" element={<CompanyOverview />} />
        <Route path="profile" element={<CompanyProfile />} />
        <Route path="orders" element={<CompanyOrders />} />
        <Route path="products" element={<CompanyProducts />} />
        <Route path="customers" element={<CompanyCustomers />} />
        <Route path="analytics" element={<CompanyAnalytics />} />
        <Route path="settings" element={<CompanySettings />} />
        {/* Fallback inside company */}
        <Route path="*" element={<Navigate to="/company" replace />} />
      </Route>
    </Routes>
  );
};

export default CompanyRoutes;
