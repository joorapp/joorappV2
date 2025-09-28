/**
 * @author Bhavesh Venugopal
 * Health Controller
 * Handles health check and system status endpoints
 */

import { createModuleLogger, logPerformance } from '../../utils/logger.js';

// Create module-specific logger
const logger = createModuleLogger('health');

/**
 * Health check endpoint handler
 * Returns API status and basic system information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getHealthStatus = (req, res) => {
  const startTime = Date.now();
  
  try {
    logger.info('Health check requested', {
      requestId: req.id,
      ip: req.ip || req.socket?.remoteAddress
    });
    
    const healthData = {
      success: true,
      message: 'API is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '2.0.0',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      }
    };

    const duration = Date.now() - startTime;
    
    logger.info('Health check completed successfully', {
      requestId: req.id,
      duration: `${duration}ms`,
      uptime: healthData.uptime,
      memoryUsed: healthData.memory.used
    });
    
    // Log performance if duration is significant
    if (duration > 100) {
      logPerformance('Health check', duration, {
        requestId: req.id,
        module: 'health'
      });
    }

    res.status(200).json(healthData);
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Health check failed', {
      requestId: req.id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`
    });
    
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Simple ping endpoint handler
 * Returns a basic ping response
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getPing = (req, res) => {
  const startTime = Date.now();
  
  try {
    logger.debug('Ping requested', {
      requestId: req.id,
      ip: req.ip || req.socket?.remoteAddress
    });
    
    const responseTime = Date.now() - startTime;
    
    const response = {
      success: true,
      message: 'Pong!',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`
    };
    
    logger.debug('Ping completed', {
      requestId: req.id,
      responseTime: `${responseTime}ms`
    });
    
    res.status(200).json(response);
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Ping failed', {
      requestId: req.id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`
    });
    
    res.status(500).json({
      success: false,
      message: 'Ping failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Detailed system metrics endpoint handler
 * Returns comprehensive system information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getSystemMetrics = (req, res) => {
  const startTime = Date.now();
  
  try {
    logger.info('System metrics requested', {
      requestId: req.id,
      ip: req.ip || req.socket?.remoteAddress
    });
    
    const systemMetrics = {
      success: true,
      message: 'System metrics retrieved successfully',
      timestamp: new Date().toISOString(),
      metrics: {
        system: {
          platform: process.platform,
          arch: process.arch,
          nodeVersion: process.version,
          uptime: process.uptime()
        },
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        environment: {
          nodeEnv: process.env.NODE_ENV || 'development',
          port: process.env.PORT || 3030,
          corsOrigin: process.env.CORS_ORIGIN || '*'
        }
      }
    };

    const duration = Date.now() - startTime;
    
    logger.info('System metrics retrieved successfully', {
      requestId: req.id,
      duration: `${duration}ms`,
      platform: systemMetrics.metrics.system.platform,
      nodeVersion: systemMetrics.metrics.system.nodeVersion,
      uptime: systemMetrics.metrics.system.uptime
    });
    
    // Log performance if duration is significant
    if (duration > 200) {
      logPerformance('System metrics', duration, {
        requestId: req.id,
        module: 'health'
      });
    }

    res.status(200).json(systemMetrics);
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('System metrics failed', {
      requestId: req.id,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve system metrics',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};