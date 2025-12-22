import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import './SuperAdminSidebar.scss';

interface SuperAdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const SuperAdminSidebar = ({ isOpen = true, onClose }: SuperAdminSidebarProps) => {
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
      label: t('SuperAdmin.systemSettings'),
      icon: '⚙️',
    },
    {
      path: '/superadmin/audit',
      label: t('SuperAdmin.auditLogs'),
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
          <h2 className="superadmin-sidebar__title">{t('SuperAdmin.portal')}</h2>
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

<<<<<<< HEAD
              <li>
                <Link to="/#" className="has-arrow" onClick={handleDropdownClick}>
                  <i className="bx bx-buildings"></i>
                  <span>Clients</span>
                </Link>
                <ul className="sub-menu mm-collapse" aria-expanded="false">
                  <li>
                    <Link to="/superadmin/NewClient">New Clients</Link>
                  </li>
                  <li>
                    <Link to="/superadmin/ActiveClients">
                      Active Clients
                    </Link>
                  </li>
                </ul>
              </li>
              

              <li>
                <Link to="/AdminReports">
                  <i className="bx bx-file"></i>
                  <span>Report</span>
                </Link>
              </li>
              <li>
                <Link to="/superadmin/UserList">
                  <i className="bx bx-user"></i>
                  <span>User Lists</span>
                </Link>
              </li>
              <li>
                <Link to="/superadmin/Loglist">
                  <i className='bx bx-layer'    ></i>
                  <span>Log</span>
                </Link>
              </li>
              <li>
                <Link to="/superadmin/Loglist">
                  <i className='bx bx-layer'    ></i>
                  <span>Ticket</span>
                </Link>
              </li>
              <li>
                <Link to="/superadmin/Loglist">
                  <i className='bx bx-layer'    ></i>
                  <span>Create plan</span>
                </Link>
              </li>

            </ul>
=======
        <div className="superadmin-sidebar__footer">
          <div className="superadmin-sidebar__admin-info">
            <div className="superadmin-sidebar__admin-badge">
              <span className="superadmin-sidebar__admin-icon">👑</span>
              <span className="superadmin-sidebar__admin-text">{t('SuperAdmin.superAdmin')}</span>
            </div>
            <div className="superadmin-sidebar__quick-actions">
              <button className="superadmin-sidebar__quick-btn">
                <span>🛡️</span>
                {t('SuperAdmin.security')}
              </button>
              <button className="superadmin-sidebar__quick-btn">
                <span>📊</span>
                {t('SuperAdmin.analytics')}
              </button>
            </div>
>>>>>>> 4f2abcd0cb29ae0ae513945aaf4c8a33169137b0
          </div>
        </div>
      </aside>
    </>
  );
};

export default SuperAdminSidebar;