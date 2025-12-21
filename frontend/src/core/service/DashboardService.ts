import API_ROUTES from "../constants/api";
import HttpUtil from "../http-handler/http-util";

export default class DashboardService {
  static getSuperAdminDashboard() {
    return HttpUtil.get(API_ROUTES.DASHBOARD.GET_SUPERADMIN_DASHBOARD);
  }

  static getCompanyDashboard(companyId: string) {
    return HttpUtil.get(
      API_ROUTES.DASHBOARD.GET_COMPANY_DASHBOARD.replace("<companyId>", companyId)
    );
  }
}

