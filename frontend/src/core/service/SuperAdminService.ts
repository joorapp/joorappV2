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
    address: string;
    logo: string | null;
  }) {
    return HttpUtil.post(API_ROUTES.SUPERADMIN.CREATE_COMPANY, companyData);
  }
}

