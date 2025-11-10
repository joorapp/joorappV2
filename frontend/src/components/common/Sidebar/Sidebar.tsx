import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './Sidebar.scss';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavigationItem {
  path: string;
  label: string;
  icon?: string;
  roles?: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const { t } = useTranslation();
  const { user, hasRole } = useAuth();

  // Define navigation items based on user role
  const getNavigationItems = (): NavigationItem[] => {
    const baseItems: NavigationItem[] = [
      {
        path: '/dashboard',
        label: t('Navigation.dashboard'),
        icon: '📊',
      },
      {
        path: '/profile',
        label: t('Navigation.profile'),
        icon: '👤',
      },
    ];

    if (hasRole('superadmin')) {
      return [
        ...baseItems,
        {
          path: '/users',
          label: t('Navigation.userManagement'),
          icon: '👥',
          roles: ['superadmin'],
        },
        {
          path: '/companies',
          label: t('Navigation.companyManagement'),
          icon: '🏢',
          roles: ['superadmin'],
        },
        {
          path: '/reports',
          label: t('Navigation.reports'),
          icon: '📈',
          roles: ['superadmin'],
        },
      ];
    }

    if (hasRole('company')) {
      return [
        ...baseItems,
        {
          path: '/settings',
          label: t('Navigation.settings'),
          icon: '⚙️',
          roles: ['company'],
        },
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

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
          className="sidebar__overlay" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : 'sidebar--closed'}`}>
        <div className="sidebar__header">
          <h2 className="sidebar__title">
            {hasRole('superadmin') ? 'Super Admin' : 'Company'}
          </h2>
          {onClose && (
            <button 
              className="sidebar__close-btn"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              ✕
            </button>
          )}
        </div>

        <nav className="sidebar__nav">
          <ul className="sidebar__nav-list">
            {navigationItems.map((item) => {
              // Check if user has permission to see this item
              if (item.roles && !item.roles.some(role => hasRole(role as any))) {
                return null;
              }

              return (
                <li key={item.path} className="sidebar__nav-item">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `sidebar__nav-link ${isActive ? 'sidebar__nav-link--active' : ''}`
                    }
                    onClick={handleItemClick}
                  >
                    {item.icon && (
                      <span className="sidebar__nav-icon">{item.icon}</span>
                    )}
                    <span className="sidebar__nav-label">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user-info">
            <span className="sidebar__user-name">{user?.name}</span>
            <span className="sidebar__user-role">{t(`Roles.${user?.role}`)}</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
