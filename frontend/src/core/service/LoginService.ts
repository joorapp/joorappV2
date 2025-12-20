import API_ROUTES from "../constants/api";
import HttpUtil from "../http-handler/http-util";

export default class LoginService {
  static login(credentials: { email: string; password: string }) {
    return HttpUtil.post(API_ROUTES.LOGIN.LOGINAPI, credentials);
  }

  static logout() {
    return HttpUtil.post(API_ROUTES.LOGIN.LOGOUTAPI);
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
}

