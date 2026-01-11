/**
 * @author Ananthapadmanabhan V K
 * User service for the application
 * This file contains the user service for the application
 * @returns UserService class with getUsers, getUserDetails, createUser, updateUser, deleteUser
 */

import API_ROUTES from "../constants/api";
import HttpUtil from "../http-handler/http-util";

export default class UserService {
  static getUsersList(page: number = 0, limit: number = 10, search: string = "") {
    return HttpUtil.get(
      API_ROUTES.SUPERADMIN.GET_USERS_LIST
        .replace("<page>", page.toString())
        .replace("<limit>", limit.toString())
        .replace("<search>", search)
    );
  }

  static getUserById(userId: string) {
    return HttpUtil.get(
      API_ROUTES.SUPERADMIN.GET_USER_BY_ID.replace("<userId>", userId)
    );
  }

  static createUser(userData: any) {
    return HttpUtil.post(API_ROUTES.SUPERADMIN.CREATE_USER, userData);
  }

  static updateUser(userId: string, userData: any) {
    return HttpUtil.put(
      API_ROUTES.SUPERADMIN.UPDATE_USER.replace("<userId>", userId),
      userData
    );
  }

  static deleteUser(userId: string) {
    return HttpUtil.delete(
      API_ROUTES.SUPERADMIN.DELETE_USER.replace("<userId>", userId)
    );
  }

  static assignUserToCompany(userId: string, companyId: string, roleId: string) {
    return HttpUtil.post(
      API_ROUTES.SUPERADMIN.ASSIGN_USER_TO_COMPANY.replace("<userId>", userId),
      { companyId, roleId }
    );
  }

  static updateUserCompanyRole(userId: string, companyId: string, roleId: string) {
    return HttpUtil.put(
      API_ROUTES.SUPERADMIN.UPDATE_USER_COMPANY_ROLE
        .replace("<userId>", userId)
        .replace("<companyId>", companyId),
      { roleId }
    );
  }
}

