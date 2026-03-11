import API_ROUTES from "../constants/api";
import HttpUtil from "../http-handler/http-util";

export default class CompanyService {
  static getCompanyProfile(companyId: string) {
    return HttpUtil.get(
      API_ROUTES.COMPANY.GET_COMPANY_PROFILE.replace("<companyId>", companyId)
    );
  }

  static updateCompanyProfile(companyId: string, companyData: any) {
    return HttpUtil.put(
      API_ROUTES.COMPANY.UPDATE_COMPANY_PROFILE.replace("<companyId>", companyId),
      companyData
    );
  }

  static getClientPayments(params: {
    companyId: string;
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) {
    const {
      companyId,
      page = 1,
      limit = 10,
      status = '',
      search = '',
    } = params;

    return HttpUtil.get(
      API_ROUTES.COMPANY.GET_CLIENT_PAYMENTS.replace('<companyId>', companyId)
        .replace('<page>', String(page))
        .replace('<limit>', String(limit))
        .replace('<status>', status)
        .replace('<search>', encodeURIComponent(search))
    );
  }
}

