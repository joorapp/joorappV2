import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../context/AuthContext';
import SuperAdminHeader from '../SuperAdminHeader/SuperAdminHeader';
import SuperAdminSidebar from '../SuperAdminSidebar/SuperAdminSidebar';
import SuperAdminFooter from '../SuperAdminFooter/SuperAdminFooter';
import './SuperAdminDashboard.scss';

// Placeholder components for superadmin pages
export const SuperAdminOverview = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="superadmin-overview">
      <div className="superadmin-overview__header">
        <h2 className="superadmin-overview__title">{t('Dashboard.welcome')}, {user?.name}!</h2>
        <p className="superadmin-overview__subtitle">{t('Dashboard.superAdmin')} {t('Dashboard.overview')}</p>
      </div>

      <div className="superadmin-overview__stats">
        <div className="superadmin-overview__stat-card">
          <div className="superadmin-overview__stat-icon">👥</div>
          <div className="superadmin-overview__stat-content">
            <h3 className="superadmin-overview__stat-number">1,247</h3>
            <p className="superadmin-overview__stat-label">{t('Dashboard.totalUsers')}</p>
          </div>
        </div>

        <div className="superadmin-overview__stat-card">
          <div className="superadmin-overview__stat-icon">🏢</div>
          <div className="superadmin-overview__stat-content">
            <h3 className="superadmin-overview__stat-number">89</h3>
            <p className="superadmin-overview__stat-label">{t('Dashboard.companies')}</p>
          </div>
        </div>

        <div className="superadmin-overview__stat-card">
          <div className="superadmin-overview__stat-icon">💰</div>
          <div className="superadmin-overview__stat-content">
            <h3 className="superadmin-overview__stat-number">€2.4M</h3>
            <p className="superadmin-overview__stat-label">{t('Dashboard.totalRevenue')}</p>
          </div>
        </div>

        <div className="superadmin-overview__stat-card">
          <div className="superadmin-overview__stat-icon">📈</div>
          <div className="superadmin-overview__stat-content">
            <h3 className="superadmin-overview__stat-number">+18%</h3>
            <p className="superadmin-overview__stat-label">{t('Dashboard.growthRate')}</p>
          </div>
        </div>
      </div>

      <div className="superadmin-overview__content">
        <div className="superadmin-overview__recent-activity">
          <h3 className="superadmin-overview__section-title">{t('Dashboard.recentSystemActivity')}</h3>
          <div className="superadmin-overview__activity-list">
            <div className="superadmin-overview__activity-item">
              <span className="superadmin-overview__activity-icon">👤</span>
              <div className="superadmin-overview__activity-content">
                <span className="superadmin-overview__activity-text">{t('SuperAdmin.activity.newUserRegistered', { name: 'John Doe' })}</span>
                <span className="superadmin-overview__activity-time">{t('SuperAdmin.activity.minutesAgo', { count: 2 })}</span>
              </div>
            </div>
            <div className="superadmin-overview__activity-item">
              <span className="superadmin-overview__activity-icon">🏢</span>
              <div className="superadmin-overview__activity-content">
                <span className="superadmin-overview__activity-text">{t('SuperAdmin.activity.companyCreated', { name: 'TechCorp' })}</span>
                <span className="superadmin-overview__activity-time">{t('SuperAdmin.activity.minutesAgo', { count: 15 })}</span>
              </div>
            </div>
            <div className="superadmin-overview__activity-item">
              <span className="superadmin-overview__activity-icon">🔒</span>
              <div className="superadmin-overview__activity-content">
                <span className="superadmin-overview__activity-text">{t('SuperAdmin.activity.securityAlert')}</span>
                <span className="superadmin-overview__activity-time">{t('SuperAdmin.activity.hoursAgo', { count: 1 })}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="superadmin-overview__quick-actions">
          <h3 className="superadmin-overview__section-title">{t('Dashboard.quickActions')}</h3>
          <div className="superadmin-overview__actions-grid">
            <button className="superadmin-overview__action-btn">
              <span className="superadmin-overview__action-icon">👥</span>
              <span className="superadmin-overview__action-label">{t('Dashboard.manageUsers')}</span>
            </button>
            <button className="superadmin-overview__action-btn">
              <span className="superadmin-overview__action-icon">🏢</span>
              <span className="superadmin-overview__action-label">{t('Dashboard.manageCompanies')}</span>
            </button>
            <button className="superadmin-overview__action-btn">
              <span className="superadmin-overview__action-icon">📊</span>
              <span className="superadmin-overview__action-label">{t('Dashboard.viewReports')}</span>
            </button>
            <button className="superadmin-overview__action-btn">
              <span className="superadmin-overview__action-icon">⚙️</span>
              <span className="superadmin-overview__action-label">{t('Dashboard.systemSettings')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const UserManagement = () => {
  const { t } = useTranslation();
  return (
    <div className="user-management">
      <h2>{t('Navigation.userManagement')}</h2>
      <p>{t('SuperAdmin.userManagementPage')}</p>
    </div>
  );
};

export const CompanyManagement = () => {
  const { t } = useTranslation();
  return (
    <div className="company-management">
      <h2>{t('Navigation.companyManagement')}</h2>
      <p>{t('SuperAdmin.companyManagementPage')}</p>
    </div>
  );
};

export const Reports = () => {
  const { t } = useTranslation();
  return (
    <div className="reports">
      <h2>{t('Navigation.reports')}</h2>
      <p>{t('SuperAdmin.reportsPage')}</p>
    </div>
  );
};

export const SystemSettings = () => {
  const { t } = useTranslation();
  return (
    <div className="system-settings">
      <h2>{t('Dashboard.systemSettings')}</h2>
      <p>{t('SuperAdmin.systemSettingsPage')}</p>
    </div>
  );
};

export const AuditLogs = () => {
  const { t } = useTranslation();
  return (
    <div className="audit-logs">
      <h2>{t('SuperAdmin.auditLogs')}</h2>
      <p>{t('SuperAdmin.auditLogsPage')}</p>
    </div>
  );
};

export const SuperAdminProfile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="superadmin-profile">
      <h2 className="superadmin-profile__title">{t('Navigation.profile')}</h2>
      <div className="superadmin-profile__content">
        <div className="superadmin-profile__info">
          <h3>{t('SuperAdmin.information.superAdminInformation')}</h3>
          <p>{t('SuperAdmin.information.userID')} {user?.id}</p>
          <p>{t('SuperAdmin.information.name')} {user?.name}</p>
          <p>{t('SuperAdmin.information.email')} {user?.email}</p>
          <p>{t('SuperAdmin.information.role')} {user?.role}</p>
        </div>
        {/* TODO: Add profile editing form */}
      </div>
    </div>
  );
};

const SuperAdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="superadmin-dashboard">
      <SuperAdminHeader onMenuClick={toggleSidebar} />
      
      <div className="superadmin-dashboard__layout">
        <SuperAdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="superadmin-dashboard__main">
          <div className="superadmin-dashboard__content">
            <Outlet />
          </div>
          
          <SuperAdminFooter />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
