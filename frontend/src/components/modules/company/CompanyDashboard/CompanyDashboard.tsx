import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../context/AuthContext';
import CompanyHeader from '../CompanyHeader/CompanyHeader';
import CompanySidebar from '../CompanySidebar/CompanySidebar';
import CompanyFooter from '../CompanyFooter/CompanyFooter';
import './CompanyDashboard.scss';

// Placeholder components for company pages
export const CompanyOverview = () => {
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
            <p className="company-overview__stat-label">{t('Dashboard.totalOrders')}</p>
          </div>
        </div>

        <div className="company-overview__stat-card">
          <div className="company-overview__stat-icon">💰</div>
          <div className="company-overview__stat-content">
            <h3 className="company-overview__stat-number">€24,580</h3>
            <p className="company-overview__stat-label">{t('Dashboard.revenue')}</p>
          </div>
        </div>

        <div className="company-overview__stat-card">
          <div className="company-overview__stat-icon">👥</div>
          <div className="company-overview__stat-content">
            <h3 className="company-overview__stat-number">89</h3>
            <p className="company-overview__stat-label">{t('Dashboard.customers')}</p>
          </div>
        </div>

        <div className="company-overview__stat-card">
          <div className="company-overview__stat-icon">📈</div>
          <div className="company-overview__stat-content">
            <h3 className="company-overview__stat-number">+12%</h3>
            <p className="company-overview__stat-label">{t('Dashboard.growth')}</p>
          </div>
        </div>
      </div>

      <div className="company-overview__content">
        <div className="company-overview__recent-orders">
          <h3 className="company-overview__section-title">{t('Dashboard.recentOrders')}</h3>
          <div className="company-overview__orders-list">
            <div className="company-overview__order-item">
              <span className="company-overview__order-id">#ORD-001</span>
              <span className="company-overview__order-customer">John Doe</span>
              <span className="company-overview__order-amount">€125.00</span>
              <span className="company-overview__order-status">{t('Company.orders.completed')}</span>
            </div>
            <div className="company-overview__order-item">
              <span className="company-overview__order-id">#ORD-002</span>
              <span className="company-overview__order-customer">Jane Smith</span>
              <span className="company-overview__order-amount">€89.50</span>
              <span className="company-overview__order-status">{t('Company.orders.processing')}</span>
            </div>
            <div className="company-overview__order-item">
              <span className="company-overview__order-id">#ORD-003</span>
              <span className="company-overview__order-customer">Bob Johnson</span>
              <span className="company-overview__order-amount">€245.75</span>
              <span className="company-overview__order-status">{t('Company.orders.shipped')}</span>
            </div>
          </div>
        </div>

        <div className="company-overview__quick-actions">
          <h3 className="company-overview__section-title">{t('Dashboard.quickActions')}</h3>
          <div className="company-overview__actions-grid">
            <button className="company-overview__action-btn">
              <span className="company-overview__action-icon">➕</span>
              <span className="company-overview__action-label">{t('Dashboard.newOrder')}</span>
            </button>
            <button className="company-overview__action-btn">
              <span className="company-overview__action-icon">👤</span>
              <span className="company-overview__action-label">{t('Dashboard.addCustomer')}</span>
            </button>
            <button className="company-overview__action-btn">
              <span className="company-overview__action-icon">📊</span>
              <span className="company-overview__action-label">{t('Dashboard.viewReports')}</span>
            </button>
            <button className="company-overview__action-btn">
              <span className="company-overview__action-icon">⚙️</span>
              <span className="company-overview__action-label">{t('Dashboard.settings')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CompanyProfile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="company-profile">
      <h2 className="company-profile__title">{t('Navigation.profile')}</h2>
      <div className="company-profile__content">
        <div className="company-profile__info">
          <h3>{t('Company.information.companyInformation')}</h3>
          <p>{t('Company.information.companyID')} {user?.companyId}</p>
          <p>{t('Company.information.user')} {user?.name}</p>
          <p>{t('Company.information.email')} {user?.email}</p>
          <p>{t('Company.information.role')} {user?.role}</p>
        </div>
        {/* TODO: Add profile editing form */}
      </div>
    </div>
  );
};

export const CompanyOrders = () => {
  const { t } = useTranslation();
  return (
    <div className="company-orders">
      <h2>{t('Company.orders.ordersManagement')}</h2>
      <p>{t('Company.orders.ordersManagementPage')}</p>
    </div>
  );
};

export const CompanyProducts = () => {
  const { t } = useTranslation();
  return (
    <div className="company-products">
      <h2>{t('Company.products.productsManagement')}</h2>
      <p>{t('Company.products.productsManagementPage')}</p>
    </div>
  );
};

export const CompanyCustomers = () => {
  const { t } = useTranslation();
  return (
    <div className="company-customers">
      <h2>{t('Company.customers.customersManagement')}</h2>
      <p>{t('Company.customers.customersManagementPage')}</p>
    </div>
  );
};

export const CompanyAnalytics = () => {
  const { t } = useTranslation();
  return (
    <div className="company-analytics">
      <h2>{t('Company.analytics.analyticsReports')}</h2>
      <p>{t('Company.analytics.analyticsPage')}</p>
    </div>
  );
};

export const CompanySettings = () => {
  const { t } = useTranslation();
  return (
    <div className="company-settings">
      <h2>{t('Company.settings.companySettings')}</h2>
      <p>{t('Company.settings.settingsPage')}</p>
    </div>
  );
};

const CompanyDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="company-dashboard">
      <CompanyHeader onMenuClick={toggleSidebar} />
      
      <div className="company-dashboard__layout">
        <CompanySidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="company-dashboard__main">
          <div className="company-dashboard__content">
            <Outlet />
          </div>
          
          <CompanyFooter />
        </main>
      </div>
    </div>
  );
};

export default CompanyDashboard;
