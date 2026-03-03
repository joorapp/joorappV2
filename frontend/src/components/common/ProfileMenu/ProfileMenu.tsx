import React, { useState } from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

//i18n
import { withTranslation } from "react-i18next";

import { useNavigate, Link } from "react-router-dom";

import user1 from "../../../assets/images/users/avatar-1.jpg";
import LoginService from "../../../core/service/LoginService";
import { useAuth } from "../../../context/AuthContext";
import { useCompanies } from "../../../context/CompaniesContext";

const ProfileMenu = (props: { t: (key: string) => string }) => {
  // Declare a new state variable, which we'll call "menu"
  const [menu, setMenu] = useState(false);
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const { companies } = useCompanies();

  const displayName =
    (user?.firstName || user?.lastName)
      ? `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()
      : user?.name || user?.email || "Admin";
  
  const companyName = companies.length > 0 ? companies[0].name : "";
  
  // Determine profile route based on user role
  const getProfileRoute = () => {
    if (hasRole('superadmin')) {
      return '/superadmin/Profile';
    }
    return '/company/profile'; // Default to company profile
  };

  const handleLogout = async () => {
    try {
     const response = await LoginService.logout();
     if (response?.data?.success) {
      navigate("/login");
     }
    } catch (error) {
      console.error(error);
    }
  };    

  return (
    <React.Fragment>
      <Dropdown
        isOpen={menu}
        toggle={() => setMenu(!menu)}
        className="d-inline-block"
      >
        <DropdownToggle
          className="btn header-item "
          id="page-header-user-dropdown"
          tag="button"
        >
          <img
            className="rounded-circle header-profile-user"
            src={user1}
            alt="Header Avatar"
          />
          <span className="d-none d-xl-inline-block ms-2 me-1">
            {companyName ? `${companyName}` : displayName}
          </span>
          <i className="mdi mdi-chevron-down d-none d-xl-inline-block" />
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          <DropdownItem tag={Link} to={getProfileRoute()}>
            <i className="bx bx-user font-size-16 align-middle me-1" />
            {props.t('Navigation.profile')}
          </DropdownItem>
          <DropdownItem tag="a" href="/crypto-wallet">
            <i className="bx bx-wallet font-size-16 align-middle me-1" />
            {props.t('Navigation.myWallet')}
          </DropdownItem>
          <DropdownItem tag="a" href="#">
            <span className="badge bg-success float-end">11</span>
            <i className="bx bx-wrench font-size-16 align-middle me-1" />
            {props.t('Navigation.settings')}
          </DropdownItem>
          <DropdownItem tag="a" href="auth-lock-screen">
            <i className="bx bx-lock-open font-size-16 align-middle me-1" />
            {props.t('Navigation.lockScreen')}
          </DropdownItem>
          <div className="dropdown-divider" />
          <DropdownItem className="dropdown-item" onClick={handleLogout}>
            <i className="bx bx-power-off font-size-16 align-middle me-1 text-danger" />
            <span>{props.t('Navigation.logout')}</span>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};


export default (withTranslation()(ProfileMenu));
