import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import './Header.scss';

interface HeaderProps {
  title?: string;
  showUserMenu?: boolean;
  showLanguageSwitcher?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  title = 'Dashboard', 
  showUserMenu = true, 
  showLanguageSwitcher = true 
}) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__left">
          <h1 className="header__title">{title}</h1>
        </div>
        
        <div className="header__right">
          {showLanguageSwitcher && (
            <div className="header__language-switcher">
              <button
                className={`header__language-btn ${i18n.language === 'en' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('en')}
              >
                EN
              </button>
              <button
                className={`header__language-btn ${i18n.language === 'de' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('de')}
              >
                DE
              </button>
            </div>
          )}
          
          {showUserMenu && user && (
            <div className="header__user-menu">
              <div className="header__user-info">
                <span className="header__user-name">{user.name}</span>
                <span className="header__user-role">{t(`Roles.${user.role}`)}</span>
              </div>
              <button 
                className="header__logout-btn"
                onClick={handleLogout}
                title={t('Navigation.logout')}
              >
                {t('Navigation.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
