// 1. Define API path constants
const API_PATH = "/api/v2";
const CUSTOM_SERVICE_PATH = "/custom-service/api";

// 2. Export base URLs from environment
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3030';
export const CUSTOM_BASE_URL = import.meta.env.VITE_CUSTOM_SERVICE_URL || '';

// 3. Create nested API_ROUTES object organized by feature
const API_ROUTES = {
  LOGIN: {
    LOGINAPI: API_PATH + "/auth/login",
    LOGOUTAPI: API_PATH + "/auth/logout",
    GET_PROFILE: API_PATH + "/auth/profile",
    REFRESH_TOKEN: API_PATH + "/auth/refresh",
    GET_COMPANIES: API_PATH + "/auth/companies",
  },
  USER: {
    GET_USERS: API_PATH + "/users?pageSize=<pageSize>&pageNumber=<pageNumber>&key=<key>",
    GET_USER_DETAILS: API_PATH + "/users/<userId>",
    CREATE_USER: API_PATH + "/users",
    UPDATE_USER: API_PATH + "/users/<userId>",
    DELETE_USER: API_PATH + "/users/<userId>",
  },
  COMPANY: {
    GET_COMPANY_PROFILE: API_PATH + "/companies/<companyId>",
    UPDATE_COMPANY_PROFILE: API_PATH + "/companies/<companyId>",
  },
  DASHBOARD: {
    GET_SUPERADMIN_DASHBOARD: API_PATH + "/dashboard/superadmin",
    GET_COMPANY_DASHBOARD: API_PATH + "/dashboard/company/<companyId>",
  },
};

export default API_ROUTES;

