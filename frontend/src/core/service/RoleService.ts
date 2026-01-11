/**
 * @author Ananthapadmanabhan V K
 * Role service for the application
 * This file contains the role service for the application
 * @returns RoleService class with role-related API methods
 */

import API_ROUTES from "../constants/api";
import HttpUtil from "../http-handler/http-util";

export default class RoleService {
  /**
   * Create a new role
   * @param roleData - Role data to create
   * @param roleData.name - Role name
   * @param roleData.code - Role code (unique identifier)
   * @param roleData.description - Role description (optional)
   * @param roleData.isActive - Role active status
   * @returns Promise with the created role response
   */
  static createRole(roleData: {
    name: string;
    code: string;
    description?: string;
    isActive: boolean;
  }) {
    return HttpUtil.post(API_ROUTES.SUPERADMIN.CREATE_ROLE, roleData);
  }

  /**
   * Get roles list with pagination
   * @param params - Query parameters for pagination and filtering
   * @param params.page - Page number (default: 1)
   * @param params.limit - Items per page (default: 10)
   * @param params.search - Search term (optional)
   * @param params.isActive - Filter by active status (optional)
   * @param params.sortBy - Sort field (default: 'name')
   * @param params.sortOrder - Sort order 'ASC' | 'DESC' (default: 'ASC')
   * @returns Promise with the roles list response
   */
  static getRoles(params?: {
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

    const baseUrl = API_ROUTES.SUPERADMIN.GET_ROLES_LIST.split('?')[0];
    const url = `${baseUrl}?${queryParams.toString()}`;

    return HttpUtil.get(url);
  }

  /**
   * Update a role by ID
   * @param roleId - Role ID to update
   * @param roleData - Role data to update
   * @param roleData.name - Role name
   * @param roleData.code - Role code (unique identifier)
   * @param roleData.description - Role description (optional)
   * @param roleData.isActive - Role active status
   * @returns Promise with the updated role response
   */
  static updateRole(roleId: string, roleData: {
    name: string;
    code: string;
    description?: string;
    isActive: boolean;
  }) {
    return HttpUtil.put(
      API_ROUTES.SUPERADMIN.UPDATE_ROLE.replace("<roleId>", roleId),
      roleData
    );
  }

  /**
   * Delete a role by ID
   * @param roleId - Role ID to delete
   * @returns Promise with the delete response
   */
  static deleteRole(roleId: string) {
    return HttpUtil.delete(
      API_ROUTES.SUPERADMIN.DELETE_ROLE.replace("<roleId>", roleId)
    );
  }
}

