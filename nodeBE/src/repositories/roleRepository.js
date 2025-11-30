/**
 * @author Bhavesh Venugopal
 * Role Repository
 * Data access layer for CompanyRole entity
 * Extends BaseRepository with Role-specific complex queries
 */

import { BaseRepository } from './base/BaseRepository.js';
import { CompanyRole, CompanyUser, User } from '../models/index.js';
import { Op } from 'sequelize';
import { NotFoundError } from '../utils/errors.js';

/**
 * RoleRepository class
 * Handles all database operations for CompanyRole entity
 * Provides complex queries beyond standard CRUD operations
 */
export class RoleRepository extends BaseRepository {
  /**
   * Constructor for RoleRepository
   * Initializes repository with CompanyRole model
   */
  constructor() {
    super(CompanyRole, 'CompanyRole');
  }

  /**
   * Find role with all user assignments
   * Complex join query with CompanyUser and User
   * @param {string} roleId - Role UUID
   * @param {Object} options - Additional Sequelize query options
   * @returns {Promise<Object>} Role object with user assignments populated
   * @throws {NotFoundError} If role not found
   * 
   * @example
   * const role = await roleRepository.findRoleWithAssignments('role-uuid');
   * // Returns role with assignments array containing users
   */
  async findRoleWithAssignments(roleId, options = {}) {
    this.logger.debug('Finding role with assignments', { roleId });
    
    const role = await this.Model.findByPk(roleId, {
      ...options,
      include: [
        {
          model: CompanyUser,
          as: 'assignments',
          include: [
            {
              model: User,
              as: 'user'
            }
          ]
        }
      ]
    });
    
    if (!role) {
      throw new NotFoundError(this.entityName, roleId);
    }
    
    return role;
  }

  /**
   * Get all global roles
   * CompanyRole is a master/global table created by super admin
   * All companies can use these roles
   * @param {Object} options - Additional Sequelize query options
   * @returns {Promise<Array>} Array of all active global roles
   * 
   * @example
   * const roles = await roleRepository.getRoles();
   */
  async getRoles(options = {}) {
    this.logger.debug('Getting all global roles');
    
    // Return all active roles (global master table)
    return await this.findActiveRoles({}, options);
  }

  /**
   * Find only active roles (isActive = true)
   * @param {Object} filters - Additional Sequelize where clause filters
   * @param {Object} options - Sequelize query options
   * @returns {Promise<Array>} Array of active roles
   * 
   * @example
   * const activeRoles = await roleRepository.findActiveRoles({}, { limit: 10 });
   */
  async findActiveRoles(filters = {}, options = {}) {
    this.logger.debug('Finding active roles', { filters });
    
    return await this.Model.findAll({
      where: {
        ...filters,
        isActive: true
      },
      ...options
    });
  }

  /**
   * Find role by unique code
   * @param {string} code - Role code (unique identifier)
   * @param {Object} options - Additional Sequelize query options
   * @returns {Promise<Object|null>} Role object or null if not found
   * 
   * @example
   * const role = await roleRepository.findRoleByCode('COMPANY_ADMIN');
   */
  async findRoleByCode(code, options = {}) {
    this.logger.debug('Finding role by code', { code });
    
    return await this.Model.findOne({
      where: { code },
      ...options
    });
  }
}

// Export singleton instance
export const roleRepository = new RoleRepository();

