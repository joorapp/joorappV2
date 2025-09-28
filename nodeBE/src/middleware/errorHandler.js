/**
 * @author Bhavesh Venugopal
 * Global Error Handler Middleware
 * Centralized error handling for the Express application
 */

import { logError, createRequestLogger } from '../utils/logger.js';

/**
 * Global error handler middleware
 * Handles all errors thrown in the application
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const errorHandler = (err, req, res, next) => {
  const requestId = req.id || `req-${Date.now()}`;
  const userId = req.user?.id || 'anonymous';
  const ip = req.ip || req.socket?.remoteAddress;
  
  // Create request logger for error context
  const logger = createRequestLogger(requestId, userId, ip);
  
  // Log error details using Winston
  logError('Global error handler triggered', err, {
    requestId,
    userId,
    ip,
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Default error response
  let error = {
    success: false,
    message: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.message = 'Validation Error';
    error.details = err.details || err.message;
    logger.warn('Validation error occurred', {
      requestId,
      validationErrors: err.details || err.message
    });
    return res.status(400).json(error);
  }

  if (err.name === 'CastError') {
    error.message = 'Invalid ID format';
    logger.warn('Cast error occurred', {
      requestId,
      invalidId: err.value
    });
    return res.status(400).json(error);
  }

  if (err.name === 'MongoError' && err.code === 11000) {
    error.message = 'Duplicate field value';
    logger.warn('Duplicate field error occurred', {
      requestId,
      duplicateField: err.keyValue
    });
    return res.status(400).json(error);
  }

  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    logger.warn('Invalid JWT token', {
      requestId,
      tokenError: err.message
    });
    return res.status(401).json(error);
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    logger.warn('JWT token expired', {
      requestId,
      expiredAt: err.expiredAt
    });
    return res.status(401).json(error);
  }

  // Handle HTTP status codes
  if (err.statusCode) {
    logger.info('HTTP error occurred', {
      requestId,
      statusCode: err.statusCode,
      message: err.message
    });
    return res.status(err.statusCode).json({
      ...error,
      message: err.message
    });
  }

  // Handle syntax errors in JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error.message = 'Invalid JSON format';
    logger.warn('JSON syntax error occurred', {
      requestId,
      syntaxError: err.message
    });
    return res.status(400).json(error);
  }

  // Development vs Production error responses
  if (process.env.NODE_ENV === 'development') {
    error.stack = err.stack;
    error.details = err;
  }

  // Default to 500 server error
  logger.error('Unhandled error occurred', {
    requestId,
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    }
  });
  
  res.status(500).json(error);
};

/**
 * 404 handler for undefined routes
 * This should be used before the global error handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const notFoundHandler = (req, res, next) => {
  const requestId = req.id || `req-${Date.now()}`;
  const logger = createRequestLogger(requestId, 'anonymous', req.ip || 'unknown');
  
  logger.warn('Route not found', {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.socket?.remoteAddress
  });
  
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors and pass them to error handler
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};