import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../context/AuthContext';
import SuperAdminHeader from '../SuperAdminHeader/SuperAdminHeader';
import SuperAdminSidebar from '../SuperAdminSidebar/SuperAdminSidebar';
import SuperAdminFooter from '../SuperAdminFooter/SuperAdminFooter';
import './SuperAdminDashboard.scss';

// Placeholder components for superadmin pages
export const SuperAdminOverview: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="superadmin-overview">
      <div className="superadmin-overview__header">
        <h2 className="superadmin-overview__title">{t('Dashboard.welcome')}, {user?.name}!</h2>
        <p className="superadmin-overview__subtitle">Super Admin {t('Dashboard.overview')}</p>
      </div>

      <div className="superadmin-overview__stats">
        <div className="superadmin-overview__stat-card">
          <div className="superadmin-overview__stat-icon">👥</div>
          <div className="superadmin-overview__stat-content">
            <h3 className="superadmin-overview__stat-number">1,247</h3>
            <p className="superadmin-overview__stat-label">Total Users</p>
          </div>
        </div>

        <div className="superadmin-overview__stat-card">
          <div className="superadmin-overview__stat-icon">🏢</div>
          <div className="superadmin-overview__stat-content">
            <h3 className="superadmin-overview__stat-number">89</h3>
            <p className="superadmin-overview__stat-label">Companies</p>
          </div>
        </div>

        <div className="superadmin-overview__stat-card">
          <div className="superadmin-overview__stat-icon">💰</div>
          <div className="superadmin-overview__stat-content">
            <h3 className="superadmin-overview__stat-number">€2.4M</h3>
            <p className="superadmin-overview__stat-label">Total Revenue</p>
          </div>
        </div>

        <div className="superadmin-overview__stat-card">
          <div className="superadmin-overview__stat-icon">📈</div>
          <div className="superadmin-overview__stat-content">
            <h3 className="superadmin-overview__stat-number">+18%</h3>
            <p className="superadmin-overview__stat-label">Growth Rate</p>
          </div>
        </div>
      </div>

      <div className="superadmin-overview__content">
        <div className="superadmin-overview__recent-activity">
          <h3 className="superadmin-overview__section-title">Recent System Activity</h3>
          <div className="superadmin-overview__activity-list">
            <div className="superadmin-overview__activity-item">
              <span className="superadmin-overview__activity-icon">👤</span>
              <div className="superadmin-overview__activity-content">
                <span className="superadmin-overview__activity-text">New user registered: John Doe</span>
                <span className="superadmin-overview__activity-time">2 minutes ago</span>
              </div>
            </div>
            <div className="superadmin-overview__activity-item">
              <span className="superadmin-overview__activity-icon">🏢</span>
              <div className="superadmin-overview__activity-content">
                <span className="superadmin-overview__activity-text">Company "TechCorp" created</span>
                <span className="superadmin-overview__activity-time">15 minutes ago</span>
              </div>
            </div>
            <div className="superadmin-overview__activity-item">
              <span className="superadmin-overview__activity-icon">🔒</span>
              <div className="superadmin-overview__activity-content">
                <span className="superadmin-overview__activity-text">Security alert: Failed login attempt</span>
                <span className="superadmin-overview__activity-time">1 hour ago</span>
              </div>
            </div>
          </div>
        </div>

        <div className="superadmin-overview__quick-actions">
          <h3 className="superadmin-overview__section-title">Quick Actions</h3>
          <div className="superadmin-overview__actions-grid">
            <button className="superadmin-overview__action-btn">
              <span className="superadmin-overview__action-icon">👥</span>
              <span className="superadmin-overview__action-label">Manage Users</span>
            </button>
            <button className="superadmin-overview__action-btn">
              <span className="superadmin-overview__action-icon">🏢</span>
              <span className="superadmin-overview__action-label">Manage Companies</span>
            </button>
            <button className="superadmin-overview__action-btn">
              <span className="superadmin-overview__action-icon">📊</span>
              <span className="superadmin-overview__action-label">View Reports</span>
            </button>
            <button className="superadmin-overview__action-btn">
              <span className="superadmin-overview__action-icon">⚙️</span>
              <span className="superadmin-overview__action-label">System Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="user-management">
      <h2>{t('Navigation.userManagement')}</h2>
      <p>User management page - TODO: Implement user management functionality</p>
    </div>
  );
};

export const CompanyManagement: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="company-management">
      <h2>{t('Navigation.companyManagement')}</h2>
      <p>Company management page - TODO: Implement company management functionality</p>
    </div>
  );
};

export const Reports: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="reports">
      <h2>{t('Navigation.reports')}</h2>
      <p>Reports page - TODO: Implement reports functionality</p>
    </div>
  );
};

export const SystemSettings: React.FC = () => {
  return (
    <div className="system-settings">
      <h2>System Settings</h2>
      <p>System settings page - TODO: Implement system settings functionality</p>
    </div>
  );
};

export const AuditLogs: React.FC = () => {
  return (
    <div className="audit-logs">
      <h2>Audit Logs</h2>
      <p>Audit logs page - TODO: Implement audit logs functionality</p>
    </div>
  );
};

export const SuperAdminProfile: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="superadmin-profile">
      <h2 className="superadmin-profile__title">{t('Navigation.profile')}</h2>
      <div className="superadmin-profile__content">
        <div className="superadmin-profile__info">
          <h3>Super Admin Information</h3>
          <p>User ID: {user?.id}</p>
          <p>Name: {user?.name}</p>
          <p>Email: {user?.email}</p>
          <p>Role: {user?.role}</p>
        </div>
        {/* TODO: Add profile editing form */}
      </div>
    </div>
  );
};

const SuperAdminDashboard: React.FC = () => {
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
