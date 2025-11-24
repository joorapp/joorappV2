/**
 * @author Bhavesh Venugopal
 * Authentication Middleware
 * Verifies JWT tokens from Keycloak and syncs user data
 */

import { verifyToken, getUserFromToken } from '../services/keycloakService.js';
import { createRequestLogger, logError, logWarn, logInfo } from '../utils/logger.js';
import { isSuperAdmin } from '../constants/keycloakRoles.js';
import { UnauthorizedError, AuthenticationFailedError, ForbiddenError } from '../utils/errors.js';

/**
 * Extract JWT token from Authorization header
 * Supports both "Bearer <token>" and direct token formats
 * @param {Object} req - Express request object
 * @returns {string|null} Extracted token or null if not found
 */
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return null;
  }

  // Check for "Bearer <token>" format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Return as-is if no Bearer prefix (for backward compatibility)
  return authHeader;
};

/**
 * Get or create "JOOR APP" company for SUPER_ADMIN users
 * @returns {Promise<Company>} The "JOOR APP" company
 */
const getJoorAppCompany = async () => {
  try {
    // Dynamically import models to avoid import-time database access
    const { Company } = await import('../models/index.js');
    
    // Try to find existing "JOOR APP" company
    let joorAppCompany = await Company.findOne({
      where: {
        name: 'JOOR APP',
        isDeleted: false
      }
    });

    if (!joorAppCompany) {
      // Create "JOOR APP" company if it doesn't exist
      // Note: This requires a system user context, which we'll handle later
      // For now, we'll create it with a placeholder user
      // In production, this should be created via migration/seed
      logWarn('JOOR APP company not found. It should be created via migration/seed.');
      throw new Error('JOOR APP company not found. Please create it via migration/seed.');
    }

    return joorAppCompany;
  } catch (error) {
    logError('Failed to get JOOR APP company', error);
    throw error;
  }
};

/**
 * Get or create default company role for SUPER_ADMIN
 * @param {string} userId - User ID for audit fields
 * @param {string} companyId - Company ID for audit fields
 * @returns {Promise<CompanyRole>} The company role
 */
const getDefaultCompanyRole = async (userId, companyId) => {
  try {
    // Dynamically import models to avoid import-time database access
    const { CompanyRole } = await import('../models/index.js');
    
    // Try to find "CompanyAdmin" role
    let companyRole = await CompanyRole.findOne({
      where: {
        name: 'CompanyAdmin',
        isDeleted: false
      }
    });

    if (!companyRole) {
      // Create default role if it doesn't exist
      // Note: This should ideally be created via migration/seed
      logWarn('CompanyAdmin role not found. It should be created via migration/seed.');
      throw new Error('CompanyAdmin role not found. Please create it via migration/seed.');
    }

    return companyRole;
  } catch (error) {
    logError('Failed to get default company role', error);
    throw error;
  }
};

/**
 * Ensure SUPER_ADMIN user is linked to "JOOR APP" company
 * @param {User} user - User instance
 * @param {string} userId - User ID for audit context
 * @returns {Promise<void>}
 */
const ensureSuperAdminCompanyLink = async (user, userId) => {
  try {
    // Dynamically import models to avoid import-time database access
    const { CompanyUser } = await import('../models/index.js');
    
    // Check if user is already linked to "JOOR APP" company
    const joorAppCompany = await getJoorAppCompany();
    
    const existingLink = await CompanyUser.findOne({
      where: {
        userId: user.id,
        companyId: joorAppCompany.id,
        isDeleted: false
      }
    });

    if (existingLink) {
      // Link already exists
      return;
    }

    // Get default company role
    const companyRole = await getDefaultCompanyRole(userId, joorAppCompany.id);

    // Create CompanyUser entry with proper audit context
    // CompanyUser is already imported above
    await CompanyUser.create({
      userId: user.id,
      companyId: joorAppCompany.id,
      companyRoleId: companyRole.id,
      isActive: true
    }, {
      context: {
        userId: user.id,
        companyId: joorAppCompany.id
      }
    });

    logInfo('SUPER_ADMIN user linked to JOOR APP company', {
      userId: user.id,
      companyId: joorAppCompany.id
    });
  } catch (error) {
    logError('Failed to link SUPER_ADMIN to JOOR APP company', error);
    // Don't throw - this is not critical for authentication
    // The link can be created later
  }
};

/**
 * Sync user from Keycloak token to database
 * Creates or updates user record based on Keycloak data
 * @param {Object} userInfo - User information from token
 * @returns {Promise<User>} User instance
 */
const syncUserFromKeycloak = async (userInfo) => {
  try {
    // Dynamically import models to avoid import-time database access
    const { User } = await import('../models/index.js');
    
    // Find existing user by Keycloak ID
    let user = await User.findOne({
      where: {
        keycloakId: userInfo.keycloakId
      }
    });

    if (user) {
      // Update existing user
      user.email = userInfo.email;
      user.firstName = userInfo.firstName;
      user.lastName = userInfo.lastName;
      user.keycloakGlobalRole = userInfo.keycloakGlobalRole;
      user.lastLoginAt = new Date();
      await user.save();

      logInfo('User updated from Keycloak', {
        userId: user.id,
        keycloakId: userInfo.keycloakId,
        role: userInfo.keycloakGlobalRole
      });
    } else {
      // Create new user
      user = await User.create({
        keycloakId: userInfo.keycloakId,
        email: userInfo.email,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        keycloakGlobalRole: userInfo.keycloakGlobalRole,
        isActive: true,
        lastLoginAt: new Date()
      });

      logInfo('User created from Keycloak', {
        userId: user.id,
        keycloakId: userInfo.keycloakId,
        role: userInfo.keycloakGlobalRole
      });
    }

    // If user is SUPER_ADMIN, ensure they're linked to "JOOR APP" company
    if (isSuperAdmin(userInfo.keycloakGlobalRole)) {
      await ensureSuperAdminCompanyLink(user, user.id);
    }

    return user;
  } catch (error) {
    logError('Failed to sync user from Keycloak', error);
    throw error;
  }
};

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {Promise<void>}
 */
export const authMiddleware = async (req, res, next) => {
  const requestId = req.id || `req-${Date.now()}`;
  const logger = createRequestLogger(requestId, 'anonymous', req.ip || req.socket?.remoteAddress);

  try {
    // Extract token from Authorization header
    const token = extractToken(req);

    if (!token) {
      logger.warn('Authentication attempt without token', {
        path: req.path,
        method: req.method
      });
      return next(new UnauthorizedError('No token provided', { requestId, path: req.path }));
    }

    // Verify token with Keycloak
    const verifyResponse = await verifyToken(token);

    if (!verifyResponse.success) {
      logger.warn('Token verification failed', {
        error: verifyResponse.error,
        path: req.path
      });
      return next(new AuthenticationFailedError(
        verifyResponse.details || 'Invalid or expired token',
        { requestId, path: req.path, error: verifyResponse.error }
      ));
    }

    // Extract user information from token
    const userInfoResponse = getUserFromToken(verifyResponse.decoded);

    if (!userInfoResponse.success) {
      logger.error('Failed to extract user from token', {
        error: userInfoResponse.error,
        path: req.path
      });
      return next(new AuthenticationFailedError(
        'Failed to extract user information from token',
        { requestId, path: req.path, error: userInfoResponse.error }
      ));
    }

    // Sync user to database
    const user = await syncUserFromKeycloak(userInfoResponse.user);

    // Check if user is active
    if (!user.isActive) {
      logger.warn('Authentication attempt with inactive user', {
        userId: user.id,
        keycloakId: user.keycloakId
      });
      return next(new ForbiddenError('Your account has been deactivated', { requestId, userId: user.id }));
    }

    // Attach user and token info to request
    req.user = {
      id: user.id,
      keycloakId: user.keycloakId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      keycloakGlobalRole: user.keycloakGlobalRole,
      sessionState: userInfoResponse.user.sessionState
    };

    // Update request logger with user ID
    req.logger = createRequestLogger(requestId, user.id, req.ip || req.socket?.remoteAddress);

    logger.info('User authenticated successfully', {
      userId: user.id,
      email: user.email,
      role: user.keycloakGlobalRole
    });

    next();
  } catch (error) {
    logError('Authentication error', error, {
      requestId,
      path: req.path,
      method: req.method
    });

    // Pass error to error handler
    return next(error);
  }
};

/**
 * Optional authentication middleware
 * Similar to authMiddleware but doesn't return 401 if token is missing
 * Useful for routes that work with or without authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {Promise<void>}
 */
export const optionalAuthMiddleware = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    // No token provided, continue without authentication
    return next();
  }

  // Token provided, use standard authentication
  return authMiddleware(req, res, next);
};

