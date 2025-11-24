/**
 * @author Bhavesh Venugopal
 * Super Admin Controller
 * Handles super admin functionality endpoints
 */

import { createModuleLogger, logPerformance } from '../../utils/logger.js';
import { isSuperAdmin } from '../../constants/keycloakRoles.js';
import { successResponse } from '../../utils/responseHelpers.js';
import { UnauthorizedError, ForbiddenError } from '../../utils/errors.js';

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

