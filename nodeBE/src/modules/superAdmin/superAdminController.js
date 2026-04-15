/**
 * @author Bhavesh Venugopal
 * Super Admin Controller
 * Handles super admin functionality endpoints
 */

import { createModuleLogger, logPerformance, logBusiness, logSecurity } from '../../utils/logger.js';
import { isSuperAdmin } from '../../constants/keycloakRoles.js';
import { successResponse, paginatedResponse } from '../../utils/responseHelpers.js';
import { UnauthorizedError, ForbiddenError, ConflictError } from '../../utils/errors.js';
import { validateUUID, validateRequired, validateString, validateEnum, validateEmail, validateNumber, validateBoolean } from '../../utils/validators.js';
import { ValidationError } from '../../utils/errors.js';
import { COMPANY_STATUS_VALUES } from '../../constants/companyStatus.js';
import { buildPaginationQuery, buildSortQuery } from '../../utils/businessHelpers.js';
import * as companyService from '../../services/companyService.js';
import * as roleService from '../../services/roleService.js';
import * as planService from '../../services/planService.js';
import * as userService from '../../services/userService.js';
import * as companyUserService from '../../services/companyUserService.js';
import * as jobTitleService from '../../services/jobTitleService.js';
import * as projectTypeService from '../../services/projectTypeService.js';
import * as clientTypeService from '../../services/clientTypeService.js';
import * as projectCategoryService from '../../services/projectCategoryService.js';
import { getSuperAdminCompanyId } from '../../services/systemCompanyService.js';
import { KEYCLOAK_GLOBAL_ROLE_VALUES } from '../../constants/keycloakRoles.js';

// Create module-specific logger
const logger = createModuleLogger('superAdmin');

/**
 * Get current user info (for testing auth middleware)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserInfo = async (req, res) => {
  const startTime = Date.now();
  
  try {
    logger.info('Get user info requested', {
      requestId: req.id,
      userId: req.user?.id,
      ip: req.ip || req.socket?.remoteAddress
    });

    // User should be attached by authMiddleware
    if (!req.user) {
      throw new UnauthorizedError('User not found in request', { requestId: req.id });
    }

    // Remove sessionState from response - it's sensitive and available in JWT token
    const userInfo = {
      id: req.user.id,
      keycloakId: req.user.keycloakId,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      keycloakGlobalRole: req.user.keycloakGlobalRole
    };

    const duration = Date.now() - startTime;
    
    logger.info('User info retrieved successfully', {
      requestId: req.id,
      userId: req.user.id,
      duration: `${duration}ms`
    });

    // Log performance if duration is significant
    if (duration > 100) {
      logPerformance('Get user info', duration, {
        requestId: req.id,
        module: 'superAdmin'
      });
    }

    res.status(200).json(
      successResponse('User info retrieved successfully', userInfo, {}, req, startTime)
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Get user info failed', {
      requestId: req.id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`
    });
    
    // Re-throw to let errorHandler handle
    throw error;
  }
};

/**
 * Get super admin dashboard data
 * Requires SUPER_ADMIN role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getDashboard = async (req, res) => {
  const startTime = Date.now();
  
  try {
    logger.info('Super admin dashboard requested', {
      requestId: req.id,
      userId: req.user?.id,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Verify user is SUPER_ADMIN
    if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
      throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
    }

    // TODO: Implement actual dashboard data retrieval
    const dashboardData = {
      totalUsers: 0,
      totalCompanies: 0,
      activeSessions: 0,
      systemStatus: 'operational'
    };

    const duration = Date.now() - startTime;
    
    logger.info('Super admin dashboard retrieved successfully', {
      requestId: req.id,
      userId: req.user.id,
      duration: `${duration}ms`
    });

    // Log performance if duration is significant
    if (duration > 200) {
      logPerformance('Get super admin dashboard', duration, {
        requestId: req.id,
        module: 'superAdmin'
      });
    }

    res.status(200).json(
      successResponse('Super admin dashboard retrieved successfully', dashboardData, {}, req, startTime)
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Get super admin dashboard failed', {
      requestId: req.id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`
    });
    
    // Re-throw to let errorHandler handle
    throw error;
  }
};

// =====================================================
// Company Management Functions
// =====================================================

/**
 * Create new company
 * Requires SUPER_ADMIN role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createCompany = async (req, res) => {
  const startTime = Date.now();
  
  try {
    logger.info('Create company requested', {
      requestId: req.id,
      userId: req.user?.id,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Verify user is SUPER_ADMIN
    if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
      throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
    }

    // Validate required fields
    const {
      name,
      description,
      isActive,
      email,
      phone,
      buildingAddress,
      streetAddress,
      city,
      state,
      postalCode,
      country,
      logo,
      status
    } = req.body;
    
    validateRequired({ name, email }, req.id);
    validateString(name, 'name', { minLength: 1, maxLength: 255 }, req.id);
    validateEmail(email, 'email', req.id);
    
    // Validate optional fields
    if (description !== undefined) {
      validateString(description, 'description', { required: false }, req.id);
    }
    if (phone !== undefined) {
      validateString(phone, 'phone', { maxLength: 50, required: false }, req.id);
    }
    if (buildingAddress !== undefined) {
      validateString(buildingAddress, 'buildingAddress', { maxLength: 255, required: false }, req.id);
    }
    if (streetAddress !== undefined) {
      validateString(streetAddress, 'streetAddress', { maxLength: 255, required: false }, req.id);
    }
    if (city !== undefined) {
      validateString(city, 'city', { maxLength: 100, required: false }, req.id);
    }
    if (state !== undefined) {
      validateString(state, 'state', { maxLength: 100, required: false }, req.id);
    }
    if (postalCode !== undefined) {
      validateString(postalCode, 'postalCode', { maxLength: 20, required: false }, req.id);
    }
    if (country !== undefined) {
      validateString(country, 'country', { maxLength: 100, required: false }, req.id);
    }
    if (logo !== undefined) {
      validateString(logo, 'logo', { required: false }, req.id);
    }
    if (status !== undefined) {
      validateEnum(status, COMPANY_STATUS_VALUES, 'status', req.id);
    }

    // Check if user or company already exists with this email
    const existingCompany = await companyService.getCompanyByEmail(email);
    if (existingCompany) {
      throw new ConflictError('A company already exists with this email', { field: 'email', value: email });
    }

    const kcUser = await userService.checkUserExistsInKeycloak(email);
    const existingUser = await userService.getUserByEmail(email);
    if (kcUser || existingUser) {
      throw new ConflictError('A user already exists with this email', { field: 'email', value: email });
    }

    // Check if COMPANY_ADMIN role exists
    const adminRole = await roleService.getRoleByCode('COMPANY_ADMIN');
    if (!adminRole) {
      throw new ConflictError('COMPANY_ADMIN role not found in the system');
    }

    // Create company via service
    const company = await companyService.createCompany(
      {
        name,
        description,
        isActive,
        email,
        phone,
        buildingAddress,
        streetAddress,
        city,
        state,
        postalCode,
        country,
        logo,
        status
      },
      { userId: req.user.id }
    );

    // Create the admin user
    const userPassword = 'admin';
    const userFirstName = name;
    const userLastName = 'Admin';
    const globalRole = 'COMPANY_ADMIN';

    logger.info('Creating new admin user in Keycloak for company', {
      requestId: req.id,
      email,
      companyId: company.id
    });
      
    const keycloakUser = await userService.createUserInKeycloak({
      email,
      password: userPassword,
      firstName: userFirstName,
      lastName: userLastName,
      keycloakGlobalRole: globalRole
    });
      
    // Create user in DB
    const newUser = await userService.createUserInDB({
      keycloakId: keycloakUser.id,
      email,
      firstName: userFirstName,
      lastName: userLastName,
      keycloakGlobalRole: globalRole
    }, { userId: req.user.id });
    
    // Assign user to the newly created company
    await companyUserService.assignUserToCompany(
      newUser.id,
      company.id,
      adminRole.id,
      { userId: req.user.id }
    );

    const duration = Date.now() - startTime;
    
    logger.info('Company created successfully', {
      requestId: req.id,
      userId: req.user.id,
      companyId: company.id,
      duration: `${duration}ms`
    });

    logBusiness('Company created', {
      requestId: req.id,
      userId: req.user.id,
      companyId: company.id,
      companyName: company.name
    });

    res.status(201).json(
      successResponse('Company created successfully', company, {}, req, startTime)
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Create company failed', {
      requestId: req.id,
      userId: req.user?.id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`
    });
    
    throw error;
  }
};

/**
 * Get all companies with pagination and filtering
 * Requires SUPER_ADMIN role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getCompanies = async (req, res) => {
  const startTime = Date.now();
  
  try {
    logger.info('Get companies requested', {
      requestId: req.id,
      userId: req.user?.id,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Verify user is SUPER_ADMIN
    if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
      throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
    }

    // Build pagination query
    const { page, limit, offset } = buildPaginationQuery(req.query, { defaultLimit: 10, maxLimit: 100 }, req.id);
    
    // Get filters
    const search = req.query.search || '';
    const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
    const sortBy = req.query.sortBy || 'name';
    const sortOrder = req.query.sortOrder || 'ASC';
    
    // Build sort query
    const allowedSortFields = ['name', 'createdDate', 'isActive'];
    const order = buildSortQuery(sortBy, sortOrder, allowedSortFields, { defaultSort: 'name', defaultOrder: 'ASC' });

    // Get companies via service
    const result = await companyService.listCompanies(
      { search, isActive },
      { page, limit, offset },
      order
    );

    const duration = Date.now() - startTime;
    
    logger.info('Companies retrieved successfully', {
      requestId: req.id,
      userId: req.user.id,
      duration: `${duration}ms`,
      totalCompanies: result.total,
      returnedCompanies: result.companies.length
    });

    if (duration > 500) {
      logPerformance('Get companies', duration, {
        requestId: req.id,
        module: 'superAdmin'
      });
    }

    res.status(200).json(
      paginatedResponse(
        'Companies retrieved successfully',
        result.companies,
        { page, limit, total: result.total },
        {},
        req,
        startTime
      )
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Get companies failed', {
      requestId: req.id,
      userId: req.user?.id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`
    });
    
    throw error;
  }
};

/**
 * Get company by ID
 * Requires SUPER_ADMIN role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getCompanyById = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;

    // Validate UUID
    validateUUID(id, 'id', req.id);

    logger.info('Get company requested', {
      requestId: req.id,
      userId: req.user?.id,
      companyId: id,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Verify user is SUPER_ADMIN
    if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
      throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
    }

    // Check if logo should be included (lazy loading)
    const includeLogo = req.query.includeLogo === 'true';

    // Get company via service
    const company = await companyService.getCompanyById(id, { includeLogo });

    const duration = Date.now() - startTime;
    
    logger.info('Company retrieved successfully', {
      requestId: req.id,
      userId: req.user.id,
      companyId: id,
      duration: `${duration}ms`
    });

    res.status(200).json(
      successResponse('Company retrieved successfully', company, {}, req, startTime)
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Get company failed', {
      requestId: req.id,
      userId: req.user?.id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`
    });
    
    throw error;
  }
};

/**
 * Update company by ID
 * Requires SUPER_ADMIN role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateCompany = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;
    const {
      name,
      description,
      isActive,
      email,
      phone,
      buildingAddress,
      streetAddress,
      city,
      state,
      postalCode,
      country,
      logo,
      status
    } = req.body;

    // Validate UUID
    validateUUID(id, 'id', req.id);

    logger.info('Update company requested', {
      requestId: req.id,
      userId: req.user?.id,
      companyId: id,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Verify user is SUPER_ADMIN
    if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
      throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
    }

    // Validate fields if provided
    if (name !== undefined) {
      validateString(name, 'name', { minLength: 1, maxLength: 255 }, req.id);
    }
    if (description !== undefined) {
      validateString(description, 'description', { required: false }, req.id);
    }
    if (email !== undefined) {
      validateEmail(email, 'email', req.id);
    }
    if (phone !== undefined) {
      validateString(phone, 'phone', { maxLength: 50, required: false }, req.id);
    }
    if (buildingAddress !== undefined) {
      validateString(buildingAddress, 'buildingAddress', { maxLength: 255, required: false }, req.id);
    }
    if (streetAddress !== undefined) {
      validateString(streetAddress, 'streetAddress', { maxLength: 255, required: false }, req.id);
    }
    if (city !== undefined) {
      validateString(city, 'city', { maxLength: 100, required: false }, req.id);
    }
    if (state !== undefined) {
      validateString(state, 'state', { maxLength: 100, required: false }, req.id);
    }
    if (postalCode !== undefined) {
      validateString(postalCode, 'postalCode', { maxLength: 20, required: false }, req.id);
    }
    if (country !== undefined) {
      validateString(country, 'country', { maxLength: 100, required: false }, req.id);
    }
    if (logo !== undefined) {
      validateString(logo, 'logo', { required: false }, req.id);
    }
    if (status !== undefined) {
      validateEnum(status, COMPANY_STATUS_VALUES, 'status', req.id);
    }

    // Update company via service
    const company = await companyService.updateCompany(
      id,
      {
        name,
        description,
        isActive,
        email,
        phone,
        buildingAddress,
        streetAddress,
        city,
        state,
        postalCode,
        country,
        logo,
        status
      },
      { userId: req.user.id }
    );

    const duration = Date.now() - startTime;
    
    logger.info('Company updated successfully', {
      requestId: req.id,
      userId: req.user.id,
      companyId: id,
      duration: `${duration}ms`
    });

    logBusiness('Company updated', {
      requestId: req.id,
      userId: req.user.id,
      companyId: id,
      updates: Object.keys({ name, description, isActive }).filter(k => req.body[k] !== undefined)
    });

    res.status(200).json(
      successResponse('Company updated successfully', company, {}, req, startTime)
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Update company failed', {
      requestId: req.id,
      userId: req.user?.id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`
    });
    
    throw error;
  }
};

/**
 * Delete (soft delete) company by ID
 * Requires SUPER_ADMIN role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteCompany = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;

    // Validate UUID
    validateUUID(id, 'id', req.id);

    logger.info('Delete company requested', {
      requestId: req.id,
      userId: req.user?.id,
      companyId: id,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Verify user is SUPER_ADMIN
    if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
      throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
    }

    // Delete company via service
    await companyService.deleteCompany(id, { userId: req.user.id });

    const duration = Date.now() - startTime;
    
    logger.info('Company deleted successfully', {
      requestId: req.id,
      userId: req.user.id,
      companyId: id,
      duration: `${duration}ms`
    });

    logBusiness('Company deleted', {
      requestId: req.id,
      userId: req.user.id,
      companyId: id
    });

    logSecurity('Company deleted', {
      requestId: req.id,
      userId: req.user.id,
      companyId: id
    });

    res.status(200).json(
      successResponse('Company deleted successfully', null, {}, req, startTime)
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Delete company failed', {
      requestId: req.id,
      userId: req.user?.id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`
    });
    
    throw error;
  }
};

// =====================================================
// Role Management Functions
// =====================================================

/**
 * Create new role
 * Requires SUPER_ADMIN role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createRole = async (req, res) => {
  const startTime = Date.now();
  
  try {
    logger.info('Create role requested', {
      requestId: req.id,
      userId: req.user?.id,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Verify user is SUPER_ADMIN
    if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
      throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
    }

    // Validate required fields
    const { name, code, description, isActive } = req.body;
    validateRequired({ name, code }, req.id);
    validateString(name, 'name', { minLength: 1, maxLength: 100 }, req.id);
    validateString(code, 'code', { minLength: 1, maxLength: 50 }, req.id);
    
    if (description !== undefined) {
      validateString(description, 'description', { required: false }, req.id);
    }

    // Create role via service
    const role = await roleService.createRole(
      { name, code, description, isActive },
      { userId: req.user.id }
    );

    const duration = Date.now() - startTime;
    
    logger.info('Role created successfully', {
      requestId: req.id,
      userId: req.user.id,
      roleId: role.id,
      duration: `${duration}ms`
    });

    logBusiness('Role created', {
      requestId: req.id,
      userId: req.user.id,
      roleId: role.id,
      roleName: role.name,
      roleCode: role.code
    });

    res.status(201).json(
      successResponse('Role created successfully', role, {}, req, startTime)
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Create role failed', {
      requestId: req.id,
      userId: req.user?.id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`
    });
    
    throw error;
  }
};

/**
 * Get all roles with pagination
 * Requires SUPER_ADMIN role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getRoles = async (req, res) => {
  const startTime = Date.now();
  
  try {
    logger.info('Get roles requested', {
      requestId: req.id,
      userId: req.user?.id,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Verify user is SUPER_ADMIN
    if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
      throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
    }

    // Build pagination query
    const { page, limit, offset } = buildPaginationQuery(req.query, { defaultLimit: 10, maxLimit: 100 }, req.id);
    
    // Get filters
    const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
    const sortBy = req.query.sortBy || 'name';
    const sortOrder = req.query.sortOrder || 'ASC';
    
    // Build sort query
    const allowedSortFields = ['name', 'code', 'createdDate', 'isActive'];
    const order = buildSortQuery(sortBy, sortOrder, allowedSortFields, { defaultSort: 'name', defaultOrder: 'ASC' });

    // Get roles via service
    const result = await roleService.listRoles(
      { isActive },
      { page, limit, offset },
      order
    );

    const duration = Date.now() - startTime;
    
    logger.info('Roles retrieved successfully', {
      requestId: req.id,
      userId: req.user.id,
      duration: `${duration}ms`,
      totalRoles: result.total
    });

    res.status(200).json(
      paginatedResponse(
        'Roles retrieved successfully',
        result.roles,
        { page, limit, total: result.total },
        {},
        req,
        startTime
      )
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Get roles failed', {
      requestId: req.id,
      userId: req.user?.id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`
    });
    
    throw error;
  }
};

/**
 * Get role by ID
 * Requires SUPER_ADMIN role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getRoleById = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;

    // Validate UUID
    validateUUID(id, 'id', req.id);

    logger.info('Get role requested', {
      requestId: req.id,
      userId: req.user?.id,
      roleId: id,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Verify user is SUPER_ADMIN
    if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
      throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
    }

    // Get role via service
    const role = await roleService.getRoleById(id);

    const duration = Date.now() - startTime;
    
    logger.info('Role retrieved successfully', {
      requestId: req.id,
      userId: req.user.id,
      roleId: id,
      duration: `${duration}ms`
    });

    res.status(200).json(
      successResponse('Role retrieved successfully', role, {}, req, startTime)
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Get role failed', {
      requestId: req.id,
      userId: req.user?.id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`
    });
    
    throw error;
  }
};

/**
 * Update role by ID
 * Requires SUPER_ADMIN role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateRole = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;
    const { name, code, description, isActive } = req.body;

    // Validate UUID
    validateUUID(id, 'id', req.id);

    logger.info('Update role requested', {
      requestId: req.id,
      userId: req.user?.id,
      roleId: id,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Verify user is SUPER_ADMIN
    if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
      throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
    }

    // Validate fields if provided
    if (name !== undefined) {
      validateString(name, 'name', { minLength: 1, maxLength: 100 }, req.id);
    }
    if (code !== undefined) {
      validateString(code, 'code', { minLength: 1, maxLength: 50 }, req.id);
    }
    if (description !== undefined) {
      validateString(description, 'description', { required: false }, req.id);
    }

    // Update role via service
    const role = await roleService.updateRole(
      id,
      { name, code, description, isActive },
      { userId: req.user.id }
    );

    const duration = Date.now() - startTime;
    
    logger.info('Role updated successfully', {
      requestId: req.id,
      userId: req.user.id,
      roleId: id,
      duration: `${duration}ms`
    });

    logBusiness('Role updated', {
      requestId: req.id,
      userId: req.user.id,
      roleId: id,
      updates: Object.keys({ name, code, description, isActive }).filter(k => req.body[k] !== undefined)
    });

    res.status(200).json(
      successResponse('Role updated successfully', role, {}, req, startTime)
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Update role failed', {
      requestId: req.id,
      userId: req.user?.id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`
    });
    
    throw error;
  }
};

/**
 * Delete (soft delete) role by ID
 * Requires SUPER_ADMIN role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteRole = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;

    // Validate UUID
    validateUUID(id, 'id', req.id);

    logger.info('Delete role requested', {
      requestId: req.id,
      userId: req.user?.id,
      roleId: id,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Verify user is SUPER_ADMIN
    if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
      throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
    }

    // Delete role via service
    await roleService.deleteRole(id, { userId: req.user.id });

    const duration = Date.now() - startTime;
    
    logger.info('Role deleted successfully', {
      requestId: req.id,
      userId: req.user.id,
      roleId: id,
      duration: `${duration}ms`
    });

    logBusiness('Role deleted', {
      requestId: req.id,
      userId: req.user.id,
      roleId: id
    });

    res.status(200).json(
      successResponse('Role deleted successfully', null, {}, req, startTime)
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Delete role failed', {
      requestId: req.id,
      userId: req.user?.id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`
    });
    
    throw error;
  }
};

// =====================================================
// Plan Management Functions
// =====================================================

/**
 * Create new plan
 * Requires SUPER_ADMIN role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createPlan = async (req, res) => {
  const startTime = Date.now();
  
  try {
    logger.info('Create plan requested', {
      requestId: req.id,
      userId: req.user?.id,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Verify user is SUPER_ADMIN
    if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
      throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
    }

    // Validate required fields
    const { name, code, description, isActive, price } = req.body;
    validateRequired({ name, code }, req.id);
    validateString(name, 'name', { minLength: 1, maxLength: 100 }, req.id);
    validateString(code, 'code', { minLength: 1, maxLength: 50 }, req.id);
    
    if (description !== undefined) {
      validateString(description, 'description', { required: false }, req.id);
    }
    
    // Validate price if provided
    if (price !== undefined) {
      validateNumber(price, 'price', { min: 0, required: false }, req.id);
    }

    // Create plan via service (no context required for master data)
    const plan = await planService.createPlan({
      name,
      code,
      description,
      isActive,
      price
    });

    const duration = Date.now() - startTime;
    
    logger.info('Plan created successfully', {
      requestId: req.id,
      userId: req.user.id,
      planId: plan.id,
      duration: `${duration}ms`
    });

    logBusiness('Plan created', {
      requestId: req.id,
      userId: req.user.id,
      planId: plan.id,
      planName: plan.name,
      planCode: plan.code
    });

    res.status(201).json(
      successResponse('Plan created successfully', plan, {}, req, startTime)
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Create plan failed', {
      requestId: req.id,
      userId: req.user?.id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`
    });
    
    throw error;
  }
};

/**
 * Get all plans with pagination
 * Requires SUPER_ADMIN role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getPlans = async (req, res) => {
  const startTime = Date.now();
  
  try {
    logger.info('Get plans requested', {
      requestId: req.id,
      userId: req.user?.id,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Verify user is SUPER_ADMIN
    if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
      throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
    }

    // Build pagination query
    const { page, limit, offset } = buildPaginationQuery(req.query, { defaultLimit: 10, maxLimit: 100 }, req.id);
    
    // Build sort query
    const sort = buildSortQuery(req.query, ['name', 'code', 'createdDate'], 'name', req.id);
    
    // Build filters
    const filters = {};
    if (req.query.isActive !== undefined) {
      filters.isActive = req.query.isActive === 'true';
    }

    // Get plans via service
    const result = await planService.listPlans(filters, { page, limit, offset }, sort);

    const duration = Date.now() - startTime;
    
    logger.info('Plans retrieved successfully', {
      requestId: req.id,
      userId: req.user.id,
      count: result.plans.length,
      total: result.total,
      duration: `${duration}ms`
    });

    res.status(200).json(
      paginatedResponse('Plans retrieved successfully', result.plans, { page, limit, total: result.total }, {}, req, startTime)
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Get plans failed', {
      requestId: req.id,
      userId: req.user?.id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`
    });
    
    throw error;
  }
};

/**
 * Get plan by ID
 * Requires SUPER_ADMIN role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getPlanById = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;

    // Validate UUID
    validateUUID(id, 'id', req.id);

    logger.info('Get plan requested', {
      requestId: req.id,
      userId: req.user?.id,
      planId: id,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Verify user is SUPER_ADMIN
    if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
      throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
    }

    // Get plan via service
    const plan = await planService.getPlanById(id);

    const duration = Date.now() - startTime;
    
    logger.info('Plan retrieved successfully', {
      requestId: req.id,
      userId: req.user.id,
      planId: id,
      duration: `${duration}ms`
    });

    res.status(200).json(
      successResponse('Plan retrieved successfully', plan, {}, req, startTime)
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Get plan failed', {
      requestId: req.id,
      userId: req.user?.id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`
    });
    
    throw error;
  }
};

/**
 * Update plan by ID
 * Requires SUPER_ADMIN role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updatePlan = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;
    const { name, code, description, price, isActive } = req.body;

    // Validate UUID
    validateUUID(id, 'id', req.id);

    logger.info('Update plan requested', {
      requestId: req.id,
      userId: req.user?.id,
      planId: id,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Verify user is SUPER_ADMIN
    if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
      throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
    }

    // Validate fields if provided
    if (name !== undefined) {
      validateString(name, 'name', { minLength: 1, maxLength: 100 }, req.id);
    }
    if (code !== undefined) {
      validateString(code, 'code', { minLength: 1, maxLength: 50 }, req.id);
    }
    if (description !== undefined) {
      validateString(description, 'description', { required: false }, req.id);
    }
    
    // Validate price if provided
    if (price !== undefined) {
      validateNumber(price, 'price', { min: 0, required: false }, req.id);
    }

    // Update plan via service (no context required for master data)
    const plan = await planService.updatePlan(id, {
      name,
      code,
      description,
      price,
      isActive
    });

    const duration = Date.now() - startTime;
    
    logger.info('Plan updated successfully', {
      requestId: req.id,
      userId: req.user.id,
      planId: id,
      duration: `${duration}ms`
    });

    logBusiness('Plan updated', {
      requestId: req.id,
      userId: req.user.id,
      planId: id,
      updates: Object.keys({ name, code, description, isActive }).filter(k => req.body[k] !== undefined)
    });

    res.status(200).json(
      successResponse('Plan updated successfully', plan, {}, req, startTime)
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Update plan failed', {
      requestId: req.id,
      userId: req.user?.id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`
    });
    
    throw error;
  }
};

/**
 * Delete (soft delete) plan by ID
 * Requires SUPER_ADMIN role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deletePlan = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;

    // Validate UUID
    validateUUID(id, 'id', req.id);

    logger.info('Delete plan requested', {
      requestId: req.id,
      userId: req.user?.id,
      planId: id,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Verify user is SUPER_ADMIN
    if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
      throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
    }

    // Delete plan via service (deletedUserId optional for master data)
    await planService.deletePlan(id, { deletedUserId: req.user.id });

    const duration = Date.now() - startTime;
    
    logger.info('Plan deleted successfully', {
      requestId: req.id,
      userId: req.user.id,
      planId: id,
      duration: `${duration}ms`
    });

    logBusiness('Plan deleted', {
      requestId: req.id,
      userId: req.user.id,
      planId: id
    });

    res.status(200).json(
      successResponse('Plan deleted successfully', null, {}, req, startTime)
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Delete plan failed', {
      requestId: req.id,
      userId: req.user?.id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`
    });
    
    throw error;
  }
};

// =====================================================
// User Management Functions
// =====================================================

/**
 * Create user with optional company assignment
 * Requires SUPER_ADMIN role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createUserWithCompany = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { email, password, firstName, lastName, keycloakGlobalRole, companyId, roleId } = req.body;

    logger.info('Create user with company requested', {
      requestId: req.id,
      userId: req.user?.id,
      email,
      companyId,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Verify user is SUPER_ADMIN
    if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
      throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
    }

    // Validate required fields
    validateRequired({ email }, req.id);
    validateEmail(email, 'email', req.id);
    
    // Validate optional fields
    if (firstName !== undefined) {
      validateString(firstName, 'firstName', { minLength: 1, maxLength: 100, required: false }, req.id);
    }
    if (lastName !== undefined) {
      validateString(lastName, 'lastName', { minLength: 1, maxLength: 100, required: false }, req.id);
    }
    if (keycloakGlobalRole !== undefined) {
      validateEnum(keycloakGlobalRole, KEYCLOAK_GLOBAL_ROLE_VALUES, 'keycloakGlobalRole', req.id);
    }
    
    // If company assignment requested, validate company and role
    if (companyId) {
      validateUUID(companyId, 'companyId', req.id);
      validateRequired({ roleId }, req.id);
      validateUUID(roleId, 'roleId', req.id);
    }

    // Check if user exists in Keycloak
    const kcUser = await userService.checkUserExistsInKeycloak(email);

    let newUser;
    if (kcUser) {
      // User exists in Keycloak - check if in DB
      const existingUser = await userService.getUserByEmail(email);
      
      if (existingUser) {
        // User exists in both Keycloak and DB
        if (!companyId) {
          // No company assignment requested - just return existing user
          logger.info('User already exists', {
            requestId: req.id,
            userId: existingUser.id,
            email
          });
          newUser = existingUser;
        } else {
          // Company assignment requested - assign to company
          await companyUserService.assignUserToCompany(
            existingUser.id,
            companyId,
            roleId,
            { userId: req.user.id }
          );
          
          logger.info('Existing user assigned to company', {
            requestId: req.id,
            userId: existingUser.id,
            companyId,
            roleId
          });
          
          newUser = existingUser;
        }
      } else {
        // User exists in Keycloak but not in DB - sync it
        logger.info('Syncing Keycloak user to database', {
          requestId: req.id,
          keycloakId: kcUser.id,
          email
        });
        
        newUser = await userService.createUserInDB({
          keycloakId: kcUser.id,
          email,
          firstName: firstName || kcUser.firstName,
          lastName: lastName || kcUser.lastName,
          keycloakGlobalRole: keycloakGlobalRole || 'COMPANY_USER'
        }, { userId: req.user.id });
        
        // Assign to company if requested
        if (companyId) {
          await companyUserService.assignUserToCompany(
            newUser.id,
            companyId,
            roleId,
            { userId: req.user.id }
          );
        }
      }
    } else {
      // User doesn't exist - create new
      if (!password) {
        validateRequired({ password }, req.id);
      }
      validateString(password, 'password', { minLength: 8 }, req.id);
      
      logger.info('Creating new user in Keycloak', {
        requestId: req.id,
        email
      });
      
      const keycloakUser = await userService.createUserInKeycloak({
        email,
        password,
        firstName,
        lastName,
        keycloakGlobalRole
      });
      
      // Create user in DB
      newUser = await userService.createUserInDB({
        keycloakId: keycloakUser.id,
        email,
        firstName,
        lastName,
        keycloakGlobalRole
      }, { userId: req.user.id });
      
      // Assign to company if requested
      if (companyId) {
        await companyUserService.assignUserToCompany(
          newUser.id,
          companyId,
          roleId,
          { userId: req.user.id }
        );
      }
    }

    const duration = Date.now() - startTime;
    
    logger.info('User creation completed', {
      requestId: req.id,
      userId: req.user.id,
      newUserId: newUser.id,
      email,
      duration: `${duration}ms`
    });

    logBusiness('User created by Super Admin', {
      requestId: req.id,
      userId: req.user.id,
      newUserId: newUser.id,
      email,
      companyId
    });

    logSecurity('User account created', {
      requestId: req.id,
      userId: req.user.id,
      newUserId: newUser.id,
      email
    });

    // Get user with companies for response
    const userWithCompanies = await userService.getUserByIdWithCompanies(newUser.id, { includeLogo: false });

    res.status(201).json(
      successResponse('User created successfully', userWithCompanies, {}, req, startTime)
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Create user with company failed', {
      requestId: req.id,
      userId: req.user?.id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`
    });
    
    throw error;
  }
};

/**
 * Get all users (cross-company) with pagination
 * Requires SUPER_ADMIN role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUsers = async (req, res) => {
  const startTime = Date.now();
  
  try {
    logger.info('Get users requested', {
      requestId: req.id,
      userId: req.user?.id,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Verify user is SUPER_ADMIN
    if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
      throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
    }

    // Build pagination query
    const { page, limit, offset } = buildPaginationQuery(req.query, { defaultLimit: 10, maxLimit: 100 }, req.id);
    
    // Get filters
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'email';
    const sortOrder = req.query.sortOrder || 'ASC';
    
    // Build sort query
    const allowedSortFields = ['email', 'firstName', 'lastName', 'keycloakGlobalRole', 'isActive'];
    const order = buildSortQuery(sortBy, sortOrder, allowedSortFields, { defaultSort: 'email', defaultOrder: 'ASC' });

    // Get users with companies via service
    const result = await userService.listUsersWithCompanies(
      { search },
      { page, limit, offset },
      order
    );

    const duration = Date.now() - startTime;
    
    logger.info('Users retrieved successfully', {
      requestId: req.id,
      userId: req.user.id,
      duration: `${duration}ms`,
      totalUsers: result.total
    });

    if (duration > 500) {
      logPerformance('Get users', duration, {
        requestId: req.id,
        module: 'superAdmin'
      });
    }

    res.status(200).json(
      paginatedResponse(
        'Users retrieved successfully',
        result.users,
        { page, limit, total: result.total },
        {},
        req,
        startTime
      )
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Get users failed', {
      requestId: req.id,
      userId: req.user?.id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`
    });
    
    throw error;
  }
};

/**
 * Get user by ID
 * Requires SUPER_ADMIN role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserById = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;

    // Validate UUID
    validateUUID(id, 'id', req.id);

    logger.info('Get user requested', {
      requestId: req.id,
      userId: req.user?.id,
      targetUserId: id,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Verify user is SUPER_ADMIN
    if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
      throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
    }

    // Get user with companies via service (include logo for single user view)
    const user = await userService.getUserByIdWithCompanies(id, { includeLogo: true });

    const duration = Date.now() - startTime;
    
    logger.info('User retrieved successfully', {
      requestId: req.id,
      userId: req.user.id,
      targetUserId: id,
      duration: `${duration}ms`
    });

    res.status(200).json(
      successResponse('User retrieved successfully', user, {}, req, startTime)
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Get user failed', {
      requestId: req.id,
      userId: req.user?.id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`
    });
    
    throw error;
  }
};

/**
 * Update user by ID
 * Requires SUPER_ADMIN role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateUser = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;
    const { email, firstName, lastName, keycloakGlobalRole, isActive, password } = req.body;

    // Validate UUID
    validateUUID(id, 'id', req.id);

    logger.info('Update user requested', {
      requestId: req.id,
      userId: req.user?.id,
      targetUserId: id,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Verify user is SUPER_ADMIN
    if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
      throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
    }

    // Validate fields if provided
    if (email !== undefined) {
      validateEmail(email, 'email', req.id);
    }
    if (firstName !== undefined) {
      validateString(firstName, 'firstName', { minLength: 1, maxLength: 100, required: false }, req.id);
    }
    if (lastName !== undefined) {
      validateString(lastName, 'lastName', { minLength: 1, maxLength: 100, required: false }, req.id);
    }
    if (keycloakGlobalRole !== undefined) {
      validateEnum(keycloakGlobalRole, KEYCLOAK_GLOBAL_ROLE_VALUES, 'keycloakGlobalRole', req.id);
    }
    if (password !== undefined) {
      validateString(password, 'password', { minLength: 8 }, req.id);
    }

    // Get current user for Keycloak update
    const currentUser = await userService.getUserById(id);

    // Update user in Keycloak
    await userService.updateUserInKeycloak(currentUser.keycloakId, {
      email,
      firstName,
      lastName,
      isActive,
      password,
      keycloakGlobalRole,
      currentRole: currentUser.keycloakGlobalRole
    });

    // Log password change if applicable
    if (password) {
      logSecurity('User password changed by Super Admin', {
        requestId: req.id,
        userId: req.user.id,
        targetUserId: id
      });
    }

    // Update user in database
    await userService.updateUserInDB(id, {
      email,
      firstName,
      lastName,
      keycloakGlobalRole,
      isActive
    }, { userId: req.user.id });

    // Get updated user with companies for response
    const user = await userService.getUserByIdWithCompanies(id, { includeLogo: false });

    const duration = Date.now() - startTime;
    
    logger.info('User updated successfully', {
      requestId: req.id,
      userId: req.user.id,
      targetUserId: id,
      duration: `${duration}ms`
    });

    logBusiness('User updated by Super Admin', {
      requestId: req.id,
      userId: req.user.id,
      targetUserId: id,
      updates: Object.keys({ email, firstName, lastName, keycloakGlobalRole, isActive }).filter(k => req.body[k] !== undefined)
    });

    res.status(200).json(
      successResponse('User updated successfully', user, {}, req, startTime)
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Update user failed', {
      requestId: req.id,
      userId: req.user?.id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`
    });
    
    throw error;
  }
};

/**
 * Disable user by ID (marks as inactive)
 * Requires SUPER_ADMIN role
 * Users are never deleted, only deactivated
 * Sets isActive to false in database and enabled to false in Keycloak
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const disableUser = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;

    // Validate UUID
    validateUUID(id, 'id', req.id);

    logger.info('Disable user requested', {
      requestId: req.id,
      userId: req.user?.id,
      targetUserId: id,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Verify user is SUPER_ADMIN
    if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
      throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
    }

    // Get user for logging
    const user = await userService.getUserById(id);

    // Disable user in Keycloak (sets enabled: false)
    await userService.deleteUserFromKeycloak(user.keycloakId);

    // Mark user as inactive in database (sets isActive: false)
    await userService.deleteUserFromDB(id, { userId: req.user.id });

    const duration = Date.now() - startTime;
    
    logger.info('User disabled successfully', {
      requestId: req.id,
      userId: req.user.id,
      targetUserId: id,
      duration: `${duration}ms`
    });

    logBusiness('User disabled by Super Admin', {
      requestId: req.id,
      userId: req.user.id,
      targetUserId: id
    });

    logSecurity('User account disabled', {
      requestId: req.id,
      userId: req.user.id,
      targetUserId: id,
      email: user.email
    });

    res.status(200).json(
      successResponse('User disabled successfully', null, {}, req, startTime)
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Disable user failed', {
      requestId: req.id,
      userId: req.user?.id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`
    });
    
    throw error;
  }
};

/**
 * Enable user by ID (marks as active)
 * Requires SUPER_ADMIN role
 * Sets isActive to true in database and enabled to true in Keycloak
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const enableUser = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;

    // Validate UUID
    validateUUID(id, 'id', req.id);

    logger.info('Enable user requested', {
      requestId: req.id,
      userId: req.user?.id,
      targetUserId: id,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Verify user is SUPER_ADMIN
    if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
      throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
    }

    // Get user for logging
    const user = await userService.getUserById(id);

    // Enable user in Keycloak (sets enabled: true)
    await userService.enableUserInKeycloak(user.keycloakId);

    // Mark user as active in database (sets isActive: true)
    await userService.enableUserInDB(id, { userId: req.user.id });

    const duration = Date.now() - startTime;
    
    logger.info('User enabled successfully', {
      requestId: req.id,
      userId: req.user.id,
      targetUserId: id,
      duration: `${duration}ms`
    });

    logBusiness('User enabled by Super Admin', {
      requestId: req.id,
      userId: req.user.id,
      targetUserId: id
    });

    logSecurity('User account enabled', {
      requestId: req.id,
      userId: req.user.id,
      targetUserId: id,
      email: user.email
    });

    res.status(200).json(
      successResponse('User enabled successfully', null, {}, req, startTime)
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Enable user failed', {
      requestId: req.id,
      userId: req.user?.id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`
    });
    
    throw error;
  }
};

/**
 * Assign user to company with role
 * Requires SUPER_ADMIN role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const assignUserToCompany = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;
    const { companyId, roleId } = req.body;

    // Validate UUIDs
    validateUUID(id, 'userId', req.id);
    validateRequired({ companyId, roleId }, req.id);
    validateUUID(companyId, 'companyId', req.id);
    validateUUID(roleId, 'roleId', req.id);

    logger.info('Assign user to company requested', {
      requestId: req.id,
      userId: req.user?.id,
      targetUserId: id,
      companyId,
      roleId,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Verify user is SUPER_ADMIN
    if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
      throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
    }

    // Assign user to company via service
    const assignment = await companyUserService.assignUserToCompany(
      id,
      companyId,
      roleId,
      { userId: req.user.id }
    );

    const duration = Date.now() - startTime;
    
    logger.info('User assigned to company successfully', {
      requestId: req.id,
      userId: req.user.id,
      targetUserId: id,
      companyId,
      roleId,
      duration: `${duration}ms`
    });

    logBusiness('User assigned to company', {
      requestId: req.id,
      userId: req.user.id,
      targetUserId: id,
      companyId,
      roleId
    });

    res.status(200).json(
      successResponse('User assigned to company successfully', assignment, {}, req, startTime)
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Assign user to company failed', {
      requestId: req.id,
      userId: req.user?.id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`
    });
    
    throw error;
  }
};

/**
 * Update user's role in a company
 * Requires SUPER_ADMIN role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateUserCompanyRole = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { id, companyId } = req.params;
    const { roleId } = req.body;

    // Validate UUIDs
    validateUUID(id, 'userId', req.id);
    validateUUID(companyId, 'companyId', req.id);
    validateRequired({ roleId }, req.id);
    validateUUID(roleId, 'roleId', req.id);

    logger.info('Update user company role requested', {
      requestId: req.id,
      userId: req.user?.id,
      targetUserId: id,
      companyId,
      roleId,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Verify user is SUPER_ADMIN
    if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
      throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
    }

    // Update role via service
    const assignment = await companyUserService.updateUserRole(
      id,
      companyId,
      roleId,
      { userId: req.user.id }
    );

    const duration = Date.now() - startTime;
    
    logger.info('User company role updated successfully', {
      requestId: req.id,
      userId: req.user.id,
      targetUserId: id,
      companyId,
      roleId,
      duration: `${duration}ms`
    });

    logBusiness('User company role updated', {
      requestId: req.id,
      userId: req.user.id,
      targetUserId: id,
      companyId,
      roleId
    });

    res.status(200).json(
      successResponse('User role updated successfully', assignment, {}, req, startTime)
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Update user company role failed', {
      requestId: req.id,
      userId: req.user?.id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`
    });
    
    throw error;
  }
};

// =====================================================
// Job title management (system company defaults)
// =====================================================

/**
 * Create job title owned by super admin company
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const createSuperAdminJobTitle = async (req, res) => {
  const startTime = Date.now();

  if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
    throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
  }

  const { jobTitle, description, isActive } = req.body;
  validateRequired({ jobTitle }, req.id);
  validateString(jobTitle, 'jobTitle', { minLength: 1, maxLength: 255 }, req.id);
  if (description !== undefined && description !== null) {
    validateString(description, 'description', { required: false, maxLength: 5000 }, req.id);
  }
  let resolvedActive = true;
  if (isActive !== undefined && isActive !== null) {
    resolvedActive = validateBoolean(isActive, 'isActive', { required: true }, req.id);
  }

  const companyId = await getSuperAdminCompanyId({ requestId: req.id });
  const created = await jobTitleService.createJobTitle(
    { jobTitle, description, isActive: resolvedActive },
    { userId: req.user.id, companyId }
  );

  logBusiness('Job title created (super admin company)', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    jobTitleId: created.id
  });

  res.status(201).json(successResponse('Job title created successfully', created, {}, req, startTime));
};

/**
 * List job titles for super admin company (paginated)
 * @param {Object} req
 * @param {Object} res
 */
export const listSuperAdminJobTitles = async (req, res) => {
  const startTime = Date.now();

  if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
    throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
  }

  const { page, limit, offset } = buildPaginationQuery(req.query, { defaultLimit: 10, maxLimit: 100 }, req.id);
  const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
  const search = req.query.search ? String(req.query.search).trim() : undefined;
  if (search) {
    validateString(search, 'search', { minLength: 1, maxLength: 255 }, req.id);
  }

  const sortBy = req.query.sortBy || 'jobTitle';
  const sortOrder = req.query.sortOrder || 'ASC';
  const allowedSortFields = ['jobTitle', 'createdDate', 'isActive'];
  const order = buildSortQuery(sortBy, sortOrder, allowedSortFields, {
    defaultSort: 'jobTitle',
    defaultOrder: 'ASC'
  });

  const companyId = await getSuperAdminCompanyId({ requestId: req.id });
  const result = await jobTitleService.listJobTitlesForCompany(
    companyId,
    { isActive, search },
    { page, limit, offset },
    order,
    { requestId: req.id, workspace: 'superAdmin' }
  );

  res.status(200).json(
    paginatedResponse(
      'Job titles retrieved successfully',
      result.jobTitles,
      { page, limit, total: result.total },
      {},
      req,
      startTime
    )
  );
};

/**
 * Get job title by id (super admin company only)
 * @param {Object} req
 * @param {Object} res
 */
export const getSuperAdminJobTitleById = async (req, res) => {
  const startTime = Date.now();

  if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
    throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
  }

  validateUUID(req.params.id, 'id', req.id);
  const companyId = await getSuperAdminCompanyId({ requestId: req.id });
  const row = await jobTitleService.getJobTitleByIdForCompany(req.params.id, companyId, {
    requestId: req.id,
    workspace: 'superAdmin'
  });

  res.status(200).json(successResponse('Job title retrieved successfully', row, {}, req, startTime));
};

/**
 * Update job title (super admin company only)
 * @param {Object} req
 * @param {Object} res
 */
export const updateSuperAdminJobTitle = async (req, res) => {
  const startTime = Date.now();

  if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
    throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
  }

  validateUUID(req.params.id, 'id', req.id);
  const companyId = await getSuperAdminCompanyId({ requestId: req.id });

  const { jobTitle, description, isActive } = req.body;
  const payload = {};
  if (jobTitle !== undefined) {
    validateString(jobTitle, 'jobTitle', { minLength: 1, maxLength: 255 }, req.id);
    payload.jobTitle = jobTitle;
  }
  if (description !== undefined) {
    validateString(description, 'description', { required: false, maxLength: 5000 }, req.id);
    payload.description = description;
  }
  if (isActive !== undefined) {
    payload.isActive = validateBoolean(isActive, 'isActive', { required: true }, req.id);
  }

  const updated = await jobTitleService.updateJobTitleForCompany(
    req.params.id,
    payload,
    { userId: req.user.id, requestId: req.id },
    companyId
  );

  logBusiness('Job title updated (super admin company)', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    jobTitleId: updated.id
  });

  res.status(200).json(successResponse('Job title updated successfully', updated, {}, req, startTime));
};

/**
 * PATCH active / inactive for job title (system company only)
 * @param {Object} req
 * @param {Object} res
 */
export const patchSuperAdminJobTitleStatus = async (req, res) => {
  const startTime = Date.now();

  if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
    throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
  }

  validateUUID(req.params.id, 'id', req.id);
  const companyId = await getSuperAdminCompanyId({ requestId: req.id });
  const isActive = validateBoolean(req.body.isActive, 'isActive', { required: true }, req.id);

  const updated = await jobTitleService.setJobTitleActiveStatusForCompany(
    req.params.id,
    isActive,
    { userId: req.user.id, requestId: req.id },
    companyId
  );

  logBusiness('Job title status updated (super admin company)', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    jobTitleId: updated.id,
    isActive
  });

  res.status(200).json(successResponse('Job title status updated successfully', updated, {}, req, startTime));
};

/**
 * Delete job title (super admin company only)
 * @param {Object} req
 * @param {Object} res
 */
export const deleteSuperAdminJobTitle = async (req, res) => {
  const startTime = Date.now();

  if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
    throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
  }

  validateUUID(req.params.id, 'id', req.id);
  const companyId = await getSuperAdminCompanyId({ requestId: req.id });

  await jobTitleService.deleteJobTitleForCompany(req.params.id, { userId: req.user.id, requestId: req.id }, companyId);

  logBusiness('Job title deleted (super admin company)', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    jobTitleId: req.params.id
  });

  res.status(200).json(successResponse('Job title deleted successfully', null, {}, req, startTime));
};

// =====================================================
// Project types (system company defaults)
// =====================================================

/**
 * Create project type owned by super admin company
 * @param {Object} req
 * @param {Object} res
 */
export const createSuperAdminProjectType = async (req, res) => {
  const startTime = Date.now();

  if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
    throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
  }

  const { projectType, description, isActive } = req.body;
  validateRequired({ projectType }, req.id);
  validateString(projectType, 'projectType', { minLength: 1, maxLength: 255 }, req.id);
  if (description !== undefined && description !== null) {
    validateString(description, 'description', { required: false, maxLength: 5000 }, req.id);
  }
  let resolvedActive = true;
  if (isActive !== undefined && isActive !== null) {
    resolvedActive = validateBoolean(isActive, 'isActive', { required: true }, req.id);
  }

  const companyId = await getSuperAdminCompanyId({ requestId: req.id });
  const created = await projectTypeService.createProjectType(
    { projectType, description, isActive: resolvedActive },
    { userId: req.user.id, companyId }
  );

  logBusiness('Project type created (super admin company)', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    projectTypeId: created.id
  });

  res.status(201).json(successResponse('Project type created successfully', created, {}, req, startTime));
};

/**
 * List project types for super admin company (paginated)
 * @param {Object} req
 * @param {Object} res
 */
export const listSuperAdminProjectTypes = async (req, res) => {
  const startTime = Date.now();

  if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
    throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
  }

  const { page, limit, offset } = buildPaginationQuery(req.query, { defaultLimit: 10, maxLimit: 100 }, req.id);
  const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
  const search = req.query.search ? String(req.query.search).trim() : undefined;
  if (search) {
    validateString(search, 'search', { minLength: 1, maxLength: 255 }, req.id);
  }

  const sortBy = req.query.sortBy || 'projectType';
  const sortOrder = req.query.sortOrder || 'ASC';
  const allowedSortFields = ['projectType', 'createdDate', 'isActive'];
  const order = buildSortQuery(sortBy, sortOrder, allowedSortFields, {
    defaultSort: 'projectType',
    defaultOrder: 'ASC'
  });

  const companyId = await getSuperAdminCompanyId({ requestId: req.id });
  const result = await projectTypeService.listProjectTypesForCompany(
    companyId,
    { isActive, search },
    { page, limit, offset },
    order,
    { requestId: req.id, workspace: 'superAdmin' }
  );

  res.status(200).json(
    paginatedResponse(
      'Project types retrieved successfully',
      result.projectTypes,
      { page, limit, total: result.total },
      {},
      req,
      startTime
    )
  );
};

/**
 * Get project type by id (super admin company only)
 * @param {Object} req
 * @param {Object} res
 */
export const getSuperAdminProjectTypeById = async (req, res) => {
  const startTime = Date.now();

  if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
    throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
  }

  validateUUID(req.params.id, 'id', req.id);
  const companyId = await getSuperAdminCompanyId({ requestId: req.id });
  const row = await projectTypeService.getProjectTypeByIdForCompany(req.params.id, companyId, {
    requestId: req.id,
    workspace: 'superAdmin'
  });

  res.status(200).json(successResponse('Project type retrieved successfully', row, {}, req, startTime));
};

/**
 * Update project type (super admin company only)
 * @param {Object} req
 * @param {Object} res
 */
export const updateSuperAdminProjectType = async (req, res) => {
  const startTime = Date.now();

  if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
    throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
  }

  validateUUID(req.params.id, 'id', req.id);
  const companyId = await getSuperAdminCompanyId({ requestId: req.id });

  const { projectType, description, isActive } = req.body;
  const payload = {};
  if (projectType !== undefined) {
    validateString(projectType, 'projectType', { minLength: 1, maxLength: 255 }, req.id);
    payload.projectType = projectType;
  }
  if (description !== undefined) {
    validateString(description, 'description', { required: false, maxLength: 5000 }, req.id);
    payload.description = description;
  }
  if (isActive !== undefined) {
    payload.isActive = validateBoolean(isActive, 'isActive', { required: true }, req.id);
  }

  const updated = await projectTypeService.updateProjectTypeForCompany(
    req.params.id,
    payload,
    { userId: req.user.id, requestId: req.id },
    companyId
  );

  logBusiness('Project type updated (super admin company)', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    projectTypeId: updated.id
  });

  res.status(200).json(successResponse('Project type updated successfully', updated, {}, req, startTime));
};

/**
 * PATCH active / inactive for project type (system company only)
 * @param {Object} req
 * @param {Object} res
 */
export const patchSuperAdminProjectTypeStatus = async (req, res) => {
  const startTime = Date.now();

  if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
    throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
  }

  validateUUID(req.params.id, 'id', req.id);
  const companyId = await getSuperAdminCompanyId({ requestId: req.id });
  const isActive = validateBoolean(req.body.isActive, 'isActive', { required: true }, req.id);

  const updated = await projectTypeService.setProjectTypeActiveStatusForCompany(
    req.params.id,
    isActive,
    { userId: req.user.id, requestId: req.id },
    companyId
  );

  logBusiness('Project type status updated (super admin company)', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    projectTypeId: updated.id,
    isActive
  });

  res.status(200).json(successResponse('Project type status updated successfully', updated, {}, req, startTime));
};

/**
 * Delete project type (super admin company only)
 * @param {Object} req
 * @param {Object} res
 */
export const deleteSuperAdminProjectType = async (req, res) => {
  const startTime = Date.now();

  if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
    throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
  }

  validateUUID(req.params.id, 'id', req.id);
  const companyId = await getSuperAdminCompanyId({ requestId: req.id });

  await projectTypeService.deleteProjectTypeForCompany(req.params.id, { userId: req.user.id, requestId: req.id }, companyId);

  logBusiness('Project type deleted (super admin company)', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    projectTypeId: req.params.id
  });

  res.status(200).json(successResponse('Project type deleted successfully', null, {}, req, startTime));
};

// =====================================================
// Client types (system company defaults)
// =====================================================

/**
 * Create client type owned by super admin company
 * @param {Object} req
 * @param {Object} res
 */
export const createSuperAdminClientType = async (req, res) => {
  const startTime = Date.now();

  if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
    throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
  }

  const { clientType, description, isActive } = req.body;
  validateRequired({ clientType }, req.id);
  validateString(clientType, 'clientType', { minLength: 1, maxLength: 255 }, req.id);
  if (description !== undefined && description !== null) {
    validateString(description, 'description', { required: false, maxLength: 5000 }, req.id);
  }
  let resolvedActive = true;
  if (isActive !== undefined && isActive !== null) {
    resolvedActive = validateBoolean(isActive, 'isActive', { required: true }, req.id);
  }

  const companyId = await getSuperAdminCompanyId({ requestId: req.id });
  const created = await clientTypeService.createClientType(
    { clientType, description, isActive: resolvedActive },
    { userId: req.user.id, companyId }
  );

  logBusiness('Client type created (super admin company)', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    clientTypeId: created.id
  });

  res.status(201).json(successResponse('Client type created successfully', created, {}, req, startTime));
};

/**
 * List client types for super admin company (paginated)
 * @param {Object} req
 * @param {Object} res
 */
export const listSuperAdminClientTypes = async (req, res) => {
  const startTime = Date.now();

  if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
    throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
  }

  const { page, limit, offset } = buildPaginationQuery(req.query, { defaultLimit: 10, maxLimit: 100 }, req.id);
  const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
  const search = req.query.search ? String(req.query.search).trim() : undefined;
  if (search) {
    validateString(search, 'search', { minLength: 1, maxLength: 255 }, req.id);
  }

  const sortBy = req.query.sortBy || 'clientType';
  const sortOrder = req.query.sortOrder || 'ASC';
  const allowedSortFields = ['clientType', 'createdDate', 'isActive'];
  const order = buildSortQuery(sortBy, sortOrder, allowedSortFields, {
    defaultSort: 'clientType',
    defaultOrder: 'ASC'
  });

  const companyId = await getSuperAdminCompanyId({ requestId: req.id });
  const result = await clientTypeService.listClientTypesForCompany(
    companyId,
    { isActive, search },
    { page, limit, offset },
    order,
    { requestId: req.id, workspace: 'superAdmin' }
  );

  res.status(200).json(
    paginatedResponse(
      'Client types retrieved successfully',
      result.clientTypes,
      { page, limit, total: result.total },
      {},
      req,
      startTime
    )
  );
};

/**
 * Get client type by id (super admin company only)
 * @param {Object} req
 * @param {Object} res
 */
export const getSuperAdminClientTypeById = async (req, res) => {
  const startTime = Date.now();

  if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
    throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
  }

  validateUUID(req.params.id, 'id', req.id);
  const companyId = await getSuperAdminCompanyId({ requestId: req.id });
  const row = await clientTypeService.getClientTypeByIdForCompany(req.params.id, companyId, {
    requestId: req.id,
    workspace: 'superAdmin'
  });

  res.status(200).json(successResponse('Client type retrieved successfully', row, {}, req, startTime));
};

/**
 * Update client type (super admin company only)
 * @param {Object} req
 * @param {Object} res
 */
export const updateSuperAdminClientType = async (req, res) => {
  const startTime = Date.now();

  if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
    throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
  }

  validateUUID(req.params.id, 'id', req.id);
  const companyId = await getSuperAdminCompanyId({ requestId: req.id });

  const { clientType, description, isActive } = req.body;
  const payload = {};
  if (clientType !== undefined) {
    validateString(clientType, 'clientType', { minLength: 1, maxLength: 255 }, req.id);
    payload.clientType = clientType;
  }
  if (description !== undefined) {
    validateString(description, 'description', { required: false, maxLength: 5000 }, req.id);
    payload.description = description;
  }
  if (isActive !== undefined) {
    payload.isActive = validateBoolean(isActive, 'isActive', { required: true }, req.id);
  }

  const updated = await clientTypeService.updateClientTypeForCompany(
    req.params.id,
    payload,
    { userId: req.user.id, requestId: req.id },
    companyId
  );

  logBusiness('Client type updated (super admin company)', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    clientTypeId: updated.id
  });

  res.status(200).json(successResponse('Client type updated successfully', updated, {}, req, startTime));
};

/**
 * PATCH active / inactive for client type (system company only)
 * @param {Object} req
 * @param {Object} res
 */
export const patchSuperAdminClientTypeStatus = async (req, res) => {
  const startTime = Date.now();

  if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
    throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
  }

  validateUUID(req.params.id, 'id', req.id);
  const companyId = await getSuperAdminCompanyId({ requestId: req.id });
  const isActive = validateBoolean(req.body.isActive, 'isActive', { required: true }, req.id);

  const updated = await clientTypeService.setClientTypeActiveStatusForCompany(
    req.params.id,
    isActive,
    { userId: req.user.id, requestId: req.id },
    companyId
  );

  logBusiness('Client type status updated (super admin company)', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    clientTypeId: updated.id,
    isActive
  });

  res.status(200).json(successResponse('Client type status updated successfully', updated, {}, req, startTime));
};

/**
 * Delete client type (super admin company only)
 * @param {Object} req
 * @param {Object} res
 */
export const deleteSuperAdminClientType = async (req, res) => {
  const startTime = Date.now();

  if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
    throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
  }

  validateUUID(req.params.id, 'id', req.id);
  const companyId = await getSuperAdminCompanyId({ requestId: req.id });

  await clientTypeService.deleteClientTypeForCompany(req.params.id, { userId: req.user.id, requestId: req.id }, companyId);

  logBusiness('Client type deleted (super admin company)', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    clientTypeId: req.params.id
  });

  res.status(200).json(successResponse('Client type deleted successfully', null, {}, req, startTime));
};

// =====================================================
// Project categories (system company defaults)
// =====================================================

/**
 * Create project category owned by super admin company
 * @param {Object} req
 * @param {Object} res
 */
export const createSuperAdminProjectCategory = async (req, res) => {
  const startTime = Date.now();

  if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
    throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
  }

  const { projectCategory, description, isActive } = req.body;
  validateRequired({ projectCategory }, req.id);
  validateString(projectCategory, 'projectCategory', { minLength: 1, maxLength: 255 }, req.id);
  if (description !== undefined && description !== null) {
    validateString(description, 'description', { required: false, maxLength: 5000 }, req.id);
  }
  let resolvedActive = true;
  if (isActive !== undefined && isActive !== null) {
    resolvedActive = validateBoolean(isActive, 'isActive', { required: true }, req.id);
  }

  const companyId = await getSuperAdminCompanyId({ requestId: req.id });
  const created = await projectCategoryService.createProjectCategory(
    { projectCategory, description, isActive: resolvedActive },
    { userId: req.user.id, companyId }
  );

  logBusiness('Project category created (super admin company)', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    projectCategoryId: created.id
  });

  res.status(201).json(successResponse('Project category created successfully', created, {}, req, startTime));
};

/**
 * List project categories for super admin company (paginated)
 * @param {Object} req
 * @param {Object} res
 */
export const listSuperAdminProjectCategories = async (req, res) => {
  const startTime = Date.now();

  if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
    throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
  }

  const { page, limit, offset } = buildPaginationQuery(req.query, { defaultLimit: 10, maxLimit: 100 }, req.id);
  const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
  const search = req.query.search ? String(req.query.search).trim() : undefined;
  if (search) {
    validateString(search, 'search', { minLength: 1, maxLength: 255 }, req.id);
  }

  const sortBy = req.query.sortBy || 'projectCategory';
  const sortOrder = req.query.sortOrder || 'ASC';
  const allowedSortFields = ['projectCategory', 'createdDate', 'isActive'];
  const order = buildSortQuery(sortBy, sortOrder, allowedSortFields, {
    defaultSort: 'projectCategory',
    defaultOrder: 'ASC'
  });

  const companyId = await getSuperAdminCompanyId({ requestId: req.id });
  const result = await projectCategoryService.listProjectCategoriesForCompany(
    companyId,
    { isActive, search },
    { page, limit, offset },
    order,
    { requestId: req.id, workspace: 'superAdmin' }
  );

  res.status(200).json(
    paginatedResponse(
      'Project categories retrieved successfully',
      result.projectCategories,
      { page, limit, total: result.total },
      {},
      req,
      startTime
    )
  );
};

/**
 * Get project category by id (super admin company only)
 * @param {Object} req
 * @param {Object} res
 */
export const getSuperAdminProjectCategoryById = async (req, res) => {
  const startTime = Date.now();

  if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
    throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
  }

  validateUUID(req.params.id, 'id', req.id);
  const companyId = await getSuperAdminCompanyId({ requestId: req.id });
  const row = await projectCategoryService.getProjectCategoryByIdForCompany(req.params.id, companyId, {
    requestId: req.id,
    workspace: 'superAdmin'
  });

  res.status(200).json(successResponse('Project category retrieved successfully', row, {}, req, startTime));
};

/**
 * Update project category (super admin company only)
 * @param {Object} req
 * @param {Object} res
 */
export const updateSuperAdminProjectCategory = async (req, res) => {
  const startTime = Date.now();

  if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
    throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
  }

  validateUUID(req.params.id, 'id', req.id);
  const companyId = await getSuperAdminCompanyId({ requestId: req.id });

  const { projectCategory, description, isActive } = req.body;
  const payload = {};
  if (projectCategory !== undefined) {
    validateString(projectCategory, 'projectCategory', { minLength: 1, maxLength: 255 }, req.id);
    payload.projectCategory = projectCategory;
  }
  if (description !== undefined) {
    validateString(description, 'description', { required: false, maxLength: 5000 }, req.id);
    payload.description = description;
  }
  if (isActive !== undefined) {
    payload.isActive = validateBoolean(isActive, 'isActive', { required: true }, req.id);
  }

  const updated = await projectCategoryService.updateProjectCategoryForCompany(
    req.params.id,
    payload,
    { userId: req.user.id, requestId: req.id },
    companyId
  );

  logBusiness('Project category updated (super admin company)', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    projectCategoryId: updated.id
  });

  res.status(200).json(successResponse('Project category updated successfully', updated, {}, req, startTime));
};

/**
 * PATCH active / inactive for project category (system company only)
 * @param {Object} req
 * @param {Object} res
 */
export const patchSuperAdminProjectCategoryStatus = async (req, res) => {
  const startTime = Date.now();

  if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
    throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
  }

  validateUUID(req.params.id, 'id', req.id);
  const companyId = await getSuperAdminCompanyId({ requestId: req.id });
  const isActive = validateBoolean(req.body.isActive, 'isActive', { required: true }, req.id);

  const updated = await projectCategoryService.setProjectCategoryActiveStatusForCompany(
    req.params.id,
    isActive,
    { userId: req.user.id, requestId: req.id },
    companyId
  );

  logBusiness('Project category status updated (super admin company)', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    projectCategoryId: updated.id,
    isActive
  });

  res.status(200).json(successResponse('Project category status updated successfully', updated, {}, req, startTime));
};

/**
 * Delete project category (super admin company only)
 * @param {Object} req
 * @param {Object} res
 */
export const deleteSuperAdminProjectCategory = async (req, res) => {
  const startTime = Date.now();

  if (!req.user || !isSuperAdmin(req.user.keycloakGlobalRole)) {
    throw new ForbiddenError('Super admin access required', { requestId: req.id, userId: req.user?.id });
  }

  validateUUID(req.params.id, 'id', req.id);
  const companyId = await getSuperAdminCompanyId({ requestId: req.id });

  await projectCategoryService.deleteProjectCategoryForCompany(
    req.params.id,
    { userId: req.user.id, requestId: req.id },
    companyId
  );

  logBusiness('Project category deleted (super admin company)', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    projectCategoryId: req.params.id
  });

  res.status(200).json(successResponse('Project category deleted successfully', null, {}, req, startTime));
};

