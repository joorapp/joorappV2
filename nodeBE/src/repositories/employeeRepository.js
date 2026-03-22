/**
 * @author Bhavesh Venugopal
 * Employee repository — company-scoped employees
 */

import { Op } from 'sequelize';
import { BaseRepository } from './base/BaseRepository.js';
import Employee from '../models/Employee.js';
import JobTitle from '../models/JobTitle.js';

const jobTitleInclude = {
  model: JobTitle,
  as: 'jobTitle',
  attributes: ['id', 'jobTitle', 'description', 'isActive']
};

export class EmployeeRepository extends BaseRepository {
  constructor() {
    super(Employee, 'Employee');
  }

  /**
   * @param {string} companyId - createdCompanyId
   * @param {Object} filters - { search?, jobTitleId?, isActive? }
   * @returns {Object} Sequelize where clause
   */
  _whereForCompanyList(companyId, filters = {}) {
    const { search, jobTitleId, isActive } = filters;
    const where = { createdCompanyId: companyId };
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (jobTitleId) {
      where.jobTitleId = jobTitleId;
    }
    if (search) {
      const term = `%${search}%`;
      where[Op.or] = [
        { firstName: { [Op.iLike]: term } },
        { lastName: { [Op.iLike]: term } },
        { email: { [Op.iLike]: term } },
        { phone: { [Op.iLike]: term } }
      ];
    }
    return where;
  }

  /**
   * @param {string} companyId
   * @param {string} normalizedEmail
   * @param {string|null} excludeId
   * @returns {Promise<Object|null>}
   */
  async findOneByCompanyAndEmail(companyId, normalizedEmail, excludeId = null) {
    const where = {
      createdCompanyId: companyId,
      email: normalizedEmail
    };
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }
    return await this.findOne(where);
  }

  /**
   * Paginated employees for company
   * @param {string} companyId
   * @param {Object} filters
   * @param {Object} pagination - { limit, offset }
   * @param {Array} order
   * @param {Object} [options]
   * @returns {Promise<{ rows: Array, count: number }>}
   */
  async findAndCountByCompany(companyId, filters, pagination, order, options = {}) {
    const { limit, offset } = pagination;
    const where = this._whereForCompanyList(companyId, filters);
    return await this.Model.findAndCountAll({
      where,
      limit,
      offset,
      order,
      distinct: true,
      include: [jobTitleInclude],
      ...options
    });
  }

  /**
   * All employees for company (no pagination) — filters only
   * @param {string} companyId
   * @param {Object} filters
   * @param {Array} order
   * @param {Object} [options]
   * @returns {Promise<Array>}
   */
  async findAllByCompany(companyId, filters, order, options = {}) {
    const where = this._whereForCompanyList(companyId, filters);
    return await this.Model.findAll({
      where,
      order,
      include: [jobTitleInclude],
      ...options
    });
  }
}

export const employeeRepository = new EmployeeRepository();
