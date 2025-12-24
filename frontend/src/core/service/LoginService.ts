/**
 * @author Ananthapadmanabhan V K
 * Login service for the application
 * This file contains the login service for the application
 * @returns LoginService class with login, logout, getProfile, refreshToken, getCompanies, selectCompany
 */

import API_ROUTES from "../constants/api";
import HttpUtil from "../http-handler/http-util";

export default class LoginService {
  static login(credentials: { email: string; password: string }) {
    return HttpUtil.uniterceptedPost(API_ROUTES.LOGIN.LOGINAPI, credentials);
  }

  static async logout() {
    const refreshToken = localStorage.getItem("refreshToken");
    localStorage.clear();
    if (!refreshToken) {
      localStorage.clear();
      return Promise.reject(new Error("Refresh token not found"));
    }
    try {
      const response = await HttpUtil.post(API_ROUTES.LOGIN.LOGOUTAPI, {
        refresh_token: refreshToken,
      });
      localStorage.clear();
      return response;
    } catch (error) {
      localStorage.clear();
      return Promise.reject(error);
    }
  }

  static getProfile() {
    return HttpUtil.get(API_ROUTES.LOGIN.GET_PROFILE);
  }

  static refreshToken(refreshToken: string) {
    // Use unauthenticated interceptor for refresh token (no access token needed)
    return HttpUtil.uniterceptedPost(API_ROUTES.LOGIN.REFRESH_TOKEN, {
      refresh_token: refreshToken,
    });
  }

  static getCompanies() {
    // Use authenticated interceptor (token will be added automatically)
    return HttpUtil.get(API_ROUTES.LOGIN.GET_COMPANIES);
  }

  static selectCompany(companyId: string) {
    // Use authenticated interceptor (token will be added automatically)
    return HttpUtil.post(
      API_ROUTES.LOGIN.SELECT_COMPANY.replace("<companyId>", companyId)
    );
  }
}

