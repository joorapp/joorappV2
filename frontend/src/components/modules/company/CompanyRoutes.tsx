/**
 * @author Ananthapadmanabhan V K
 * Company routes for the application
 * This file contains the company routes for the application
 * @returns CompanyRoutes component with Routes, Route, Navigate
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import CompanyDashboard, { CompanyOverview } from './CompanyDashboard/CompanyDashboard';
import CompanyClientsList from './CompanyClientsList/CompanyClientsList';
import ClientPaymentPage from './ClientPayment/ClientPayment';
import CompanyClientTypes from './CompanyClientTypes/CompanyClientTypes';
import CompanyProjectTypes from './CompanyProjectTypes/CompanyProjectTypes';
import CompanyProjectCategories from './CompanyProjectCategories/CompanyProjectCategories';
import CompanyEmployeesList from './CompanyEmployeesList/CompanyEmployeesList';
import CompanyAssignRolesList from './CompanyAssignRolesList/CompanyAssignRolesList';
import CompanyProjectsList from './CompanyProjectsList/CompanyProjectsList';

const CompanyRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<CompanyDashboard />}>
        <Route index element={<CompanyOverview />} />
        <Route path="dashboard" element={<CompanyOverview />} />
        <Route path="clients" element={<CompanyClientsList />} />
        <Route path="clients/types" element={<CompanyClientTypes />} />
        <Route path="employees" element={<CompanyEmployeesList />} />
        <Route path="staffs/assignRoles" element={<CompanyAssignRolesList />} />
        <Route path="projects" element={<CompanyProjectsList />} />
        <Route path="projects/types" element={<CompanyProjectTypes />} />
        <Route path="projects/categories" element={<CompanyProjectCategories />} />
        <Route path="clients/payments" element={<ClientPaymentPage />} />
        {/* Fallback inside company */}
        <Route path="*" element={<Navigate to="/company" replace />} />
      </Route>
    </Routes>
  );
};

export default CompanyRoutes;
