/**
 * @author Bhavesh Venugopal
 * User Controller
 * Handles user management CRUD operations
 */

import { createModuleLogger, logBusiness, logSecurity, logPerformance } from '../../utils/logger.js';
import { successResponse, paginatedResponse } from '../../utils/responseHelpers.js';
import { 
  NotFoundError, 
  ValidationError, 
  ConflictError, 
  BadRequestError,
  ForbiddenError 
} from '../../utils/errors.js';
import { 
  validateUUID, 
  validateEmail, 
  validateRequired, 
  validateString,
  validateEnum 
} from '../../utils/validators.js';
import { 
  buildPaginationQuery, 
  buildFilterQuery, 
  buildSortQuery
} from '../../utils/businessHelpers.js';
import { KEYCLOAK_GLOBAL_ROLE_VALUES } from '../../constants/keycloakRoles.js';
import * as userService from '../../services/userService.js';

// Create module-specific logger
const logger = createModuleLogger('users');

/**
 * Get all users with pagination, filtering, and sorting
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getUsers = async (req, res) => {
  const startTime = Date.now();

  try {
    // Build pagination query (includes validation)
    const { page, limit, offset } = buildPaginationQuery(req.query, { defaultLimit: 10, maxLimit: 100 }, req.id);
    
    // Get filter and sort parameters
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'email';
    const sortOrder = req.query.sortOrder || 'ASC';
    
    logger.info('Users list requested', {
      requestId: req.id,
      userId: req.user?.id,
      ip: req.ip || req.socket?.remoteAddress,
      filters: { page, limit, search, sortBy, sortOrder }
    });

    // Build sort query
    const allowedSortFields = ['email', 'firstName', 'lastName', 'keycloakGlobalRole', 'isActive', 'lastLoginAt'];
    const order = buildSortQuery(sortBy, sortOrder, allowedSortFields, { defaultSort: 'email', defaultOrder: 'ASC' });

    // Call service layer
    const result = await userService.listUsers(
      { search },
      { page, limit, offset },
      order
    );

    const duration = Date.now() - startTime;
    
    logger.info('Users list retrieved successfully', {
      requestId: req.id,
      userId: req.user?.id,
      duration: `${duration}ms`,
      totalUsers: result.total,
      returnedUsers: result.users.length,
      page,
      pages: Math.ceil(result.total / limit)
    });
    
    // Log business event
    logBusiness('Users list accessed', {
      requestId: req.id,
      userId: req.user?.id,
      totalUsers: result.total,
      filters: { page, limit, search }
    });
    
    // Log performance if duration is significant
    if (duration > 500) {
      logPerformance('Get users', duration, {
        requestId: req.id,
        module: 'users',
        totalUsers: result.total
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
 * Get single user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
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

    // Call service layer
    const userData = await userService.getUserById(id);

    const duration = Date.now() - startTime;
    
    logger.info('User retrieved successfully', {
      requestId: req.id,
      userId: req.user?.id,
      targetUserId: id,
      duration: `${duration}ms`
    });

    res.status(200).json(
      successResponse('User retrieved successfully', userData, {}, req, startTime)
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
 * Create new user
 * Creates user in both Keycloak and database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const createUser = async (req, res) => {
  const startTime = Date.now();

  try {
    const { email, password, firstName, lastName, keycloakGlobalRole } = req.body;

    // Validate required fields
    validateRequired({ email, password }, req.id);
    validateEmail(email, 'email', req.id);
    validateString(password, 'password', { minLength: 8 }, req.id);
    
    // Validate optional fields
    if (firstName) {
      validateString(firstName, 'firstName', { minLength: 1, maxLength: 100 }, req.id);
    }
    if (lastName) {
      validateString(lastName, 'lastName', { minLength: 1, maxLength: 100 }, req.id);
    }
    if (keycloakGlobalRole) {
      validateEnum(keycloakGlobalRole, KEYCLOAK_GLOBAL_ROLE_VALUES, 'keycloakGlobalRole', req.id);
    }

    logger.info('Create user requested', {
      requestId: req.id,
      userId: req.user?.id,
      email,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Check if user exists in Keycloak
    const kcUser = await userService.checkUserExistsInKeycloak(email);

    let keycloakUser;
    if (kcUser) {
      // User exists in Keycloak - sync to database
      logger.info('User exists in Keycloak, syncing to database', {
        requestId: req.id,
        keycloakId: kcUser.id,
        email
      });
      keycloakUser = kcUser;
    } else {
      // Create user in Keycloak
      logger.info('Creating user in Keycloak', { requestId: req.id, email });
      keycloakUser = await userService.createUserInKeycloak({
        email,
        password,
        firstName,
        lastName,
        keycloakGlobalRole
      });
    }

    // Create user in database
    const newUser = await userService.createUserInDB({
      keycloakId: keycloakUser.id,
      email,
      firstName,
      lastName,
      keycloakGlobalRole
    }, { userId: req.user?.id });

    const duration = Date.now() - startTime;
    
    logger.info('User created successfully', {
      requestId: req.id,
      userId: req.user?.id,
      newUserId: newUser.id,
      email,
      duration: `${duration}ms`
    });

    // Log business event
    logBusiness('User created', {
      requestId: req.id,
      userId: req.user?.id,
      newUserId: newUser.id,
      email
    });

    // Log security event
    logSecurity('User account created', {
      requestId: req.id,
      userId: req.user?.id,
      newUserId: newUser.id,
      email
    });

    res.status(201).json(
      successResponse('User created successfully', newUser, {}, req, startTime)
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Create user failed', {
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
 * Updates user in both Keycloak and database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const updateUser = async (req, res) => {
  const startTime = Date.now();

  try {
    const { id } = req.params;
    const { email, firstName, lastName, keycloakGlobalRole, isActive, password } = req.body;

    // Validate UUID
    validateUUID(id, 'id', req.id);

    // Validate optional fields if provided
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

    logger.info('Update user requested', {
      requestId: req.id,
      userId: req.user?.id,
      targetUserId: id,
      updates: { email, firstName, lastName, keycloakGlobalRole, isActive },
      ip: req.ip || req.socket?.remoteAddress
    });

    // Get current user to check keycloak ID and role
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
      logSecurity('User password changed', {
        requestId: req.id,
        userId: req.user?.id,
        targetUserId: id
      });
    }

    // Update user in database
    const userData = await userService.updateUserInDB(id, {
      email,
      firstName,
      lastName,
      keycloakGlobalRole,
      isActive
    }, { userId: req.user?.id });

    const duration = Date.now() - startTime;
    
    logger.info('User updated successfully', {
      requestId: req.id,
      userId: req.user?.id,
      targetUserId: id,
      duration: `${duration}ms`
    });

    // Log business event
    logBusiness('User updated', {
      requestId: req.id,
      userId: req.user?.id,
      targetUserId: id,
      updates: Object.keys({ email, firstName, lastName, keycloakGlobalRole, isActive }).filter(k => req.body[k] !== undefined)
    });

    res.status(200).json(
      successResponse('User updated successfully', userData, {}, req, startTime)
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
 * Soft delete user by ID
 * Deactivates user in Keycloak and marks as inactive in database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const deleteUser = async (req, res) => {
  const startTime = Date.now();

  try {
    const { id } = req.params;

    // Validate UUID
    validateUUID(id, 'id', req.id);

    logger.info('Delete user requested', {
      requestId: req.id,
      userId: req.user?.id,
      targetUserId: id,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Prevent self-deletion
    if (req.user && req.user.id === id) {
      logger.warn('User attempted to delete themselves', {
        requestId: req.id,
        userId: req.user.id
      });
      throw new BadRequestError('Cannot delete your own account', { requestId: req.id });
    }

    // Get user for logging purposes
    const user = await userService.getUserById(id);

    // Delete user from Keycloak (disable)
    await userService.deleteUserFromKeycloak(user.keycloakId);

    // Delete user from database (mark as inactive)
    await userService.deleteUserFromDB(id, { userId: req.user?.id });

    const duration = Date.now() - startTime;
    
    logger.info('User deleted successfully', {
      requestId: req.id,
      userId: req.user?.id,
      targetUserId: id,
      duration: `${duration}ms`
    });

    // Log business event
    logBusiness('User deleted', {
      requestId: req.id,
      userId: req.user?.id,
      targetUserId: id
    });

    // Log security event
    logSecurity('User account deleted', {
      requestId: req.id,
      userId: req.user?.id,
      targetUserId: id,
      email: user.email
    });

    res.status(200).json(
      successResponse('User deleted successfully', null, {}, req, startTime)
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Delete user failed', {
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

