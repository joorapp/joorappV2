/**
 * @author Ananthapadmanabhan V K
 * Axios interceptor for authenticated requests
 * This file contains the axios interceptor for authenticated requests
 * @returns mainAxios - The axios instance with interceptors
 */

import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { BASE_URL } from "../constants/api";
import { showErrorToastFromError } from "../utils/toast";
import API_ROUTES from "../constants/api";
import LoginService from "../service/LoginService";

// Get API timeout from environment variable (default: 10000ms = 10 seconds)
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;

const mainAxios = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-type": "application/json" },
  timeout: API_TIMEOUT,
});

// Track if we're currently refreshing token to avoid multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const requestHandler = (request: any) => request;
const responseHandler = (response: any) => response;

const errorHandler = async (error: any) => {
  const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

  // Handle 401 Unauthorized - Token expired
  if (error?.response?.status === 401 && originalRequest) {
    const requestUrl = originalRequest.url || "";
    const loginEndpoint = API_ROUTES.LOGIN.LOGINAPI;
    const refreshEndpoint = API_ROUTES.LOGIN.REFRESH_TOKEN;

    // Skip token refresh for login and refresh endpoints (check both full URL and endpoint path)
    const isLoginEndpoint = requestUrl.includes(loginEndpoint) || requestUrl.endsWith(loginEndpoint);
    const isRefreshEndpoint = requestUrl.includes(refreshEndpoint) || requestUrl.endsWith(refreshEndpoint);
    
    if (isLoginEndpoint || isRefreshEndpoint) {
      localStorage.clear();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers["Authorization"] = "Bearer " + token;
          }
          return mainAxios(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    // Start token refresh process
    isRefreshing = true;
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      // No refresh token, logout user
      processQueue(error, null);
      isRefreshing = false;
      localStorage.clear();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    try {
      // Call refresh token API
      const refreshResponse = await LoginService.refreshToken(refreshToken);

      if (refreshResponse.data?.success && refreshResponse.data?.data) {
        const { access_token, refresh_token: newRefreshToken } = refreshResponse.data.data;

        // Update tokens in localStorage
        localStorage.setItem("accessToken", access_token);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        // Update authorization header for original request
        if (originalRequest.headers) {
          originalRequest.headers["Authorization"] = "Bearer " + access_token;
        }

        // Process queued requests
        processQueue(null, access_token);
        isRefreshing = false;

        // Retry original request
        return mainAxios(originalRequest);
      } else {
        throw new Error("Invalid refresh token response");
      }
    } catch (refreshError) {
      // Refresh token failed, logout user
      processQueue(refreshError, null);
      isRefreshing = false;
      localStorage.clear();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    }
  } else if (error?.response?.status === 400) {
    // Extract error message from API response
    showErrorToastFromError(error, "Bad Request");
  } else if (error?.response?.status === 403) {
    // Extract error message from API response
    showErrorToastFromError(error, "Not Authorized");
  } else if (error?.response?.status && error.response.status >= 500) {
    // Extract error message from API response
    showErrorToastFromError(error, "Server error - Please retry after some time");
  }
  return Promise.reject(error);
};

mainAxios.interceptors.request.use(
  function (config) {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers["Authorization"] = "Bearer " + accessToken;
    }
    return requestHandler(config);
  },
  function (error) {
    return Promise.reject(error);
  }
);

mainAxios.interceptors.response.use(
  function (response) {
    return responseHandler(response);
  },
  function (error) {
    return errorHandler(error);
  }
);

export default mainAxios;

