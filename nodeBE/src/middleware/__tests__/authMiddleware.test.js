/**
 * @author Bhavesh Venugopal
 * Authentication Middleware Tests
 * Tests for authMiddleware authentication and authorization logic
 */

import { jest, describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import {
  UnauthorizedError,
  AuthenticationFailedError,
  ForbiddenError
} from '../../utils/errors.js';
import { createMockUser } from '../../../__tests__/mocks/models/UserMock.js';
import { createMockCompany } from '../../../__tests__/mocks/models/CompanyMock.js';
import { createMockRole } from '../../../__tests__/mocks/models/CompanyRoleMock.js';
import { createMockCompanyUser } from '../../../__tests__/mocks/models/CompanyUserMock.js';

// Mock logger
const mockCreateRequestLogger = jest.fn();
const mockLogError = jest.fn();
const mockLogWarn = jest.fn();
const mockLogInfo = jest.fn();

jest.unstable_mockModule('../../utils/logger.js', () => ({
  createRequestLogger: mockCreateRequestLogger,
  logError: mockLogError,
  logWarn: mockLogWarn,
  logInfo: mockLogInfo
}));

// Mock keycloakService
const mockVerifyToken = jest.fn();
const mockGetUserFromToken = jest.fn();

jest.unstable_mockModule('../../services/keycloakService.js', () => ({
  verifyToken: mockVerifyToken,
  getUserFromToken: mockGetUserFromToken
}));

// Mock keycloakRoles
jest.unstable_mockModule('../../constants/keycloakRoles.js', () => ({
  isSuperAdmin: jest.fn()
}));

// Mock models
const mockUser = {
  findOne: jest.fn(),
  create: jest.fn()
};

const mockCompany = {
  findOne: jest.fn()
};

const mockCompanyRole = {
  findOne: jest.fn()
};

const mockCompanyUser = {
  findOne: jest.fn(),
  create: jest.fn()
};

jest.unstable_mockModule('../../models/index.js', () => ({
  User: mockUser,
  Company: mockCompany,
  CompanyRole: mockCompanyRole,
  CompanyUser: mockCompanyUser
}));

let authMiddleware;
let keycloakService;
let keycloakRoles;
let models;
let loggerUtils;

beforeAll(async () => {
  authMiddleware = await import('../authMiddleware.js');
  keycloakService = await import('../../services/keycloakService.js');
  keycloakRoles = await import('../../constants/keycloakRoles.js');
  models = await import('../../models/index.js');
  loggerUtils = await import('../../utils/logger.js');
});

describe('Authentication Middleware', () => {
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

    req = {
      id: 'test-request-id',
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
      path: '/api/v2/users',
      method: 'GET',
      headers: {}
    };

    res = {};
    next = jest.fn();
  });

  describe('authMiddleware', () => {
    it('should throw UnauthorizedError when no token is provided', async () => {
      // Arrange
      req.headers.authorization = undefined;

      // Act
      await authMiddleware.authMiddleware(req, res, next);

      // Assert
      expect(mockLogger.warn).toHaveBeenCalledWith('Authentication attempt without token', {
        path: '/api/v2/users',
        method: 'GET'
      });
      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect(mockVerifyToken).not.toHaveBeenCalled();
    });

    it('should extract token from Bearer format', async () => {
      // Arrange
      const token = 'test-token-123';
      req.headers.authorization = `Bearer ${token}`;
      mockVerifyToken.mockResolvedValue({ success: false });

      // Act
      await authMiddleware.authMiddleware(req, res, next);

      // Assert
      // Token extraction is internal, but we verify token verification was called
      expect(mockVerifyToken).toHaveBeenCalled();
    });

    it('should extract token without Bearer prefix', async () => {
      // Arrange
      const token = 'test-token-123';
      req.headers.authorization = token;
      mockVerifyToken.mockResolvedValue({ success: false });

      // Act
      await authMiddleware.authMiddleware(req, res, next);

      // Assert
      expect(mockVerifyToken).toHaveBeenCalled();
    });

    it('should throw AuthenticationFailedError when token verification fails', async () => {
      // Arrange
      req.headers.authorization = 'Bearer invalid-token';
      mockVerifyToken.mockResolvedValue({
        success: false,
        error: 'Token expired',
        details: 'Token has expired'
      });

      // Act
      await authMiddleware.authMiddleware(req, res, next);

      // Assert
      expect(mockLogger.warn).toHaveBeenCalledWith('Token verification failed', {
        error: 'Token expired',
        path: '/api/v2/users'
      });
      expect(next).toHaveBeenCalledWith(expect.any(AuthenticationFailedError));
      const error = next.mock.calls[0][0];
      // Error message uses details if available, otherwise default message
      expect(error.message).toBe('Token has expired');
    });

    it('should throw AuthenticationFailedError when user extraction fails', async () => {
      // Arrange
      req.headers.authorization = 'Bearer valid-token';
      mockVerifyToken.mockResolvedValue({
        success: true,
        decoded: { sub: 'kc-user-id' }
      });
      mockGetUserFromToken.mockReturnValue({
        success: false,
        error: 'Invalid token format'
      });

      // Act
      await authMiddleware.authMiddleware(req, res, next);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to extract user from token', {
        error: 'Invalid token format',
        path: '/api/v2/users'
      });
      expect(next).toHaveBeenCalledWith(expect.any(AuthenticationFailedError));
    });

    it('should sync existing user from Keycloak', async () => {
      // Arrange
      const keycloakId = uuidv4();
      const userId = uuidv4();
      const mockUserData = createMockUser({
        id: userId,
        keycloakId: keycloakId,
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        keycloakGlobalRole: 'COMPANY_USER',
        isActive: true
      });

      req.headers.authorization = 'Bearer valid-token';
      mockVerifyToken.mockResolvedValue({
        success: true,
        decoded: { sub: keycloakId }
      });
      mockGetUserFromToken.mockReturnValue({
        success: true,
        user: {
          keycloakId: keycloakId,
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          keycloakGlobalRole: 'COMPANY_USER',
          sessionState: 'session-123'
        }
      });

      mockUser.findOne.mockResolvedValue(mockUserData);
      mockUserData.save = jest.fn().mockResolvedValue(undefined);

      // Act
      await authMiddleware.authMiddleware(req, res, next);

      // Assert
      expect(mockUser.findOne).toHaveBeenCalledWith({
        where: { keycloakId: keycloakId }
      });
      expect(mockUserData.save).toHaveBeenCalled();
      expect(req.user).toEqual({
        id: userId,
        keycloakId: keycloakId,
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        keycloakGlobalRole: 'COMPANY_USER',
        sessionState: 'session-123'
      });
      expect(next).toHaveBeenCalledWith();
    });

    it('should create new user from Keycloak when not found', async () => {
      // Arrange
      const keycloakId = uuidv4();
      const userId = uuidv4();
      const newUser = createMockUser({
        id: userId,
        keycloakId: keycloakId,
        email: 'newuser@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        keycloakGlobalRole: 'COMPANY_USER',
        isActive: true
      });

      req.headers.authorization = 'Bearer valid-token';
      mockVerifyToken.mockResolvedValue({
        success: true,
        decoded: { sub: keycloakId }
      });
      mockGetUserFromToken.mockReturnValue({
        success: true,
        user: {
          keycloakId: keycloakId,
          email: 'newuser@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          keycloakGlobalRole: 'COMPANY_USER',
          sessionState: 'session-123'
        }
      });

      mockUser.findOne.mockResolvedValue(null);
      mockUser.create.mockResolvedValue(newUser);
      keycloakRoles.isSuperAdmin.mockReturnValue(false);

      // Act
      await authMiddleware.authMiddleware(req, res, next);

      // Assert
      expect(mockUser.create).toHaveBeenCalledWith({
        keycloakId: keycloakId,
        email: 'newuser@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        keycloakGlobalRole: 'COMPANY_USER',
        isActive: true,
        lastLoginAt: expect.any(Date)
      });
      expect(req.user).toBeDefined();
      expect(next).toHaveBeenCalledWith();
    });

    it('should throw ForbiddenError when user is inactive', async () => {
      // Arrange
      const keycloakId = uuidv4();
      const userId = uuidv4();
      const inactiveUser = createMockUser({
        id: userId,
        keycloakId: keycloakId,
        isActive: false
      });

      req.headers.authorization = 'Bearer valid-token';
      mockVerifyToken.mockResolvedValue({
        success: true,
        decoded: { sub: keycloakId }
      });
      mockGetUserFromToken.mockReturnValue({
        success: true,
        user: {
          keycloakId: keycloakId,
          email: 'user@example.com',
          keycloakGlobalRole: 'COMPANY_USER',
          sessionState: 'session-123'
        }
      });

      mockUser.findOne.mockResolvedValue(inactiveUser);
      inactiveUser.save = jest.fn().mockResolvedValue(undefined);

      // Act
      await authMiddleware.authMiddleware(req, res, next);

      // Assert
      expect(mockLogger.warn).toHaveBeenCalledWith('Authentication attempt with inactive user', {
        userId: userId,
        keycloakId: keycloakId
      });
      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
      const error = next.mock.calls[0][0];
      expect(error.message).toBe('Your account has been deactivated');
    });

    it('should update request logger with user ID after authentication', async () => {
      // Arrange
      const keycloakId = uuidv4();
      const userId = uuidv4();
      const mockUserData = createMockUser({
        id: userId,
        keycloakId: keycloakId,
        isActive: true
      });

      req.headers.authorization = 'Bearer valid-token';
      mockVerifyToken.mockResolvedValue({
        success: true,
        decoded: { sub: keycloakId }
      });
      mockGetUserFromToken.mockReturnValue({
        success: true,
        user: {
          keycloakId: keycloakId,
          email: 'user@example.com',
          keycloakGlobalRole: 'COMPANY_USER',
          sessionState: 'session-123'
        }
      });

      mockUser.findOne.mockResolvedValue(mockUserData);
      mockUserData.save = jest.fn().mockResolvedValue(undefined);

      // Act
      await authMiddleware.authMiddleware(req, res, next);

      // Assert
      expect(mockCreateRequestLogger).toHaveBeenCalledWith(
        'test-request-id',
        userId,
        '127.0.0.1'
      );
      expect(req.logger).toBeDefined();
    });

    it('should handle errors and pass to error handler', async () => {
      // Arrange
      req.headers.authorization = 'Bearer valid-token';
      const error = new Error('Database error');
      mockVerifyToken.mockRejectedValue(error);

      // Act
      await authMiddleware.authMiddleware(req, res, next);

      // Assert
      expect(mockLogError).toHaveBeenCalledWith('Authentication error', error, {
        requestId: 'test-request-id',
        path: '/api/v2/users',
        method: 'GET'
      });
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('optionalAuthMiddleware', () => {
    it('should continue without authentication when no token provided', async () => {
      // Arrange
      req.headers.authorization = undefined;

      // Act
      await authMiddleware.optionalAuthMiddleware(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith();
      expect(mockVerifyToken).not.toHaveBeenCalled();
    });

    it('should authenticate when token is provided', async () => {
      // Arrange
      const keycloakId = uuidv4();
      const userId = uuidv4();
      const mockUserData = createMockUser({
        id: userId,
        keycloakId: keycloakId,
        isActive: true
      });

      req.headers.authorization = 'Bearer valid-token';
      mockVerifyToken.mockResolvedValue({
        success: true,
        decoded: { sub: keycloakId }
      });
      mockGetUserFromToken.mockReturnValue({
        success: true,
        user: {
          keycloakId: keycloakId,
          email: 'user@example.com',
          keycloakGlobalRole: 'COMPANY_USER',
          sessionState: 'session-123'
        }
      });

      mockUser.findOne.mockResolvedValue(mockUserData);
      mockUserData.save = jest.fn().mockResolvedValue(undefined);

      // Act
      await authMiddleware.optionalAuthMiddleware(req, res, next);

      // Assert
      expect(mockVerifyToken).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(next).toHaveBeenCalledWith();
    });
  });
});

