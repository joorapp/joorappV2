import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../context/AuthContext';
import './SuperAdminHeader.scss';

interface SuperAdminHeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

const SuperAdminHeader: React.FC<SuperAdminHeaderProps> = ({ 
  title = 'Super Admin Dashboard',
  onMenuClick 
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <header className="superadmin-header">
      <div className="superadmin-header__container">
        <div className="superadmin-header__left">
          <button 
            className="superadmin-header__menu-btn"
            onClick={onMenuClick}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <div className="superadmin-header__logo">
            <span className="superadmin-header__logo-icon">👑</span>
            <h1 className="superadmin-header__title">{title}</h1>
          </div>
        </div>
        
        <div className="superadmin-header__right">
          <div className="superadmin-header__user-info">
            <div className="superadmin-header__user-avatar">
              <span>{user?.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="superadmin-header__user-details">
              <span className="superadmin-header__user-name">{user?.name}</span>
              <span className="superadmin-header__user-role">{t(`Roles.${user?.role}`)}</span>
            </div>
          </div>
          
          <div className="superadmin-header__actions">
            <button className="superadmin-header__notification-btn" title="Notifications">
              🔔
            </button>
            <button className="superadmin-header__settings-btn" title="Settings">
              ⚙️
            </button>
            <button className="superadmin-header__admin-btn" title="Admin Panel">
              🛡️
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SuperAdminHeader;
