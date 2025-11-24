/**
 * @author Bhavesh Venugopal
 * Request Logging Middleware
 * Logs HTTP requests and responses using Winston
 */

import { createRequestLogger, logHttp, logPerformance } from '../utils/logger.js';

/**
 * HTTP request logging middleware
 * Replaces Morgan with Winston-based logging
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Generate request ID if not present
  if (!req.id) {
    req.id = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Create request-specific logger
  req.logger = createRequestLogger(
    req.id,
    req.user?.id || 'anonymous',
    req.ip || req.socket?.remoteAddress
  );
  
  // Log request start
  req.logger.info('Request started', {
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.socket?.remoteAddress,
    headers: {
      'content-type': req.get('Content-Type'),
      'authorization': req.get('Authorization') ? '[REDACTED]' : undefined
    }
  });
  
  // Override res.end to capture response details
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - startTime;
    
    // Log response
    req.logger.info('Request completed', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length') || 0
    });
    
    // Log HTTP level for access logs
    logHttp(`${req.method} ${req.originalUrl}`, {
      requestId: req.id,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.socket?.remoteAddress,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id || 'anonymous'
    });
    
    // Log performance if duration is significant
    if (duration > 1000) {
      logPerformance(`${req.method} ${req.originalUrl}`, duration, {
        requestId: req.id,
        statusCode: res.statusCode,
        userId: req.user?.id || 'anonymous'
      });
    }
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

/**
 * Error logging middleware
 * Logs errors with request context
 */
export const errorLogger = (err, req, res, next) => {
  if (req.logger) {
    req.logger.error('Request error occurred', {
      error: {
        message: err.message,
        stack: err.stack,
        name: err.name
      },
      method: req.method,
      url: req.originalUrl,
      statusCode: err.statusCode || 500
    });
  } else {
    // Fallback if request logger not available
    const logger = createRequestLogger('unknown', 'system', 'unknown');
    logger.error('Unhandled error occurred', {
      error: {
        message: err.message,
        stack: err.stack,
        name: err.name
      }
    });
  }
  
  next(err);
};

export default requestLogger;
