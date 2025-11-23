/**
 * @author Bhavesh Venugopal
 * Admin Controller
 * Handles administrative functions and user management
 */

import { createModuleLogger, logBusiness, logSecurity, logPerformance } from '../../utils/logger.js';
import { successResponse } from '../../utils/responseHelpers.js';

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