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

