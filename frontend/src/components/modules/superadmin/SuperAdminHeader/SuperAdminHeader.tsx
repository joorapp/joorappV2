import React from 'react';
import { useTranslation } from 'react-i18next';
import NotificationDropdown from '../../../common/NotificationDropdown/NotificationDropdown';
import ProfileMenu from '../../../common/ProfileMenu/ProfileMenu';
import LanguageDropdown from '../../../common/LanguageDropdown/LanguageDropdown';

interface SuperAdminHeaderProps {
  onMenuClick: () => void;
}

const SuperAdminHeader = ({ 
<<<<<<< Updated upstream
  onMenuClick = () => {}
=======
  title = 'Super Admin Dashboard',
  onMenuClick 
>>>>>>> Stashed changes
}: SuperAdminHeaderProps) => {
  const { t } = useTranslation();

  const toggleLeftmenu = () => {
    onMenuClick?.();
 
    document.body.classList.toggle('vertical-collpsed');
    document.body.classList.toggle('sidebar-enable');
  }
  

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => { });
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
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
