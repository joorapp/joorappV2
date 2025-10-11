import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../context/AuthContext';
import CompanyHeader from '../CompanyHeader/CompanyHeader';
import CompanySidebar from '../CompanySidebar/CompanySidebar';
import CompanyFooter from '../CompanyFooter/CompanyFooter';
import './CompanyDashboard.scss';

// Placeholder components for company pages
const CompanyOverview: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="company-overview">
      <div className="company-overview__header">
        <h2 className="company-overview__title">{t('Dashboard.welcome')}, {user?.name}!</h2>
        <p className="company-overview__subtitle">{t('Dashboard.overview')}</p>
      </div>

      <div className="company-overview__stats">
        <div className="company-overview__stat-card">
          <div className="company-overview__stat-icon">📦</div>
          <div className="company-overview__stat-content">
            <h3 className="company-overview__stat-number">156</h3>
            <p className="company-overview__stat-label">Total Orders</p>
          </div>
        </div>

        <div className="company-overview__stat-card">
          <div className="company-overview__stat-icon">💰</div>
          <div className="company-overview__stat-content">
            <h3 className="company-overview__stat-number">€24,580</h3>
            <p className="company-overview__stat-label">Revenue</p>
          </div>
        </div>

        <div className="company-overview__stat-card">
          <div className="company-overview__stat-icon">👥</div>
          <div className="company-overview__stat-content">
            <h3 className="company-overview__stat-number">89</h3>
            <p className="company-overview__stat-label">Customers</p>
          </div>
        </div>

        <div className="company-overview__stat-card">
          <div className="company-overview__stat-icon">📈</div>
          <div className="company-overview__stat-content">
            <h3 className="company-overview__stat-number">+12%</h3>
            <p className="company-overview__stat-label">Growth</p>
          </div>
        </div>
      </div>

      <div className="company-overview__content">
        <div className="company-overview__recent-orders">
          <h3 className="company-overview__section-title">Recent Orders</h3>
          <div className="company-overview__orders-list">
            <div className="company-overview__order-item">
              <span className="company-overview__order-id">#ORD-001</span>
              <span className="company-overview__order-customer">John Doe</span>
              <span className="company-overview__order-amount">€125.00</span>
              <span className="company-overview__order-status">Completed</span>
            </div>
            <div className="company-overview__order-item">
              <span className="company-overview__order-id">#ORD-002</span>
              <span className="company-overview__order-customer">Jane Smith</span>
              <span className="company-overview__order-amount">€89.50</span>
              <span className="company-overview__order-status">Processing</span>
            </div>
            <div className="company-overview__order-item">
              <span className="company-overview__order-id">#ORD-003</span>
              <span className="company-overview__order-customer">Bob Johnson</span>
              <span className="company-overview__order-amount">€245.75</span>
              <span className="company-overview__order-status">Shipped</span>
            </div>
          </div>
        </div>

        <div className="company-overview__quick-actions">
          <h3 className="company-overview__section-title">Quick Actions</h3>
          <div className="company-overview__actions-grid">
            <button className="company-overview__action-btn">
              <span className="company-overview__action-icon">➕</span>
              <span className="company-overview__action-label">New Order</span>
            </button>
            <button className="company-overview__action-btn">
              <span className="company-overview__action-icon">👤</span>
              <span className="company-overview__action-label">Add Customer</span>
            </button>
            <button className="company-overview__action-btn">
              <span className="company-overview__action-icon">📊</span>
              <span className="company-overview__action-label">View Reports</span>
            </button>
            <button className="company-overview__action-btn">
              <span className="company-overview__action-icon">⚙️</span>
              <span className="company-overview__action-label">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CompanyProfile: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="company-profile">
      <h2 className="company-profile__title">{t('Navigation.profile')}</h2>
      <div className="company-profile__content">
        <div className="company-profile__info">
          <h3>Company Information</h3>
          <p>Company ID: {user?.companyId}</p>
          <p>User: {user?.name}</p>
          <p>Email: {user?.email}</p>
          <p>Role: {user?.role}</p>
        </div>
        {/* TODO: Add profile editing form */}
      </div>
    </div>
  );
};

const CompanyOrders: React.FC = () => {
  return (
    <div className="company-orders">
      <h2>Orders Management</h2>
      <p>Orders management page - TODO: Implement orders functionality</p>
    </div>
  );
};

const CompanyProducts: React.FC = () => {
  return (
    <div className="company-products">
      <h2>Products Management</h2>
      <p>Products management page - TODO: Implement products functionality</p>
    </div>
  );
};

const CompanyCustomers: React.FC = () => {
  return (
    <div className="company-customers">
      <h2>Customers Management</h2>
      <p>Customers management page - TODO: Implement customers functionality</p>
    </div>
  );
};

const CompanyAnalytics: React.FC = () => {
  return (
    <div className="company-analytics">
      <h2>Analytics & Reports</h2>
      <p>Analytics page - TODO: Implement analytics functionality</p>
    </div>
  );
};

const CompanySettings: React.FC = () => {
  return (
    <div className="company-settings">
      <h2>Company Settings</h2>
      <p>Settings page - TODO: Implement settings functionality</p>
    </div>
  );
};

const CompanyDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // For now, always show the overview
  const renderContent = () => {
    return <CompanyOverview />;
  };

  return (
    <div className="company-dashboard">
      <CompanyHeader onMenuClick={toggleSidebar} />
      
      <div className="company-dashboard__layout">
        <CompanySidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="company-dashboard__main">
          <div className="company-dashboard__content">
            {renderContent()}
          </div>
          
          <CompanyFooter />
        </main>
      </div>
    </div>
  );
};

export default CompanyDashboard;
