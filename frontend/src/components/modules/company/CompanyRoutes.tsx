/**
 * @author Ananthapadmanabhan V K
 * Company routes for the application
 * This file contains the company routes for the application
 * @returns CompanyRoutes component with Routes, Route, Navigate
 */

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
import CompanyClientsList from './CompanyClientsList/CompanyClientsList';
import ClientPaymentPage from './ClientPayment/ClientPayment';

const CompanyRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<CompanyDashboard />}>
        <Route index element={<CompanyOverview />} />
        <Route path="dashboard" element={<CompanyOverview />} />
        <Route path="clients" element={<CompanyClientsList />} />
        <Route path="clients/payments" element={<ClientPaymentPage />} />
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
