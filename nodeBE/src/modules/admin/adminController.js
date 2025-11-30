/**
 * @author Bhavesh Venugopal
 * Admin Controller
 * Handles administrative functions and user management
 */

import { createModuleLogger, logBusiness, logSecurity, logPerformance } from '../../utils/logger.js';
import { successResponse, paginatedResponse } from '../../utils/responseHelpers.js';
import { validateUUID, validateRequired, validateEmail, validateString, validateEnum } from '../../utils/validators.js';
import { buildPaginationQuery, buildSortQuery } from '../../utils/businessHelpers.js';
import { ForbiddenError, BadRequestError } from '../../utils/errors.js';
import { isCompanyAdmin } from '../../constants/keycloakRoles.js';
import * as userService from '../../services/userService.js';
import * as companyUserService from '../../services/companyUserService.js';
import { KEYCLOAK_GLOBAL_ROLE_VALUES } from '../../constants/keycloakRoles.js';

// Create module-specific logger
const logger = createModuleLogger('admin');

/**
 * Get system settings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getSettings = async (req, res) => {
  const startTime = Date.now();
  
  try {
    logger.info('Settings requested', {
      requestId: req.id,
      userId: req.user?.id || 'anonymous',
      ip: req.ip || req.socket?.remoteAddress
    });
    
    // Mock settings - replace with actual database query
    const settings = {
      siteName: "JoorApp",
      maintenanceMode: false,
      maxUsers: 1000,
      features: {
        registration: true,
        emailNotifications: true,
        analytics: true
      }
    };

    const duration = Date.now() - startTime;
    
    logger.info('Settings retrieved successfully', {
      requestId: req.id,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
      maintenanceMode: settings.maintenanceMode,
      maxUsers: settings.maxUsers
    });
    
    // Log business event
    logBusiness('Settings accessed', {
      requestId: req.id,
      userId: req.user?.id || 'anonymous'
    });

    res.status(200).json(
      successResponse("Settings retrieved successfully", { settings }, {}, req, startTime)
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Get settings failed', {
      requestId: req.id,
      userId: req.user?.id || 'anonymous',
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
 * Update system settings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const updateSettings = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { siteName, maintenanceMode, maxUsers, features } = req.body;
    
    logger.info('Settings update requested', {
      requestId: req.id,
      userId: req.user?.id || 'anonymous',
      ip: req.ip || req.socket?.remoteAddress,
      changes: { siteName, maintenanceMode, maxUsers, features }
    });
    
    // Mock settings update - replace with actual database update
    const updatedSettings = {
      siteName: siteName || "JoorApp",
      maintenanceMode: maintenanceMode || false,
      maxUsers: maxUsers || 1000,
      features: features || {
        registration: true,
        emailNotifications: true,
        analytics: true
      }
    };

    const duration = Date.now() - startTime;
    
    logger.info('Settings updated successfully', {
      requestId: req.id,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
      changes: { siteName, maintenanceMode, maxUsers }
    });
    
    // Log business event
    logBusiness('Settings updated', {
      requestId: req.id,
      userId: req.user?.id || 'anonymous',
      changes: { siteName, maintenanceMode, maxUsers }
    });
    
    // Log security event for sensitive changes
    if (maintenanceMode !== undefined) {
      logSecurity('Maintenance mode changed', {
        requestId: req.id,
        userId: req.user?.id || 'anonymous',
        newValue: maintenanceMode
      });
    }

    res.status(200).json(
      successResponse("Settings updated successfully", { settings: updatedSettings }, {}, req, startTime)
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Update settings failed', {
      requestId: req.id,
      userId: req.user?.id || 'anonymous',
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
 * Get system statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getStats = async (req, res) => {
  const startTime = Date.now();
  
  try {
    logger.info('Statistics requested', {
      requestId: req.id,
      userId: req.user?.id || 'anonymous',
      ip: req.ip || req.socket?.remoteAddress
    });
    
    // Mock statistics - replace with actual database queries
    const stats = {
      users: {
        total: 1250,
        active: 980,
        newThisMonth: 45
      },
      system: {
        uptime: process.uptime(),
        memoryUsage: `${Math.round(process.memoryUsage().heapUsed / process.memoryUsage().heapTotal * 100)}%`,
        cpuUsage: "45%"
      },
      api: {
        totalRequests: 50000,
        requestsToday: 1200,
        averageResponseTime: "150ms"
      }
    };

    const duration = Date.now() - startTime;
    
    logger.info('Statistics retrieved successfully', {
      requestId: req.id,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
      totalUsers: stats.users.total,
      activeUsers: stats.users.active,
      systemUptime: stats.system.uptime
    });
    
    // Log business event
    logBusiness('Statistics accessed', {
      requestId: req.id,
      userId: req.user?.id || 'anonymous',
      totalUsers: stats.users.total,
      activeUsers: stats.users.active
    });
    
    // Log performance if duration is significant
    if (duration > 300) {
      logPerformance('Get statistics', duration, {
        requestId: req.id,
        module: 'admin'
      });
    }

    res.status(200).json(
      successResponse("Statistics retrieved successfully", { stats }, {}, req, startTime)
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Get statistics failed', {
      requestId: req.id,
      userId: req.user?.id || 'anonymous',
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
// Company-Scoped User Management Functions
// =====================================================

/**
 * Create user in company
 * Company admin can create users and assign them to their company
 * Requires COMPANY_ADMIN role or isCompanyAdmin global role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createUserInCompany = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { email, password, firstName, lastName, roleId } = req.body;

    logger.info('Create user in company requested', {
      requestId: req.id,
      userId: req.user?.id,
      companyId: req.company?.id,
      email,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Verify user has company context
    if (!req.company) {
      throw new BadRequestError('Company context not found', { requestId: req.id });
    }

    // Verify user is company admin (global role or company role)
    if (!req.user || !isCompanyAdmin(req.user.keycloakGlobalRole)) {
      // TODO: Check if user has CompanyAdmin role in CompanyUser
      throw new ForbiddenError('Company admin access required', { requestId: req.id, userId: req.user?.id });
    }

    // Validate required fields
    validateRequired({ email, roleId }, req.id);
    validateEmail(email, 'email', req.id);
    validateUUID(roleId, 'roleId', req.id);
    
    // Validate optional fields
    if (firstName !== undefined) {
      validateString(firstName, 'firstName', { minLength: 1, maxLength: 100, required: false }, req.id);
    }
    if (lastName !== undefined) {
      validateString(lastName, 'lastName', { minLength: 1, maxLength: 100, required: false }, req.id);
    }

    // Check if user exists in Keycloak
    const kcUser = await userService.checkUserExistsInKeycloak(email);

    let newUser;
    if (kcUser) {
      // User exists in Keycloak - check if in DB
      const existingUser = await userService.getUserByEmail(email);
      
      if (existingUser) {
        // User exists - just assign to company
        await companyUserService.assignUserToCompany(
          existingUser.id,
          req.company.id,
          roleId,
          { userId: req.user.id }
        );
        
        logger.info('Existing user assigned to company', {
          requestId: req.id,
          userId: existingUser.id,
          companyId: req.company.id,
          roleId
        });
        
        newUser = existingUser;
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
          keycloakGlobalRole: 'COMPANY_USER'
        }, { userId: req.user.id });
        
        // Assign to company
        await companyUserService.assignUserToCompany(
          newUser.id,
          req.company.id,
          roleId,
          { userId: req.user.id }
        );
      }
    } else {
      // User doesn't exist - create new
      if (!password) {
        validateRequired({ password }, req.id);
      }
      validateString(password, 'password', { minLength: 8 }, req.id);
      
      logger.info('Creating new user in Keycloak for company', {
        requestId: req.id,
        email,
        companyId: req.company.id
      });
      
      const keycloakUser = await userService.createUserInKeycloak({
        email,
        password,
        firstName,
        lastName,
        keycloakGlobalRole: 'COMPANY_USER'
      });
      
      // Create user in DB
      newUser = await userService.createUserInDB({
        keycloakId: keycloakUser.id,
        email,
        firstName,
        lastName,
        keycloakGlobalRole: 'COMPANY_USER'
      }, { userId: req.user.id });
      
      // Assign to company
      await companyUserService.assignUserToCompany(
        newUser.id,
        req.company.id,
        roleId,
        { userId: req.user.id }
      );
    }

    const duration = Date.now() - startTime;
    
    logger.info('User created in company successfully', {
      requestId: req.id,
      userId: req.user.id,
      newUserId: newUser.id,
      companyId: req.company.id,
      email,
      duration: `${duration}ms`
    });

    logBusiness('User created by Company Admin', {
      requestId: req.id,
      userId: req.user.id,
      newUserId: newUser.id,
      companyId: req.company.id,
      email
    });

    logSecurity('User account created in company', {
      requestId: req.id,
      userId: req.user.id,
      newUserId: newUser.id,
      companyId: req.company.id,
      email
    });

    res.status(201).json(
      successResponse('User created in company successfully', newUser, {}, req, startTime)
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Create user in company failed', {
      requestId: req.id,
      userId: req.user?.id,
      companyId: req.company?.id,
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
 * Get company users with pagination
 * Requires COMPANY_ADMIN role or isCompanyAdmin global role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getCompanyUsers = async (req, res) => {
  const startTime = Date.now();
  
  try {
    logger.info('Get company users requested', {
      requestId: req.id,
      userId: req.user?.id,
      companyId: req.company?.id,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Verify user has company context
    if (!req.company) {
      throw new BadRequestError('Company context not found', { requestId: req.id });
    }

    // Verify user is company admin
    if (!req.user || !isCompanyAdmin(req.user.keycloakGlobalRole)) {
      throw new ForbiddenError('Company admin access required', { requestId: req.id, userId: req.user?.id });
    }

    // Build pagination query
    const { page, limit, offset } = buildPaginationQuery(req.query, { defaultLimit: 10, maxLimit: 100 }, req.id);
    
    // Get filters
    const sortBy = req.query.sortBy || 'email';
    const sortOrder = req.query.sortOrder || 'ASC';
    
    // Build sort query (allowedSortFields would be from CompanyUser joins)
    const allowedSortFields = ['email', 'firstName', 'lastName', 'isActive'];
    const order = buildSortQuery(sortBy, sortOrder, allowedSortFields, { defaultSort: 'email', defaultOrder: 'ASC' });

    // Get company users via service
    const result = await companyUserService.getCompanyUsers(
      req.company.id,
      {},
      { page, limit, offset },
      order
    );

    const duration = Date.now() - startTime;
    
    logger.info('Company users retrieved successfully', {
      requestId: req.id,
      userId: req.user.id,
      companyId: req.company.id,
      duration: `${duration}ms`,
      totalUsers: result.total
    });

    if (duration > 500) {
      logPerformance('Get company users', duration, {
        requestId: req.id,
        module: 'admin',
        companyId: req.company.id
      });
    }

    res.status(200).json(
      paginatedResponse(
        'Company users retrieved successfully',
        result.users,
        { page, limit, total: result.total },
        {},
        req,
        startTime
      )
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Get company users failed', {
      requestId: req.id,
      userId: req.user?.id,
      companyId: req.company?.id,
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
 * Get company user by ID
 * Requires COMPANY_ADMIN role or isCompanyAdmin global role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getCompanyUserById = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;

    // Validate UUID
    validateUUID(id, 'id', req.id);

    logger.info('Get company user requested', {
      requestId: req.id,
      userId: req.user?.id,
      companyId: req.company?.id,
      targetUserId: id,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Verify user has company context
    if (!req.company) {
      throw new BadRequestError('Company context not found', { requestId: req.id });
    }

    // Verify user is company admin
    if (!req.user || !isCompanyAdmin(req.user.keycloakGlobalRole)) {
      throw new ForbiddenError('Company admin access required', { requestId: req.id, userId: req.user?.id });
    }

    // Check if user is in company
    const isInCompany = await companyUserService.checkUserInCompany(id, req.company.id);
    if (!isInCompany) {
      throw new ForbiddenError('User not found in company', { requestId: req.id, userId: id, companyId: req.company.id });
    }

    // Get user via service
    const user = await userService.getUserById(id);

    const duration = Date.now() - startTime;
    
    logger.info('Company user retrieved successfully', {
      requestId: req.id,
      userId: req.user.id,
      companyId: req.company.id,
      targetUserId: id,
      duration: `${duration}ms`
    });

    res.status(200).json(
      successResponse('User retrieved successfully', user, {}, req, startTime)
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Get company user failed', {
      requestId: req.id,
      userId: req.user?.id,
      companyId: req.company?.id,
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
 * Update company user by ID
 * Requires COMPANY_ADMIN role or isCompanyAdmin global role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateCompanyUser = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;
    const { email, firstName, lastName, isActive, password } = req.body;

    // Validate UUID
    validateUUID(id, 'id', req.id);

    logger.info('Update company user requested', {
      requestId: req.id,
      userId: req.user?.id,
      companyId: req.company?.id,
      targetUserId: id,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Verify user has company context
    if (!req.company) {
      throw new BadRequestError('Company context not found', { requestId: req.id });
    }

    // Verify user is company admin
    if (!req.user || !isCompanyAdmin(req.user.keycloakGlobalRole)) {
      throw new ForbiddenError('Company admin access required', { requestId: req.id, userId: req.user?.id });
    }

    // Check if user is in company
    const isInCompany = await companyUserService.checkUserInCompany(id, req.company.id);
    if (!isInCompany) {
      throw new ForbiddenError('User not found in company', { requestId: req.id, userId: id, companyId: req.company.id });
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
      password
    });

    // Log password change if applicable
    if (password) {
      logSecurity('User password changed by Company Admin', {
        requestId: req.id,
        userId: req.user.id,
        targetUserId: id,
        companyId: req.company.id
      });
    }

    // Update user in database
    const user = await userService.updateUserInDB(id, {
      email,
      firstName,
      lastName,
      isActive
    }, { userId: req.user.id });

    const duration = Date.now() - startTime;
    
    logger.info('Company user updated successfully', {
      requestId: req.id,
      userId: req.user.id,
      companyId: req.company.id,
      targetUserId: id,
      duration: `${duration}ms`
    });

    logBusiness('User updated by Company Admin', {
      requestId: req.id,
      userId: req.user.id,
      targetUserId: id,
      companyId: req.company.id,
      updates: Object.keys({ email, firstName, lastName, isActive }).filter(k => req.body[k] !== undefined)
    });

    res.status(200).json(
      successResponse('User updated successfully', user, {}, req, startTime)
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Update company user failed', {
      requestId: req.id,
      userId: req.user?.id,
      companyId: req.company?.id,
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
 * Remove user from company
 * Soft deletes the CompanyUser relationship
 * Requires COMPANY_ADMIN role or isCompanyAdmin global role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const removeUserFromCompany = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;

    // Validate UUID
    validateUUID(id, 'id', req.id);

    logger.info('Remove user from company requested', {
      requestId: req.id,
      userId: req.user?.id,
      companyId: req.company?.id,
      targetUserId: id,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Verify user has company context
    if (!req.company) {
      throw new BadRequestError('Company context not found', { requestId: req.id });
    }

    // Verify user is company admin
    if (!req.user || !isCompanyAdmin(req.user.keycloakGlobalRole)) {
      throw new ForbiddenError('Company admin access required', { requestId: req.id, userId: req.user?.id });
    }

    // Check if user is in company
    const isInCompany = await companyUserService.checkUserInCompany(id, req.company.id);
    if (!isInCompany) {
      throw new ForbiddenError('User not found in company', { requestId: req.id, userId: id, companyId: req.company.id });
    }

    // Remove user from company via service
    await companyUserService.removeUserFromCompany(id, req.company.id, { userId: req.user.id });

    const duration = Date.now() - startTime;
    
    logger.info('User removed from company successfully', {
      requestId: req.id,
      userId: req.user.id,
      companyId: req.company.id,
      targetUserId: id,
      duration: `${duration}ms`
    });

    logBusiness('User removed from company', {
      requestId: req.id,
      userId: req.user.id,
      targetUserId: id,
      companyId: req.company.id
    });

    logSecurity('User removed from company', {
      requestId: req.id,
      userId: req.user.id,
      targetUserId: id,
      companyId: req.company.id
    });

    res.status(200).json(
      successResponse('User removed from company successfully', null, {}, req, startTime)
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Remove user from company failed', {
      requestId: req.id,
      userId: req.user?.id,
      companyId: req.company?.id,
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
 * Update user's role in company
 * Requires COMPANY_ADMIN role or isCompanyAdmin global role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateUserRole = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;
    const { roleId } = req.body;

    // Validate UUIDs
    validateUUID(id, 'userId', req.id);
    validateRequired({ roleId }, req.id);
    validateUUID(roleId, 'roleId', req.id);

    logger.info('Update user role requested', {
      requestId: req.id,
      userId: req.user?.id,
      companyId: req.company?.id,
      targetUserId: id,
      roleId,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Verify user has company context
    if (!req.company) {
      throw new BadRequestError('Company context not found', { requestId: req.id });
    }

    // Verify user is company admin
    if (!req.user || !isCompanyAdmin(req.user.keycloakGlobalRole)) {
      throw new ForbiddenError('Company admin access required', { requestId: req.id, userId: req.user?.id });
    }

    // Check if user is in company
    const isInCompany = await companyUserService.checkUserInCompany(id, req.company.id);
    if (!isInCompany) {
      throw new ForbiddenError('User not found in company', { requestId: req.id, userId: id, companyId: req.company.id });
    }

    // Update role via service
    const assignment = await companyUserService.updateUserRole(
      id,
      req.company.id,
      roleId,
      { userId: req.user.id }
    );

    const duration = Date.now() - startTime;
    
    logger.info('User role updated successfully', {
      requestId: req.id,
      userId: req.user.id,
      companyId: req.company.id,
      targetUserId: id,
      roleId,
      duration: `${duration}ms`
    });

    logBusiness('User role updated by Company Admin', {
      requestId: req.id,
      userId: req.user.id,
      targetUserId: id,
      companyId: req.company.id,
      roleId
    });

    res.status(200).json(
      successResponse('User role updated successfully', assignment, {}, req, startTime)
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Update user role failed', {
      requestId: req.id,
      userId: req.user?.id,
      companyId: req.company?.id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`
    });
    
    throw error;
  }
};