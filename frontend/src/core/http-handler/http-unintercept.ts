/**
 * @author Ananthapadmanabhan V K
 * Axios interceptor for unauthenticated requests
 * This file contains the axios interceptor for unauthenticated requests
 * @returns unincepaxios - The axios instance with interceptors
 */

import axios from "axios";
import { BASE_URL } from "../constants/api";
import { showErrorToastFromError } from "../utils/toast";

const unincepaxios = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-type": "application/json" },
  timeout: 10000,
});

const requestHandler = (request: any) => request;
const responseHandler = (response: any) => response;

const errorHandler = async (error: any) => {
  // Handle 400 Bad Request
  if (error?.response?.status === 400) {
    // Extract error message from API response
    showErrorToastFromError(error, "Bad Request");
  } else if (error?.response?.status === 401) {
    // Handle 401 Unauthorized - For unauthenticated requests (e.g., login failures)
    // Extract error message from API response
    showErrorToastFromError(error, "Unauthorized");
  } else if (error?.response?.status === 403) {
    // Extract error message from API response
    showErrorToastFromError(error, "Not Authorized");
  } else if (error?.response?.status && error.response.status >= 500) {
    // Extract error message from API response
    showErrorToastFromError(error, "Server error - Please retry after some time");
  }
  return Promise.reject(error);
};

unincepaxios.interceptors.request.use(
  function (config) {
    return requestHandler(config);
  },
  function (error) {
    return Promise.reject(error);
  }
);

unincepaxios.interceptors.response.use(
  function (response) {
    return responseHandler(response);
  },
  function (error) {
    return errorHandler(error);
  }
);

// For unauthenticated requests (e.g., login)
export default unincepaxios;

