/**
 * @author Bhavesh Venugopal
 * Plan Repository
 * Data access layer for Plan entity
 * Extends MasterBaseRepository (master data - no context required)
 */

import { MasterBaseRepository } from './base/MasterBaseRepository.js';
import { Plan } from '../models/index.js';

/**
 * PlanRepository class
 * Handles all database operations for Plan entity
 * Provides complex queries beyond standard CRUD operations
 */
export class PlanRepository extends MasterBaseRepository {
  /**
   * Constructor for PlanRepository
   * Initializes repository with Plan model
   */
  constructor() {
    super(Plan, 'Plan');
  }

  /**
   * Find plan by unique code
   * @param {string} code - Plan code (unique identifier)
   * @param {Object} options - Additional Sequelize query options
   * @returns {Promise<Object|null>} Plan object or null if not found
   * 
   * @example
   * const plan = await planRepository.findPlanByCode('BASIC');
   */
  async findPlanByCode(code, options = {}) {
    this.logger.debug('Finding plan by code', { code });
    
    return await this.Model.findOne({
      where: { code },
      ...options
    });
  }
}

// Export singleton instance
export const planRepository = new PlanRepository();

