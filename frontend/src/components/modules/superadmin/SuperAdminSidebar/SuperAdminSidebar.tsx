import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import './SuperAdminSidebar.scss';

interface SuperAdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({ isOpen = true, onClose }) => {
  const { t } = useTranslation();

  const navigationItems = [
    {
      path: '/superadmin/dashboard',
      label: t('Navigation.dashboard'),
      icon: '📊',
    },
    {
      path: '/superadmin/users',
      label: t('Navigation.userManagement'),
      icon: '👥',
    },
    {
      path: '/superadmin/companies',
      label: t('Navigation.companyManagement'),
      icon: '🏢',
    },
    {
      path: '/superadmin/reports',
      label: t('Navigation.reports'),
      icon: '📈',
    },
    {
      path: '/superadmin/system',
      label: 'System Settings',
      icon: '⚙️',
    },
    {
      path: '/superadmin/audit',
      label: 'Audit Logs',
      icon: '📋',
    },
    {
      path: '/superadmin/profile',
      label: t('Navigation.profile'),
      icon: '👤',
    },
  ];

  const handleItemClick = () => {
    // Close sidebar on mobile when item is clicked
    if (window.innerWidth <= 768 && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="superadmin-sidebar__overlay" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      <aside className={`superadmin-sidebar ${isOpen ? 'superadmin-sidebar--open' : 'superadmin-sidebar--closed'}`}>
        <div className="superadmin-sidebar__header">
          <h2 className="superadmin-sidebar__title">Super Admin Portal</h2>
          {onClose && (
            <button 
              className="superadmin-sidebar__close-btn"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              ✕
            </button>
          )}
        </div>

        <nav className="superadmin-sidebar__nav">
          <ul className="superadmin-sidebar__nav-list">
            {navigationItems.map((item) => (
              <li key={item.path} className="superadmin-sidebar__nav-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `superadmin-sidebar__nav-link ${isActive ? 'superadmin-sidebar__nav-link--active' : ''}`
                  }
                  onClick={handleItemClick}
                >
                  <span className="superadmin-sidebar__nav-icon">{item.icon}</span>
                  <span className="superadmin-sidebar__nav-label">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="superadmin-sidebar__footer">
          <div className="superadmin-sidebar__admin-info">
            <div className="superadmin-sidebar__admin-badge">
              <span className="superadmin-sidebar__admin-icon">👑</span>
              <span className="superadmin-sidebar__admin-text">Super Admin</span>
            </div>
            <div className="superadmin-sidebar__quick-actions">
              <button className="superadmin-sidebar__quick-btn">
                <span>🛡️</span>
                Security
              </button>
              <button className="superadmin-sidebar__quick-btn">
                <span>📊</span>
                Analytics
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SuperAdminSidebar;