import React, { useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import SimpleBar from 'simplebar-react';
import { MetisMenu } from 'metismenujs';
import 'simplebar-react/dist/simplebar.min.css';
import logo from '../../../../assets/images/Icon.png';
import logoDark from '../../../../assets/images/Logo.png';
import logoLightSvg from '../../../../assets/images/Icon.png';
import logoLightPng from '../../../../assets/images/Icon.png';

interface SuperAdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

// Utility functions moved outside component to prevent recreation
function scrollElement(item: HTMLElement) {
  if (item) {
    const currentPosition = item.offsetTop;
    if (currentPosition > window.innerHeight) {
      const sidebarMenu = document.getElementById("sidebar-menu");
      if (sidebarMenu) {
        sidebarMenu.scrollTop = currentPosition - 300;
      }
    }
  }
}

function removeActivation(items: HTMLCollectionOf<HTMLAnchorElement>) {
  for (var i = 0; i < items.length; ++i) {
    var item = items[i];
    const parent = items[i].parentElement;

    if (item && item.classList.contains("active")) {
      item.classList.remove("active");
    }
    if (parent) {
      const parent2El =
        parent.childNodes && parent.childNodes.length && parent.childNodes[1]
          ? parent.childNodes[1]
          : null;
      if (parent2El && (parent2El as HTMLElement).id !== "side-menu") {
        (parent2El as HTMLElement).classList.remove("mm-show");
      }

      parent.classList.remove("mm-active");
      const parent2 = parent.parentElement;

      if (parent2) {
        parent2.classList.remove("mm-show");

        const parent3 = parent2.parentElement;
        if (parent3) {
          parent3.classList.remove("mm-active"); // li
          (parent3.childNodes[0] as HTMLElement).classList.remove("mm-active");

          const parent4 = parent3.parentElement; // ul
          if (parent4) {
            parent4.classList.remove("mm-show"); // ul
            const parent5 = parent4.parentElement;
            if (parent5) {
              parent5.classList.remove("mm-show"); // li
              (parent5.childNodes[0] as HTMLElement).classList.remove("mm-active"); // a tag
            }
          }
        }
      }
    }
  }
}

const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({ isOpen = true, onClose }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleItemClick = () => {
    if (window.innerWidth <= 768 && onClose) {
      onClose();
    }
  };

  const activateParentDropdown = useCallback((item: HTMLElement) => {
    item.classList.add("active");
    const parent = item.parentElement;
    if (!parent) return;
    const parent2El = parent.childNodes[1] as HTMLElement;
    if (parent2El && parent2El.id !== "side-menu") {
      parent2El.classList.add("mm-show");
    }

    if (parent) {
      parent.classList.add("mm-active");
      const parent2 = parent.parentElement;

      if (parent2) {
        parent2.classList.add("mm-show"); // ul tag

        const parent3 = parent2.parentElement; // li tag

        if (parent3) {
          parent3.classList.add("mm-active"); // li
          (parent3.childNodes[0] as HTMLElement).classList.add("mm-active"); //a
          const parent4 = parent3.parentElement; // ul
          if (parent4) {
            parent4.classList.add("mm-show"); // ul
            const parent5 = parent4.parentElement;
            if (parent5) {
              parent5.classList.add("mm-show"); // li
              (parent5.childNodes[0] as HTMLElement).classList.add("mm-active"); // a tag
            }
          }
        }
      }
      scrollElement(item);
      return false;
    }
    scrollElement(item);
    return false;
  }, []);

  const activeMenu = useCallback(() => {
    const pathName = location.pathname;
    let matchingMenuItem = null;
    const ul = document.getElementById("side-menu");
    if (!ul) return;
    const items = ul.getElementsByTagName("a") as HTMLCollectionOf<HTMLAnchorElement>;
    removeActivation(items);

    for (let i = 0; i < items.length; ++i) {
      if (pathName === items[i].pathname) {
        matchingMenuItem = items[i];
        break;
      }
    }
    if (matchingMenuItem) {
      activateParentDropdown(matchingMenuItem);
    }
  }, [location.pathname, activateParentDropdown]);

  useEffect(() => {
    const metisMenu = new MetisMenu("#side-menu" as unknown as HTMLElement);
    activeMenu();

    // Cleanup on component unmount
    return () => {
      metisMenu.dispose();
    };
  }, [activeMenu]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    activeMenu();
  }, [activeMenu]);

  return (
    <>
      <div className={`vertical-menu${isOpen ? ' show' : ''}`}>
        <div className="navbar-brand-box">
          <Link to="/" className="logo logo-dark">
            <span className="logo-sm">
              <img src={logo} alt="" height="36" />
            </span>
            <span className="logo-lg">
              <img src={logoDark} alt="" height="52" />
            </span>
          </Link>

          <Link to="/" className="logo logo-light">
            <span className="logo-sm">
              <img src={logoLightSvg} alt="" height="22" />
            </span>
            <span className="logo-lg">
              <img src={logoLightPng} alt="" height="19" />
            </span>
          </Link>
        </div>

        <SimpleBar className="h-100 venu" scrollableNodeProps={{ ref: scrollRef }}>
          <div id="sidebar-menu">
            <ul className="metismenu list-unstyled" id="side-menu">
              <li className="menu-title">{t('Navigation.admin')}</li>
              <li>
                <Link to="/superadmin/dashboard" className=" " onClick={handleItemClick}>
                  <i className="bx bx-home-circle"></i>
                  <span>{t('Navigation.dashboard')} </span>
                </Link>
              </li>

              <li>
                <Link to="/#" className="has-arrow" onClick={handleItemClick}>
                  <i className="bx bx-buildings"></i>
                  <span>{t('Navigation.clients')}</span>
                </Link>
                <ul className="sub-menu" aria-expanded="false">
                  <li>
                    <Link to="/superadmin/NewClient" onClick={handleItemClick}>{t('Navigation.newClients')}</Link>
                  </li>
                  <li>
                    <Link to="/superadmin/ActiveClients" onClick={handleItemClick}>
                      {t('Navigation.activeClients')}
                    </Link>
                  </li>
                </ul>
              </li>

              <li>
                <Link to="/#" className="has-arrow " onClick={handleItemClick}>
                  <i className="bx bxs-user-detail"></i>
                  <span>{t('Navigation.contacts')}</span>
                </Link>
                <ul className="sub-menu" aria-expanded="false">
                  <li>
                    <Link to="/contacts-grid" onClick={handleItemClick}>{t('Navigation.userGrid')}</Link>
                  </li>
                  <li>
                    <Link to="/contacts-list" onClick={handleItemClick}>{t('Navigation.userList')}</Link>
                  </li>
                  <li>
                    <Link to="/contacts-profile" onClick={handleItemClick}>{t('Navigation.profile')}</Link>
                  </li>
                </ul>
              </li>

              <li>
                <Link to="/AdminReports" onClick={handleItemClick}>
                  <i className="bx bx-file"></i>
                  <span>{t('Navigation.report')}</span>
                </Link>
              </li>
              <li>
                <Link to="/superadmin/UserList" onClick={handleItemClick}>
                  <i className="bx bx-user"></i>
                  <span>{t('Navigation.userLists')}</span>
                </Link>
              </li>
              <li>
                <Link to="/superadmin/Loglist" onClick={handleItemClick}>
                  <i className='bx bx-layer'    ></i>
                  <span>{t('Navigation.log')}</span>
                </Link>
              </li>

            </ul>
          </div>
        </SimpleBar>
      </div>
      
    </>
  );
};

export default SuperAdminSidebar;
