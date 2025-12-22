import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../context/AuthContext';
import './CompanyHeader.scss';

interface CompanyHeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

const CompanyHeader = ({ 
  title = 'Company Dashboard',
  onMenuClick 
}: CompanyHeaderProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <header className="company-header">
      <div className="company-header__container">
        <div className="company-header__left">
          <button 
            className="company-header__menu-btn"
            onClick={onMenuClick}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <div className="company-header__logo">
            <span className="company-header__logo-icon">🏢</span>
            <h1 className="company-header__title">{title}</h1>
          </div>
        </div>
        
        <div className="company-header__right">
          <div className="company-header__user-info">
            <div className="company-header__user-avatar">
              <span>{user?.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="company-header__user-details">
              <span className="company-header__user-name">{user?.name}</span>
              <span className="company-header__user-role">{t(`Roles.${user?.role}`)}</span>
            </div>
          </div>
          
          <div className="company-header__actions">
            <button className="company-header__notification-btn" title="Notifications">
              🔔
            </button>
            <button className="company-header__settings-btn" title="Settings">
              ⚙️
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default CompanyHeader;
