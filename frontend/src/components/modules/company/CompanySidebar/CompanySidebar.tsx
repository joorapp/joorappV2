import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import './CompanySidebar.scss';

interface CompanySidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const CompanySidebar: React.FC<CompanySidebarProps> = ({ isOpen = true, onClose }) => {
  const { t } = useTranslation();

  const navigationItems = [
    {
      path: '/company/dashboard',
      label: t('Navigation.dashboard'),
      icon: '📊',
    },
    {
      path: '/company/profile',
      label: t('Navigation.profile'),
      icon: '👤',
    },
    {
      path: '/company/orders',
      label: 'Orders',
      icon: '📦',
    },
    {
      path: '/company/products',
      label: 'Products',
      icon: '🛍️',
    },
    {
      path: '/company/customers',
      label: 'Customers',
      icon: '👥',
    },
    {
      path: '/company/analytics',
      label: 'Analytics',
      icon: '📈',
    },
    {
      path: '/company/settings',
      label: t('Navigation.settings'),
      icon: '⚙️',
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
          className="company-sidebar__overlay" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      <aside className={`company-sidebar ${isOpen ? 'company-sidebar--open' : 'company-sidebar--closed'}`}>
        <div className="company-sidebar__header">
          <h2 className="company-sidebar__title">Company Portal</h2>
          {onClose && (
            <button 
              className="company-sidebar__close-btn"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              ✕
            </button>
          )}
        </div>

        <nav className="company-sidebar__nav">
          <ul className="company-sidebar__nav-list">
            {navigationItems.map((item) => (
              <li key={item.path} className="company-sidebar__nav-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `company-sidebar__nav-link ${isActive ? 'company-sidebar__nav-link--active' : ''}`
                  }
                  onClick={handleItemClick}
                >
                  <span className="company-sidebar__nav-icon">{item.icon}</span>
                  <span className="company-sidebar__nav-label">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="company-sidebar__footer">
          <div className="company-sidebar__quick-actions">
            <h3 className="company-sidebar__quick-title">Quick Actions</h3>
            <div className="company-sidebar__quick-buttons">
              <button className="company-sidebar__quick-btn">
                <span>➕</span>
                New Order
              </button>
              <button className="company-sidebar__quick-btn">
                <span>📊</span>
                View Reports
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default CompanySidebar;
