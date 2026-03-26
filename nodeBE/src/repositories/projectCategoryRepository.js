/**
 * @author Bhavesh Venugopal
 * ProjectCategory Repository
 * Data access for project categories scoped by created company
 */

import { BaseRepository } from './base/BaseRepository.js';
import { ProjectCategory } from '../models/index.js';
import { Op } from 'sequelize';

export class ProjectCategoryRepository extends BaseRepository {
  constructor() {
    super(ProjectCategory, 'ProjectCategory');
  }

  _listWhereFragment(filters = {}) {
    const { isActive, search } = filters;
    const fragment = {};
    if (isActive !== undefined) {
      fragment.isActive = isActive;
    }
    if (search) {
      fragment[Op.or] = [
        { projectCategory: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    return fragment;
  }

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

  async findAllForCompanyDropdown(currentCompanyId, systemCompanyId, filters = {}, options = {}) {
    const { search, isActive } = filters;
    const where = {
      createdCompanyId: { [Op.in]: [currentCompanyId, systemCompanyId] },
      ...this._listWhereFragment({ search, isActive })
    };
    return await this.Model.findAll({
      where,
      order: [['projectCategory', 'ASC']],
      ...options
    });
  }

  async findOneByCategoryAndCompany(projectCategory, createdCompanyId, excludeId = null, options = {}) {
    const where = {
      projectCategory,
      createdCompanyId
    };
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }
    return await this.findOne(where, options);
  }
}

export const projectCategoryRepository = new ProjectCategoryRepository();
