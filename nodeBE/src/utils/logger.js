/**
 * @author Bhavesh Venugopal
 * Centralized Logger Utility
 * Provides easy access to logger throughout the application
 */

import logger from '../config/logger.js';

// Create a centralized logger instance
const appLogger = logger;

// Helper functions for common logging patterns
export const logInfo = (message, meta = {}) => {
  appLogger.info(message, meta);
};

export const logError = (message, error = null, meta = {}) => {
  if (error) {
    meta.error = {
      message: error.message,
      stack: error.stack,
      name: error.name
    };
  }
  appLogger.error(message, meta);
};

export const logWarn = (message, meta = {}) => {
  appLogger.warn(message, meta);
};

export const logDebug = (message, meta = {}) => {
  appLogger.debug(message, meta);
};

export const logHttp = (message, meta = {}) => {
  appLogger.http(message, meta);
};

// Module-specific logger factory
export const createModuleLogger = (moduleName) => {
  return appLogger.child({ module: moduleName });
};

// Request-specific logger factory
export const createRequestLogger = (requestId, userId = 'anonymous', ip = 'unknown') => {
  return appLogger.child({
    requestId,
    userId,
    ip,
    timestamp: new Date().toISOString()
  });
};

// Performance logging helper
export const logPerformance = (operation, duration, meta = {}) => {
  appLogger.info(`Performance: ${operation}`, {
    ...meta,
    duration: `${duration}ms`,
    operation
  });
};

// Security logging helper
export const logSecurity = (event, meta = {}) => {
  appLogger.warn(`Security: ${event}`, {
    ...meta,
    category: 'SECURITY',
    event
  });
};

// Business logic logging helper
export const logBusiness = (event, meta = {}) => {
  appLogger.info(`Business: ${event}`, {
    ...meta,
    category: 'BUSINESS',
    event
  });
};

export default appLogger;
