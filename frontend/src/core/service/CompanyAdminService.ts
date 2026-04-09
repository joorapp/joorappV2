/**
 * Company admin service – client create/update/delete/list via COMPANYADMIN API.
 */

import API_ROUTES from "../constants/api";
import HttpUtil from "../http-handler/http-util";

export interface CreateClientBody {
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  clientMetadata: Record<string, unknown>;
}

export interface GetClientsParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface GetAllClientsParams {
  search?: string;
  isActive?: boolean;
}

export interface GetEmployeesParams {
  page?: number;
  limit?: number;
  search?: string;
  jobTitleId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface GetAllEmployeeJobTitlesParams {
  search?: string;
  isActive?: boolean;
}

export interface CreateEmployeeJobTitleBody {
  jobTitle: string;
  description?: string;
  isActive?: boolean;
}

export interface GetEmployeeJobTitlesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateEmployeeBody {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  employeeMetadata?: Record<string, unknown>;
  jobTitleId: string;
  salary?: number;
  isActive?: boolean;
}

export interface CreateProjectTypeBody {
  projectType: string;
  description?: string;
  isActive?: boolean;
}

export interface GetProjectTypesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface GetAllProjectTypesParams {
  search?: string;
  isActive?: boolean;
}

export interface GetProjectsParams {
  page?: number;
  limit?: number;
  clientId?: string;
  status?: string;
}

export interface CreateProjectCategoryBody {
  projectCategory: string;
  description?: string;
  isActive?: boolean;
}

export interface GetProjectCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface GetAllProjectCategoriesParams {
  search?: string;
  isActive?: boolean;
}

export default class CompanyAdminService {
  static getAllClients(params: GetAllClientsParams = {}) {
    const { search = "", isActive = true } = params;
    const query = new URLSearchParams();
    if (search.trim()) query.set("search", search.trim());
    if (isActive !== undefined) query.set("isActive", String(isActive));
    const url = `${API_ROUTES.COMPANYADMIN.GET_ALL_CLIENTS}?${query.toString()}`;
    return HttpUtil.get(url);
  }

  static getClients(params: GetClientsParams = {}) {
    const { page = 1, limit = 10, search = "", isActive } = params;
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", String(limit));
    if (search.trim()) query.set("search", search.trim());
    if (isActive !== undefined) query.set("isActive", String(isActive));
    const url = `${API_ROUTES.COMPANYADMIN.GET_CLIENTS}?${query.toString()}`;
    return HttpUtil.get(url);
  }

  static getClientById(clientId: string) {
    return HttpUtil.get(
      API_ROUTES.COMPANYADMIN.GET_CLIENT_BY_ID.replace("<clientId>", clientId)
    );
  }

  static createClient(body: CreateClientBody) {
    return HttpUtil.post(API_ROUTES.COMPANYADMIN.CREATE_CLIENT, body);
  }

  static updateClient(clientId: string, body: CreateClientBody) {
    return HttpUtil.put(
      API_ROUTES.COMPANYADMIN.UPDATE_CLIENT.replace("<clientId>", clientId),
      body
    );
  }

  static deleteClient(clientId: string) {
    return HttpUtil.delete(
      API_ROUTES.COMPANYADMIN.DELETE_CLIENT.replace("<clientId>", clientId)
    );
  }

  static getEmployees(params: GetEmployeesParams = {}) {
    const {
      page = 1,
      limit = 10,
      search = "",
      jobTitleId,
      isActive,
      sortBy = 'email',
      sortOrder = 'ASC',
    } = params;
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", String(limit));
    if (search.trim()) query.set("search", search.trim());
    if (jobTitleId) query.set("jobTitleId", jobTitleId);
    if (isActive !== undefined) query.set("isActive", String(isActive));
    query.set("sortBy", sortBy);
    query.set("sortOrder", sortOrder);
    const url = `${API_ROUTES.COMPANYADMIN.GET_EMPLOYEES}?${query.toString()}`;
    return HttpUtil.get(url);
  }

  static getAllEmployeeJobTitles(params: GetAllEmployeeJobTitlesParams = {}) {
    const { search = "", isActive = true } = params;
    const query = new URLSearchParams();
    if (search.trim()) query.set("search", search.trim());
    if (isActive !== undefined) query.set("isActive", String(isActive));
    const url = `${API_ROUTES.COMPANYADMIN.GET_ALL_EMPLOYEE_JOB_TITLES}?${query.toString()}`;
    return HttpUtil.get(url);
  }

  static getEmployeeJobTitles(params: GetEmployeeJobTitlesParams = {}) {
    const {
      page = 1,
      limit = 10,
      search = "",
      isActive,
      sortBy = "jobTitle",
      sortOrder = "ASC",
    } = params;
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", String(limit));
    if (search.trim()) query.set("search", search.trim());
    if (isActive !== undefined) query.set("isActive", String(isActive));
    query.set("sortBy", sortBy);
    query.set("sortOrder", sortOrder);
    const url = `${API_ROUTES.COMPANYADMIN.GET_EMPLOYEE_JOB_TITLES}?${query.toString()}`;
    return HttpUtil.get(url);
  }

  static createEmployeeJobTitle(body: CreateEmployeeJobTitleBody) {
    return HttpUtil.post(API_ROUTES.COMPANYADMIN.CREATE_EMPLOYEE_JOB_TITLE, body);
  }

  static updateEmployeeJobTitle(jobTitleId: string, body: CreateEmployeeJobTitleBody) {
    return HttpUtil.put(
      API_ROUTES.COMPANYADMIN.UPDATE_EMPLOYEE_JOB_TITLE.replace("<id>", jobTitleId),
      body
    );
  }

  static deleteEmployeeJobTitle(jobTitleId: string) {
    return HttpUtil.delete(
      API_ROUTES.COMPANYADMIN.DELETE_EMPLOYEE_JOB_TITLE.replace("<id>", jobTitleId)
    );
  }

  static updateEmployeeJobTitleStatus(jobTitleId: string, isActive: boolean) {
    return HttpUtil.patch(
      API_ROUTES.COMPANYADMIN.UPDATE_EMPLOYEE_JOB_TITLE_STATUS.replace("<id>", jobTitleId),
      { isActive }
    );
  }

  static createEmployee(body: CreateEmployeeBody) {
    return HttpUtil.post(API_ROUTES.COMPANYADMIN.GET_EMPLOYEES, body);
  }

  static getEmployeeById(employeeId: string) {
    return HttpUtil.get(
      API_ROUTES.COMPANYADMIN.GET_EMPLOYEE_BY_ID.replace("<id>", employeeId)
    );
  }

  static updateEmployee(employeeId: string, body: CreateEmployeeBody) {
    return HttpUtil.put(
      API_ROUTES.COMPANYADMIN.UPDATE_EMPLOYEE.replace("<id>", employeeId),
      body
    );
  }

  static deleteEmployee(employeeId: string) {
    return HttpUtil.delete(
      API_ROUTES.COMPANYADMIN.DELETE_EMPLOYEE.replace("<id>", employeeId)
    );
  }

  static updateEmployeeStatus(employeeId: string, isActive: boolean) {
    return HttpUtil.patch(
      API_ROUTES.COMPANYADMIN.UPDATE_EMPLOYEE_STATUS.replace("<id>", employeeId),
      { isActive }
    );
  }

  static getProjectTypes(params: GetProjectTypesParams = {}) {
    const {
      page = 1,
      limit = 10,
      search = "",
      isActive,
      sortBy = "projectType",
      sortOrder = "ASC",
    } = params;
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", String(limit));
    if (search.trim()) query.set("search", search.trim());
    if (isActive !== undefined) query.set("isActive", String(isActive));
    query.set("sortBy", sortBy);
    query.set("sortOrder", sortOrder);
    const url = `${API_ROUTES.COMPANYADMIN.GET_PROJECT_TYPES}?${query.toString()}`;
    return HttpUtil.get(url);
  }

  static getAllProjectTypes(params: GetAllProjectTypesParams = {}) {
    const { search = "", isActive = true } = params;
    const query = new URLSearchParams();
    if (search.trim()) query.set("search", search.trim());
    if (isActive !== undefined) query.set("isActive", String(isActive));
    const url = `${API_ROUTES.COMPANYADMIN.GET_ALL_PROJECT_TYPES}?${query.toString()}`;
    return HttpUtil.get(url);
  }

  static getProjects(params: GetProjectsParams = {}) {
    const { page = 1, limit = 10, clientId, status } = params;
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", String(limit));
    if (clientId) query.set("clientId", clientId);
    if (status) query.set("status", status);
    const url = `${API_ROUTES.COMPANYADMIN.GET_PROJECTS}?${query.toString()}`;
    return HttpUtil.get(url);
  }

  static createProjectType(body: CreateProjectTypeBody) {
    return HttpUtil.post(API_ROUTES.COMPANYADMIN.CREATE_PROJECT_TYPE, body);
  }

  static updateProjectType(projectTypeId: string, body: CreateProjectTypeBody) {
    return HttpUtil.put(
      API_ROUTES.COMPANYADMIN.UPDATE_PROJECT_TYPE.replace("<id>", projectTypeId),
      body
    );
  }

  static deleteProjectType(projectTypeId: string) {
    return HttpUtil.delete(
      API_ROUTES.COMPANYADMIN.DELETE_PROJECT_TYPE.replace("<id>", projectTypeId)
    );
  }

  static updateProjectTypeStatus(projectTypeId: string, isActive: boolean) {
    return HttpUtil.patch(
      API_ROUTES.COMPANYADMIN.UPDATE_PROJECT_TYPE_STATUS.replace("<id>", projectTypeId),
      { isActive }
    );
  }

  static getProjectCategories(params: GetProjectCategoriesParams = {}) {
    const {
      page = 1,
      limit = 10,
      search = "",
      isActive,
      sortBy = "projectCategory",
      sortOrder = "ASC",
    } = params;
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", String(limit));
    if (search.trim()) query.set("search", search.trim());
    if (isActive !== undefined) query.set("isActive", String(isActive));
    query.set("sortBy", sortBy);
    query.set("sortOrder", sortOrder);
    const url = `${API_ROUTES.COMPANYADMIN.GET_PROJECT_CATEGORIES}?${query.toString()}`;
    return HttpUtil.get(url);
  }

  static getAllProjectCategories(params: GetAllProjectCategoriesParams = {}) {
    const { search = "", isActive = true } = params;
    const query = new URLSearchParams();
    if (search.trim()) query.set("search", search.trim());
    if (isActive !== undefined) query.set("isActive", String(isActive));
    const url = `${API_ROUTES.COMPANYADMIN.GET_ALL_PROJECT_CATEGORIES}?${query.toString()}`;
    return HttpUtil.get(url);
  }

  static createProjectCategory(body: CreateProjectCategoryBody) {
    return HttpUtil.post(API_ROUTES.COMPANYADMIN.CREATE_PROJECT_CATEGORY, body);
  }

  static updateProjectCategory(projectCategoryId: string, body: CreateProjectCategoryBody) {
    return HttpUtil.put(
      API_ROUTES.COMPANYADMIN.UPDATE_PROJECT_CATEGORY.replace("<id>", projectCategoryId),
      body
    );
  }

  static deleteProjectCategory(projectCategoryId: string) {
    return HttpUtil.delete(
      API_ROUTES.COMPANYADMIN.DELETE_PROJECT_CATEGORY.replace("<id>", projectCategoryId)
    );
  }

  static updateProjectCategoryStatus(projectCategoryId: string, isActive: boolean) {
    return HttpUtil.patch(
      API_ROUTES.COMPANYADMIN.UPDATE_PROJECT_CATEGORY_STATUS.replace("<id>", projectCategoryId),
      { isActive }
    );
  }
}
