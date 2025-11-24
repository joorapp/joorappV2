/**
 * @author Bhavesh Venugopal
 * Global Error Handler Middleware
 * Centralized error handling for the Express application
 */

import { logError, createRequestLogger } from '../utils/logger.js';
import { errorResponse } from '../utils/responseHelpers.js';
import {
  NotFoundError,
  ValidationError as CustomValidationError,
  ForbiddenError,
  UnauthorizedError,
  AuthenticationFailedError,
  ConflictError,
  BadRequestError,
  SessionError,
  InternalServerError
} from '../utils/errors.js';

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

  // Default error response - will be built using errorResponse helper
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let statusCode = 500;
  let errorDetails = null;

  // Check if this is a health or documentation endpoint (special format - no meta)
  const isHealthEndpoint = req.originalUrl?.startsWith('/api/v2/health');
  const isDocsEndpoint = /^\/api\/v2\/[^\/]+$/.test(req.originalUrl || req.path);

  // Handle custom error classes first (before generic error types)
  if (err instanceof NotFoundError) {
    errorCode = err.errorCode;
    statusCode = err.statusCode;
    errorDetails = { entityType: err.entityType, entityId: err.entityId, ...err.context };
    logger.warn('Resource not found', {
      requestId,
      entityType: err.entityType,
      entityId: err.entityId,
      errorCode
    });
    
    if (isHealthEndpoint || isDocsEndpoint) {
      return res.status(statusCode).json({
        success: false,
        error: errorCode,
        message: err.message,
        timestamp: new Date().toISOString()
      });
    }
    
    return res.status(statusCode).json(
      errorResponse(err.message, errorCode, statusCode, errorDetails, req)
    );
  }

  if (err instanceof CustomValidationError) {
    errorCode = err.errorCode;
    statusCode = err.statusCode;
    errorDetails = err.details || err.message;
    logger.warn('Validation error occurred', {
      requestId,
      validationErrors: err.details || err.message
    });
    
    if (isHealthEndpoint || isDocsEndpoint) {
      return res.status(statusCode).json({
        success: false,
        error: errorCode,
        message: err.message,
        timestamp: new Date().toISOString()
      });
    }
    
    return res.status(statusCode).json(
      errorResponse(err.message, errorCode, statusCode, errorDetails, req)
    );
  }

  if (err instanceof ForbiddenError) {
    errorCode = err.errorCode;
    statusCode = err.statusCode;
    logger.warn('Forbidden access attempt', {
      requestId,
      userId,
      errorCode
    });
    
    if (isHealthEndpoint || isDocsEndpoint) {
      return res.status(statusCode).json({
        success: false,
        error: errorCode,
        message: err.message,
        timestamp: new Date().toISOString()
      });
    }
    
    return res.status(statusCode).json(
      errorResponse(err.message, errorCode, statusCode, null, req)
    );
  }

  if (err instanceof UnauthorizedError || err instanceof AuthenticationFailedError) {
    errorCode = err.errorCode;
    statusCode = err.statusCode;
    logger.warn('Authentication error', {
      requestId,
      errorCode,
      message: err.message
    });
    
    if (isHealthEndpoint || isDocsEndpoint) {
      return res.status(statusCode).json({
        success: false,
        error: errorCode,
        message: err.message,
        timestamp: new Date().toISOString()
      });
    }
    
    return res.status(statusCode).json(
      errorResponse(err.message, errorCode, statusCode, null, req)
    );
  }

  if (err instanceof ConflictError) {
    errorCode = err.errorCode;
    statusCode = err.statusCode;
    errorDetails = err.details;
    logger.warn('Resource conflict', {
      requestId,
      errorCode,
      details: err.details
    });
    
    if (isHealthEndpoint || isDocsEndpoint) {
      return res.status(statusCode).json({
        success: false,
        error: errorCode,
        message: err.message,
        timestamp: new Date().toISOString()
      });
    }
    
    return res.status(statusCode).json(
      errorResponse(err.message, errorCode, statusCode, errorDetails, req)
    );
  }

  if (err instanceof BadRequestError || err instanceof SessionError) {
    errorCode = err.errorCode;
    statusCode = err.statusCode;
    errorDetails = err.details;
    logger.warn('Bad request error', {
      requestId,
      errorCode,
      message: err.message
    });
    
    if (isHealthEndpoint || isDocsEndpoint) {
      return res.status(statusCode).json({
        success: false,
        error: errorCode,
        message: err.message,
        timestamp: new Date().toISOString()
      });
    }
    
    return res.status(statusCode).json(
      errorResponse(err.message, errorCode, statusCode, errorDetails, req)
    );
  }

  if (err instanceof InternalServerError) {
    errorCode = err.errorCode;
    statusCode = err.statusCode;
    logger.error('Internal server error', {
      requestId,
      errorCode,
      message: err.message
    });
    
    if (isHealthEndpoint || isDocsEndpoint) {
      return res.status(statusCode).json({
        success: false,
        error: errorCode,
        message: err.message,
        timestamp: new Date().toISOString()
      });
    }
    
    return res.status(statusCode).json(
      errorResponse(err.message, errorCode, statusCode, null, req)
    );
  }

  // Handle specific error types (backward compatibility)
  if (err.name === 'ValidationError') {
    errorCode = 'VALIDATION_ERROR';
    statusCode = 400;
    errorDetails = err.details || err.message;
    logger.warn('Validation error occurred', {
      requestId,
      validationErrors: err.details || err.message
    });
    return res.status(statusCode).json(
      errorResponse('Validation Error', errorCode, statusCode, errorDetails, req)
    );
  }

  if (err.name === 'CastError') {
    errorCode = 'INVALID_ID_FORMAT';
    statusCode = 400;
    errorDetails = { invalidId: err.value };
    logger.warn('Cast error occurred', {
      requestId,
      invalidId: err.value
    });
    return res.status(statusCode).json(
      errorResponse('Invalid ID format', errorCode, statusCode, errorDetails, req)
    );
  }

  if (err.name === 'MongoError' && err.code === 11000) {
    errorCode = 'DUPLICATE_FIELD';
    statusCode = 400;
    errorDetails = { duplicateField: err.keyValue };
    logger.warn('Duplicate field error occurred', {
      requestId,
      duplicateField: err.keyValue
    });
    return res.status(statusCode).json(
      errorResponse('Duplicate field value', errorCode, statusCode, errorDetails, req)
    );
  }

  if (err.name === 'JsonWebTokenError') {
    errorCode = 'INVALID_TOKEN';
    statusCode = 401;
    logger.warn('Invalid JWT token', {
      requestId,
      tokenError: err.message
    });
    return res.status(statusCode).json(
      errorResponse('Invalid token', errorCode, statusCode, null, req)
    );
  }

  if (err.name === 'TokenExpiredError') {
    errorCode = 'TOKEN_EXPIRED';
    statusCode = 401;
    errorDetails = { expiredAt: err.expiredAt };
    logger.warn('JWT token expired', {
      requestId,
      expiredAt: err.expiredAt
    });
    return res.status(statusCode).json(
      errorResponse('Token expired', errorCode, statusCode, errorDetails, req)
    );
  }

  // Handle HTTP status codes
  if (err.statusCode) {
    statusCode = err.statusCode;
    errorCode = err.errorCode || 'HTTP_ERROR';
    logger.info('HTTP error occurred', {
      requestId,
      statusCode: err.statusCode,
      message: err.message
    });
    return res.status(statusCode).json(
      errorResponse(err.message || 'Internal Server Error', errorCode, statusCode, null, req)
    );
  }

  // Handle syntax errors in JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    errorCode = 'INVALID_JSON';
    statusCode = 400;
    logger.warn('JSON syntax error occurred', {
      requestId,
      syntaxError: err.message
    });
    return res.status(statusCode).json(
      errorResponse('Invalid JSON format', errorCode, statusCode, null, req)
    );
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

  // Include stack and details in development
  const details = process.env.NODE_ENV === 'development' 
    ? { stack: err.stack, error: err }
    : null;

  // For health/docs endpoints, format without meta field
  if (isHealthEndpoint || isDocsEndpoint) {
    return res.status(statusCode).json({
      success: false,
      error: errorCode,
      message: err.message || 'Internal Server Error',
      timestamp: new Date().toISOString()
    });
  }
  
  res.status(statusCode).json(
    errorResponse(
      err.message || 'Internal Server Error',
      errorCode,
      statusCode,
      details,
      req
    )
  );
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