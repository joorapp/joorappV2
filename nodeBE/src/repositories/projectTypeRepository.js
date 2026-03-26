/**
 * @author Bhavesh Venugopal
 * ProjectType Repository
 * Data access for project types scoped by created company
 */

import { BaseRepository } from './base/BaseRepository.js';
import { ProjectType } from '../models/index.js';
import { Op } from 'sequelize';

export class ProjectTypeRepository extends BaseRepository {
  constructor() {
    super(ProjectType, 'ProjectType');
  }

  /**
   * @param {Object} filters
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
        { projectType: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    return fragment;
  }

  /**
   * @param {string} companyId
   * @param {Object} filters
   * @param {Object} pagination
   * @param {Array} order
   * @param {Object} [options]
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
   * @param {string[]} companyIds
   * @param {Object} filters
   * @param {Object} pagination
   * @param {Array} order
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
   * @param {string} currentCompanyId
   * @param {string} systemCompanyId
   * @param {Object} [filters] - { search?, isActive? }
   * @param {Object} [options]
   * @returns {Promise<Array>}
   */
  async findAllForCompanyDropdown(currentCompanyId, systemCompanyId, filters = {}, options = {}) {
    const { search, isActive } = filters;
    const where = {
      createdCompanyId: { [Op.in]: [currentCompanyId, systemCompanyId] },
      ...this._listWhereFragment({ search, isActive })
    };
    return await this.Model.findAll({
      where,
      order: [['projectType', 'ASC']],
      ...options
    });
  }

  /**
   * @param {string} projectType
   * @param {string} createdCompanyId
   * @param {string|null} [excludeId]
   * @param {Object} [options]
   * @returns {Promise<Object|null>}
   */
  async findOneByTypeAndCompany(projectType, createdCompanyId, excludeId = null, options = {}) {
    const where = {
      projectType,
      createdCompanyId
    };
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }
    return await this.findOne(where, options);
  }
}

export const projectTypeRepository = new ProjectTypeRepository();
