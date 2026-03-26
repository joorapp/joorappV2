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

export default class CompanyAdminService {
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
}
