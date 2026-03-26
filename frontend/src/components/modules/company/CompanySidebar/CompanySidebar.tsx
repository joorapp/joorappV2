import { useEffect, useCallback, useRef } from 'react';
import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import SimpleBar from 'simplebar-react';
import MetisMenu from 'metismenujs';
import { useAuth } from '../../../../context/AuthContext';
import { useCompanies } from '../../../../context/CompaniesContext';
import logo from '../../../../assets/images/Icon.png';
import logoDark from '../../../../assets/images/Logo.png';
import logoLightSvg from '../../../../assets/images/Icon.png';
import logoLightPng from '../../../../assets/images/Icon.png';

interface CompanySidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const CompanySidebar = (_props: CompanySidebarProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const ref = useRef<any>(null);
  const metisMenuRef = useRef<MetisMenu | null>(null);
  const { logout } = useAuth();
  const { clearCompanies } = useCompanies();

  const handleLogout = () => {
    clearCompanies();
    logout();
  };

  const activateParentDropdown = useCallback((item: HTMLElement) => {
    item.classList.add('active');
    const parent = item.parentElement;
    if (!parent) return;
    const parent2El = parent.childNodes[1] as HTMLElement;
    if (parent2El && parent2El.id !== 'side-menu') {
      parent2El.classList.add('mm-show');
    }
    if (parent) {
      parent.classList.add('mm-active');
      const parent2 = parent.parentElement;
      if (parent2) {
        parent2.classList.add('mm-show');
        const parent3 = parent2.parentElement;
        if (parent3) {
          parent3.classList.add('mm-active');
          (parent3.childNodes[0] as HTMLElement).classList.add('mm-active');
          const parent4 = parent3.parentElement;
          if (parent4) {
            parent4.classList.add('mm-show');
            const parent5 = parent4.parentElement;
            if (parent5) {
              parent5.classList.add('mm-show');
              (parent5.childNodes[0] as HTMLElement).classList.add('mm-active');
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
    for (let i = 0; i < items.length; ++i) {
      const item = items[i];
      const parent = items[i].parentElement;
      if (item && item.classList.contains('active')) {
        item.classList.remove('active');
      }
      if (parent) {
        const parent2El =
          parent.childNodes && parent.childNodes.length && parent.childNodes[1]
            ? parent.childNodes[1]
            : null;
        if (parent2El && (parent2El as HTMLElement).id !== 'side-menu') {
          (parent2El as HTMLElement).classList.remove('mm-show');
        }
        parent.classList.remove('mm-active');
        const parent2 = parent.parentElement;
        if (parent2) {
          parent2.classList.remove('mm-show');
          const parent3 = parent2.parentElement;
          if (parent3) {
            parent3.classList.remove('mm-active');
            (parent3.childNodes[0] as HTMLElement).classList.remove('mm-active');
            const parent4 = parent3.parentElement;
            if (parent4) {
              parent4.classList.remove('mm-show');
              const parent5 = parent4.parentElement;
              if (parent5) {
                parent5.classList.remove('mm-show');
                (parent5.childNodes[0] as HTMLElement).classList.remove('mm-active');
              }
            }
          }
        }
      }
    }
  };

  const activeMenu = useCallback(() => {
    const pathName = location.pathname;
    const ul = document.getElementById('side-menu');
    if (!ul) return;

    const items = ul.getElementsByTagName('a') as HTMLCollectionOf<HTMLAnchorElement>;
    removeActivation(items);

    let exactMatch: HTMLAnchorElement | null = null;
    let prefixMatch: HTMLAnchorElement | null = null;

    for (let i = 0; i < items.length; ++i) {
      const item = items[i];
      const itemPath = item.getAttribute('href');
      const itemPathname = item.pathname || itemPath;

      if (
        itemPathname &&
        itemPathname !== '/#' &&
        itemPathname !== '/' &&
        !item.classList.contains('has-arrow')
      ) {
        if (pathName === itemPathname) {
          exactMatch = item;
          break;
        }

        if (!prefixMatch && pathName.startsWith(itemPathname + '/')) {
          prefixMatch = item;
        }
      }
    }

    const itemToActivate = exactMatch || prefixMatch;
    if (itemToActivate) {
      activateParentDropdown(itemToActivate);
    }
  }, [location.pathname, activateParentDropdown]);

  useEffect(() => {
    metisMenuRef.current = new MetisMenu('#side-menu' as unknown as HTMLElement);
    activeMenu();
    return () => {
      if (metisMenuRef.current) {
        metisMenuRef.current.dispose();
        metisMenuRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    activeMenu();
  }, [location.pathname, activeMenu]);

  function scrollElement(item: HTMLElement) {
    if (item) {
      const currentPosition = item.offsetTop;
      if (currentPosition > window.innerHeight) {
        (document.getElementById('sidebar-menu') as HTMLElement).scrollTop =
          currentPosition - 300;
      }
    }
  }

  const handleDropdownClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    if (target.classList.contains('has-arrow')) {
      e.preventDefault();
    }
  };

  type SidebarChildItem = {
    key: string;
    path: string;
    label: string;
  };

  type SidebarGroupItem = {
    key: string;
    iconClass: string;
    label: string;
    children: SidebarChildItem[];
  };

  type SidebarLeafItem = {
    key: string;
    path: string;
    iconClass: string;
    label: string;
    onClick?: () => void;
  };

  type SidebarItem = SidebarGroupItem | SidebarLeafItem;

  const sidebarItems: SidebarItem[] = [
    {
      key: 'dashboard',
      path: '/company/dashboard',
      iconClass: 'bx bx-home-circle',
      label: t('Navigation.dashboard'),
    },
    {
      key: 'clientsGroup',
      iconClass: 'bx bx-group',
      label: t('CompanySidebar.clients'),
      children: [
        {
          key: 'clientsList',
          path: '/company/clients',
          label: t('CompanySidebar.clientsList'),
        },
        {
          key: 'clientPayment',
          path: '/company/clients/payments',
          label: t('CompanySidebar.clientPayment'),
        },
        {
          key: 'clientInvoice',
          path: '/company/clients/invoices',
          label: t('CompanySidebar.clientInvoice'),
        },
        {
          key: 'clientVisits',
          path: '/company/clients/visit',
          label: t('CompanySidebar.clientVisits'),
        },
      ],
    },
    {
      key: 'projectsGroup',
      iconClass: 'bx bx-buildings',
      label: t('CompanySidebar.projects'),
      children: [
        {
          key: 'projectsList',
          path: '/company/projects',
          label: t('CompanySidebar.projectsList'),
        },
       
        {
          key: 'estimations',
          path: '/company/projects/estimations',
          label: t('CompanySidebar.estimations'),
        },
      ],
    },
    // {
    //   key: 'scheduleActivitiesGroup',
    //   iconClass: 'bx bx-calendar-event',
    //   label: t('CompanySidebar.scheduleActivities'),
    //   children: [
    //     {
    //       key: 'stages',
    //       path: '/company/schedule/stages',
    //       label: t('CompanySidebar.stages'),
    //     },
    //     {
    //       key: 'activities',
    //       path: '/company/schedule/activities',
    //       label: t('CompanySidebar.activities'),
    //     },
    //     {
    //       key: 'subActivities',
    //       path: '/company/schedule/sub-activities',
    //       label: t('CompanySidebar.subActivities'),
    //     },
    //   ],
    // },
    // {
    //   key: 'assignTasks',
    //   path: '/company/assign-tasks',
    //   iconClass: 'bx bx-check-square',
    //   label: t('CompanySidebar.assignTasks'),
    // },
    // {
    //   key: 'materialsGroup',
    //   iconClass: 'bx bx-layer',
    //   label: t('CompanySidebar.manageMaterials'),
    //   children: [
    //     {
    //       key: 'materialCategories',
    //       path: '/company/materials/categories',
    //       label: t('CompanySidebar.materialCategories'),
    //     },
    //     {
    //       key: 'units',
    //       path: '/company/materials/units',
    //       label: t('CompanySidebar.units'),
    //     },
    //     {
    //       key: 'materials',
    //       path: '/company/materials',
    //       label: t('CompanySidebar.materials'),
    //     },
    //   ],
    // },
    // {
    //   key: 'inventoryGroup',
    //   iconClass: 'bx bx-box',
    //   label: t('CompanySidebar.manageInventory'),
    //   children: [
    //     {
    //       key: 'inventory',
    //       path: '/company/inventory',
    //       label: t('CompanySidebar.inventory'),
    //     },
    //     {
    //       key: 'materialTransfer',
    //       path: '/company/inventory/material-transfer',
    //       label: t('CompanySidebar.materialTransfer'),
    //     },
    //     {
    //       key: 'materialReturn',
    //       path: '/company/inventory/material-return',
    //       label: t('CompanySidebar.materialReturn'),
    //     },
    //     {
    //       key: 'newStores',
    //       path: '/company/inventory/new-stores',
    //       label: t('CompanySidebar.newStores'),
    //     },
    //   ],
    // },
    // {
    //   key: 'rentalsGroup',
    //   iconClass: 'bx bx-car',
    //   label: t('CompanySidebar.manageRentals'),
    //   children: [
    //     {
    //       key: 'rentalCategories',
    //       path: '/company/rentals/categories',
    //       label: t('CompanySidebar.rentalCategories'),
    //     },
    //     {
    //       key: 'rentalItems',
    //       path: '/company/rentals/items',
    //       label: t('CompanySidebar.rentalItems'),
    //     },
    //   ],
    // },
    
    {
      key: 'staffsGroup',
      iconClass: 'bx bx-user-voice',
      label: t('CompanySidebar.manageEmployees'),
      children: [
        {
          key: 'employees',
          path: '/company/employees',
          label: t('CompanySidebar.employees'),
        },
        {
          key: 'assignRoles',
          path: '/company/staffs/assignRoles',
          label: t('CompanySidebar.assignRoles'),
        },
        {
          key: 'salaries',
          path: '/company/staffs/salaries',
          label: t('CompanySidebar.salaries'),
        },
        {
          key: 'attendance',
          path: '/company/staffs/attendance',
          label: t('CompanySidebar.attendance'),
        },
        {
          key: 'teams',
          path: '/company/staffs/teams',
          label: t('CompanySidebar.teams'),
        },
      ],
    },
    // {
    //   key: 'cashBookGroup',
    //   iconClass: 'bx bx-rupee',
    //   label: t('CompanySidebar.cashBook'),
    //   children: [
    //     {
    //       key: 'openingBalance',
    //       path: '/company/cash-book/opening-balance',
    //       label: t('CompanySidebar.openingBalance'),
    //     },
    //     {
    //       key: 'cashTransfers',
    //       path: '/company/cash-book/transfers',
    //       label: t('CompanySidebar.transfers'),
    //     },
    //     {
    //       key: 'otherIncomes',
    //       path: '/company/cash-book/other-incomes',
    //       label: t('CompanySidebar.otherIncomes'),
    //     },
    //     {
    //       key: 'otherExpenses',
    //       path: '/company/cash-book/other-expenses',
    //       label: t('CompanySidebar.otherExpenses'),
    //     },
    //   ],
    // },
    // {
    //   key: 'suppliersGroup',
    //   iconClass: 'bx bx-id-card',
    //   label: t('CompanySidebar.manageSuppliers'),
    //   children: [
    //     {
    //       key: 'suppliers',
    //       path: '/company/suppliers',
    //       label: t('CompanySidebar.suppliers'),
    //     },
    //     {
    //       key: 'purchases',
    //       path: '/company/suppliers/purchases',
    //       label: t('CompanySidebar.purchases'),
    //     },
    //     {
    //       key: 'payMaterialSuppliers',
    //       path: '/company/suppliers/pay-material-suppliers',
    //       label: t('CompanySidebar.payMaterialSuppliers'),
    //     },
    //     {
    //       key: 'rentalBills',
    //       path: '/company/suppliers/rental-bills',
    //       label: t('CompanySidebar.rentalBills'),
    //     },
    //     {
    //       key: 'payRentalSuppliers',
    //       path: '/company/suppliers/pay-rental-suppliers',
    //       label: t('CompanySidebar.payRentalSuppliers'),
    //     },
    //   ],
    // },
    // {
    //   key: 'subcontractorsGroup',
    //   iconClass: 'bx bx-train',
    //   label: t('CompanySidebar.subcontractors'),
    //   children: [
    //     {
    //       key: 'subcontractors',
    //       path: '/company/subcontractors',
    //       label: t('CompanySidebar.subcontractors'),
    //     },
    //     {
    //       key: 'contractTypes',
    //       path: '/company/subcontractors/contract-types',
    //       label: t('CompanySidebar.contractTypes'),
    //     },
    //     {
    //       key: 'paySubcontractors',
    //       path: '/company/subcontractors/pay',
    //       label: t('CompanySidebar.paySubcontractors'),
    //     },
    //   ],
    // },
    // {
    //   key: 'downloadReports',
    //   path: '/company/download-reports',
    //   iconClass: 'bx bx-download',
    //   label: t('CompanySidebar.downloadReports'),
    // },
    {
      key: 'settings',
      iconClass: 'bx bx-cog',
      label: t('Navigation.settings'),
      children: [
        {
          key: 'settingsClientTypes',
          path: '/company/clients/types',
          label: t('CompanySidebar.clientTypes'),
        },
        {
          key: 'projectTypes',
          path: '/company/projects/types',
          label: t('CompanySidebar.projectTypes'),
        },
        {
          key: 'settingsProjectCategories',
          path: '/company/projects/categories',
          label: t('CompanySidebar.projectCategories'),
        },
        {
          key: 'jobTitles',
          path: '/company/employees/job-titles',
          label: t('CompanySidebar.jobTitles'),
        },
        {
          key: 'rolePermissions',
          path: '/company/employees/role-permissions',
          label: t('CompanySidebar.rolePermissions'),
        },
        {
          key: 'howItWorks',
          path: '/company/employees/how-it-works',
          label: t('CompanySidebar.howItWorks'),
        },
       
      ],
    },
    
    
  ] as const;

  return (
    <>
      <div className="vertical-menu">
        <div className="navbar-brand-box">
          <Link to="/company" className="logo logo-dark">
            <span className="logo-sm">
              <img src={logo} alt="" height="36" />
            </span>
            <span className="logo-lg">
              <img src={logoDark} alt="" height="52" />
            </span>
          </Link>
          <Link to="/company" className="logo logo-light">
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
              <li className="menu-title">{t('CompanyHeader.companyDashboard')}</li>
              {sidebarItems.map((item) => {
                if ('children' in item) {
                  const group = item;
                  return (
                    <li key={group.key}>
                      <Link to="/#" className="has-arrow" onClick={handleDropdownClick}>
                        <i className={group.iconClass}></i>
                        <span>{group.label}</span>
                      </Link>
                      <ul className="sub-menu mm-collapse" aria-expanded="false">
                        {group.children.map((child) => (
                          <li key={child.key}>
                            <Link to={child.path}>{child.label}</Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                }

                const leaf = item;
                return (
                  <li key={leaf.key}>
                    <Link
                      to={leaf.path}
                      onClick={
                        leaf.key === 'logout'
                          ? (e) => {
                              e.preventDefault();
                              leaf.onClick && leaf.onClick();
                            }
                          : undefined
                      }
                    >
                      <i className={leaf.iconClass}></i>
                      <span>{leaf.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </SimpleBar>
      </div>
    </>
  );
};

export default CompanySidebar;
