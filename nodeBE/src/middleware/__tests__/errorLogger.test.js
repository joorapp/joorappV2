/**
 * @author Bhavesh Venugopal
 * Error Logger Middleware Tests
 * Tests for errorLogger middleware functionality
 */

import { jest, describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import { ValidationError, UnauthorizedError, ForbiddenError, NotFoundError } from '../../utils/errors.js';

// Mock logger before importing middleware
const mockLogError = jest.fn();
const mockLogSecurity = jest.fn();
const mockCreateRequestLogger = jest.fn();

jest.unstable_mockModule('../../utils/logger.js', () => ({
  logError: mockLogError,
  logSecurity: mockLogSecurity,
  createRequestLogger: mockCreateRequestLogger
}));

let errorLogger;
let loggerUtils;

beforeAll(async () => {
  errorLogger = await import('../errorLogger.js');
  loggerUtils = await import('../../utils/logger.js');
});

describe('Error Logger Middleware', () => {
  let req, res, next;
  let mockLogger;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock logger
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    };

    mockCreateRequestLogger.mockReturnValue(mockLogger);

    // Mock Express request
    req = {
      id: 'test-request-id',
      method: 'GET',
      originalUrl: '/api/v2/users',
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
      get: jest.fn((header) => {
        if (header === 'User-Agent') return 'Mozilla/5.0';
        if (header === 'Content-Type') return 'application/json';
        if (header === 'Authorization') return 'Bearer token123';
        return undefined;
      }),
      user: { id: 'user-123' },
      logger: mockLogger
    };

    res = {};
    next = jest.fn();
  });

  describe('errorLogger', () => {
    it('should log security errors with logSecurity', () => {
      // Arrange
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';

      // Act
      errorLogger.errorLogger(error, req, res, next);

      // Assert
      expect(mockLogSecurity).toHaveBeenCalledWith(
        'Security error: Invalid token',
        expect.objectContaining({
          requestId: 'test-request-id',
          userId: 'user-123',
          category: 'SECURITY'
        })
      );
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should log validation errors with warn level', () => {
      // Arrange
      const error = new ValidationError('Invalid input', { field: 'email' });

      // Act
      errorLogger.errorLogger(error, req, res, next);

      // Assert
      expect(mockLogger.warn).toHaveBeenCalledWith('Validation error', expect.objectContaining({
        category: 'VALIDATION',
        validationErrors: { field: 'email' }
      }));
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should log authentication errors with logSecurity', () => {
      // Arrange
      const error = new UnauthorizedError('Authentication required');
      error.statusCode = 401;

      // Act
      errorLogger.errorLogger(error, req, res, next);

      // Assert
      expect(mockLogSecurity).toHaveBeenCalledWith(
        expect.stringContaining('Authentication error'),
        expect.objectContaining({
          category: 'AUTHENTICATION'
        })
      );
    });

    it('should log authorization errors with logSecurity', () => {
      // Arrange
      const error = new ForbiddenError('Access denied');
      error.statusCode = 403;

      // Act
      errorLogger.errorLogger(error, req, res, next);

      // Assert
      expect(mockLogSecurity).toHaveBeenCalledWith(
        expect.stringContaining('Authorization error'),
        expect.objectContaining({
          category: 'AUTHORIZATION'
        })
      );
    });

    it('should log database errors with error level', () => {
      // Arrange
      const error = new Error('Database connection failed');
      error.name = 'SequelizeError';
      error.code = 'ECONNREFUSED';

      // Act
      errorLogger.errorLogger(error, req, res, next);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith('Database error', expect.objectContaining({
        category: 'DATABASE',
        databaseError: {
          code: 'ECONNREFUSED',
          errno: undefined,
          sqlState: undefined
        }
      }));
    });

    it('should log external API errors with error level', () => {
      // Arrange
      const error = new Error('API request failed');
      error.isAxiosError = true;
      error.externalStatusCode = 500;

      // Act
      errorLogger.errorLogger(error, req, res, next);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith('External API error', expect.objectContaining({
        category: 'EXTERNAL_API',
        externalService: 'unknown',
        externalStatusCode: 500
      }));
    });

    it('should log application errors with logError', () => {
      // Arrange
      const error = new Error('Generic application error');

      // Act
      errorLogger.errorLogger(error, req, res, next);

      // Assert
      expect(mockLogError).toHaveBeenCalledWith(
        'Application error: Generic application error',
        error,
        expect.objectContaining({
          category: 'APPLICATION'
        })
      );
    });

    it('should include request metadata in error log', () => {
      // Arrange
      const error = new Error('Test error');

      // Act
      errorLogger.errorLogger(error, req, res, next);

      // Assert
      expect(mockLogError).toHaveBeenCalledWith(
        expect.any(String),
        error,
        expect.objectContaining({
          requestId: 'test-request-id',
          userId: 'user-123',
          ip: '127.0.0.1',
          userAgent: 'Mozilla/5.0',
          method: 'GET',
          url: '/api/v2/users',
          statusCode: 500,
          headers: {
            'content-type': 'application/json',
            'authorization': '[REDACTED]'
          }
        })
      );
    });

    it('should redact authorization header in logs', () => {
      // Arrange
      const error = new Error('Test error');

      // Act
      errorLogger.errorLogger(error, req, res, next);

      // Assert
      const callArgs = mockLogError.mock.calls[0];
      expect(callArgs[2].headers.authorization).toBe('[REDACTED]');
    });

    it('should log to request logger if available', () => {
      // Arrange
      const error = new Error('Test error');
      req.logger = mockLogger;

      // Act
      errorLogger.errorLogger(error, req, res, next);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith('Request failed', {
        error: 'Test error',
        statusCode: 500,
        category: 'APPLICATION'
      });
    });

    it('should create request logger if req.logger not available', () => {
      // Arrange
      const error = new Error('Test error');
      req.logger = undefined;

      // Act
      errorLogger.errorLogger(error, req, res, next);

      // Assert
      expect(mockCreateRequestLogger).toHaveBeenCalledWith(
        'test-request-id',
        'user-123',
        '127.0.0.1'
      );
    });

    it('should use anonymous user if req.user not available', () => {
      // Arrange
      const error = new Error('Test error');
      req.user = undefined;

      // Act
      errorLogger.errorLogger(error, req, res, next);

      // Assert
      expect(mockCreateRequestLogger).toHaveBeenCalledWith(
        'test-request-id',
        'anonymous',
        '127.0.0.1'
      );
    });

    it('should pass error to next middleware', () => {
      // Arrange
      const error = new Error('Test error');

      // Act
      errorLogger.errorLogger(error, req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should categorize JWT errors as SECURITY', () => {
      // Arrange
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';

      // Act
      errorLogger.errorLogger(error, req, res, next);

      // Assert
      expect(mockLogSecurity).toHaveBeenCalledWith(
        expect.stringContaining('Security error'),
        expect.objectContaining({
          category: 'SECURITY'
        })
      );
    });

    it('should categorize token expired errors as SECURITY', () => {
      // Arrange
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';

      // Act
      errorLogger.errorLogger(error, req, res, next);

      // Assert
      expect(mockLogSecurity).toHaveBeenCalledWith(
        expect.stringContaining('Security error'),
        expect.objectContaining({
          category: 'SECURITY'
        })
      );
    });
  });

  describe('unhandledErrorLogger', () => {
    it('should log unhandled errors with system context', () => {
      // Arrange
      const error = new Error('Unhandled error');

      // Act
      errorLogger.unhandledErrorLogger(error, req, res, next);

      // Assert
      expect(mockCreateRequestLogger).toHaveBeenCalledWith('unhandled', 'system', 'unknown');
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should include process information in unhandled error log', () => {
      // Arrange
      const error = new Error('Unhandled error');
      const mockUnhandledLogger = {
        error: jest.fn()
      };
      mockCreateRequestLogger.mockReturnValueOnce(mockUnhandledLogger);

      // Act
      errorLogger.unhandledErrorLogger(error, req, res, next);

      // Assert
      expect(mockUnhandledLogger.error).toHaveBeenCalledWith('Unhandled error occurred', expect.objectContaining({
        error: {
          message: 'Unhandled error',
          stack: expect.any(String),
          name: 'Error'
        },
        process: {
          pid: expect.any(Number),
          uptime: expect.any(Number),
          memory: expect.any(Object)
        }
      }));
    });
  });
});

