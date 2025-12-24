/**
 * @author Ananthapadmanabhan V K
 * User service for the application
 * This file contains the user service for the application
 * @returns UserService class with getUsers, getUserDetails, createUser, updateUser, deleteUser
 */

import API_ROUTES from "../constants/api";
import HttpUtil from "../http-handler/http-util";

export default class UserService {
  static getUsers(pageNumber: number = 0, pageSize: number = 10, key: string = "") {
    return HttpUtil.get(
      API_ROUTES.USER.GET_USERS
        .replace("<pageNumber>", pageNumber.toString())
        .replace("<pageSize>", pageSize.toString())
        .replace("<key>", key)
    );
  }

  static getUserDetails(userId: string) {
    return HttpUtil.get(
      API_ROUTES.USER.GET_USER_DETAILS.replace("<userId>", userId)
    );
  }

  static createUser(userData: any) {
    return HttpUtil.post(API_ROUTES.USER.CREATE_USER, userData);
  }

  static updateUser(userId: string, userData: any) {
    return HttpUtil.put(
      API_ROUTES.USER.UPDATE_USER.replace("<userId>", userId),
      userData
    );
  }

  static deleteUser(userId: string) {
    return HttpUtil.delete(
      API_ROUTES.USER.DELETE_USER.replace("<userId>", userId)
    );
  }
}

