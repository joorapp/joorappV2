/**
 * @author Bhavesh Venugopal
 * CompanyUser Repository
 * Data access layer for CompanyUser entity
 * Extends BaseRepository with CompanyUser-specific complex queries and upsert logic
 */

import { BaseRepository } from './base/BaseRepository.js';
import { CompanyUser, User, Company, CompanyRole } from '../models/index.js';
import { validateContext } from '../utils/contextHelpers.js';

/**
 * CompanyUserRepository class
 * Handles all database operations for CompanyUser entity (junction table)
 * Provides complex queries and handles unique constraint (userId, companyId)
 */
export class CompanyUserRepository extends BaseRepository {
  /**
   * Constructor for CompanyUserRepository
   * Initializes repository with CompanyUser model
   */
  constructor() {
    super(CompanyUser, 'CompanyUser');
  }

  /**
   * Find all companies for a specific user with roles
   * @param {string} userId - User UUID
   * @param {Object} options - Additional Sequelize query options
   * @returns {Promise<Array>} Array of CompanyUser records with company and role populated
   * 
   * @example
   * const userCompanies = await companyUserRepository.findUserCompanies('user-uuid');
   * // Returns array of CompanyUser records with company and role details
   */
  async findUserCompanies(userId, options = {}) {
    this.logger.debug('Finding user companies', { userId });
    
    return await this.Model.findAll({
      where: { userId },
      ...options,
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
    });
  }

  /**
   * Find all users in a specific company with roles
   * @param {string} companyId - Company UUID
   * @param {Object} options - Additional Sequelize query options (limit, offset, etc.)
   * @returns {Promise<Array|Object>} Array of CompanyUser records, or {rows, count} if paginated
   * 
   * @example
   * const companyUsers = await companyUserRepository.findCompanyUsers('company-uuid', { limit: 10 });
   * // Returns {rows: [...], count: total} when limit/offset provided
   */
  async findCompanyUsers(companyId, options = {}) {
    this.logger.debug('Finding company users', { companyId });
    
    const queryOptions = {
      where: { companyId },
      ...options,
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
    };
    
    // Use findAndCountAll when pagination options are provided
    if (options.limit || options.offset) {
      return await this.Model.findAndCountAll(queryOptions);
    }
    
    return await this.Model.findAll(queryOptions);
  }

  /**
   * Find specific user-company-role relationship
   * @param {string} userId - User UUID
   * @param {string} companyId - Company UUID
   * @param {Object} options - Additional Sequelize query options
   * @returns {Promise<Object|null>} CompanyUser record or null if not found
   * 
   * @example
   * const assignment = await companyUserRepository.findUserCompanyRole('user-uuid', 'company-uuid');
   */
  async findUserCompanyRole(userId, companyId, options = {}) {
    this.logger.debug('Finding user company role', { userId, companyId });
    
    return await this.Model.findOne({
      where: { userId, companyId },
      ...options,
      include: [
        {
          model: CompanyRole,
          as: 'role'
        }
      ]
    });
  }

  /**
   * Check if user is assigned to a company
   * @param {string} userId - User UUID
   * @param {string} companyId - Company UUID
   * @returns {Promise<boolean>} True if user is assigned to company
   * 
   * @example
   * const isAssigned = await companyUserRepository.checkUserInCompany('user-uuid', 'company-uuid');
   */
  async checkUserInCompany(userId, companyId) {
    this.logger.debug('Checking user in company', { userId, companyId });
    
    const count = await this.Model.count({
      where: { userId, companyId }
    });
    
    return count > 0;
  }

  /**
   * Find only active company-user assignments (isActive = true)
   * @param {Object} filters - Additional Sequelize where clause filters
   * @param {Object} options - Sequelize query options
   * @returns {Promise<Array>} Array of active CompanyUser assignments
   * 
   * @example
   * const activeAssignments = await companyUserRepository.findActiveAssignments({ userId: 'user-uuid' });
   */
  async findActiveAssignments(filters = {}, options = {}) {
    this.logger.debug('Finding active assignments', { filters });
    
    return await this.Model.findAll({
      where: {
        ...filters,
        isActive: true
      },
      ...options
    });
  }

  /**
   * Assign user to company with role (upsert pattern)
   * Handles unique constraint: updates if assignment exists, creates if new
   * @param {string} userId - User UUID
   * @param {string} companyId - Company UUID
   * @param {string} roleId - CompanyRole UUID
   * @param {Object} context - Audit context { userId }
   * @param {Object} options - Sequelize options (transaction, etc.)
   * @returns {Promise<Object>} CompanyUser assignment record
   * @throws {Error} If context is invalid
   * 
   * @example
   * const assignment = await companyUserRepository.assignUserToCompany(
   *   'user-uuid',
   *   'company-uuid',
   *   'role-uuid',
   *   { userId: 'admin-uuid' }
   * );
   */
  async assignUserToCompany(userId, companyId, roleId, context, options = {}) {
    validateContext(context, ['userId']);
    
    this.logger.debug('Assigning user to company', { userId, companyId, roleId, context });
    
    // Try to find existing assignment
    const existing = await this.findOne({ userId, companyId }, options);
    
    if (existing) {
      // Update existing assignment
      this.logger.debug('Updating existing assignment', { id: existing.id });
      await existing.update(
        {
          companyRoleId: roleId,
          isActive: true // Reactivate if was inactive
        },
        {
          ...options,
          context: {
            userId: context.userId
          }
        }
      );
      return existing;
    } else {
      // Create new assignment
      this.logger.debug('Creating new assignment');
      return await this.create(
        {
          userId,
          companyId,
          companyRoleId: roleId,
          isActive: true
        },
        context,
        options
      );
    }
  }
}

// Export singleton instance
export const companyUserRepository = new CompanyUserRepository();

