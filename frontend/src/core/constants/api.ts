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
  COMPANYADMIN: {
   CREATE_CLIENT: API_PATH + "/admin/clients",
   GET_CLIENTS: API_PATH + "/admin/clients",
   GET_ALL_CLIENTS: API_PATH + "/admin/clients/all",
   GET_CLIENT_BY_ID: API_PATH + "/admin/clients/<clientId>",
   UPDATE_CLIENT: API_PATH + "/admin/clients/<clientId>",
   DELETE_CLIENT: API_PATH + "/admin/clients/<clientId>",
   GET_EMPLOYEES: API_PATH + "/admin/employees",
   GET_EMPLOYEE_BY_ID: API_PATH + "/admin/employees/<id>",
   UPDATE_EMPLOYEE: API_PATH + "/admin/employees/<id>",
   DELETE_EMPLOYEE: API_PATH + "/admin/employees/<id>",
   UPDATE_EMPLOYEE_STATUS: API_PATH + "/admin/employees/<id>/status",
   GET_EMPLOYEE_JOB_TITLES: API_PATH + "/admin/employees/job-titles",
   CREATE_EMPLOYEE_JOB_TITLE: API_PATH + "/admin/employees/job-titles",
   UPDATE_EMPLOYEE_JOB_TITLE: API_PATH + "/admin/employees/job-titles/<id>",
   DELETE_EMPLOYEE_JOB_TITLE: API_PATH + "/admin/employees/job-titles/<id>",
   UPDATE_EMPLOYEE_JOB_TITLE_STATUS: API_PATH + "/admin/employees/job-titles/<id>/status",
   GET_ALL_EMPLOYEE_JOB_TITLES: API_PATH + "/admin/employees/job-titles/all",
   GET_PROJECT_TYPES: API_PATH + "/admin/projects/types",
   GET_ALL_PROJECT_TYPES: API_PATH + "/admin/projects/types/all",
   CREATE_PROJECT_TYPE: API_PATH + "/admin/projects/types",
   UPDATE_PROJECT_TYPE: API_PATH + "/admin/projects/types/<id>",
   DELETE_PROJECT_TYPE: API_PATH + "/admin/projects/types/<id>",
   UPDATE_PROJECT_TYPE_STATUS: API_PATH + "/admin/projects/types/<id>/status",
   GET_PROJECTS: API_PATH + "/admin/projects",
   GET_PROJECT_CATEGORIES: API_PATH + "/admin/projects/categories",
   GET_ALL_PROJECT_CATEGORIES: API_PATH + "/admin/projects/categories/all",
   CREATE_PROJECT_CATEGORY: API_PATH + "/admin/projects/categories",
   UPDATE_PROJECT_CATEGORY: API_PATH + "/admin/projects/categories/<id>",
   DELETE_PROJECT_CATEGORY: API_PATH + "/admin/projects/categories/<id>",
   UPDATE_PROJECT_CATEGORY_STATUS: API_PATH + "/admin/projects/categories/<id>/status",
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
    ENABLE_USER: API_PATH + "/superAdmin/users/<userId>/enable",
    DISABLE_USER: API_PATH + "/superAdmin/users/<userId>/disable",
    GET_PROJECT_TYPES: API_PATH + "/superAdmin/project-types",
    CREATE_PROJECT_TYPE: API_PATH + "/superAdmin/project-types",
    UPDATE_PROJECT_TYPE: API_PATH + "/superAdmin/project-types/<id>",
    UPDATE_PROJECT_TYPE_STATUS: API_PATH + "/superAdmin/project-types/<id>/status",
    DELETE_PROJECT_TYPE: API_PATH + "/superAdmin/project-types/<id>",
    GET_JOB_TITLES: API_PATH + "/superAdmin/job-titles",
    CREATE_JOB_TITLE: API_PATH + "/superAdmin/job-titles",
    UPDATE_JOB_TITLE: API_PATH + "/superAdmin/job-titles/<id>",
    UPDATE_JOB_TITLE_STATUS: API_PATH + "/superAdmin/job-titles/<id>/status",
    DELETE_JOB_TITLE: API_PATH + "/superAdmin/job-titles/<id>",
    GET_PROJECT_CATEGORIES: API_PATH + "/superAdmin/project-categories",
    CREATE_PROJECT_CATEGORY: API_PATH + "/superAdmin/project-categories",
    UPDATE_PROJECT_CATEGORY: API_PATH + "/superAdmin/project-categories/<id>",
    UPDATE_PROJECT_CATEGORY_STATUS: API_PATH + "/superAdmin/project-categories/<id>/status",
    DELETE_PROJECT_CATEGORY: API_PATH + "/superAdmin/project-categories/<id>",
  },
};

export default API_ROUTES;

