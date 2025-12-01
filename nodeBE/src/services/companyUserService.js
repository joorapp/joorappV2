/**
 * @author Bhavesh Venugopal
 * CompanyUser Service
 * Business logic layer for company-user relationship management
 * Handles database operations via companyUserRepository
 */

import { createModuleLogger } from '../utils/logger.js';
import { companyUserRepository } from '../repositories/companyUserRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { companyRepository } from '../repositories/companyRepository.js';
import { roleRepository } from '../repositories/roleRepository.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

// Create module-specific logger
const logger = createModuleLogger('companyUserService');

/**
 * Assign user to company with a role
 * Validates that user, company, and role exist before assignment
 * Handles upsert logic (update if exists, create if new)
 * @param {string} userId - User UUID
 * @param {string} companyId - Company UUID
 * @param {string} roleId - CompanyRole UUID
 * @param {Object} context - Audit context { userId }
 * @returns {Promise<Object>} CompanyUser assignment object
 * @throws {NotFoundError} If user, company, or role not found
 * @throws {BadRequestError} If role is not active
 * 
 * @example
 * const assignment = await assignUserToCompany(
 *   'user-uuid',
 *   'company-uuid',
 *   'role-uuid',
 *   { userId: 'admin-uuid' }
 * );
 */
export const assignUserToCompany = async (userId, companyId, roleId, context) => {
  logger.debug('Assigning user to company', { userId, companyId, roleId });
  
  // Validate user exists
  const user = await userRepository.findByIdOrFail(userId);
  
  // Validate company exists
  const company = await companyRepository.findByIdOrFail(companyId);
  
  // Validate role exists
  const role = await roleRepository.findByIdOrFail(roleId);
  
  // Check if role is active
  if (!role.isActive) {
    throw new BadRequestError('Cannot assign inactive role to user');
  }
  
  // Assign user to company (handles upsert)
  const assignment = await companyUserRepository.assignUserToCompany(
    userId,
    companyId,
    roleId,
    context
  );
  
  logger.info('User assigned to company', { 
    assignmentId: assignment.id, 
    userId, 
    companyId, 
    roleId 
  });
  
  return {
    id: assignment.id,
    userId: assignment.userId,
    companyId: assignment.companyId,
    roleId: assignment.companyRoleId,
    isActive: assignment.isActive,
    createdDate: assignment.createdDate,
    createdUserId: assignment.createdUserId
  };
};

/**
 * Get all companies for a user with role information
 * @param {string} userId - User UUID
 * @param {Object} options - Query options
 * @param {boolean} [options.activeOnly] - Return only active assignments
 * @returns {Promise<Array>} Array of company assignments with company and role details
 * 
 * @example
 * const companies = await getUserCompanies('user-uuid', { activeOnly: true });
 */
export const getUserCompanies = async (userId, options = {}) => {
  logger.debug('Getting user companies', { userId, options });
  
  const { activeOnly = false } = options;
  
  const companies = await companyUserRepository.findUserCompanies(userId);
  
  // Filter by active if requested
  let filteredCompanies = companies;
  if (activeOnly) {
    filteredCompanies = companies.filter(cu => cu.isActive === true);
  }
  
  return filteredCompanies.map(cu => ({
    id: cu.id,
    userId: cu.userId,
    companyId: cu.companyId,
    roleId: cu.companyRoleId,
    isActive: cu.isActive,
    company: cu.company ? {
      id: cu.company.id,
      name: cu.company.name,
      description: cu.company.description,
      isActive: cu.company.isActive
    } : null,
    role: cu.role ? {
      id: cu.role.id,
      name: cu.role.name,
      code: cu.role.code,
      isActive: cu.role.isActive
    } : null
  }));
};

/**
 * Get all users in a company with role information
 * @param {string} companyId - Company UUID
 * @param {Object} filters - Filter parameters
 * @param {boolean} [filters.isActive] - Filter by active status
 * @param {Object} pagination - Pagination parameters { limit, offset }
 * @returns {Promise<Array>} Array of user assignments with user and role details
 * 
 * @example
 * const users = await getCompanyUsers('company-uuid', { isActive: true }, { limit: 10, offset: 0 });
 */
export const getCompanyUsers = async (companyId, filters = {}, pagination = {}) => {
  logger.debug('Getting company users', { companyId, filters, pagination });
  
  const { isActive } = filters;
  
  // Build options
  const options = {
    limit: pagination.limit,
    offset: pagination.offset
  };
  
  const users = await companyUserRepository.findCompanyUsers(companyId, options);
  
  // Filter by active if specified
  let filteredUsers = users;
  if (isActive !== undefined) {
    filteredUsers = users.filter(cu => cu.isActive === isActive);
  }
  
  return filteredUsers.map(cu => ({
    id: cu.id,
    userId: cu.userId,
    companyId: cu.companyId,
    roleId: cu.companyRoleId,
    isActive: cu.isActive,
    user: cu.user ? {
      id: cu.user.id,
      email: cu.user.email,
      firstName: cu.user.firstName,
      lastName: cu.user.lastName,
      isActive: cu.user.isActive
    } : null,
    role: cu.role ? {
      id: cu.role.id,
      name: cu.role.name,
      code: cu.role.code,
      isActive: cu.role.isActive
    } : null
  }));
};

/**
 * Update user's role in a company
 * @param {string} userId - User UUID
 * @param {string} companyId - Company UUID
 * @param {string} roleId - New CompanyRole UUID
 * @param {Object} context - Audit context { userId }
 * @returns {Promise<Object>} Updated CompanyUser assignment
 * @throws {NotFoundError} If assignment, role not found
 * @throws {BadRequestError} If role is not active
 * 
 * @example
 * const updated = await updateUserRole('user-uuid', 'company-uuid', 'new-role-uuid', { userId: 'admin-uuid' });
 */
export const updateUserRole = async (userId, companyId, roleId, context) => {
  logger.debug('Updating user role', { userId, companyId, roleId });
  
  // Find existing assignment
  const assignment = await companyUserRepository.findUserCompanyRole(userId, companyId);
  if (!assignment) {
    throw new NotFoundError('CompanyUser assignment', null);
  }
  
  // Validate new role exists and is active
  const role = await roleRepository.findByIdOrFail(roleId);
  if (!role.isActive) {
    throw new BadRequestError('Cannot assign inactive role to user');
  }
  
  // Update assignment
  const updated = await companyUserRepository.update(
    assignment.id,
    { companyRoleId: roleId },
    context
  );
  
  logger.info('User role updated', { assignmentId: assignment.id, userId, companyId, newRoleId: roleId });
  
  return {
    id: updated.id,
    userId: updated.userId,
    companyId: updated.companyId,
    roleId: updated.companyRoleId,
    isActive: updated.isActive,
    updatedDate: updated.updatedDate,
    updatedUserId: updated.updatedUserId
  };
};

/**
 * Remove user from company (soft delete)
 * @param {string} userId - User UUID
 * @param {string} companyId - Company UUID
 * @param {Object} context - Audit context { userId }
 * @returns {Promise<void>}
 * @throws {NotFoundError} If assignment not found
 * 
 * @example
 * await removeUserFromCompany('user-uuid', 'company-uuid', { userId: 'admin-uuid' });
 */
export const removeUserFromCompany = async (userId, companyId, context) => {
  logger.debug('Removing user from company', { userId, companyId });
  
  // Find existing assignment
  const assignment = await companyUserRepository.findUserCompanyRole(userId, companyId);
  if (!assignment) {
    throw new NotFoundError('CompanyUser assignment', null);
  }
  
  // Soft delete assignment
  await companyUserRepository.delete(assignment.id, context);
  
  logger.info('User removed from company', { assignmentId: assignment.id, userId, companyId });
};

/**
 * Get user's role in a specific company
 * @param {string} userId - User UUID
 * @param {string} companyId - Company UUID
 * @returns {Promise<Object|null>} CompanyUser assignment with role details or null
 * 
 * @example
 * const assignment = await getUserCompanyRole('user-uuid', 'company-uuid');
 */
export const getUserCompanyRole = async (userId, companyId) => {
  logger.debug('Getting user company role', { userId, companyId });
  
  const assignment = await companyUserRepository.findUserCompanyRole(userId, companyId);
  
  if (!assignment) {
    return null;
  }
  
  return {
    id: assignment.id,
    userId: assignment.userId,
    companyId: assignment.companyId,
    roleId: assignment.companyRoleId,
    isActive: assignment.isActive,
    role: assignment.role ? {
      id: assignment.role.id,
      name: assignment.role.name,
      code: assignment.role.code,
      isActive: assignment.role.isActive
    } : null
  };
};

/**
 * Check if user is assigned to a company
 * @param {string} userId - User UUID
 * @param {string} companyId - Company UUID
 * @returns {Promise<boolean>} True if user is assigned to company
 * 
 * @example
 * const isAssigned = await checkUserInCompany('user-uuid', 'company-uuid');
 */
export const checkUserInCompany = async (userId, companyId) => {
  logger.debug('Checking if user is in company', { userId, companyId });
  
  return await companyUserRepository.checkUserInCompany(userId, companyId);
};

