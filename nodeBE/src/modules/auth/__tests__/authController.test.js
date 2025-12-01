/**
 * @author Bhavesh Venugopal
 * Auth Controller Tests
 * Tests for authController endpoints
 */

import { jest, describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import {
  ValidationError,
  UnauthorizedError,
  AuthenticationFailedError,
  ForbiddenError,
  SessionError,
  BadRequestError
} from '../../../utils/errors.js';

// Mock logger
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
};

const mockCreateModuleLogger = jest.fn(() => mockLogger);
const mockLogPerformance = jest.fn();

jest.unstable_mockModule('../../../utils/logger.js', () => ({
  createModuleLogger: mockCreateModuleLogger,
  logPerformance: mockLogPerformance
}));

// Mock responseHelpers
const mockSuccessResponse = jest.fn();

jest.unstable_mockModule('../../../utils/responseHelpers.js', () => ({
  successResponse: mockSuccessResponse
}));

// Mock validators
const mockValidateRequired = jest.fn();
const mockValidateUUID = jest.fn();
const mockValidateEmail = jest.fn();

jest.unstable_mockModule('../../../utils/validators.js', () => ({
  validateRequired: mockValidateRequired,
  validateUUID: mockValidateUUID,
  validateEmail: mockValidateEmail
}));

// Mock keycloakService
const mockLoginUser = jest.fn();
const mockRefreshToken = jest.fn();
const mockLogoutUser = jest.fn();

jest.unstable_mockModule('../../../services/keycloakService.js', () => ({
  loginUser: mockLoginUser,
  refreshToken: mockRefreshToken,
  logoutUser: mockLogoutUser
}));

// Mock models
const mockCompanyUser = {
  findAll: jest.fn(),
  findOne: jest.fn()
};

const mockUserCompanyContext = {
  findOne: jest.fn(),
  findOrCreate: jest.fn(),
  destroy: jest.fn()
};

jest.unstable_mockModule('../../../models/index.js', () => ({
  CompanyUser: mockCompanyUser,
  Company: {},
  CompanyRole: {},
  User: {},
  UserCompanyContext: mockUserCompanyContext
}));

let authController;
let loggerUtils;
let responseHelpers;
let validators;
let keycloakService;
let models;

beforeAll(async () => {
  authController = await import('../authController.js');
  loggerUtils = await import('../../../utils/logger.js');
  responseHelpers = await import('../../../utils/responseHelpers.js');
  validators = await import('../../../utils/validators.js');
  keycloakService = await import('../../../services/keycloakService.js');
  models = await import('../../../models/index.js');
});

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      id: 'test-request-id',
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
      path: '/api/v2/auth/login',
      method: 'POST',
      body: {},
      params: {},
      user: null
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockSuccessResponse.mockReturnValue({
      success: true,
      message: 'Success',
      data: {}
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      req.body = {
        email: 'user@example.com',
        password: 'password123'
      };

      const mockLoginResponse = {
        success: true,
        data: {
          access_token: 'access-token',
          refresh_token: 'refresh-token',
          expires_in: 3600,
          session_state: 'session-123'
        }
      };

      mockLoginUser.mockResolvedValue(mockLoginResponse);

      // Act
      await authController.login(req, res);

      // Assert
      expect(mockValidateRequired).toHaveBeenCalledWith(
        { email: 'user@example.com', password: 'password123' },
        'test-request-id'
      );
      expect(mockValidateEmail).toHaveBeenCalledWith('user@example.com', 'email', 'test-request-id');
      expect(mockLoginUser).toHaveBeenCalledWith('user@example.com', 'password123');
      expect(mockLogger.info).toHaveBeenCalledWith('Login successful', {
        requestId: 'test-request-id',
        email: 'user@example.com',
        sessionState: 'session-123'
      });
      expect(mockSuccessResponse).toHaveBeenCalledWith(
        'Login successful',
        {
          access_token: 'access-token',
          refresh_token: 'refresh-token',
          expires_in: 3600
        },
        {},
        req,
        expect.any(Number)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should throw ValidationError when email is missing', async () => {
      // Arrange
      req.body = { password: 'password123' };
      mockValidateRequired.mockImplementation(() => {
        throw new ValidationError('Email is required');
      });

      // Act & Assert
      await expect(authController.login(req, res)).rejects.toThrow(ValidationError);
      expect(mockLoginUser).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when email is invalid', async () => {
      // Arrange
      req.body = {
        email: 'invalid-email',
        password: 'password123'
      };
      mockValidateEmail.mockImplementation(() => {
        throw new ValidationError('Invalid email format');
      });

      // Act & Assert
      await expect(authController.login(req, res)).rejects.toThrow(ValidationError);
      expect(mockLoginUser).not.toHaveBeenCalled();
    });

    it('should throw AuthenticationFailedError when login fails', async () => {
      // Arrange
      req.body = {
        email: 'user@example.com',
        password: 'wrong-password'
      };

      mockValidateRequired.mockImplementation(() => {}); // Don't throw
      mockValidateEmail.mockImplementation(() => {}); // Don't throw

      mockLoginUser.mockResolvedValue({
        success: false,
        error: 'Invalid credentials',
        details: 'Invalid username or password'
      });

      // Act & Assert
      await expect(authController.login(req, res)).rejects.toThrow(AuthenticationFailedError);
      expect(mockLogger.warn).toHaveBeenCalledWith('Login failed', {
        requestId: 'test-request-id',
        email: 'user@example.com',
        error: 'Invalid credentials'
      });
    });

    it('should remove session_state from response', async () => {
      // Arrange
      req.body = {
        email: 'user@example.com',
        password: 'password123'
      };

      mockValidateRequired.mockImplementation(() => {}); // Don't throw
      mockValidateEmail.mockImplementation(() => {}); // Don't throw

      mockLoginUser.mockResolvedValue({
        success: true,
        data: {
          access_token: 'token',
          session_state: 'session-123'
        }
      });

      // Act
      await authController.login(req, res);

      // Assert
      const responseData = mockSuccessResponse.mock.calls[0][1];
      expect(responseData).not.toHaveProperty('session_state');
      expect(responseData).toHaveProperty('access_token');
    });
  });

  describe('getUserCompanies', () => {
    it('should return user companies successfully', async () => {
      // Arrange
      const userId = uuidv4();
      req.user = {
        id: userId,
        email: 'user@example.com'
      };

      const mockCompanyUsers = [
        {
          id: uuidv4(),
          company: {
            id: uuidv4(),
            name: 'Company 1',
            isActive: true
          },
          role: {
            id: uuidv4(),
            name: 'Admin',
            code: 'ADMIN',
            description: 'Administrator'
          }
        }
      ];

      mockCompanyUser.findAll.mockResolvedValue(mockCompanyUsers);

      // Act
      await authController.getUserCompanies(req, res);

      // Assert
      expect(mockCompanyUser.findAll).toHaveBeenCalledWith({
        where: {
          userId: userId,
          isActive: true,
          isDeleted: false
        },
        include: expect.any(Array)
      });
      expect(mockLogger.info).toHaveBeenCalledWith('User companies retrieved successfully', {
        requestId: 'test-request-id',
        userId: userId,
        companyCount: 1
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should throw UnauthorizedError when user is not authenticated', async () => {
      // Arrange
      req.user = null;

      // Act & Assert
      await expect(authController.getUserCompanies(req, res)).rejects.toThrow(UnauthorizedError);
      expect(mockCompanyUser.findAll).not.toHaveBeenCalled();
    });
  });

  describe('selectCompany', () => {
    it('should select company successfully', async () => {
      // Arrange
      const userId = uuidv4();
      const companyId = uuidv4();
      req.user = {
        id: userId,
        sessionState: 'session-123'
      };
      req.params = { companyId: companyId };

      const mockCompanyUserData = {
        id: uuidv4(),
        company: {
          id: companyId,
          name: 'Test Company',
          isActive: true
        },
        role: {
          id: uuidv4(),
          name: 'Admin',
          code: 'ADMIN',
          description: 'Administrator'
        },
        user: {
          id: userId,
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe'
        }
      };

      mockCompanyUser.findOne.mockResolvedValue(mockCompanyUserData);
      mockUserCompanyContext.findOrCreate.mockResolvedValue([
        {
          companyId: companyId,
          save: jest.fn().mockResolvedValue(undefined)
        },
        true // created
      ]);

      // Act
      await authController.selectCompany(req, res);

      // Assert
      expect(mockValidateUUID).toHaveBeenCalledWith(companyId, 'companyId', 'test-request-id');
      expect(mockCompanyUser.findOne).toHaveBeenCalled();
      expect(mockUserCompanyContext.findOrCreate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should throw UnauthorizedError when user is not authenticated', async () => {
      // Arrange
      req.user = null;
      req.params = { companyId: uuidv4() };

      // Act & Assert
      await expect(authController.selectCompany(req, res)).rejects.toThrow(UnauthorizedError);
    });

    it('should throw SessionError when sessionState is missing', async () => {
      // Arrange
      req.user = {
        id: uuidv4(),
        sessionState: null
      };
      req.params = { companyId: uuidv4() };

      // Act & Assert
      await expect(authController.selectCompany(req, res)).rejects.toThrow(SessionError);
    });

    it('should throw ForbiddenError when user does not have access to company', async () => {
      // Arrange
      req.user = {
        id: uuidv4(),
        sessionState: 'session-123'
      };
      req.params = { companyId: uuidv4() };

      mockCompanyUser.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(authController.selectCompany(req, res)).rejects.toThrow(ForbiddenError);
      expect(mockLogger.warn).toHaveBeenCalledWith('User attempted to select unauthorized company', {
        requestId: 'test-request-id',
        userId: req.user.id,
        companyId: req.params.companyId
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      // Arrange
      req.body = {
        refresh_token: 'refresh-token-123'
      };

      mockValidateRequired.mockImplementation(() => {}); // Don't throw

      const mockRefreshResponse = {
        success: true,
        data: {
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          expires_in: 3600,
          session_state: 'session-123'
        }
      };

      mockRefreshToken.mockResolvedValue(mockRefreshResponse);

      // Act
      await authController.refreshToken(req, res);

      // Assert
      expect(mockValidateRequired).toHaveBeenCalledWith(
        { refresh_token: 'refresh-token-123' },
        'test-request-id'
      );
      expect(mockRefreshToken).toHaveBeenCalledWith('refresh-token-123');
      expect(mockLogger.info).toHaveBeenCalledWith('Token refresh successful', {
        requestId: 'test-request-id',
        sessionState: 'session-123'
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should throw AuthenticationFailedError when refresh token expired', async () => {
      // Arrange
      req.body = {
        refresh_token: 'expired-token'
      };

      mockValidateRequired.mockImplementation(() => {}); // Don't throw

      mockRefreshToken.mockResolvedValue({
        success: false,
        error: 'Refresh token expired',
        details: 'Token has expired'
      });

      // Act & Assert
      await expect(authController.refreshToken(req, res)).rejects.toThrow(AuthenticationFailedError);
    });

    it('should throw BadRequestError when refresh token is invalid', async () => {
      // Arrange
      req.body = {
        refresh_token: 'invalid-token'
      };

      mockValidateRequired.mockImplementation(() => {}); // Don't throw

      mockRefreshToken.mockResolvedValue({
        success: false,
        error: 'Invalid token',
        details: 'Token format is invalid'
      });

      // Act & Assert
      await expect(authController.refreshToken(req, res)).rejects.toThrow(BadRequestError);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      // Arrange
      const userId = uuidv4();
      req.user = {
        id: userId,
        email: 'user@example.com',
        sessionState: 'session-123'
      };
      req.body = {
        refresh_token: 'refresh-token-123'
      };

      mockLogoutUser.mockResolvedValue({ success: true });
      mockUserCompanyContext.destroy.mockResolvedValue(1);

      // Act
      await authController.logout(req, res);

      // Assert
      expect(mockLogoutUser).toHaveBeenCalledWith('refresh-token-123');
      expect(mockUserCompanyContext.destroy).toHaveBeenCalledWith({
        where: {
          keycloakSessionId: 'session-123'
        }
      });
      expect(mockLogger.info).toHaveBeenCalledWith('Logout successful', {
        requestId: 'test-request-id',
        userId: userId,
        email: 'user@example.com'
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should throw UnauthorizedError when user is not authenticated', async () => {
      // Arrange
      req.user = null;

      // Act & Assert
      await expect(authController.logout(req, res)).rejects.toThrow(UnauthorizedError);
    });

    it('should cleanup UserCompanyContext even if Keycloak logout fails', async () => {
      // Arrange
      req.user = {
        id: uuidv4(),
        sessionState: 'session-123'
      };
      req.body = {
        refresh_token: 'refresh-token-123'
      };

      mockLogoutUser.mockResolvedValue({ success: false, error: 'Keycloak error' });
      mockUserCompanyContext.destroy.mockResolvedValue(1);

      // Act
      await authController.logout(req, res);

      // Assert
      expect(mockUserCompanyContext.destroy).toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith('Keycloak logout failed, but continuing with cleanup', {
        requestId: 'test-request-id',
        userId: req.user.id,
        error: 'Keycloak error'
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});

