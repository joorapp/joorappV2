/**
 * @author Bhavesh Venugopal
 * Company Repository
 * Data access layer for Company entity
 * Extends BaseRepository with Company-specific complex queries
 */

import { BaseRepository } from './base/BaseRepository.js';
import { Company, User, CompanyUser, CompanyRole } from '../models/index.js';
import { Op } from 'sequelize';
import { NotFoundError } from '../utils/errors.js';
import { SUPER_ADMIN_COMPANY_NAME } from '../constants/superAdmin.js';

/**
 * CompanyRepository class
 * Handles all database operations for Company entity
 * Provides complex queries beyond standard CRUD operations
 */
export class CompanyRepository extends BaseRepository {
  /**
   * Constructor for CompanyRepository
   * Initializes repository with Company model
   */
  constructor() {
    super(Company, 'Company');
  }

  /**
   * Find company with all associated users and their roles
   * Complex join query with CompanyUser and User
   * @param {string} companyId - Company UUID
   * @param {Object} options - Additional Sequelize query options
   * @returns {Promise<Object>} Company object with users and roles populated
   * @throws {NotFoundError} If company not found
   * 
   * @example
   * const company = await companyRepository.findCompanyWithUsers('company-uuid');
   * // Returns company with users array, each containing role information
   */
  async findCompanyWithUsers(companyId, options = {}) {
    this.logger.debug('Finding company with users', { companyId });
    
    const company = await this.Model.findByPk(companyId, {
      ...options,
      include: [
        {
          model: CompanyUser,
          as: 'users',
          include: [
            {
              model: User,
              as: 'user'
            },
            {
              model: CompanyRole,
              as: 'role'
            }
          ]
        }
      ]
    });
    
    if (!company) {
      throw new NotFoundError(this.entityName, companyId);
    }
    
    return company;
  }

  /**
   * Search companies by name
   * @param {string} searchTerm - Search term to match
   * @param {Object} pagination - Pagination parameters { limit, offset }
   * @param {Array} sort - Sequelize order array (e.g., [['name', 'ASC']])
   * @param {Object} options - Additional Sequelize query options
   * @returns {Promise<Object>} { rows: Array, count: number }
   * 
   * @example
   * const result = await companyRepository.searchCompanies('acme', { limit: 10, offset: 0 }, [['name', 'ASC']]);
   */
  async searchCompanies(searchTerm, pagination = {}, sort = [], options = {}) {
    this.logger.debug('Searching companies', { searchTerm, pagination, sort });
    
    const { limit = 10, offset = 0 } = pagination;
    
    // Build search filter (case-insensitive)
    const where = searchTerm ? {
      name: { [Op.iLike]: `%${searchTerm}%` }
    } : {};
    
    return await this.Model.findAndCountAll({
      where,
      limit,
      offset,
      order: sort.length > 0 ? sort : [['name', 'ASC']],
      ...options
    });
  }

  /**
   * Find companies created by a specific user
   * Filters by createdUserId audit field
   * @param {string} userId - User UUID
   * @param {Object} options - Additional Sequelize query options
   * @returns {Promise<Array>} Array of companies created by the user
   * 
   * @example
   * const companies = await companyRepository.findCompaniesByCreatedUser('user-uuid');
   */
  async findCompaniesByCreatedUser(userId, options = {}) {
    this.logger.debug('Finding companies by created user', { userId });
    
    return await this.Model.findAll({
      where: { createdUserId: userId },
      ...options
    });
  }

  /**
   * Find only active companies (isActive = true)
   * @param {Object} filters - Additional Sequelize where clause filters
   * @param {Object} options - Sequelize query options
   * @returns {Promise<Array>} Array of active companies
   * 
   * @example
   * const activeCompanies = await companyRepository.findActiveCompanies({}, { limit: 10 });
   */
  async findActiveCompanies(filters = {}, options = {}) {
    this.logger.debug('Finding active companies', { filters });
    
    return await this.Model.findAll({
      where: {
        ...filters,
        isActive: true
      },
      ...options
    });
  }

  /**
   * Find the super admin (system) company by configured name
   * @param {Object} options - Sequelize query options
   * @returns {Promise<Object|null>} Company row or null
   */
  async findSuperAdminCompany(options = {}) {
    this.logger.debug('Finding super admin company by name', { name: SUPER_ADMIN_COMPANY_NAME });
    return await this.Model.findOne({
      where: { name: SUPER_ADMIN_COMPANY_NAME },
      ...options
    });
  }
}

// Export singleton instance
export const companyRepository = new CompanyRepository();

