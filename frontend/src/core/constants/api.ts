/**
 * @author Ananthapadmanabhan V K
 * API constants for the application
 * This file contains the API constants for the application
 * @returns API_ROUTES object with the API constants
 */

// 1. Define API path constants
const API_PATH = "/api/v2";

// 2. Export base URLs from environment
// Ensure VITE_API_BASE_URL is set in .env file
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  if (import.meta.env.DEV) {
    console.warn(
      '⚠️ VITE_API_BASE_URL is not defined in .env file.\n' +
      'Please create a .env file in the frontend directory with:\n' +
      'VITE_API_BASE_URL=http://localhost:3030\n' +
      'The application may not work correctly without this variable.'
    );
  }
}

export const BASE_URL = apiBaseUrl || '';

// 3. Create nested API_ROUTES object organized by feature
const API_ROUTES = {
  LOGIN: {
    LOGINAPI: API_PATH + "/auth/login",
    LOGOUTAPI: API_PATH + "/auth/logout",
    GET_PROFILE: API_PATH + "/auth/profile",
    REFRESH_TOKEN: API_PATH + "/auth/refresh",
    GET_COMPANIES: API_PATH + "/auth/companies",
    SELECT_COMPANY: API_PATH + "/auth/companies/<companyId>/select",
  },
  // USER: {
  //   GET_USERS: API_PATH + "/users?pageSize=<pageSize>&pageNumber=<pageNumber>&key=<key>",
  //   GET_USER_DETAILS: API_PATH + "/users/<userId>",
  //   CREATE_USER: API_PATH + "/users",
  //   UPDATE_USER: API_PATH + "/users/<userId>",
  //   DELETE_USER: API_PATH + "/users/<userId>",
  // },
  COMPANY: {
    GET_COMPANY_PROFILE: API_PATH + "/companies/<companyId>",
    UPDATE_COMPANY_PROFILE: API_PATH + "/companies/<companyId>",
  },
  DASHBOARD: {
    GET_SUPERADMIN_DASHBOARD: API_PATH + "/dashboard/superadmin",
    GET_COMPANY_DASHBOARD: API_PATH + "/dashboard/company/<companyId>",
  },
  SUPERADMIN: {
    CREATE_COMPANY: API_PATH + "/superAdmin/companies",
    UPDATE_COMPANY: API_PATH + "/superAdmin/companies/<companyId>",
    DELETE_COMPANY: API_PATH + "/superAdmin/companies/<companyId>",
    GET_COMPANIES_LIST: API_PATH + "/superAdmin/companies",
    GET_COMPANY_BY_ID: API_PATH + "/superAdmin/companies/<companyId>?includeLogo=true",
    CREATE_ROLE: API_PATH + "/superAdmin/roles",
    UPDATE_ROLE: API_PATH + "/superAdmin/roles/<roleId>",
    DELETE_ROLE: API_PATH + "/superAdmin/roles/<roleId>",
    GET_ROLES_LIST: API_PATH + "/superAdmin/roles",
    GET_ROLE_BY_ID: API_PATH + "/superAdmin/roles/<roleId>",
    GET_USERS_LIST: API_PATH + "/superAdmin/users?page=<page>&limit=<limit>&search=<search>",
    GET_USER_BY_ID: API_PATH + "/superAdmin/users/<userId>",
    CREATE_USER: API_PATH + "/superAdmin/users",
    UPDATE_USER: API_PATH + "/superAdmin/users/<userId>",
    DELETE_USER: API_PATH + "/superAdmin/users/<userId>",
    ASSIGN_USER_TO_COMPANY: API_PATH + "/superAdmin/users/<userId>/assign",
    UPDATE_USER_COMPANY_ROLE: API_PATH + "/superAdmin/users/<userId>/companies/<companyId>/role",
  },
};

export default API_ROUTES;

