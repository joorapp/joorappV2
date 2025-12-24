/**
 * @author Ananthapadmanabhan V K
 * Http utility for the application
 * This file contains the http utility for the application
 * @returns HttpUtil class with post, put, get, delete, patch, uniterceptedPost, uniterceptedGet
 * @param url - The url to make the request to
 * @param params - The parameters to send with the request
 * @returns The response from the request
 */

import axios from "./http-incep";
import unincepaxios from "./http-unintercept";

export default class HttpUtil {
  static post(url: string, params: any = {}) {
    return axios.post(url, params, {});
  }
  static put(url: string, params: any = {}) {
    return axios.put(url, params, {});
  }
  static get(url: string, params: any = {}) {
    return axios.get(url, params);
  }
  static delete(url: string, params: any = {}) {
    return axios.delete(url, params);
  }
  static patch(url: string, params: any = {}) {
    return axios.patch(url, params);
  }
 
  // Unauthenticated requests
  static uniterceptedPost(url: string, params: any = {}) {
    return unincepaxios.post(url, params, {});
  }
  static uniterceptedGet(url: string, params: any = {}) {
    return unincepaxios.get(url, params);
  }
}

