/**
 * @author Bhavesh Venugopal
 * User Controller Tests
 * Tests for userController endpoints
 */

import { jest, describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import {
  NotFoundError,
  ValidationError,
  ConflictError,
  BadRequestError,
  ForbiddenError
} from '../../../utils/errors.js';
import { createMockUser } from '../../../../__tests__/mocks/models/UserMock.js';

// Mock logger
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
};

const mockCreateModuleLogger = jest.fn(() => mockLogger);
const mockLogPerformance = jest.fn();
const mockLogBusiness = jest.fn();
const mockLogSecurity = jest.fn();

jest.unstable_mockModule('../../../utils/logger.js', () => ({
  createModuleLogger: mockCreateModuleLogger,
  logPerformance: mockLogPerformance,
  logBusiness: mockLogBusiness,
  logSecurity: mockLogSecurity
}));

// Mock responseHelpers
const mockSuccessResponse = jest.fn();
const mockPaginatedResponse = jest.fn();

jest.unstable_mockModule('../../../utils/responseHelpers.js', () => ({
  successResponse: mockSuccessResponse,
  paginatedResponse: mockPaginatedResponse
}));

// Mock validators
const mockValidateUUID = jest.fn();
const mockValidateEmail = jest.fn();
const mockValidateRequired = jest.fn();
const mockValidateString = jest.fn();
const mockValidateEnum = jest.fn();

jest.unstable_mockModule('../../../utils/validators.js', () => ({
  validateUUID: mockValidateUUID,
  validateEmail: mockValidateEmail,
  validateRequired: mockValidateRequired,
  validateString: mockValidateString,
  validateEnum: mockValidateEnum
}));

// Mock businessHelpers
const mockBuildPaginationQuery = jest.fn();
const mockBuildFilterQuery = jest.fn();
const mockBuildSortQuery = jest.fn();

jest.unstable_mockModule('../../../utils/businessHelpers.js', () => ({
  buildPaginationQuery: mockBuildPaginationQuery,
  buildFilterQuery: mockBuildFilterQuery,
  buildSortQuery: mockBuildSortQuery
}));

// Mock keycloakRoles
jest.unstable_mockModule('../../../constants/keycloakRoles.js', () => ({
  KEYCLOAK_GLOBAL_ROLE_VALUES: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'COMPANY_USER']
}));

// Mock userService
const mockListUsers = jest.fn();
const mockGetUserById = jest.fn();
const mockCreateUserInDB = jest.fn();
const mockCreateUserInKeycloak = jest.fn();
const mockCheckUserExistsInKeycloak = jest.fn();
const mockUpdateUserInDB = jest.fn();
const mockUpdateUserInKeycloak = jest.fn();
const mockDeleteUserFromKeycloak = jest.fn();
const mockDeleteUserFromDB = jest.fn();

jest.unstable_mockModule('../../../services/userService.js', () => ({
  listUsers: mockListUsers,
  getUserById: mockGetUserById,
  createUserInDB: mockCreateUserInDB,
  createUserInKeycloak: mockCreateUserInKeycloak,
  checkUserExistsInKeycloak: mockCheckUserExistsInKeycloak,
  updateUserInDB: mockUpdateUserInDB,
  updateUserInKeycloak: mockUpdateUserInKeycloak,
  deleteUserFromKeycloak: mockDeleteUserFromKeycloak,
  deleteUserFromDB: mockDeleteUserFromDB
}));

let userController;
let loggerUtils;
let responseHelpers;
let validators;
let businessHelpers;
let keycloakRoles;
let userService;

beforeAll(async () => {
  userController = await import('../userController.js');
  loggerUtils = await import('../../../utils/logger.js');
  responseHelpers = await import('../../../utils/responseHelpers.js');
  validators = await import('../../../utils/validators.js');
  businessHelpers = await import('../../../utils/businessHelpers.js');
  keycloakRoles = await import('../../../constants/keycloakRoles.js');
  userService = await import('../../../services/userService.js');
});

describe('User Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      id: 'test-request-id',
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
      path: '/api/v2/users',
      method: 'GET',
      body: {},
      params: {},
      query: {},
      user: { id: uuidv4() }
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

    mockPaginatedResponse.mockReturnValue({
      success: true,
      message: 'Success',
      data: [],
      meta: {}
    });

    mockBuildPaginationQuery.mockReturnValue({
      page: 1,
      limit: 10,
      offset: 0
    });

    mockBuildSortQuery.mockReturnValue([['email', 'ASC']]);
  });

  describe('getUsers', () => {
    it('should return paginated list of users', async () => {
      // Arrange
      req.query = { page: '1', limit: '10', search: 'test' };

      const mockResult = {
        users: [createMockUser(), createMockUser()],
        total: 2
      };

      mockListUsers.mockResolvedValue(mockResult);

      // Act
      await userController.getUsers(req, res);

      // Assert
      expect(mockBuildPaginationQuery).toHaveBeenCalled();
      expect(mockBuildSortQuery).toHaveBeenCalled();
      expect(mockListUsers).toHaveBeenCalledWith(
        { search: 'test' },
        { page: 1, limit: 10, offset: 0 },
        [['email', 'ASC']]
      );
      expect(mockPaginatedResponse).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should log business event when users are retrieved', async () => {
      // Arrange
      mockListUsers.mockResolvedValue({
        users: [createMockUser()],
        total: 1
      });

      // Act
      await userController.getUsers(req, res);

      // Assert
      expect(mockLogBusiness).toHaveBeenCalledWith('Users list accessed', {
        requestId: 'test-request-id',
        userId: req.user.id,
        totalUsers: 1,
        filters: { page: 1, limit: 10, search: '' }
      });
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      // Arrange
      const userId = uuidv4();
      req.params = { id: userId };

      const mockUser = createMockUser({ id: userId });
      mockGetUserById.mockResolvedValue(mockUser);

      // Act
      await userController.getUserById(req, res);

      // Assert
      expect(mockValidateUUID).toHaveBeenCalledWith(userId, 'id', 'test-request-id');
      expect(mockGetUserById).toHaveBeenCalledWith(userId);
      expect(mockSuccessResponse).toHaveBeenCalledWith(
        'User retrieved successfully',
        mockUser,
        {},
        req,
        expect.any(Number)
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should throw ValidationError when ID is invalid', async () => {
      // Arrange
      req.params = { id: 'invalid-id' };
      mockValidateUUID.mockImplementation(() => {
        throw new ValidationError('Invalid UUID format');
      });

      // Act & Assert
      await expect(userController.getUserById(req, res)).rejects.toThrow(ValidationError);
      expect(mockGetUserById).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when user does not exist', async () => {
      // Arrange
      const userId = uuidv4();
      req.params = { id: userId };
      mockValidateUUID.mockImplementation(() => {}); // Don't throw
      mockGetUserById.mockRejectedValue(new NotFoundError('User', userId));

      // Act & Assert
      await expect(userController.getUserById(req, res)).rejects.toThrow(NotFoundError);
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      // Arrange
      req.body = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        keycloakGlobalRole: 'COMPANY_USER'
      };

      const mockKeycloakUser = { id: uuidv4(), email: 'newuser@example.com' };
      const mockNewUser = createMockUser({
        email: 'newuser@example.com',
        firstName: 'John',
        lastName: 'Doe'
      });

      mockCheckUserExistsInKeycloak.mockResolvedValue(null);
      mockCreateUserInKeycloak.mockResolvedValue(mockKeycloakUser);
      mockCreateUserInDB.mockResolvedValue(mockNewUser);

      // Act
      await userController.createUser(req, res);

      // Assert
      expect(mockValidateRequired).toHaveBeenCalledWith(
        { email: 'newuser@example.com', password: 'password123' },
        'test-request-id'
      );
      expect(mockValidateEmail).toHaveBeenCalledWith('newuser@example.com', 'email', 'test-request-id');
      expect(mockCheckUserExistsInKeycloak).toHaveBeenCalledWith('newuser@example.com');
      expect(mockCreateUserInKeycloak).toHaveBeenCalled();
      expect(mockCreateUserInDB).toHaveBeenCalled();
      expect(mockLogBusiness).toHaveBeenCalled();
      expect(mockLogSecurity).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should sync existing Keycloak user to database', async () => {
      // Arrange
      req.body = {
        email: 'existing@example.com',
        password: 'password123'
      };

      const mockKeycloakUser = { id: uuidv4(), email: 'existing@example.com' };
      const mockNewUser = createMockUser({ email: 'existing@example.com' });

      mockCheckUserExistsInKeycloak.mockResolvedValue(mockKeycloakUser);
      mockCreateUserInDB.mockResolvedValue(mockNewUser);

      // Act
      await userController.createUser(req, res);

      // Assert
      expect(mockCreateUserInKeycloak).not.toHaveBeenCalled();
      expect(mockCreateUserInDB).toHaveBeenCalledWith(
        expect.objectContaining({ keycloakId: mockKeycloakUser.id }),
        { userId: req.user.id }
      );
    });

    it('should throw ValidationError when email is missing', async () => {
      // Arrange
      req.body = { password: 'password123' };
      mockValidateRequired.mockImplementation(() => {
        throw new ValidationError('Email is required');
      });

      // Act & Assert
      await expect(userController.createUser(req, res)).rejects.toThrow(ValidationError);
      expect(mockCheckUserExistsInKeycloak).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when password is too short', async () => {
      // Arrange
      req.body = {
        email: 'user@example.com',
        password: '123'
      };

      mockValidateRequired.mockImplementation(() => {});
      mockValidateEmail.mockImplementation(() => {});
      mockValidateString.mockImplementation(() => {
        throw new ValidationError('Password must be at least 8 characters');
      });

      // Act & Assert
      await expect(userController.createUser(req, res)).rejects.toThrow(ValidationError);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      // Arrange
      const userId = uuidv4();
      req.params = { id: userId };
      req.body = {
        firstName: 'Updated',
        lastName: 'Name'
      };

      const mockCurrentUser = createMockUser({ id: userId });
      const mockUpdatedUser = createMockUser({
        id: userId,
        firstName: 'Updated',
        lastName: 'Name'
      });

      mockValidateUUID.mockImplementation(() => {}); // Don't throw
      mockValidateString.mockImplementation(() => {}); // Don't throw
      mockGetUserById.mockResolvedValue(mockCurrentUser);
      mockUpdateUserInKeycloak.mockResolvedValue(undefined);
      mockUpdateUserInDB.mockResolvedValue(mockUpdatedUser);

      // Act
      await userController.updateUser(req, res);

      // Assert
      expect(mockValidateUUID).toHaveBeenCalledWith(userId, 'id', 'test-request-id');
      expect(mockGetUserById).toHaveBeenCalledWith(userId);
      expect(mockUpdateUserInKeycloak).toHaveBeenCalled();
      expect(mockUpdateUserInDB).toHaveBeenCalledWith(
        userId,
        { firstName: 'Updated', lastName: 'Name' },
        { userId: req.user.id }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should update user in Keycloak when email or password changes', async () => {
      // Arrange
      const userId = uuidv4();
      req.params = { id: userId };
      req.body = {
        email: 'newemail@example.com',
        password: 'newpassword123'
      };

      const mockCurrentUser = createMockUser({ id: userId });
      const mockUpdatedUser = createMockUser({ id: userId, email: 'newemail@example.com' });

      mockValidateUUID.mockImplementation(() => {}); // Don't throw
      mockValidateEmail.mockImplementation(() => {}); // Don't throw
      mockValidateString.mockImplementation(() => {}); // Don't throw
      mockGetUserById.mockResolvedValue(mockCurrentUser);
      mockUpdateUserInKeycloak.mockResolvedValue(undefined);
      mockUpdateUserInDB.mockResolvedValue(mockUpdatedUser);

      // Act
      await userController.updateUser(req, res);

      // Assert
      expect(mockUpdateUserInKeycloak).toHaveBeenCalled();
      expect(mockLogSecurity).toHaveBeenCalledWith('User password changed', {
        requestId: 'test-request-id',
        userId: req.user.id,
        targetUserId: userId
      });
    });

    it('should throw NotFoundError when user does not exist', async () => {
      // Arrange
      const userId = uuidv4();
      req.params = { id: userId };
      req.body = { firstName: 'Updated' };

      mockValidateUUID.mockImplementation(() => {}); // Don't throw
      mockGetUserById.mockRejectedValue(new NotFoundError('User', userId));

      // Act & Assert
      await expect(userController.updateUser(req, res)).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      // Arrange
      const userId = uuidv4();
      req.params = { id: userId };

      const mockUser = createMockUser({ id: userId, keycloakId: uuidv4() });

      mockValidateUUID.mockImplementation(() => {}); // Don't throw
      mockGetUserById.mockResolvedValue(mockUser);
      mockDeleteUserFromKeycloak.mockResolvedValue(undefined);
      mockDeleteUserFromDB.mockResolvedValue(undefined);

      // Act
      await userController.deleteUser(req, res);

      // Assert
      expect(mockValidateUUID).toHaveBeenCalledWith(userId, 'id', 'test-request-id');
      expect(mockGetUserById).toHaveBeenCalledWith(userId);
      expect(mockDeleteUserFromKeycloak).toHaveBeenCalledWith(mockUser.keycloakId);
      expect(mockDeleteUserFromDB).toHaveBeenCalledWith(userId, { userId: req.user.id });
      expect(mockLogBusiness).toHaveBeenCalled();
      expect(mockLogSecurity).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      // Arrange
      const userId = uuidv4();
      req.params = { id: userId };

      mockValidateUUID.mockImplementation(() => {}); // Don't throw
      mockGetUserById.mockRejectedValue(new NotFoundError('User', userId));

      // Act & Assert
      await expect(userController.deleteUser(req, res)).rejects.toThrow(NotFoundError);
    });

    it('should throw BadRequestError when user tries to delete themselves', async () => {
      // Arrange
      const userId = req.user.id;
      req.params = { id: userId };

      mockValidateUUID.mockImplementation(() => {}); // Don't throw

      // Act & Assert
      await expect(userController.deleteUser(req, res)).rejects.toThrow(BadRequestError);
      expect(mockGetUserById).not.toHaveBeenCalled();
    });
  });
});

