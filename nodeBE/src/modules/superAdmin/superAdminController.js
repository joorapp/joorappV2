/**
 * @author Bhavesh Venugopal
 * Super Admin Controller
 * Handles super admin functionality endpoints
 */

import { createModuleLogger, logPerformance, logBusiness, logSecurity } from '../../utils/logger.js';
import { isSuperAdmin } from '../../constants/keycloakRoles.js';
import { successResponse, paginatedResponse } from '../../utils/responseHelpers.js';
import { UnauthorizedError, ForbiddenError } from '../../utils/errors.js';
import { validateUUID, validateRequired, validateString, validateEnum, validateEmail } from '../../utils/validators.js';
import { buildPaginationQuery, buildSortQuery } from '../../utils/businessHelpers.js';
import * as companyService from '../../services/companyService.js';
import * as roleService from '../../services/roleService.js';
import * as userService from '../../services/userService.js';
import * as companyUserService from '../../services/companyUserService.js';
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
    const { name, code, description, isActive } = req.body;
    validateRequired({ name }, req.id);
    validateString(name, 'name', { minLength: 1, maxLength: 100 }, req.id);
    
    if (code !== undefined) {
      validateString(code, 'code', { required: false, maxLength: 50 }, req.id);
    }
    
    if (description !== undefined) {
      validateString(description, 'description', { required: false }, req.id);
    }

    // Create company via service
    const company = await companyService.createCompany(
      { name, code, description, isActive },
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

    // Get company via service
    const company = await companyService.getCompanyById(id);

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
    const { name, code, description, isActive } = req.body;

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
      validateString(name, 'name', { minLength: 1, maxLength: 100 }, req.id);
    }
    if (code !== undefined) {
      validateString(code, 'code', { required: false, maxLength: 50 }, req.id);
    }
    if (description !== undefined) {
      validateString(description, 'description', { required: false }, req.id);
    }

    // Update company via service
    const company = await companyService.updateCompany(
      id,
      { name, code, description, isActive },
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

    res.status(201).json(
      successResponse('User created successfully', newUser, {}, req, startTime)
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

    // Get users via service
    const result = await userService.listUsers(
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

    // Get user via service
    const user = await userService.getUserById(id);

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
    const user = await userService.updateUserInDB(id, {
      email,
      firstName,
      lastName,
      keycloakGlobalRole,
      isActive
    }, { userId: req.user.id });

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

    // Disable user in Keycloak
    await userService.deleteUserFromKeycloak(user.keycloakId);

    // Mark user as inactive in database (never delete)
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

