/**
 * @author Bhavesh Venugopal
 * Error Logging Middleware
 * Centralized error logging and monitoring
 */

import { logError, logSecurity, createRequestLogger } from '../utils/logger.js';

/**
 * Enhanced error logging middleware
 * Logs errors with detailed context and categorization
 */
export const errorLogger = (err, req, res, next) => {
  const requestId = req.id || `req-${Date.now()}`;
  const userId = req.user?.id || 'anonymous';
  const ip = req.ip || req.socket?.remoteAddress;
  
  // Create request logger for error context
  const logger = createRequestLogger(requestId, userId, ip);
  
  // Categorize error types
  const errorCategory = categorizeError(err, req);
  
  // Prepare error metadata
  const errorMeta = {
    requestId,
    userId,
    ip,
    userAgent: req.get('User-Agent'),
    method: req.method,
    url: req.originalUrl,
    statusCode: err.statusCode || 500,
    category: errorCategory,
    timestamp: new Date().toISOString(),
    headers: {
      'content-type': req.get('Content-Type'),
      'authorization': req.get('Authorization') ? '[REDACTED]' : undefined
    }
  };
  
  // Log based on error category
  switch (errorCategory) {
    case 'SECURITY':
      logSecurity(`Security error: ${err.message}`, errorMeta);
      break;
      
    case 'VALIDATION':
      logger.warn('Validation error', {
        ...errorMeta,
        validationErrors: err.details || err.errors
      });
      break;
      
    case 'AUTHENTICATION':
      logSecurity(`Authentication error: ${err.message}`, errorMeta);
      break;
      
    case 'AUTHORIZATION':
      logSecurity(`Authorization error: ${err.message}`, errorMeta);
      break;
      
    case 'DATABASE':
      logger.error('Database error', {
        ...errorMeta,
        databaseError: {
          code: err.code,
          errno: err.errno,
          sqlState: err.sqlState
        }
      });
      break;
      
    case 'EXTERNAL_API':
      logger.error('External API error', {
        ...errorMeta,
        externalService: err.service || 'unknown',
        externalStatusCode: err.externalStatusCode
      });
      break;
      
    default:
      logError(`Application error: ${err.message}`, err, errorMeta);
  }
  
  // Log to request logger if available
  if (req.logger) {
    req.logger.error('Request failed', {
      error: err.message,
      statusCode: err.statusCode || 500,
      category: errorCategory
    });
  }
  
  next(err);
};

/**
 * Categorize error based on type and context
 */
const categorizeError = (err, req) => {
  // Security-related errors
  if (err.name === 'JsonWebTokenError' || 
      err.name === 'TokenExpiredError' ||
      err.message.includes('unauthorized') ||
      err.message.includes('forbidden')) {
    return 'SECURITY';
  }
  
  // Authentication errors
  if (err.statusCode === 401 || 
      err.message.includes('authentication') ||
      err.message.includes('login')) {
    return 'AUTHENTICATION';
  }
  
  // Authorization errors
  if (err.statusCode === 403 || 
      err.message.includes('permission') ||
      err.message.includes('access denied')) {
    return 'AUTHORIZATION';
  }
  
  // Validation errors
  if (err.name === 'ValidationError' || 
      err.name === 'CastError' ||
      err.statusCode === 400) {
    return 'VALIDATION';
  }
  
  // Database errors
  if (err.name === 'MongoError' || 
      err.name === 'SequelizeError' ||
      err.code === 'ECONNREFUSED' ||
      err.message.includes('database')) {
    return 'DATABASE';
  }
  
  // External API errors
  if (err.isAxiosError || 
      err.message.includes('fetch') ||
      err.message.includes('API')) {
    return 'EXTERNAL_API';
  }
  
  // Default to application error
  return 'APPLICATION';
};

/**
 * Unhandled error logger
 * Catches errors that escape the normal error handling
 */
export const unhandledErrorLogger = (err, req, res, next) => {
  const logger = createRequestLogger('unhandled', 'system', 'unknown');
  
  logger.error('Unhandled error occurred', {
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    process: {
      pid: process.pid,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    },
    timestamp: new Date().toISOString()
  });
  
  next(err);
};

export default errorLogger;
