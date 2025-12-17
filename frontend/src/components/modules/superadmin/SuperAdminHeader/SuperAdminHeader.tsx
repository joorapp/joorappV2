import React from 'react';
import { useTranslation } from 'react-i18next';
import NotificationDropdown from '../../../common/NotificationDropdown/NotificationDropdown';
import ProfileMenu from '../../../common/ProfileMenu/ProfileMenu';
import LanguageDropdown from '../../../common/LanguageDropdown/LanguageDropdown';

interface SuperAdminHeaderProps {
  onMenuClick?: () => void;
}

const SuperAdminHeader: React.FC<SuperAdminHeaderProps> = ({ onMenuClick }) => {
  const { t } = useTranslation();

  const toggleLeftmenu = () => {
    document.body.classList.toggle('sidebar-enable');
    onMenuClick?.();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    // <header className="superadmin-header">
    //   <div className="superadmin-header__container">
    //     <div className="superadmin-header__left">
    //       <button 
    //         className="superadmin-header__menu-btn"
    //         onClick={onMenuClick}
    //         aria-label="Toggle menu"
    //       >
    //         ☰
    //       </button>
    //       <div className="superadmin-header__logo">
    //         <span className="superadmin-header__logo-icon">👑</span>
    //         <h1 className="superadmin-header__title">{title} venu</h1>
    //       </div>
    //     </div>
        
    //     <div className="superadmin-header__right">
    //       <div className="superadmin-header__user-info">
    //         <div className="superadmin-header__user-avatar">
    //           <span>{user?.name?.charAt(0).toUpperCase()}</span>
    //         </div>
    //         <div className="superadmin-header__user-details">
    //           <span className="superadmin-header__user-name">{user?.name}</span>
    //           <span className="superadmin-header__user-role">{t(`Roles.${user?.role}`)}</span>
    //         </div>
    //       </div>
          
    //       <div className="superadmin-header__actions">
    //         <button className="superadmin-header__notification-btn" title="Notifications">
    //           🔔
    //         </button>
    //         <button className="superadmin-header__settings-btn" title="Settings">
    //           ⚙️
    //         </button>
    //         <button className="superadmin-header__admin-btn" title="Admin Panel">
    //           🛡️
    //         </button>
    //       </div>
    //     </div>
    //   </div>
    // </header>
    <header id="page-topbar">
    <div className="navbar-header">
      <div className="d-flex">
        <button
          type="button"
          className="btn btn-sm px-3 font-size-16 header-item"
          data-toggle="collapse"
          onClick={() => {
            toggleLeftmenu();
          }}
          data-target="#topnav-menu-content"
        >
          <i className="fa fa-fw fa-bars" />
        </button>

        <form className="app-search d-none d-lg-block">
          <div className="position-relative">
            <input
              type="text"
              className="form-control"
              placeholder={t('Common.searchPlaceholder')}
            />
            <span className="bx bx-search-alt" />
          </div>
        </form>

      </div>

      <div className="d-flex">
        <LanguageDropdown />

        <div className="dropdown d-none d-lg-inline-block ms-1">
          <button
            type="button"
            className="btn header-item noti-icon "
            onClick={() => {
              toggleFullscreen();
            }}
            data-toggle="fullscreen"
          >
            <i className="bx bx-fullscreen" />
          </button>
        </div>

        <NotificationDropdown />

        <ProfileMenu />
        
      </div>
    </div>
  </header>
  );
};

export default SuperAdminHeader;
