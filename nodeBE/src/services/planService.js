/**
 * @author Bhavesh Venugopal
 * Plan Service
 * Business logic layer for plan management
 * Handles database operations via planRepository
 */

import { createModuleLogger } from '../utils/logger.js';
import { planRepository } from '../repositories/planRepository.js';
import { ConflictError, NotFoundError, BadRequestError } from '../utils/errors.js';

// Create module-specific logger
const logger = createModuleLogger('planService');

/**
 * Create new plan
 * @param {Object} planData - Plan data
 * @param {string} planData.name - Plan name
 * @param {string} planData.code - Plan code (unique identifier)
 * @param {string} [planData.description] - Plan description
 * @param {number} [planData.price] - Plan price (default: 0.00)
 * @param {boolean} [planData.isActive] - Plan active status
 * @returns {Promise<Object>} Created plan object
 * @throws {ConflictError} If plan name or code already exists
 * 
 * @example
 * const plan = await createPlan({
 *   name: 'Premium',
 *   code: 'PREMIUM',
 *   description: 'Premium subscription plan',
 *   price: 99.99,
 *   isActive: true
 * });
 */
export const createPlan = async (planData) => {
  const { name, code, description, price = 0.00, isActive = true } = planData;
  
  logger.debug('Creating plan', { name, code, price });
  
  // Check name uniqueness
  const existingByName = await planRepository.findOne({ name });
  if (existingByName) {
    throw new ConflictError('Plan with this name already exists', { field: 'name', value: name });
  }
  
  // Check code uniqueness
  const existingByCode = await planRepository.findOne({ code });
  if (existingByCode) {
    throw new ConflictError('Plan with this code already exists', { field: 'code', value: code });
  }
  
  // Create plan (no context required for master data)
  const plan = await planRepository.create({
    name,
    code,
    description: description || null,
    price: parseFloat(price) || 0.00,
    isActive
  });
  
  logger.info('Plan created', { planId: plan.id, name, code, price });
  
  return {
    id: plan.id,
    name: plan.name,
    code: plan.code,
    description: plan.description,
    price: parseFloat(plan.price) || 0.00,
    isActive: plan.isActive,
    createdDate: plan.createdDate,
    updatedDate: plan.updatedDate,
    version: plan.version
  };
};

/**
 * Get plan by ID
 * @param {string} planId - Plan UUID
 * @returns {Promise<Object>} Plan object
 * @throws {NotFoundError} If plan not found
 * 
 * @example
 * const plan = await getPlanById('plan-uuid');
 */
export const getPlanById = async (planId) => {
  logger.debug('Getting plan by ID', { planId });
  
  const plan = await planRepository.findByIdOrFail(planId);
  
  return {
    id: plan.id,
    name: plan.name,
    code: plan.code,
    description: plan.description,
    price: parseFloat(plan.price) || 0.00,
    isActive: plan.isActive,
    createdDate: plan.createdDate,
    updatedDate: plan.updatedDate,
    version: plan.version
  };
};

/**
 * Get plan by code
 * @param {string} code - Plan code
 * @returns {Promise<Object|null>} Plan object or null if not found
 * 
 * @example
 * const plan = await getPlanByCode('BASIC');
 */
export const getPlanByCode = async (code) => {
  logger.debug('Getting plan by code', { code });
  
  const plan = await planRepository.findPlanByCode(code);
  
  if (!plan) {
    return null;
  }
  
  return {
    id: plan.id,
    name: plan.name,
    code: plan.code,
    description: plan.description,
    price: parseFloat(plan.price) || 0.00,
    isActive: plan.isActive,
    createdDate: plan.createdDate,
    updatedDate: plan.updatedDate,
    version: plan.version
  };
};

/**
 * Get BASIC plan (helper for default assignment)
 * @returns {Promise<Object>} BASIC plan object
 * @throws {NotFoundError} If BASIC plan not found
 * 
 * @example
 * const basicPlan = await getBasicPlan();
 */
export const getBasicPlan = async () => {
  logger.debug('Getting BASIC plan');
  
  const plan = await planRepository.findPlanByCode('BASIC');
  
  if (!plan) {
    throw new NotFoundError('Plan', 'BASIC', { message: 'BASIC plan not found. Please ensure BASIC plan exists in the database.' });
  }
  
  return {
    id: plan.id,
    name: plan.name,
    code: plan.code,
    description: plan.description,
    price: parseFloat(plan.price) || 0.00,
    isActive: plan.isActive,
    version: plan.version
  };
};

/**
 * Update plan
 * @param {string} planId - Plan UUID
 * @param {Object} planData - Plan data to update
 * @param {string} [planData.name] - Plan name
 * @param {string} [planData.code] - Plan code
 * @param {string} [planData.description] - Plan description
 * @param {number} [planData.price] - Plan price
 * @param {boolean} [planData.isActive] - Plan active status
 * @returns {Promise<Object>} Updated plan object
 * @throws {NotFoundError} If plan not found
 * @throws {ConflictError} If new name or code already exists
 * 
 * @example
 * const plan = await updatePlan('plan-uuid', {
 *   name: 'Updated Premium',
 *   price: 149.99,
 *   isActive: false
 * });
 */
export const updatePlan = async (planId, planData) => {
  logger.debug('Updating plan', { planId });
  
  const plan = await planRepository.findByIdOrFail(planId);
  
  // Check name uniqueness if name is being changed
  if (planData.name && planData.name !== plan.name) {
    const existing = await planRepository.findOne({ name: planData.name });
    if (existing) {
      throw new ConflictError('Plan with this name already exists', { field: 'name', value: planData.name });
    }
  }
  
  // Check code uniqueness if code is being changed
  if (planData.code && planData.code !== plan.code) {
    const existing = await planRepository.findOne({ code: planData.code });
    if (existing) {
      throw new ConflictError('Plan with this code already exists', { field: 'code', value: planData.code });
    }
  }
  
  // Build update object
  const updateData = {};
  if (planData.name !== undefined) updateData.name = planData.name;
  if (planData.code !== undefined) updateData.code = planData.code;
  if (planData.description !== undefined) updateData.description = planData.description || null;
  if (planData.price !== undefined) updateData.price = parseFloat(planData.price) || 0.00;
  if (planData.isActive !== undefined) updateData.isActive = planData.isActive;
  
  // Update plan (no context required for master data)
  const updatedPlan = await planRepository.update(planId, updateData);
  
  logger.info('Plan updated', { planId });
  
  return {
    id: updatedPlan.id,
    name: updatedPlan.name,
    code: updatedPlan.code,
    description: updatedPlan.description,
    price: parseFloat(updatedPlan.price) || 0.00,
    isActive: updatedPlan.isActive,
    createdDate: updatedPlan.createdDate,
    updatedDate: updatedPlan.updatedDate,
    version: updatedPlan.version
  };
};

/**
 * List plans with pagination, filtering, and sorting
 * @param {Object} filters - Filter criteria
 * @param {boolean} [filters.isActive] - Filter by active status
 * @param {Object} pagination - Pagination options
 * @param {number} [pagination.page] - Page number (default: 1)
 * @param {number} [pagination.limit] - Items per page (default: 10)
 * @param {number} [pagination.offset] - Offset for pagination
 * @param {Array} sort - Sort order array (default: [['name', 'ASC']])
 * @returns {Promise<Object>} { plans: Array, total: number }
 * 
 * @example
 * const result = await listPlans(
 *   { isActive: true },
 *   { page: 1, limit: 10, offset: 0 },
 *   [['name', 'ASC']]
 * );
 */
export const listPlans = async (filters = {}, pagination = {}, sort = []) => {
  logger.debug('Listing plans', { filters, pagination, sort });
  
  const { isActive } = filters;
  
  // Build where filters
  const whereFilters = {};
  if (isActive !== undefined) whereFilters.isActive = isActive;
  
  // Get plans
  const result = await planRepository.findAndCountAll(whereFilters, {
    limit: pagination.limit,
    offset: pagination.offset,
    order: sort.length > 0 ? sort : [['name', 'ASC']]
  });
  
  return {
    plans: result.rows.map(plan => ({
      id: plan.id,
      name: plan.name,
      code: plan.code,
      description: plan.description,
      price: parseFloat(plan.price) || 0.00,
      isActive: plan.isActive,
      createdDate: plan.createdDate
    })),
    total: result.count
  };
};

/**
 * Delete plan (soft delete)
 * @param {string} planId - Plan UUID
 * @param {Object} [options] - Optional options (deletedUserId can be passed here)
 * @returns {Promise<void>}
 * @throws {NotFoundError} If plan not found
 * 
 * @example
 * await deletePlan('plan-uuid');
 * // Or with deletedUserId:
 * await deletePlan('plan-uuid', { deletedUserId: 'user-uuid' });
 */
export const deletePlan = async (planId, options = {}) => {
  logger.debug('Deleting plan', { planId });
  
  // Check if this is the BASIC plan - prevent deletion or handle gracefully
  const plan = await planRepository.findByIdOrFail(planId);
  if (plan.code === 'BASIC') {
    throw new BadRequestError('Cannot delete BASIC plan. BASIC plan is required for system operation.', { field: 'code', value: 'BASIC' });
  }
  
  // For soft delete, deletedUserId can be passed in options.deletedUserId (optional)
  await planRepository.delete(planId, options);
  
  logger.info('Plan deleted', { planId });
};

