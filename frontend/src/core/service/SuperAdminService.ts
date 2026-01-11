/**
 * @author Ananthapadmanabhan V K
 * Super admin service for the application
 * This file contains the super admin service for the application
 * @returns SuperAdminService class with createCompany
 */

import API_ROUTES from "../constants/api";
import HttpUtil from "../http-handler/http-util";

export default class SuperAdminService {
  static createCompany(companyData: {
    name: string;
    description: string;
    isActive: boolean;
    email: string;
    phone: string;
    buildingAddress: string;
    streetAddress: string;
    country: string;
    state: string;
    city: string;
    postalCode: string;
    logo: string | null;
    status: string;
    planId: string;
  }) {
    return HttpUtil.post(API_ROUTES.SUPERADMIN.CREATE_COMPANY, companyData);
  }
  static updateCompany(companyData: {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    email: string;
    phone: string;
    buildingAddress: string;
    streetAddress: string;
    country: string;
    state: string;
    city: string;
    postalCode: string;
    logo: string | null;
    status: string;
    planId: string;
  }) {
    return HttpUtil.put(API_ROUTES.SUPERADMIN.UPDATE_COMPANY.replace("<companyId>", companyData.id), companyData);
  }
  static getCompaniesList(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) {
    const {
      page = 1,
      limit = 10,
      search = '',
      isActive,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = params || {};

    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));
    if (search) {
      queryParams.append('search', search);
    }
    if (isActive !== undefined) {
      queryParams.append('isActive', String(isActive));
    }
    queryParams.append('sortBy', sortBy);
    queryParams.append('sortOrder', sortOrder);

    const baseUrl = API_ROUTES.SUPERADMIN.GET_COMPANIES_LIST.split('?')[0];
    const url = `${baseUrl}?${queryParams.toString()}`;

    return HttpUtil.get(url);
  }

  static getCompanyById(companyId: string) {
    return HttpUtil.get(
      API_ROUTES.SUPERADMIN.GET_COMPANY_BY_ID.replace("<companyId>", companyId)
    );
  }

  static deleteCompany(companyId: string) {
    return HttpUtil.delete(
      API_ROUTES.SUPERADMIN.DELETE_COMPANY.replace("<companyId>", companyId)
    );
  }
}
