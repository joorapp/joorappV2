/**
 * @author Bhavesh Venugopal
 * Role Service
 * Business logic layer for company role management
 * Handles database operations via roleRepository
 */

import { createModuleLogger } from '../utils/logger.js';
import { roleRepository } from '../repositories/roleRepository.js';
import { ConflictError } from '../utils/errors.js';

// Create module-specific logger
const logger = createModuleLogger('roleService');

/**
 * Create new role
 * @param {Object} roleData - Role data
 * @param {string} roleData.name - Role name
 * @param {string} roleData.code - Role code (unique identifier)
 * @param {string} [roleData.description] - Role description
 * @param {boolean} [roleData.isActive] - Role active status
 * @param {Object} context - Audit context { userId, companyId? }
 * @returns {Promise<Object>} Created role object
 * @throws {ConflictError} If role name or code already exists
 * 
 * @example
 * const role = await createRole({
 *   name: 'Company Admin',
 *   code: 'COMPANY_ADMIN',
 *   description: 'Administrator role for company',
 *   isActive: true
 * }, { userId: 'admin-uuid' });
 */
export const createRole = async (roleData, context) => {
  const { name, code, description, isActive = true } = roleData;
  
  logger.debug('Creating role', { name, code });
  
  // Check name uniqueness
  const existingByName = await roleRepository.findOne({ name });
  if (existingByName) {
    throw new ConflictError('Role with this name already exists', { field: 'name', value: name });
  }
  
  // Check code uniqueness
  const existingByCode = await roleRepository.findOne({ code });
  if (existingByCode) {
    throw new ConflictError('Role with this code already exists', { field: 'code', value: code });
  }
  
  // Create role
  const role = await roleRepository.create(
    {
      name,
      code,
      description: description || null,
      isActive
    },
    context
  );
  
  logger.info('Role created', { roleId: role.id, name, code });
  
  return {
    id: role.id,
    name: role.name,
    code: role.code,
    description: role.description,
    isActive: role.isActive,
    createdDate: role.createdDate,
    createdUserId: role.createdUserId
  };
};

/**
 * Get role by ID
 * @param {string} roleId - Role UUID
 * @returns {Promise<Object>} Role object
 * @throws {NotFoundError} If role not found
 * 
 * @example
 * const role = await getRoleById('role-uuid');
 */
export const getRoleById = async (roleId) => {
  logger.debug('Getting role by ID', { roleId });
  
  const role = await roleRepository.findByIdOrFail(roleId);
  
  return {
    id: role.id,
    name: role.name,
    code: role.code,
    description: role.description,
    isActive: role.isActive,
    createdDate: role.createdDate,
    createdUserId: role.createdUserId,
    updatedDate: role.updatedDate,
    updatedUserId: role.updatedUserId
  };
};

/**
 * Get role by code
 * @param {string} code - Role code
 * @returns {Promise<Object|null>} Role object or null if not found
 * 
 * @example
 * const role = await getRoleByCode('COMPANY_ADMIN');
 */
export const getRoleByCode = async (code) => {
  logger.debug('Getting role by code', { code });
  
  const role = await roleRepository.findRoleByCode(code);
  
  if (!role) {
    return null;
  }
  
  return {
    id: role.id,
    name: role.name,
    code: role.code,
    description: role.description,
    isActive: role.isActive,
    createdDate: role.createdDate
  };
};

/**
 * Update role
 * @param {string} roleId - Role UUID
 * @param {Object} roleData - Role data to update
 * @param {string} [roleData.name] - Role name
 * @param {string} [roleData.code] - Role code
 * @param {string} [roleData.description] - Role description
 * @param {boolean} [roleData.isActive] - Role active status
 * @param {Object} context - Audit context { userId }
 * @returns {Promise<Object>} Updated role object
 * @throws {NotFoundError} If role not found
 * @throws {ConflictError} If new name or code already exists
 * 
 * @example
 * const role = await updateRole('role-uuid', {
 *   name: 'Updated Admin',
 *   isActive: false
 * }, { userId: 'admin-uuid' });
 */
export const updateRole = async (roleId, roleData, context) => {
  logger.debug('Updating role', { roleId });
  
  const role = await roleRepository.findByIdOrFail(roleId);
  
  // Check name uniqueness if name is being changed
  if (roleData.name && roleData.name !== role.name) {
    const existing = await roleRepository.findOne({ name: roleData.name });
    if (existing) {
      throw new ConflictError('Role with this name already exists', { field: 'name', value: roleData.name });
    }
  }
  
  // Check code uniqueness if code is being changed
  if (roleData.code && roleData.code !== role.code) {
    const existing = await roleRepository.findOne({ code: roleData.code });
    if (existing) {
      throw new ConflictError('Role with this code already exists', { field: 'code', value: roleData.code });
    }
  }
  
  // Build update object
  const updateData = {};
  if (roleData.name !== undefined) updateData.name = roleData.name;
  if (roleData.code !== undefined) updateData.code = roleData.code;
  if (roleData.description !== undefined) updateData.description = roleData.description;
  if (roleData.isActive !== undefined) updateData.isActive = roleData.isActive;
  
  // Update role
  const updated = await roleRepository.update(roleId, updateData, context);
  
  logger.info('Role updated', { roleId });
  
  return {
    id: updated.id,
    name: updated.name,
    code: updated.code,
    description: updated.description,
    isActive: updated.isActive,
    createdDate: updated.createdDate,
    createdUserId: updated.createdUserId,
    updatedDate: updated.updatedDate,
    updatedUserId: updated.updatedUserId
  };
};

/**
 * List roles with optional pagination and sorting
 * @param {Object} filters - Filter parameters
 * @param {boolean} [filters.isActive] - Filter by active status
 * @param {Object} pagination - Pagination parameters { page, limit, offset }
 * @param {Array} sort - Sort array [[field, order]]
 * @returns {Promise<Object>} { roles: Array, total: number }
 * 
 * @example
 * const result = await listRoles(
 *   { isActive: true },
 *   { page: 1, limit: 10, offset: 0 },
 *   [['name', 'ASC']]
 * );
 */
export const listRoles = async (filters = {}, pagination = {}, sort = []) => {
  logger.debug('Listing roles', { filters, pagination, sort });
  
  const { isActive } = filters;
  
  // Build where filters
  const whereFilters = {};
  if (isActive !== undefined) whereFilters.isActive = isActive;
  
  // Get roles
  const result = await roleRepository.findAndCountAll(whereFilters, {
    limit: pagination.limit,
    offset: pagination.offset,
    order: sort.length > 0 ? sort : [['name', 'ASC']]
  });
  
  return {
    roles: result.rows.map(role => ({
      id: role.id,
      name: role.name,
      code: role.code,
      description: role.description,
      isActive: role.isActive,
      createdDate: role.createdDate
    })),
    total: result.count
  };
};

/**
 * Delete role (soft delete)
 * @param {string} roleId - Role UUID
 * @param {Object} context - Audit context { userId }
 * @returns {Promise<void>}
 * @throws {NotFoundError} If role not found
 * 
 * @example
 * await deleteRole('role-uuid', { userId: 'admin-uuid' });
 */
export const deleteRole = async (roleId, context) => {
  logger.debug('Deleting role', { roleId });
  
  await roleRepository.delete(roleId, context);
  
  logger.info('Role deleted', { roleId });
};

