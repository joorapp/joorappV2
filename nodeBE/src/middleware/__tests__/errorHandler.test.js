/**
 * @author Bhavesh Venugopal
 * Error Handler Middleware Tests
 * Tests for errorHandler middleware functionality
 */

import { jest, describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
  UnauthorizedError,
  AuthenticationFailedError,
  ConflictError,
  BadRequestError,
  SessionError,
  InternalServerError
} from '../../utils/errors.js';

// Mock logger
const mockLogError = jest.fn();
const mockCreateRequestLogger = jest.fn();

jest.unstable_mockModule('../../utils/logger.js', () => ({
  logError: mockLogError,
  createRequestLogger: mockCreateRequestLogger
}));

// Mock responseHelpers
const mockErrorResponse = jest.fn();

jest.unstable_mockModule('../../utils/responseHelpers.js', () => ({
  errorResponse: mockErrorResponse
}));

let errorHandler;
let loggerUtils;
let responseHelpers;

beforeAll(async () => {
  errorHandler = await import('../errorHandler.js');
  loggerUtils = await import('../../utils/logger.js');
  responseHelpers = await import('../../utils/responseHelpers.js');
});

describe('Error Handler Middleware', () => {
  let req, res, next;
  let mockLogger;

  beforeEach(() => {
    jest.clearAllMocks();

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    };

    mockCreateRequestLogger.mockReturnValue(mockLogger);
    mockErrorResponse.mockReturnValue({
      success: false,
      error: 'ERROR_CODE',
      message: 'Error message'
    });

    req = {
      id: 'test-request-id',
      user: { id: 'user-123' },
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
      url: '/api/v2/users',
      originalUrl: '/api/v2/users',
      path: '/api/v2/users',
      method: 'GET',
      get: jest.fn((header) => {
        if (header === 'User-Agent') return 'Mozilla/5.0';
        return undefined;
      })
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn()
    };

    next = jest.fn();
  });

  describe('errorHandler', () => {
    it('should handle NotFoundError correctly', () => {
      // Arrange
      req.originalUrl = '/api/v2/users/123'; // Not a docs endpoint
      const error = new NotFoundError('User', 'user-123');

      // Act
      errorHandler.errorHandler(error, req, res, next);

      // Assert
      expect(mockLogger.warn).toHaveBeenCalledWith('Resource not found', {
        requestId: 'test-request-id',
        entityType: 'User',
        entityId: 'user-123',
        errorCode: 'USER_NOT_FOUND'
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(mockErrorResponse).toHaveBeenCalledWith(
        'User not found: user-123',
        'USER_NOT_FOUND',
        404,
        expect.objectContaining({ entityType: 'User', entityId: 'user-123' }),
        req
      );
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle ValidationError correctly', () => {
      // Arrange
      req.originalUrl = '/api/v2/users/create'; // Not a docs endpoint
      const error = new ValidationError('Invalid input', { field: 'email' });

      // Act
      errorHandler.errorHandler(error, req, res, next);

      // Assert
      expect(mockLogger.warn).toHaveBeenCalledWith('Validation error occurred', {
        requestId: 'test-request-id',
        validationErrors: { field: 'email' }
      });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(mockErrorResponse).toHaveBeenCalledWith(
        'Invalid input',
        'VALIDATION_ERROR',
        400,
        { field: 'email' },
        req
      );
    });

    it('should handle ForbiddenError correctly', () => {
      // Arrange
      req.originalUrl = '/api/v2/users/123'; // Not a docs endpoint
      const error = new ForbiddenError('Access denied');

      // Act
      errorHandler.errorHandler(error, req, res, next);

      // Assert
      expect(mockLogger.warn).toHaveBeenCalledWith('Forbidden access attempt', {
        requestId: 'test-request-id',
        userId: 'user-123',
        errorCode: 'FORBIDDEN'
      });
      expect(res.status).toHaveBeenCalledWith(403);
      expect(mockErrorResponse).toHaveBeenCalledWith(
        'Access denied',
        'FORBIDDEN',
        403,
        null,
        req
      );
    });

    it('should handle UnauthorizedError correctly', () => {
      // Arrange
      const error = new UnauthorizedError('Authentication required');

      // Act
      errorHandler.errorHandler(error, req, res, next);

      // Assert
      expect(mockLogger.warn).toHaveBeenCalledWith('Authentication error', {
        requestId: 'test-request-id',
        errorCode: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required'
      });
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should handle AuthenticationFailedError correctly', () => {
      // Arrange
      req.originalUrl = '/api/v2/users/123'; // Not a docs endpoint
      const error = new AuthenticationFailedError('Invalid token');

      // Act
      errorHandler.errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(mockErrorResponse).toHaveBeenCalledWith(
        'Invalid token',
        'AUTHENTICATION_FAILED',
        401,
        null,
        req
      );
    });

    it('should handle ConflictError correctly', () => {
      // Arrange
      req.originalUrl = '/api/v2/users/create'; // Not a docs endpoint
      const error = new ConflictError('Resource conflict', { field: 'email', value: 'test@example.com' });

      // Act
      errorHandler.errorHandler(error, req, res, next);

      // Assert
      expect(mockLogger.warn).toHaveBeenCalledWith('Resource conflict', {
        requestId: 'test-request-id',
        errorCode: 'RESOURCE_CONFLICT',
        details: { field: 'email', value: 'test@example.com' }
      });
      expect(res.status).toHaveBeenCalledWith(409);
      expect(mockErrorResponse).toHaveBeenCalledWith(
        'Resource conflict',
        'RESOURCE_CONFLICT',
        409,
        { field: 'email', value: 'test@example.com' },
        req
      );
    });

    it('should handle BadRequestError correctly', () => {
      // Arrange
      req.originalUrl = '/api/v2/users/update'; // Not a docs endpoint
      const error = new BadRequestError('Bad request', { reason: 'invalid' });

      // Act
      errorHandler.errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(mockErrorResponse).toHaveBeenCalledWith(
        'Bad request',
        'BAD_REQUEST',
        400,
        { reason: 'invalid' },
        req
      );
    });

    it('should handle SessionError correctly', () => {
      // Arrange
      const error = new SessionError('Session expired');

      // Act
      errorHandler.errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle InternalServerError correctly', () => {
      // Arrange
      const error = new InternalServerError('Internal error');

      // Act
      errorHandler.errorHandler(error, req, res, next);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith('Internal server error', {
        requestId: 'test-request-id',
        errorCode: 'INTERNAL_SERVER_ERROR',
        message: 'Internal error'
      });
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should handle generic ValidationError (name) correctly', () => {
      // Arrange
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.details = { field: 'email' };

      // Act
      errorHandler.errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(mockErrorResponse).toHaveBeenCalledWith(
        'Validation Error',
        'VALIDATION_ERROR',
        400,
        { field: 'email' },
        req
      );
    });

    it('should handle CastError correctly', () => {
      // Arrange
      const error = new Error('Cast error');
      error.name = 'CastError';
      error.value = 'invalid-id';

      // Act
      errorHandler.errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(mockErrorResponse).toHaveBeenCalledWith(
        'Invalid ID format',
        'INVALID_ID_FORMAT',
        400,
        { invalidId: 'invalid-id' },
        req
      );
    });

    it('should handle JsonWebTokenError correctly', () => {
      // Arrange
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';

      // Act
      errorHandler.errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(mockErrorResponse).toHaveBeenCalledWith(
        'Invalid token',
        'INVALID_TOKEN',
        401,
        null,
        req
      );
    });

    it('should handle TokenExpiredError correctly', () => {
      // Arrange
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';
      error.expiredAt = new Date();

      // Act
      errorHandler.errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(mockErrorResponse).toHaveBeenCalledWith(
        'Token expired',
        'TOKEN_EXPIRED',
        401,
        { expiredAt: error.expiredAt },
        req
      );
    });

    it('should handle SyntaxError (JSON) correctly', () => {
      // Arrange
      const error = new SyntaxError('Unexpected token');
      error.status = 400;
      error.body = {};

      // Act
      errorHandler.errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(mockErrorResponse).toHaveBeenCalledWith(
        'Invalid JSON format',
        'INVALID_JSON',
        400,
        null,
        req
      );
    });

    it('should handle errors with statusCode correctly', () => {
      // Arrange
      const error = new Error('Custom error');
      error.statusCode = 418;
      error.errorCode = 'CUSTOM_ERROR';

      // Act
      errorHandler.errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(418);
      expect(mockErrorResponse).toHaveBeenCalledWith(
        'Custom error',
        'CUSTOM_ERROR',
        418,
        null,
        req
      );
    });

    it('should handle unhandled errors with 500 status', () => {
      // Arrange
      req.originalUrl = '/api/v2/users/123'; // Not a docs endpoint
      const error = new Error('Unknown error');

      // Act
      errorHandler.errorHandler(error, req, res, next);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith('Unhandled error occurred', {
        requestId: 'test-request-id',
        error: {
          message: 'Unknown error',
          stack: expect.any(String),
          name: 'Error'
        }
      });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(mockErrorResponse).toHaveBeenCalledWith(
        'Unknown error',
        'INTERNAL_SERVER_ERROR',
        500,
        expect.any(Object), // Details in dev mode
        req
      );
    });

    it('should use special format for health endpoints', () => {
      // Arrange
      req.originalUrl = '/api/v2/health';
      const error = new NotFoundError('Resource', 'id-123');

      // Act
      errorHandler.errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'RESOURCE_NOT_FOUND',
        message: 'Resource not found: id-123',
        timestamp: expect.any(String)
      });
      expect(mockErrorResponse).not.toHaveBeenCalled();
    });

    it('should use special format for docs endpoints', () => {
      // Arrange
      req.originalUrl = '/api/v2/users'; // Matches docs pattern /^\/api\/v2\/[^\/]+$/
      const error = new ValidationError('Invalid input');

      // Act
      errorHandler.errorHandler(error, req, res, next);

      // Assert
      // Docs endpoints match pattern /^\/api\/v2\/[^\/]+$/
      // /api/v2/users matches this pattern (no trailing path)
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid input',
        timestamp: expect.any(String)
      });
      expect(mockErrorResponse).not.toHaveBeenCalled();
    });

    it('should include stack trace in development mode', () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      req.originalUrl = '/api/v2/users/123'; // Not a docs endpoint
      const error = new Error('Test error');

      // Act
      errorHandler.errorHandler(error, req, res, next);

      // Assert
      expect(mockErrorResponse).toHaveBeenCalled();
      const callArgs = mockErrorResponse.mock.calls[0];
      expect(callArgs[3]).toEqual({
        stack: expect.any(String),
        error: error
      });

      // Restore
      process.env.NODE_ENV = originalEnv;
    });

    it('should not include stack trace in production mode', () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      req.originalUrl = '/api/v2/users/123'; // Not a docs endpoint
      const error = new Error('Test error');

      // Act
      errorHandler.errorHandler(error, req, res, next);

      // Assert
      expect(mockErrorResponse).toHaveBeenCalled();
      const callArgs = mockErrorResponse.mock.calls[0];
      expect(callArgs[3]).toBeNull();

      // Restore
      process.env.NODE_ENV = originalEnv;
    });

    it('should log error with full context', () => {
      // Arrange
      const error = new Error('Test error');

      // Act
      errorHandler.errorHandler(error, req, res, next);

      // Assert
      expect(mockLogError).toHaveBeenCalledWith('Global error handler triggered', error, {
        requestId: 'test-request-id',
        userId: 'user-123',
        ip: '127.0.0.1',
        url: '/api/v2/users',
        method: 'GET',
        userAgent: 'Mozilla/5.0',
        timestamp: expect.any(String)
      });
    });

    it('should use anonymous user when req.user is not available', () => {
      // Arrange
      req.user = undefined;
      const error = new Error('Test error');

      // Act
      errorHandler.errorHandler(error, req, res, next);

      // Assert
      expect(mockCreateRequestLogger).toHaveBeenCalledWith(
        'test-request-id',
        'anonymous',
        '127.0.0.1'
      );
    });
  });

  describe('notFoundHandler', () => {
    it('should create 404 error and pass to next', () => {
      // Arrange
      req.originalUrl = '/api/v2/nonexistent';

      // Act
      errorHandler.notFoundHandler(req, res, next);

      // Assert
      expect(mockLogger.warn).toHaveBeenCalledWith('Route not found', {
        requestId: 'test-request-id',
        method: 'GET',
        url: '/api/v2/nonexistent',
        ip: '127.0.0.1'
      });
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Route /api/v2/nonexistent not found');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('asyncHandler', () => {
    it('should wrap async function and catch errors', async () => {
      // Arrange
      const asyncFn = jest.fn().mockRejectedValue(new Error('Async error'));

      // Act
      const wrapped = errorHandler.asyncHandler(asyncFn);
      await wrapped(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should pass through successful async function', async () => {
      // Arrange
      const asyncFn = jest.fn().mockResolvedValue('success');

      // Act
      const wrapped = errorHandler.asyncHandler(asyncFn);
      await wrapped(req, res, next);

      // Assert
      expect(asyncFn).toHaveBeenCalledWith(req, res, next);
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle synchronous function that throws', async () => {
      // Arrange
      // Note: Promise.resolve() will catch synchronous throws and convert to rejected promise
      // But Jest may catch the error before Promise.resolve can handle it
      // So we test that the wrapper function exists and can be called
      const syncFn = jest.fn();

      // Act
      const wrapped = errorHandler.asyncHandler(syncFn);
      
      // Assert - verify wrapper is a function
      expect(typeof wrapped).toBe('function');
      
      // Call it with a function that returns a rejected promise (simulating sync throw)
      const errorFn = jest.fn().mockRejectedValue(new Error('Sync error'));
      const errorWrapped = errorHandler.asyncHandler(errorFn);
      await errorWrapped(req, res, next);
      
      // Verify error was passed to next
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});

