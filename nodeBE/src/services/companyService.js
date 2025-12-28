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
import { COMPANY_STATUS_DEFAULT, isValidCompanyStatus } from '../constants/companyStatus.js';
import { getBasicPlan } from './planService.js';
import { Plan } from '../models/index.js';

// Create module-specific logger
const logger = createModuleLogger('companyService');

/**
 * Create new company
 * @param {Object} companyData - Company data
 * @param {string} companyData.name - Company name
 * @param {string} [companyData.description] - Company description
 * @param {boolean} [companyData.isActive] - Company active status
 * @param {string} [companyData.email] - Company email
 * @param {string} [companyData.phone] - Company phone
 * @param {string} [companyData.buildingAddress] - Building address
 * @param {string} [companyData.streetAddress] - Street address
 * @param {string} [companyData.city] - City
 * @param {string} [companyData.state] - State
 * @param {string} [companyData.postalCode] - Postal code
 * @param {string} [companyData.country] - Country
 * @param {string} [companyData.logo] - Base64 encoded logo
 * @param {string} [companyData.status] - Company status (NEW, ACTIVE, LICENSE_EXPIRED)
 * @param {Object} context - Audit context { userId, companyId? }
 * @returns {Promise<Object>} Created company object (without logo)
 * @throws {ConflictError} If company name already exists
 * @throws {ValidationError} If status is invalid
 * 
 * @example
 * const company = await createCompany({
 *   name: 'Acme Corp',
 *   description: 'Leading technology company',
 *   email: 'contact@acme.com',
 *   status: 'NEW'
 * }, { userId: 'admin-uuid' });
 */
export const createCompany = async (companyData, context) => {
  const {
    name,
    description,
    isActive = true,
    email,
    phone,
    buildingAddress,
    streetAddress,
    city,
    state,
    postalCode,
    country,
    logo,
    status = COMPANY_STATUS_DEFAULT
  } = companyData;
  
  logger.debug('Creating company', { name, email, status });
  
  // Validate status if provided
  if (status && !isValidCompanyStatus(status)) {
    throw new ConflictError('Invalid company status', { field: 'status', value: status });
  }
  
  // Check name uniqueness
  const existingByName = await companyRepository.findOne({ name });
  if (existingByName) {
    throw new ConflictError('Company with this name already exists', { field: 'name', value: name });
  }
  
  // Get BASIC plan for default assignment (if planId not provided)
  let planId = companyData.planId || null;
  if (!planId) {
    try {
      const basicPlan = await getBasicPlan();
      planId = basicPlan.id;
      logger.debug('Assigned BASIC plan to new company', { planId: basicPlan.id });
    } catch (error) {
      // If BASIC plan doesn't exist, log warning but continue without plan assignment
      logger.warn('BASIC plan not found, creating company without plan assignment', { error: error.message });
      // Continue without planId - it will remain null
    }
  }
  
  // Create company
  const company = await companyRepository.create(
    {
      name,
      description: description || null,
      isActive,
      email: email || null,
      phone: phone || null,
      buildingAddress: buildingAddress || null,
      streetAddress: streetAddress || null,
      city: city || null,
      state: state || null,
      postalCode: postalCode || null,
      country: country || null,
      logo: logo || null,
      status,
      planId
    },
    context
  );
  
  logger.info('Company created', { companyId: company.id, name, status });
  
  // Reload company with Plan association to get plan object
  const companyWithPlan = await companyRepository.findByIdOrFail(company.id, {
    include: [
      {
        model: Plan,
        as: 'plan',
        required: false
      }
    ]
  });
  
  // Return company without logo (lazy loading)
  return {
    id: companyWithPlan.id,
    name: companyWithPlan.name,
    description: companyWithPlan.description,
    isActive: companyWithPlan.isActive,
    status: companyWithPlan.status,
    email: companyWithPlan.email,
    phone: companyWithPlan.phone,
    buildingAddress: companyWithPlan.buildingAddress,
    streetAddress: companyWithPlan.streetAddress,
    city: companyWithPlan.city,
    state: companyWithPlan.state,
    postalCode: companyWithPlan.postalCode,
    country: companyWithPlan.country,
    plan: companyWithPlan.plan ? {
      id: companyWithPlan.plan.id,
      name: companyWithPlan.plan.name,
      code: companyWithPlan.plan.code,
      description: companyWithPlan.plan.description,
      price: parseFloat(companyWithPlan.plan.price) || 0.00,
      isActive: companyWithPlan.plan.isActive,
      createdDate: companyWithPlan.plan.createdDate,
      updatedDate: companyWithPlan.plan.updatedDate,
      version: companyWithPlan.plan.version
    } : null,
    createdDate: companyWithPlan.createdDate,
    createdUserId: companyWithPlan.createdUserId
  };
};

/**
 * Get company by ID
 * @param {string} companyId - Company UUID
 * @param {Object} [options] - Options
 * @param {boolean} [options.includeLogo=false] - Whether to include logo in response
 * @returns {Promise<Object>} Company object (with logo only if includeLogo=true)
 * @throws {NotFoundError} If company not found
 * 
 * @example
 * const company = await getCompanyById('company-uuid', { includeLogo: true });
 */
export const getCompanyById = async (companyId, options = {}) => {
  const { includeLogo = false } = options;
  logger.debug('Getting company by ID', { companyId, includeLogo });
  
  const company = await companyRepository.findByIdOrFail(companyId, {
    include: [
      {
        model: Plan,
        as: 'plan',
        required: false
      }
    ]
  });
  
  const result = {
    id: company.id,
    name: company.name,
    description: company.description,
    isActive: company.isActive,
    status: company.status,
    email: company.email,
    phone: company.phone,
    buildingAddress: company.buildingAddress,
    streetAddress: company.streetAddress,
    city: company.city,
    state: company.state,
    postalCode: company.postalCode,
    country: company.country,
    plan: company.plan ? {
      id: company.plan.id,
      name: company.plan.name,
      code: company.plan.code,
      description: company.plan.description,
      price: parseFloat(company.plan.price) || 0.00,
      isActive: company.plan.isActive,
      createdDate: company.plan.createdDate,
      updatedDate: company.plan.updatedDate,
      version: company.plan.version
    } : null,
    createdDate: company.createdDate,
    createdUserId: company.createdUserId,
    updatedDate: company.updatedDate,
    updatedUserId: company.updatedUserId
  };
  
  // Include logo only if explicitly requested (lazy loading)
  if (includeLogo) {
    result.logo = company.logo;
  }
  
  return result;
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
 * @param {string} [companyData.description] - Company description
 * @param {boolean} [companyData.isActive] - Company active status
 * @param {string} [companyData.email] - Company email
 * @param {string} [companyData.phone] - Company phone
 * @param {string} [companyData.buildingAddress] - Building address
 * @param {string} [companyData.streetAddress] - Street address
 * @param {string} [companyData.city] - City
 * @param {string} [companyData.state] - State
 * @param {string} [companyData.postalCode] - Postal code
 * @param {string} [companyData.country] - Country
 * @param {string} [companyData.logo] - Base64 encoded logo
 * @param {string} [companyData.status] - Company status (NEW, ACTIVE, LICENSE_EXPIRED)
 * @param {Object} context - Audit context { userId }
 * @returns {Promise<Object>} Updated company object (without logo)
 * @throws {NotFoundError} If company not found
 * @throws {ConflictError} If new name already exists or status is invalid
 * 
 * @example
 * const company = await updateCompany('company-uuid', {
 *   name: 'New Acme Corp',
 *   status: 'ACTIVE'
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
  
  // Validate status if provided
  if (companyData.status !== undefined && !isValidCompanyStatus(companyData.status)) {
    throw new ConflictError('Invalid company status', { field: 'status', value: companyData.status });
  }
  
  // Build update object
  const updateData = {};
  if (companyData.name !== undefined) updateData.name = companyData.name;
  if (companyData.description !== undefined) updateData.description = companyData.description;
  if (companyData.isActive !== undefined) updateData.isActive = companyData.isActive;
  if (companyData.email !== undefined) updateData.email = companyData.email || null;
  if (companyData.phone !== undefined) updateData.phone = companyData.phone || null;
  if (companyData.buildingAddress !== undefined) updateData.buildingAddress = companyData.buildingAddress || null;
  if (companyData.streetAddress !== undefined) updateData.streetAddress = companyData.streetAddress || null;
  if (companyData.city !== undefined) updateData.city = companyData.city || null;
  if (companyData.state !== undefined) updateData.state = companyData.state || null;
  if (companyData.postalCode !== undefined) updateData.postalCode = companyData.postalCode || null;
  if (companyData.country !== undefined) updateData.country = companyData.country || null;
  if (companyData.logo !== undefined) updateData.logo = companyData.logo || null;
  if (companyData.status !== undefined) updateData.status = companyData.status;
  if (companyData.planId !== undefined) updateData.planId = companyData.planId || null;
  
  // Update company
  const updated = await companyRepository.update(companyId, updateData, context);
  
  logger.info('Company updated', { companyId });
  
  // Reload company with Plan association to get plan object
  const companyWithPlan = await companyRepository.findByIdOrFail(companyId, {
    include: [
      {
        model: Plan,
        as: 'plan',
        required: false
      }
    ]
  });
  
  // Return company without logo (lazy loading)
  return {
    id: companyWithPlan.id,
    name: companyWithPlan.name,
    description: companyWithPlan.description,
    isActive: companyWithPlan.isActive,
    status: companyWithPlan.status,
    email: companyWithPlan.email,
    phone: companyWithPlan.phone,
    buildingAddress: companyWithPlan.buildingAddress,
    streetAddress: companyWithPlan.streetAddress,
    city: companyWithPlan.city,
    state: companyWithPlan.state,
    postalCode: companyWithPlan.postalCode,
    country: companyWithPlan.country,
    plan: companyWithPlan.plan ? {
      id: companyWithPlan.plan.id,
      name: companyWithPlan.plan.name,
      code: companyWithPlan.plan.code,
      description: companyWithPlan.plan.description,
      price: parseFloat(companyWithPlan.plan.price) || 0.00,
      isActive: companyWithPlan.plan.isActive,
      createdDate: companyWithPlan.plan.createdDate,
      updatedDate: companyWithPlan.plan.updatedDate,
      version: companyWithPlan.plan.version
    } : null,
    createdDate: companyWithPlan.createdDate,
    createdUserId: companyWithPlan.createdUserId,
    updatedDate: companyWithPlan.updatedDate,
    updatedUserId: companyWithPlan.updatedUserId
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
    const result = await companyRepository.searchCompanies(search, pagination, sort, {
      include: [
        {
          model: Plan,
          as: 'plan',
          required: false
        }
      ]
    });
    
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
        status: company.status,
        email: company.email,
        phone: company.phone,
        buildingAddress: company.buildingAddress,
        streetAddress: company.streetAddress,
        city: company.city,
        state: company.state,
        postalCode: company.postalCode,
        country: company.country,
        plan: company.plan ? {
          id: company.plan.id,
          name: company.plan.name,
          code: company.plan.code,
          description: company.plan.description,
          price: parseFloat(company.plan.price) || 0.00,
          isActive: company.plan.isActive,
          createdDate: company.plan.createdDate,
          updatedDate: company.plan.updatedDate,
          version: company.plan.version
        } : null,
        createdDate: company.createdDate
        // Logo excluded (lazy loading)
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
      order: sort.length > 0 ? sort : [['name', 'ASC']],
      include: [
        {
          model: Plan,
          as: 'plan',
          required: false
        }
      ]
    });
    
    return {
      companies: result.rows.map(company => ({
        id: company.id,
        name: company.name,
        description: company.description,
        isActive: company.isActive,
        status: company.status,
        email: company.email,
        phone: company.phone,
        buildingAddress: company.buildingAddress,
        streetAddress: company.streetAddress,
        city: company.city,
        state: company.state,
        postalCode: company.postalCode,
        country: company.country,
        plan: company.plan ? {
          id: company.plan.id,
          name: company.plan.name,
          code: company.plan.code,
          description: company.plan.description,
          price: parseFloat(company.plan.price) || 0.00,
          isActive: company.plan.isActive,
          createdDate: company.plan.createdDate,
          updatedDate: company.plan.updatedDate,
          version: company.plan.version
        } : null,
        createdDate: company.createdDate
        // Logo excluded (lazy loading)
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

