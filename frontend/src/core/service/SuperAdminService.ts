/**
 * @author Ananthapadmanabhan V K
 * Super admin service for the application
 * This file contains the super admin service for the application
 * @returns SuperAdminService class with createCompany
 */

import API_ROUTES from "../constants/api";
import HttpUtil from "../http-handler/http-util";

export interface CreateProjectCategoryBody {
  projectCategory: string;
  description: string;
  isActive: boolean;
}

export interface CreateProjectTypeBody {
  projectType: string;
  description: string;
  isActive: boolean;
}

export interface GetProjectCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface GetProjectTypesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateJobTitleBody {
  jobTitle: string;
  description: string;
  isActive: boolean;
}

export interface GetJobTitlesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

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

  static createProjectType(body: CreateProjectTypeBody) {
    return HttpUtil.post(API_ROUTES.SUPERADMIN.CREATE_PROJECT_TYPE, body);
  }

  static updateProjectType(id: string, body: CreateProjectTypeBody) {
    return HttpUtil.put(
      API_ROUTES.SUPERADMIN.UPDATE_PROJECT_TYPE.replace("<id>", id),
      body
    );
  }

  static getProjectTypes(params?: GetProjectTypesParams) {
    const {
      page = 1,
      limit = 10,
      search = '',
      isActive,
      sortBy = 'projectType',
      sortOrder = 'ASC',
    } = params || {};

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

    const baseUrl = API_ROUTES.SUPERADMIN.GET_PROJECT_TYPES.split('?')[0];
    const url = `${baseUrl}?${queryParams.toString()}`;
    return HttpUtil.get(url);
  }

  static updateProjectTypeStatus(id: string, isActive: boolean) {
    return HttpUtil.patch(
      API_ROUTES.SUPERADMIN.UPDATE_PROJECT_TYPE_STATUS.replace("<id>", id),
      { isActive }
    );
  }

  static deleteProjectType(id: string) {
    return HttpUtil.delete(
      API_ROUTES.SUPERADMIN.DELETE_PROJECT_TYPE.replace("<id>", id)
    );
  }

  static createJobTitle(body: CreateJobTitleBody) {
    return HttpUtil.post(API_ROUTES.SUPERADMIN.CREATE_JOB_TITLE, body);
  }

  static updateJobTitle(id: string, body: CreateJobTitleBody) {
    return HttpUtil.put(
      API_ROUTES.SUPERADMIN.UPDATE_JOB_TITLE.replace("<id>", id),
      body
    );
  }

  static getJobTitles(params?: GetJobTitlesParams) {
    const {
      page = 1,
      limit = 10,
      search = '',
      isActive,
      sortBy = 'jobTitle',
      sortOrder = 'ASC',
    } = params || {};

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

    const baseUrl = API_ROUTES.SUPERADMIN.GET_JOB_TITLES.split('?')[0];
    const url = `${baseUrl}?${queryParams.toString()}`;
    return HttpUtil.get(url);
  }

  static updateJobTitleStatus(id: string, isActive: boolean) {
    return HttpUtil.patch(
      API_ROUTES.SUPERADMIN.UPDATE_JOB_TITLE_STATUS.replace("<id>", id),
      { isActive }
    );
  }

  static deleteJobTitle(id: string) {
    return HttpUtil.delete(
      API_ROUTES.SUPERADMIN.DELETE_JOB_TITLE.replace("<id>", id)
    );
  }

  static createProjectCategory(body: CreateProjectCategoryBody) {
    return HttpUtil.post(API_ROUTES.SUPERADMIN.CREATE_PROJECT_CATEGORY, body);
  }

  static updateProjectCategory(id: string, body: CreateProjectCategoryBody) {
    return HttpUtil.put(
      API_ROUTES.SUPERADMIN.UPDATE_PROJECT_CATEGORY.replace("<id>", id),
      body
    );
  }

  static getProjectCategories(params?: GetProjectCategoriesParams) {
    const {
      page = 1,
      limit = 10,
      search = '',
      isActive,
      sortBy = 'projectCategory',
      sortOrder = 'ASC',
    } = params || {};

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

    const baseUrl = API_ROUTES.SUPERADMIN.GET_PROJECT_CATEGORIES.split('?')[0];
    const url = `${baseUrl}?${queryParams.toString()}`;
    return HttpUtil.get(url);
  }

  static updateProjectCategoryStatus(id: string, isActive: boolean) {
    return HttpUtil.patch(
      API_ROUTES.SUPERADMIN.UPDATE_PROJECT_CATEGORY_STATUS.replace("<id>", id),
      { isActive }
    );
  }

  static deleteProjectCategory(id: string) {
    return HttpUtil.delete(
      API_ROUTES.SUPERADMIN.DELETE_PROJECT_CATEGORY.replace("<id>", id)
    );
  }
}
