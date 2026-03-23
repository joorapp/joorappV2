/**
 * @author Bhavesh Venugopal
 * Client Repository
 * Handles all database operations for Clients
 */

import { BaseRepository } from './base/BaseRepository.js';
import Client from '../models/Client.js';
import { Op } from 'sequelize';

class ClientRepository extends BaseRepository {
  constructor() {
    super(Client);
  }

  /**
   * All non-deleted clients for a company (dropdown / full list without pagination)
   * @param {string} companyId - createdCompanyId
   * @param {Object} [filters] - { search?, isActive? } — omit isActive for both active and inactive
   * @param {Object} [options] - Sequelize options
   * @returns {Promise<Array>}
   */
  async findAllForCompany(companyId, filters = {}, options = {}) {
    const { search, isActive } = filters;
    const where = {
      createdCompanyId: companyId
    };
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }
    return await this.Model.findAll({
      where,
      order: [['name', 'ASC']],
      ...options
    });
  }
}

export const clientRepository = new ClientRepository();
