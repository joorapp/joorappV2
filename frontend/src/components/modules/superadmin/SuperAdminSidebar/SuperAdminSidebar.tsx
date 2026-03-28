import React, { useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import SimpleBar from 'simplebar-react';
import MetisMenu from 'metismenujs';
import logo from '../../../../assets/images/Icon.png';
import logoDark from '../../../../assets/images/Logo.png';
import logoLightSvg from '../../../../assets/images/Icon.png';
import logoLightPng from '../../../../assets/images/Icon.png';

  interface SuperAdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const ref = useRef<any>(null);
  const metisMenuRef = useRef<MetisMenu | null>(null);


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

  const removeActivation = (items: HTMLCollectionOf<HTMLAnchorElement>) => {
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
  };

  const activeMenu = useCallback(() => {
    const pathName = location.pathname;
    let matchingMenuItem = null;
    const ul = document.getElementById("side-menu");
    if (!ul) return;
    const items = ul.getElementsByTagName("a") as HTMLCollectionOf<HTMLAnchorElement>;
    removeActivation(items);

    for (let i = 0; i < items.length; ++i) {
      const item = items[i];
      const itemPath = item.getAttribute('href');
      const itemPathname = item.pathname || itemPath;
      
      // Skip placeholder links and parent dropdown links
      if (itemPathname && itemPathname !== '/#' && itemPathname !== '/' && !item.classList.contains('has-arrow')) {
        // Exact match or path starts with the item path
        if (pathName === itemPathname || pathName.startsWith(itemPathname + '/')) {
          matchingMenuItem = item;
          break;
        }
      }
    }
    if (matchingMenuItem) {
      activateParentDropdown(matchingMenuItem);
    }
  }, [location.pathname, activateParentDropdown]);

  useEffect(() => {
    // Initialize MetisMenu only once
    metisMenuRef.current = new MetisMenu("#side-menu" as unknown as HTMLElement);
    activeMenu();

    // Cleanup on component unmount
    return () => {
      if (metisMenuRef.current) {
        metisMenuRef.current.dispose();
        metisMenuRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Update active menu when location changes
    activeMenu();
  }, [location.pathname, activeMenu]);

  function scrollElement(item: HTMLElement) {
    if (item) {
      const currentPosition = item.offsetTop;
      if (currentPosition > window.innerHeight) {
        (document.getElementById("sidebar-menu") as HTMLElement).scrollTop = currentPosition - 300;
      }
    }
  }

  const handleDropdownClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Prevent navigation for dropdown parent links
    const target = e.currentTarget;
    if (target.classList.contains('has-arrow')) {
      e.preventDefault();
      // MetisMenu will handle the toggle automatically
    }
  };




  return (
    <>
      <div className="vertical-menu">
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

        <SimpleBar className="h-100 venu" ref={ref}>
          <div id="sidebar-menu">
            <ul className="metismenu list-unstyled" id="side-menu">
              <li className="menu-title">{t('Navigation.admin')}</li>
              <li>
                <Link to="/superadmin/dashboard" className=" ">
                  <i className="bx bx-home-circle"></i>
                  <span>{t('Navigation.dashboard')} </span>
                </Link>
              </li>

              <li>
                <Link to="/#" className="has-arrow" onClick={handleDropdownClick}>
                  <i className="bx bx-buildings"></i>
                  <span>{t('Navigation.clients')}</span>
                </Link>
                <ul className="sub-menu mm-collapse" aria-expanded="false">
                  <li>
                    <Link to="/superadmin/NewClient">{t('Navigation.newClients')}</Link>
                  </li>
                  <li>
                    <Link to="/superadmin/ActiveClients">
                      {t('Navigation.activeClients')}
                    </Link>
                  </li>
                </ul>
              </li>
              <li>
                <Link to="/AdminReports">
                  <i className="bx bx-file"></i>
                  <span>{t('Navigation.report')}</span>
                </Link>
              </li>
              <li>
                <Link to="/superadmin/UserList">
                  <i className="bx bx-user"></i>
                  <span>{t('Navigation.employeeLists')}</span>
                </Link>
              </li>
              <li>
                <Link to="/#" className="has-arrow" onClick={handleDropdownClick}>
                  <i className='bx bx-user-plus'></i>
                  <span>{t('Navigation.roles')}</span>
                </Link>
                <ul className="sub-menu mm-collapse" aria-expanded="false">
                  <li>
                    <Link to="/superadmin/RolesList">{t('Navigation.rolesList')}</Link>
                  </li>
                  <li>
                    <Link to="/superadmin/RolePermissions">{t('Navigation.rolePermissions')}</Link>
                  </li>
                </ul>
              </li>

              <li>
                <Link to="/superadmin/SubscriptionPlans">
                  <i className='bx bx-calendar'></i>
                  <span>{t('Navigation.subscriptions')}</span>
                </Link>
              </li>
              <li>
                <Link to="/superadmin/Loglist">
                  <i className='bx bx-layer'></i>
                  <span>{t('Navigation.log')}</span>
                </Link>
              </li>
              <li>
                <Link to="/superadmin/Tickets">
                  <i className='bx bx-support'></i>
                  <span>{t('Tickets.title')}</span>
                </Link>
              </li>
              <li>
                <Link to="/superadmin/Notifications">
                  <i className='bx bx-bell'></i>
                  <span>{t('Navigation.notifications')}</span>
                </Link>
              </li>
              <li>
                <Link className="has-arrow" to="/superadmin/Settings">
                  <i className='bx bx-cog'></i>
                  <span>{t('Navigation.settings')}</span>
                </Link>
                <ul className="sub-menu mm-collapse" aria-expanded="false">
                  <li>
                    <Link  to="/superadmin/Settings/project-types">
                      {t('Common.projectTypes')}
                    </Link>
                  </li>
              
                  <li>
                    <Link to="/superadmin/Settings/project-categories">
                      {t('Common.projectCategories')}
                    </Link>
                  </li>
              
                  <li>
                    <Link to="/superadmin/Settings/job-titles">
                      {t('Common.jobTitles')}
                    </Link>
                  </li>
                </ul>
              </li>

            </ul>
          </div>
        </SimpleBar>
      </div>
      
    </>
  );
};

export default SuperAdminSidebar;
 