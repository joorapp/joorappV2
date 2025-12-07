/**
 * @author Bhavesh Venugopal
 * Company Service
 * Business logic layer for company management
 * Handles database operations via companyRepository
 */

import { createModuleLogger } from '../utils/logger.js';
import { companyRepository } from '../repositories/companyRepository.js';
import { companyUserRepository } from '../repositories/companyUserRepository.js';
import { ConflictError } from '../utils/errors.js';

// Create module-specific logger
const logger = createModuleLogger('companyService');

/**
 * Create new company
 * @param {Object} companyData - Company data
 * @param {string} companyData.name - Company name
 * @param {string} [companyData.code] - Company code
 * @param {string} [companyData.description] - Company description
 * @param {boolean} [companyData.isActive] - Company active status
 * @param {Object} context - Audit context { userId, companyId? }
 * @returns {Promise<Object>} Created company object
 * @throws {ConflictError} If company name already exists
 * 
 * @example
 * const company = await createCompany({
 *   name: 'Acme Corp',
 *   code: 'ACME',
 *   description: 'Leading technology company',
 *   isActive: true
 * }, { userId: 'admin-uuid' });
 */
export const createCompany = async (companyData, context) => {
  const { name, code, description, isActive = true } = companyData;
  
  logger.debug('Creating company', { name, code });
  
  // Check name uniqueness
  const existingByName = await companyRepository.findOne({ name });
  if (existingByName) {
    throw new ConflictError('Company with this name already exists', { field: 'name', value: name });
  }
  
  // Check code uniqueness if code is provided
  if (code) {
    const existingByCode = await companyRepository.findOne({ code });
    if (existingByCode) {
      throw new ConflictError('Company with this code already exists', { field: 'code', value: code });
    }
  }
  
  // Create company
  const company = await companyRepository.create(
    {
      name,
      code: code || null,
      description: description || null,
      isActive
    },
    context
  );
  
  logger.info('Company created', { companyId: company.id, name });
  
  return {
    id: company.id,
    name: company.name,
    code: company.code,
    description: company.description,
    isActive: company.isActive,
    createdDate: company.createdDate,
    createdUserId: company.createdUserId
  };
};

/**
 * Get company by ID
 * @param {string} companyId - Company UUID
 * @returns {Promise<Object>} Company object
 * @throws {NotFoundError} If company not found
 * 
 * @example
 * const company = await getCompanyById('company-uuid');
 */
export const getCompanyById = async (companyId) => {
  logger.debug('Getting company by ID', { companyId });
  
  const company = await companyRepository.findByIdOrFail(companyId);
  
  return {
    id: company.id,
    name: company.name,
    code: company.code,
    description: company.description,
    isActive: company.isActive,
    createdDate: company.createdDate,
    createdUserId: company.createdUserId,
    updatedDate: company.updatedDate,
    updatedUserId: company.updatedUserId
  };
};

/**
 * Get company by ID including soft-deleted records
 * @param {string} companyId - Company UUID
 * @returns {Promise<Object>} Company object
 * @throws {NotFoundError} If company not found
 * 
 * @example
 * const company = await getCompanyByIdIncludingDeleted('company-uuid');
 */
export const getCompanyByIdIncludingDeleted = async (companyId) => {
  logger.debug('Getting company by ID (including deleted)', { companyId });
  
  const company = await companyRepository.findByIdIncludingDeletedOrFail(companyId);
  
  return {
    id: company.id,
    name: company.name,
    code: company.code,
    description: company.description,
    isActive: company.isActive,
    isDeleted: company.isDeleted,
    createdDate: company.createdDate,
    createdUserId: company.createdUserId,
    updatedDate: company.updatedDate,
    updatedUserId: company.updatedUserId,
    deletedDate: company.deletedDate,
    deletedUserId: company.deletedUserId
  };
};

/**
 * Update company
 * @param {string} companyId - Company UUID
 * @param {Object} companyData - Company data to update
 * @param {string} [companyData.name] - Company name
 * @param {string} [companyData.code] - Company code
 * @param {string} [companyData.description] - Company description
 * @param {boolean} [companyData.isActive] - Company active status
 * @param {Object} context - Audit context { userId }
 * @returns {Promise<Object>} Updated company object
 * @throws {NotFoundError} If company not found
 * @throws {ConflictError} If new name already exists
 * 
 * @example
 * const company = await updateCompany('company-uuid', {
 *   name: 'New Acme Corp',
 *   isActive: false
 * }, { userId: 'admin-uuid' });
 */
export const updateCompany = async (companyId, companyData, context) => {
  logger.debug('Updating company', { companyId });
  
  const company = await companyRepository.findByIdOrFail(companyId);
  
  // Check name uniqueness if name is being changed
  if (companyData.name && companyData.name !== company.name) {
    const existing = await companyRepository.findOne({ name: companyData.name });
    if (existing) {
      throw new ConflictError('Company with this name already exists', { field: 'name', value: companyData.name });
    }
  }
  
  // Check code uniqueness if code is being changed
  if (companyData.code !== undefined && companyData.code !== company.code) {
    if (companyData.code) {
      const existing = await companyRepository.findOne({ code: companyData.code });
      if (existing) {
        throw new ConflictError('Company with this code already exists', { field: 'code', value: companyData.code });
      }
    }
  }
  
  // Build update object
  const updateData = {};
  if (companyData.name !== undefined) updateData.name = companyData.name;
  if (companyData.code !== undefined) updateData.code = companyData.code || null;
  if (companyData.description !== undefined) updateData.description = companyData.description;
  if (companyData.isActive !== undefined) updateData.isActive = companyData.isActive;
  
  // Update company
  const updated = await companyRepository.update(companyId, updateData, context);
  
  logger.info('Company updated', { companyId });
  
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
 * List companies with optional search, pagination, and sorting
 * @param {Object} filters - Search and filter parameters
 * @param {string} [filters.search] - Search term for company name
 * @param {boolean} [filters.isActive] - Filter by active status
 * @param {Object} pagination - Pagination parameters { page, limit, offset }
 * @param {Array} sort - Sort array [[field, order]]
 * @returns {Promise<Object>} { companies: Array, total: number }
 * 
 * @example
 * const result = await listCompanies(
 *   { search: 'acme', isActive: true },
 *   { page: 1, limit: 10, offset: 0 },
 *   [['name', 'ASC']]
 * );
 */
export const listCompanies = async (filters = {}, pagination = {}, sort = []) => {
  logger.debug('Listing companies', { filters, pagination, sort });
  
  const { search, isActive } = filters;
  
  if (search) {
    // Use complex search query
    const result = await companyRepository.searchCompanies(search, pagination, sort);
    
    // Apply isActive filter if specified
    let filteredRows = result.rows;
    if (isActive !== undefined) {
      filteredRows = result.rows.filter(c => c.isActive === isActive);
    }
    
    return {
      companies: filteredRows.map(company => ({
        id: company.id,
        name: company.name,
        description: company.description,
        isActive: company.isActive,
        createdDate: company.createdDate
      })),
      total: isActive !== undefined ? filteredRows.length : result.count
    };
  } else {
    // Use standard findAndCountAll
    const whereFilters = {};
    if (isActive !== undefined) whereFilters.isActive = isActive;
    
    const result = await companyRepository.findAndCountAll(whereFilters, {
      limit: pagination.limit,
      offset: pagination.offset,
      order: sort.length > 0 ? sort : [['name', 'ASC']]
    });
    
    return {
      companies: result.rows.map(company => ({
        id: company.id,
        name: company.name,
        description: company.description,
        isActive: company.isActive,
        createdDate: company.createdDate
      })),
      total: result.count
    };
  }
};

/**
 * Delete company (soft delete)
 * @param {string} companyId - Company UUID
 * @param {Object} context - Audit context { userId }
 * @returns {Promise<void>}
 * @throws {NotFoundError} If company not found
 * 
 * @example
 * await deleteCompany('company-uuid', { userId: 'admin-uuid' });
 */
export const deleteCompany = async (companyId, context) => {
  logger.debug('Deleting company', { companyId });
  
  await companyRepository.delete(companyId, context);
  
  logger.info('Company deleted', { companyId });
};

/**
 * Restore soft-deleted company
 * @param {string} companyId - Company UUID
 * @param {Object} context - Audit context { userId }
 * @returns {Promise<Object>} Restored company object
 * @throws {NotFoundError} If company not found in deleted records
 * 
 * @example
 * const company = await restoreCompany('company-uuid', { userId: 'admin-uuid' });
 */
export const restoreCompany = async (companyId, context) => {
  logger.debug('Restoring company', { companyId });
  
  const company = await companyRepository.restore(companyId, context);
  
  logger.info('Company restored', { companyId });
  
  return {
    id: company.id,
    name: company.name,
    code: company.code,
    description: company.description,
    isActive: company.isActive,
    createdDate: company.createdDate,
    updatedDate: company.updatedDate
  };
};

/**
 * Get company users with pagination
 * @param {string} companyId - Company UUID
 * @param {Object} filters - Filter parameters
 * @param {boolean} [filters.isActive] - Filter by active status
 * @param {Object} pagination - Pagination parameters { limit, offset }
 * @returns {Promise<Array>} Array of company users with role information
 * 
 * @example
 * const users = await getCompanyUsers('company-uuid', { isActive: true }, { limit: 10, offset: 0 });
 */
export const getCompanyUsers = async (companyId, filters = {}, pagination = {}) => {
  logger.debug('Getting company users', { companyId, filters, pagination });
  
  // Build options
  const options = {
    limit: pagination.limit,
    offset: pagination.offset
  };
  
  const users = await companyUserRepository.findCompanyUsers(companyId, options);
  
  // Apply isActive filter if specified
  let filteredUsers = users;
  if (filters.isActive !== undefined) {
    filteredUsers = users.filter(cu => cu.isActive === filters.isActive);
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
      lastName: cu.user.lastName
    } : null,
    role: cu.role ? {
      id: cu.role.id,
      name: cu.role.name,
      code: cu.role.code
    } : null
  }));
};

