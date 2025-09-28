/**
 * @author Bhavesh Venugopal
 * Admin Controller
 * Handles administrative functions and user management
 */

import { createModuleLogger, logBusiness, logSecurity, logPerformance } from '../../utils/logger.js';

// Create module-specific logger
const logger = createModuleLogger('admin');

/**
 * Get all users with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUsers = (req, res) => {
  const startTime = Date.now();
  
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    logger.info('Users list requested', {
      requestId: req.id,
      userId: req.user?.id || 'anonymous',
      ip: req.ip || req.socket?.remoteAddress,
      filters: { page, limit, search }
    });
    
    // Mock data - replace with actual database query
    const mockUsers = [
      {
        id: "user123",
        username: "john_doe",
        email: "john@example.com",
        role: "user",
        createdAt: "2024-01-01T00:00:00.000Z",
        lastLogin: "2024-01-01T12:00:00.000Z"
      },
      {
        id: "user456",
        username: "jane_smith",
        email: "jane@example.com",
        role: "admin",
        createdAt: "2024-01-01T01:00:00.000Z",
        lastLogin: "2024-01-01T13:00:00.000Z"
      }
    ];

    const filteredUsers = mockUsers.filter(user => 
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    );

    const total = filteredUsers.length;
    const pages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    const duration = Date.now() - startTime;
    
    logger.info('Users list retrieved successfully', {
      requestId: req.id,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
      totalUsers: total,
      returnedUsers: paginatedUsers.length,
      page,
      pages
    });
    
    // Log business event
    logBusiness('Users list accessed', {
      requestId: req.id,
      userId: req.user?.id || 'anonymous',
      totalUsers: total,
      filters: { page, limit, search }
    });
    
    // Log performance if duration is significant
    if (duration > 500) {
      logPerformance('Get users', duration, {
        requestId: req.id,
        module: 'admin',
        totalUsers: total
      });
    }

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: {
        users: paginatedUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Get users failed', {
      requestId: req.id,
      userId: req.user?.id || 'anonymous',
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get system settings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getSettings = (req, res) => {
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

    res.status(200).json({
      success: true,
      message: "Settings retrieved successfully",
      data: {
        settings
      },
      timestamp: new Date().toISOString()
    });
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
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve settings',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Update system settings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateSettings = (req, res) => {
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

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: {
        settings: updatedSettings
      },
      timestamp: new Date().toISOString()
    });
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
    
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get system statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getStats = (req, res) => {
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

    res.status(200).json({
      success: true,
      message: "Statistics retrieved successfully",
      data: {
        stats
      },
      timestamp: new Date().toISOString()
    });
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
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};