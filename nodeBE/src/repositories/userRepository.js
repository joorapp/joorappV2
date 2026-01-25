/**
 * @author Bhavesh Venugopal
 * User Repository
 * Data access layer for User entity
 * Extends MasterBaseRepository (master data - no context required)
 */

import { MasterBaseRepository } from './base/MasterBaseRepository.js';
import { User, Company, CompanyUser, CompanyRole } from '../models/index.js';
import { Op } from 'sequelize';
import { NotFoundError } from '../utils/errors.js';

/**
 * UserRepository class
 * Handles all database operations for User entity
 * Provides complex queries beyond standard CRUD operations
 */
export class UserRepository extends MasterBaseRepository {
  /**
   * Constructor for UserRepository
   * Initializes repository with User model
   */
  constructor() {
    super(User, 'User');
  }

  /**
   * Find user with all associated companies and roles
   * Complex join query with CompanyUser and CompanyRole
   * @param {string} userId - User UUID
   * @param {Object} options - Additional Sequelize query options
   * @returns {Promise<Object>} User object with companies and roles populated
   * @throws {NotFoundError} If user not found
   * 
   * @example
   * const user = await userRepository.findUserWithCompanies('user-uuid');
   * // Returns user with companies array, each containing role information
   */
  async findUserWithCompanies(userId, options = {}) {
    this.logger.debug('Finding user with companies', { userId });
    
    const user = await this.Model.findByPk(userId, {
      ...options,
      include: [
        {
          model: CompanyUser,
          as: 'companyUsers',
          required: false,  // LEFT JOIN - include user even if no companies
          include: [
            {
              model: Company,
              as: 'company'
            },
            {
              model: CompanyRole,
              as: 'role'
            }
          ]
        }
      ]
    });
    
    if (!user) {
      throw new NotFoundError(this.entityName, userId);
    }
    
    return user;
  }

  /**
   * Search users with OR conditions across multiple fields
   * Searches in email, firstName, and lastName fields
   * @param {string} searchTerm - Search term to match
   * @param {Object} pagination - Pagination parameters { limit, offset }
   * @param {Array} sort - Sequelize order array (e.g., [['email', 'ASC']])
   * @param {Object} options - Additional Sequelize query options
   * @returns {Promise<Object>} { rows: Array, count: number }
   * 
   * @example
   * const result = await userRepository.searchUsers('john', { limit: 10, offset: 0 }, [['email', 'ASC']]);
   */
  async searchUsers(searchTerm, pagination = {}, sort = [], options = {}) {
    this.logger.debug('Searching users', { searchTerm, pagination, sort });
    
    const { limit = 10, offset = 0 } = pagination;
    
    // Build search filter with OR conditions (case-insensitive)
    const where = searchTerm ? {
      [Op.or]: [
        { email: { [Op.iLike]: `%${searchTerm}%` } },
        { firstName: { [Op.iLike]: `%${searchTerm}%` } },
        { lastName: { [Op.iLike]: `%${searchTerm}%` } }
      ]
    } : {};
    
    return await this.Model.findAndCountAll({
      where,
      limit,
      offset,
      order: sort.length > 0 ? sort : [['email', 'ASC']],
      ...options
    });
  }

  /**
   * Find all users in a specific company
   * Joins with CompanyUser to filter by companyId
   * @param {string} companyId - Company UUID
   * @param {Object} options - Additional Sequelize query options (limit, offset, order, etc.)
   * @returns {Promise<Array>} Array of users in the company
   * 
   * @example
   * const users = await userRepository.findUsersByCompany('company-uuid', { limit: 10, offset: 0 });
   */
  async findUsersByCompany(companyId, options = {}) {
    this.logger.debug('Finding users by company', { companyId });
    
    return await this.Model.findAll({
      ...options,
      include: [
        {
          model: CompanyUser,
          as: 'companyUsers',
          where: { companyId },
          required: true,
          include: [
            {
              model: CompanyRole,
              as: 'role'
            }
          ]
        }
      ]
    });
  }
}

// Export singleton instance
export const userRepository = new UserRepository();

