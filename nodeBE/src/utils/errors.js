/**
 * @author Bhavesh Venugopal
 * Custom Error Classes
 * Standardized error classes for consistent error handling
 * All custom errors extend Error and include statusCode, errorCode, and context
 */

/**
 * Base error class with common properties
 * @class BaseError
 */
class BaseError extends Error {
  constructor(message, statusCode, errorCode, context = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Resource not found error (404)
 * @class NotFoundError
 * @extends BaseError
 */
export class NotFoundError extends BaseError {
  constructor(entityType, entityId = null, context = {}) {
    const message = entityId 
      ? `${entityType} not found: ${entityId}`
      : `${entityType} not found`;
    
    // Generate error code from entity type (e.g., "User" -> "USER_NOT_FOUND")
    const errorCode = `${entityType.toUpperCase().replace(/\s+/g, '_')}_NOT_FOUND`;
    
    super(message, 404, errorCode, { entityType, entityId, ...context });
    this.entityType = entityType;
    this.entityId = entityId;
  }
}

/**
 * Input validation error (400)
 * @class ValidationError
 * @extends BaseError
 */
export class ValidationError extends BaseError {
  constructor(message, details = null, context = {}) {
    super(message, 400, 'VALIDATION_ERROR', { details, ...context });
    this.details = details;
  }
}

/**
 * Permission denied error (403)
 * @class ForbiddenError
 * @extends BaseError
 */
export class ForbiddenError extends BaseError {
  constructor(message = 'Access forbidden', context = {}) {
    super(message, 403, 'FORBIDDEN', context);
  }
}

/**
 * Authentication required error (401)
 * @class UnauthorizedError
 * @extends BaseError
 */
export class UnauthorizedError extends BaseError {
  constructor(message = 'Authentication required', context = {}) {
    super(message, 401, 'AUTHENTICATION_REQUIRED', context);
  }
}

/**
 * Authentication failed error (401)
 * @class AuthenticationFailedError
 * @extends BaseError
 */
export class AuthenticationFailedError extends BaseError {
  constructor(message = 'Authentication failed', context = {}) {
    super(message, 401, 'AUTHENTICATION_FAILED', context);
  }
}

/**
 * Resource conflict error (409)
 * @class ConflictError
 * @extends BaseError
 */
export class ConflictError extends BaseError {
  constructor(message, details = null, context = {}) {
    super(message, 409, 'RESOURCE_CONFLICT', { details, ...context });
    this.details = details;
  }
}

/**
 * Bad request error (400)
 * @class BadRequestError
 * @extends BaseError
 */
export class BadRequestError extends BaseError {
  constructor(message, details = null, context = {}) {
    super(message, 400, 'BAD_REQUEST', { details, ...context });
    this.details = details;
  }
}

/**
 * Session error (400)
 * @class SessionError
 * @extends BaseError
 */
export class SessionError extends BaseError {
  constructor(message = 'Session error', context = {}) {
    super(message, 400, 'SESSION_ERROR', context);
  }
}

/**
 * Internal server error (500)
 * @class InternalServerError
 * @extends BaseError
 */
export class InternalServerError extends BaseError {
  constructor(message = 'Internal server error', context = {}) {
    super(message, 500, 'INTERNAL_SERVER_ERROR', context);
  }
}

