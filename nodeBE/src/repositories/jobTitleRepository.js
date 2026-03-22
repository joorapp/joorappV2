/**
 * @author Bhavesh Venugopal
 * JobTitle Repository
 * Data access for job titles scoped by created company
 */

import { BaseRepository } from './base/BaseRepository.js';
import { JobTitle } from '../models/index.js';
import { Op } from 'sequelize';

export class JobTitleRepository extends BaseRepository {
  constructor() {
    super(JobTitle, 'JobTitle');
  }

  /**
   * Build list filters (search, isActive)
   * @param {Object} filters
   * @param {boolean} [filters.isActive]
   * @param {string} [filters.search]
   * @returns {Object} Sequelize where fragment
   */
  _listWhereFragment(filters = {}) {
    const { isActive, search } = filters;
    const fragment = {};
    if (isActive !== undefined) {
      fragment.isActive = isActive;
    }
    if (search) {
      fragment[Op.or] = [
        { jobTitle: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    return fragment;
  }

  /**
   * Paginated list for a single owning company
   * @param {string} companyId - createdCompanyId
   * @param {Object} filters - { isActive?, search? }
   * @param {Object} pagination - { limit, offset }
   * @param {Array} order - Sequelize order
   * @param {Object} [options] - Sequelize options
   * @returns {Promise<{ rows: Array, count: number }>}
   */
  async findAndCountByCreatedCompany(companyId, filters, pagination, order, options = {}) {
    const { limit, offset } = pagination;
    const where = {
      createdCompanyId: companyId,
      ...this._listWhereFragment(filters)
    };
    return await this.Model.findAndCountAll({
      where,
      limit,
      offset,
      order,
      distinct: true,
      ...options
    });
  }

  /**
   * Paginated list where createdCompanyId is one of the given companies (tenant + system)
   * @param {string[]} companyIds - [tenantCompanyId, systemCompanyId]
   * @param {Object} filters - { isActive?, search? }
   * @param {Object} pagination - { limit, offset }
   * @param {Array} order - Sequelize order
   * @param {Object} [options]
   * @returns {Promise<{ rows: Array, count: number }>}
   */
  async findAndCountByCreatedCompanies(companyIds, filters, pagination, order, options = {}) {
    const { limit, offset } = pagination;
    const where = {
      createdCompanyId: { [Op.in]: companyIds },
      ...this._listWhereFragment(filters)
    };
    return await this.Model.findAndCountAll({
      where,
      limit,
      offset,
      order,
      distinct: true,
      ...options
    });
  }

  /**
   * All active job titles for dropdown: system company + current company, ordered by name
   * @param {string} currentCompanyId - Tenant company id
   * @param {string} systemCompanyId - Super admin company id
   * @param {Object} [filters] - { search? }
   * @param {Object} [options] - Sequelize options
   * @returns {Promise<Array>}
   */
  async findAllForCompanyDropdown(currentCompanyId, systemCompanyId, filters = {}, options = {}) {
    const { search } = filters;
    const where = {
      createdCompanyId: { [Op.in]: [currentCompanyId, systemCompanyId] },
      isActive: true,
      ...this._listWhereFragment({ search })
    };
    return await this.Model.findAll({
      where,
      order: [['jobTitle', 'ASC']],
      ...options
    });
  }

  /**
   * Case-sensitive duplicate check per owning company (title text must be unique per company)
   * @param {string} jobTitle - Title text
   * @param {string} createdCompanyId - Owning company
   * @param {string|null} [excludeId] - Exclude id on update
   * @param {Object} [options]
   * @returns {Promise<Object|null>}
   */
  async findOneByTitleAndCompany(jobTitle, createdCompanyId, excludeId = null, options = {}) {
    const where = {
      jobTitle,
      createdCompanyId
    };
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }
    return await this.findOne(where, options);
  }
}

export const jobTitleRepository = new JobTitleRepository();
