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
import { getAdminClient } from '../../services/keycloakService.js';
import { KEYCLOAK_GLOBAL_ROLE_VALUES } from '../../constants/keycloakRoles.js';
import { Op } from 'sequelize';

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

    // Dynamically import models to avoid import-time database access
    const { User } = await import('../../models/index.js');

    // Build where clause
    const where = {};
    
    // Add search filter if provided
    if (search) {
      const searchFields = ['email', 'firstName', 'lastName'];
      const searchConditions = searchFields.map(field => ({
        [field]: { [Op.like]: `%${search}%` }
      }));
      where[Op.or] = searchConditions;
    }

    // Build sort query
    // Note: User model doesn't have createdDate, so we use email as default
    const allowedSortFields = ['email', 'firstName', 'lastName', 'keycloakGlobalRole', 'isActive', 'lastLoginAt'];
    const order = buildSortQuery(sortBy, sortOrder, allowedSortFields, { defaultSort: 'email', defaultOrder: 'ASC' });

    // Get total count
    const total = await User.count({ where });

    // Get users with pagination
    const users = await User.findAll({
      where,
      order,
      limit,
      offset,
      attributes: {
        exclude: [] // Include all fields
      }
    });

    // Format users for response
    const formattedUsers = users.map(user => ({
      id: user.id,
      keycloakId: user.keycloakId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      keycloakGlobalRole: user.keycloakGlobalRole,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt
    }));

    const duration = Date.now() - startTime;
    
    logger.info('Users list retrieved successfully', {
      requestId: req.id,
      userId: req.user?.id,
      duration: `${duration}ms`,
      totalUsers: total,
      returnedUsers: formattedUsers.length,
      page,
      pages: Math.ceil(total / limit)
    });
    
    // Log business event
    logBusiness('Users list accessed', {
      requestId: req.id,
      userId: req.user?.id,
      totalUsers: total,
      filters: { page, limit, search }
    });
    
    // Log performance if duration is significant
    if (duration > 500) {
      logPerformance('Get users', duration, {
        requestId: req.id,
        module: 'users',
        totalUsers: total
      });
    }

    res.status(200).json(
      paginatedResponse(
        'Users retrieved successfully',
        formattedUsers,
        { page, limit, total },
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

    // Dynamically import models
    const { User } = await import('../../models/index.js');

    // Find user
    const user = await User.findByPk(id);

    if (!user) {
      logger.warn('User not found', {
        requestId: req.id,
        userId: req.user?.id,
        targetUserId: id
      });
      throw new NotFoundError('User', id, { requestId: req.id });
    }

    // Format user for response
    const userData = {
      id: user.id,
      keycloakId: user.keycloakId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      keycloakGlobalRole: user.keycloakGlobalRole,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt
    };

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

    // Dynamically import models
    const { User } = await import('../../models/index.js');

    // Check if user already exists in database
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      logger.warn('User creation failed - email already exists', {
        requestId: req.id,
        userId: req.user?.id,
        email
      });
      throw new ConflictError('User with this email already exists', { field: 'email', value: email }, { requestId: req.id });
    }

    // Get Keycloak admin client
    const kcAdminClient = await getAdminClient();

    // Check if user exists in Keycloak
    const keycloakUsers = await kcAdminClient.users.find({
      email: email,
      exact: true
    });

    let keycloakUser;
    if (keycloakUsers && keycloakUsers.length > 0) {
      // User exists in Keycloak but not in database - sync it
      keycloakUser = keycloakUsers[0];
      logger.info('User exists in Keycloak, syncing to database', {
        requestId: req.id,
        keycloakId: keycloakUser.id,
        email
      });
    } else {
      // Create user in Keycloak
      logger.info('Creating user in Keycloak', { requestId: req.id, email });
      
      const newKeycloakUser = await kcAdminClient.users.create({
        email: email,
        firstName: firstName || '',
        lastName: lastName || '',
        enabled: true,
        emailVerified: false,
        username: email
      });

      // Set password
      await kcAdminClient.users.resetPassword({
        id: newKeycloakUser.id,
        credential: {
          temporary: false,
          type: 'password',
          value: password
        }
      });

      // Assign global role if specified
      if (keycloakGlobalRole) {
        try {
          const role = await kcAdminClient.roles.findOneByName({
            name: keycloakGlobalRole
          });
          
          if (role) {
            await kcAdminClient.users.addRealmRoleMappings({
              id: newKeycloakUser.id,
              roles: [role]
            });
            logger.info('Global role assigned in Keycloak', {
              requestId: req.id,
              keycloakId: newKeycloakUser.id,
              role: keycloakGlobalRole
            });
          }
        } catch (roleError) {
          logger.warn('Failed to assign role in Keycloak (continuing)', {
            requestId: req.id,
            keycloakId: newKeycloakUser.id,
            role: keycloakGlobalRole,
            error: roleError.message
          });
        }
      }

      keycloakUser = newKeycloakUser;
      logger.info('User created in Keycloak', {
        requestId: req.id,
        keycloakId: keycloakUser.id,
        email
      });
    }

    // Create user in database
    const newUser = await User.create({
      keycloakId: keycloakUser.id,
      email: email,
      firstName: firstName || null,
      lastName: lastName || null,
      keycloakGlobalRole: keycloakGlobalRole || 'COMPANY_USER',
      isActive: true
    });

    // Format user for response
    const userData = {
      id: newUser.id,
      keycloakId: newUser.keycloakId,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      keycloakGlobalRole: newUser.keycloakGlobalRole,
      isActive: newUser.isActive
    };

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
      successResponse('User created successfully', userData, {}, req, startTime)
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

    // Dynamically import models
    const { User } = await import('../../models/index.js');

    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      logger.warn('User not found for update', {
        requestId: req.id,
        userId: req.user?.id,
        targetUserId: id
      });
      throw new NotFoundError('User', id, { requestId: req.id });
    }

    // Check email uniqueness if email is being changed
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        logger.warn('User update failed - email already exists', {
          requestId: req.id,
          userId: req.user?.id,
          targetUserId: id,
          email
        });
        throw new ConflictError('User with this email already exists', { field: 'email', value: email }, { requestId: req.id });
      }
    }

    // Get Keycloak admin client
    const kcAdminClient = await getAdminClient();

    // Update user in Keycloak
    const keycloakUpdate = {};
    if (email !== undefined) keycloakUpdate.email = email;
    if (firstName !== undefined) keycloakUpdate.firstName = firstName;
    if (lastName !== undefined) keycloakUpdate.lastName = lastName;
    if (isActive !== undefined) keycloakUpdate.enabled = isActive;

    if (Object.keys(keycloakUpdate).length > 0) {
      await kcAdminClient.users.update({
        id: user.keycloakId
      }, keycloakUpdate);
      logger.info('User updated in Keycloak', {
        requestId: req.id,
        keycloakId: user.keycloakId,
        updates: keycloakUpdate
      });
    }

    // Update password in Keycloak if provided
    if (password) {
      await kcAdminClient.users.resetPassword({
        id: user.keycloakId,
        credential: {
          temporary: false,
          type: 'password',
          value: password
        }
      });
      logger.info('User password updated in Keycloak', {
        requestId: req.id,
        keycloakId: user.keycloakId
      });
      logSecurity('User password changed', {
        requestId: req.id,
        userId: req.user?.id,
        targetUserId: id
      });
    }

    // Update global role in Keycloak if provided
    if (keycloakGlobalRole && keycloakGlobalRole !== user.keycloakGlobalRole) {
      try {
        // Get current roles
        const currentRoles = await kcAdminClient.users.listRealmRoleMappings({
          id: user.keycloakId
        });

        // Remove old role if exists
        const oldRole = currentRoles.find(r => KEYCLOAK_GLOBAL_ROLE_VALUES.includes(r.name));
        if (oldRole) {
          await kcAdminClient.users.delRealmRoleMappings({
            id: user.keycloakId,
            roles: [oldRole]
          });
        }

        // Add new role
        const newRole = await kcAdminClient.roles.findOneByName({
          name: keycloakGlobalRole
        });
        
        if (newRole) {
          await kcAdminClient.users.addRealmRoleMappings({
            id: user.keycloakId,
            roles: [newRole]
          });
          logger.info('User global role updated in Keycloak', {
            requestId: req.id,
            keycloakId: user.keycloakId,
            oldRole: user.keycloakGlobalRole,
            newRole: keycloakGlobalRole
          });
        }
      } catch (roleError) {
        logger.warn('Failed to update role in Keycloak (continuing)', {
          requestId: req.id,
          keycloakId: user.keycloakId,
          role: keycloakGlobalRole,
          error: roleError.message
        });
      }
    }

    // Update user in database
    const updateData = {};
    if (email !== undefined) updateData.email = email;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (keycloakGlobalRole !== undefined) updateData.keycloakGlobalRole = keycloakGlobalRole;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Note: User model doesn't have audit fields, so we just update directly
    await user.update(updateData);

    // Format user for response
    const userData = {
      id: user.id,
      keycloakId: user.keycloakId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      keycloakGlobalRole: user.keycloakGlobalRole,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt
    };

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
      updates: Object.keys(updateData)
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

    // Dynamically import models
    const { User } = await import('../../models/index.js');

    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      logger.warn('User not found for deletion', {
        requestId: req.id,
        userId: req.user?.id,
        targetUserId: id
      });
      throw new NotFoundError('User', id, { requestId: req.id });
    }

    // Get Keycloak admin client
    const kcAdminClient = await getAdminClient();

    // Disable user in Keycloak (soft delete)
    await kcAdminClient.users.update({
      id: user.keycloakId
    }, {
      enabled: false
    });
    logger.info('User disabled in Keycloak', {
      requestId: req.id,
      keycloakId: user.keycloakId
    });

    // Mark user as inactive in database
    await user.update({ isActive: false });

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

