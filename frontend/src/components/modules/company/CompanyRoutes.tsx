/**
 * @author Ananthapadmanabhan V K
 * Company routes for the application
 * This file contains the company routes for the application
 * @returns CompanyRoutes component with Routes, Route, Navigate
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import CompanyDashboard, { CompanyOverview } from './CompanyDashboard/CompanyDashboard';
import CompanyClientsList from './CompanyClientsList/CompanyClientsList';
import CompanyClientOverview from './CompanyClientsList/CompanyClientOverview';
import CompanyClientTransactions from './CompanyClientsList/CompanyClientTransactions';
import CompanyClientCreate from './CompanyClientsList/CompanyClientCreate';
import CompanyClientInvoiceList from './CompanyClientsList/CompanyClientInvoiceList';
import ClientPaymentPage from './ClientPayment/ClientPayment';
import CompanyClientTypes from './CompanyClientTypes/CompanyClientTypes';
import CompanyProjectTypes from './CompanyProjectTypes/CompanyProjectTypes';
import CompanyProjectCategories from './CompanyProjectCategories/CompanyProjectCategories';
import CompanyEmployeesList from './CompanyEmployeesList/CompanyEmployeesList';
import CompanyAssignRolesList from './CompanyAssignRolesList/CompanyAssignRolesList';
import CompanyProjectsList from './CompanyProjectsList/CompanyProjectsList';
import CompanyProjectOverview from './CompanyProjectsList/CompanyProjectOverview';
import CompanyTaskList from './CompanyTaskList/CompanyTaskList';
import CompanyTaskDetail from './CompanyTaskList/CompanyTaskDetail';
import CompanyJobTitles from './CompanyJobTitles/CompanyJobTitles';
import CompanyRolePermissions from './CompanyRolePermissions/CompanyRolePermissions';


const CompanyRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<CompanyDashboard />}>
        <Route index element={<CompanyOverview />} />
        <Route path="dashboard" element={<CompanyOverview />} />
        <Route path="clients" element={<CompanyClientsList />} />
        <Route path="clients/:clientId/overview" element={<CompanyClientOverview />} />
        <Route path="clients/:clientId/transactions" element={<CompanyClientTransactions />} />
        <Route path="clients/create" element={<CompanyClientCreate />} />
        <Route path="clients/update" element={<Navigate to="/company/clients/create" replace />} />
        <Route path="clients/invoices" element={<CompanyClientInvoiceList />} />
        <Route path="clients/types" element={<CompanyClientTypes />} />
        <Route path="employees" element={<CompanyEmployeesList />} />
        <Route path="employees/job-titles" element={<CompanyJobTitles />} />
        <Route path="employees/role-permissions" element={<CompanyRolePermissions />} />
        <Route path="staffs/assignRoles" element={<CompanyAssignRolesList />} />
        <Route path="projects" element={<CompanyProjectsList />} />
        <Route path="projects/:projectId/overview" element={<CompanyProjectOverview />} />
        <Route path="projects/tasks" element={<CompanyTaskList />} />
        <Route path="projects/tasks/:taskId" element={<CompanyTaskDetail />} />
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
