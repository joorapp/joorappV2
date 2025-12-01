/**
 * @author Bhavesh Venugopal
 * Admin Controller Tests
 * Tests for adminController endpoints
 */

import { jest, describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import {
  NotFoundError,
  ValidationError,
  BadRequestError,
  ForbiddenError
} from '../../../utils/errors.js';
import { createMockUser } from '../../../../__tests__/mocks/models/UserMock.js';
import { createMockCompany } from '../../../../__tests__/mocks/models/CompanyMock.js';
import { createMockCompanyUser } from '../../../../__tests__/mocks/models/CompanyUserMock.js';
import { createMockRole } from '../../../../__tests__/mocks/models/CompanyRoleMock.js';

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
const mockIsCompanyAdmin = jest.fn();
const mockBuildPaginationQuery = jest.fn();
const mockBuildSortQuery = jest.fn();

jest.unstable_mockModule('../../../utils/businessHelpers.js', () => ({
  isCompanyAdmin: mockIsCompanyAdmin,
  buildPaginationQuery: mockBuildPaginationQuery,
  buildSortQuery: mockBuildSortQuery
}));

// Mock services
const mockCreateUserInDB = jest.fn();
const mockCreateUserInKeycloak = jest.fn();
const mockCheckUserExistsInKeycloak = jest.fn();
const mockAssignUserToCompany = jest.fn();
const mockGetCompanyUsers = jest.fn();
const mockGetCompanyUserById = jest.fn();
const mockUpdateCompanyUser = jest.fn();
const mockRemoveUserFromCompany = jest.fn();
const mockUpdateUserRole = jest.fn();
const mockCheckUserInCompany = jest.fn();

jest.unstable_mockModule('../../../services/companyUserService.js', () => ({
  assignUserToCompany: mockAssignUserToCompany,
  getCompanyUsers: mockGetCompanyUsers,
  getCompanyUserById: mockGetCompanyUserById,
  updateCompanyUser: mockUpdateCompanyUser,
  removeUserFromCompany: mockRemoveUserFromCompany,
  updateUserRole: mockUpdateUserRole,
  checkUserInCompany: mockCheckUserInCompany
}));

const mockGetUserById = jest.fn();
const mockUpdateUserInKeycloak = jest.fn();
const mockUpdateUserInDB = jest.fn();

jest.unstable_mockModule('../../../services/userService.js', () => ({
  createUserInDB: mockCreateUserInDB,
  createUserInKeycloak: mockCreateUserInKeycloak,
  checkUserExistsInKeycloak: mockCheckUserExistsInKeycloak,
  getUserById: mockGetUserById,
  updateUserInKeycloak: mockUpdateUserInKeycloak,
  updateUserInDB: mockUpdateUserInDB
}));

let adminController;
let loggerUtils;
let responseHelpers;
let validators;
let businessHelpers;
let companyUserService;
let userService;

beforeAll(async () => {
  adminController = await import('../adminController.js');
  loggerUtils = await import('../../../utils/logger.js');
  responseHelpers = await import('../../../utils/responseHelpers.js');
  validators = await import('../../../utils/validators.js');
  businessHelpers = await import('../../../utils/businessHelpers.js');
  companyUserService = await import('../../../services/companyUserService.js');
  userService = await import('../../../services/userService.js');
});

describe('Admin Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      id: 'test-request-id',
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
      path: '/api/v2/admin',
      method: 'GET',
      body: {},
      params: {},
      query: {},
      user: createMockUser({ keycloakGlobalRole: 'COMPANY_ADMIN' }),
      company: createMockCompany()
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

    mockIsCompanyAdmin.mockReturnValue(true);
    mockBuildPaginationQuery.mockReturnValue({
      page: 1,
      limit: 10,
      offset: 0
    });
    mockBuildSortQuery.mockReturnValue([['email', 'ASC']]);
  });

  describe('getSettings', () => {
    it('should return system settings', async () => {
      // Act
      await adminController.getSettings(req, res);

      // Assert
      expect(mockSuccessResponse).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('updateSettings', () => {
    it('should update settings successfully', async () => {
      // Arrange
      req.body = {
        siteName: 'New Site Name',
        maintenanceMode: false,
        maxUsers: 2000
      };

      // Act
      await adminController.updateSettings(req, res);

      // Assert
      expect(mockLogBusiness).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should log security event when maintenance mode changes', async () => {
      // Arrange
      req.body = {
        maintenanceMode: true
      };

      // Act
      await adminController.updateSettings(req, res);

      // Assert
      expect(mockLogSecurity).toHaveBeenCalledWith('Maintenance mode changed', {
        requestId: 'test-request-id',
        userId: req.user.id,
        newValue: true
      });
    });
  });

  describe('getStats', () => {
    it('should return system statistics', async () => {
      // Act
      await adminController.getStats(req, res);

      // Assert
      expect(mockLogBusiness).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createUserInCompany', () => {
    it('should create user in company successfully', async () => {
      // Arrange
      req.body = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        roleId: uuidv4()
      };

      const mockKeycloakUser = { id: uuidv4() };
      const mockNewUser = createMockUser({ email: 'newuser@example.com' });
      const mockCompanyUser = createMockCompanyUser();

      mockCheckUserExistsInKeycloak.mockResolvedValue(null);
      mockCreateUserInKeycloak.mockResolvedValue(mockKeycloakUser);
      mockCreateUserInDB.mockResolvedValue(mockNewUser);
      mockAssignUserToCompany.mockResolvedValue(mockCompanyUser);

      // Act
      await adminController.createUserInCompany(req, res);

      // Assert
      expect(mockCheckUserExistsInKeycloak).toHaveBeenCalled();
      expect(mockCreateUserInKeycloak).toHaveBeenCalled();
      expect(mockCreateUserInDB).toHaveBeenCalled();
      expect(mockAssignUserToCompany).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should throw BadRequestError when company context is missing', async () => {
      // Arrange
      req.company = null;
      req.body = {
        email: 'user@example.com',
        password: 'password123'
      };

      // Act & Assert
      await expect(adminController.createUserInCompany(req, res)).rejects.toThrow(BadRequestError);
    });

    it('should throw ForbiddenError when user is not company admin', async () => {
      // Arrange
      req.user.keycloakGlobalRole = 'COMPANY_USER'; // Not admin
      req.body = {
        email: 'user@example.com',
        password: 'password123'
      };

      // Act & Assert
      await expect(adminController.createUserInCompany(req, res)).rejects.toThrow(ForbiddenError);
    });
  });

  describe('getCompanyUsers', () => {
    it('should return paginated list of company users', async () => {
      // Arrange
      req.query = { page: '1', limit: '10' };

      const mockResult = {
        users: [createMockCompanyUser(), createMockCompanyUser()],
        total: 2
      };

      mockGetCompanyUsers.mockResolvedValue(mockResult);

      // Act
      await adminController.getCompanyUsers(req, res);

      // Assert
      expect(mockGetCompanyUsers).toHaveBeenCalled();
      expect(mockPaginatedResponse).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should throw BadRequestError when company context is missing', async () => {
      // Arrange
      req.company = null;

      // Act & Assert
      await expect(adminController.getCompanyUsers(req, res)).rejects.toThrow(BadRequestError);
    });
  });

  describe('getCompanyUserById', () => {
    it('should return company user by ID', async () => {
      // Arrange
      const companyUserId = uuidv4();
      req.params = { id: companyUserId };

      const mockUser = createMockUser();
      const mockCompanyUser = createMockCompanyUser({ id: companyUserId });
      mockValidateUUID.mockImplementation(() => {});
      mockCheckUserInCompany.mockResolvedValue(true);
      mockGetUserById.mockResolvedValue(mockUser);
      mockGetCompanyUserById.mockResolvedValue(mockCompanyUser);

      // Act
      await adminController.getCompanyUserById(req, res);

      // Assert
      expect(mockValidateUUID).toHaveBeenCalledWith(companyUserId, 'id', 'test-request-id');
      expect(mockCheckUserInCompany).toHaveBeenCalledWith(companyUserId, req.company.id);
      expect(mockGetUserById).toHaveBeenCalledWith(companyUserId);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should throw BadRequestError when company context is missing', async () => {
      // Arrange
      req.company = null;
      req.params = { id: uuidv4() };

      // Act & Assert
      await expect(adminController.getCompanyUserById(req, res)).rejects.toThrow(BadRequestError);
    });
  });

  describe('updateCompanyUser', () => {
    it('should update company user successfully', async () => {
      // Arrange
      const companyUserId = uuidv4();
      req.params = { id: companyUserId };
      req.body = {
        isActive: false
      };

      const mockCurrentUser = createMockUser({ keycloakId: uuidv4() });
      const mockUpdatedCompanyUser = createMockCompanyUser({
        id: companyUserId,
        isActive: false
      });

      mockValidateUUID.mockImplementation(() => {});
      mockCheckUserInCompany.mockResolvedValue(true);
      mockGetUserById.mockResolvedValue(mockCurrentUser);
      mockUpdateUserInKeycloak.mockResolvedValue(undefined);
      mockUpdateUserInDB.mockResolvedValue(mockCurrentUser);
      mockUpdateCompanyUser.mockResolvedValue(mockUpdatedCompanyUser);

      // Act
      await adminController.updateCompanyUser(req, res);

      // Assert
      expect(mockCheckUserInCompany).toHaveBeenCalledWith(companyUserId, req.company.id);
      expect(mockGetUserById).toHaveBeenCalledWith(companyUserId);
      expect(mockUpdateUserInKeycloak).toHaveBeenCalled();
      expect(mockUpdateUserInDB).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should throw BadRequestError when company context is missing', async () => {
      // Arrange
      req.company = null;
      req.params = { id: uuidv4() };

      // Act & Assert
      await expect(adminController.updateCompanyUser(req, res)).rejects.toThrow(BadRequestError);
    });
  });

  describe('removeUserFromCompany', () => {
    it('should remove user from company successfully', async () => {
      // Arrange
      const companyUserId = uuidv4();
      req.params = { id: companyUserId };

      mockValidateUUID.mockImplementation(() => {});
      mockCheckUserInCompany.mockResolvedValue(true);
      mockRemoveUserFromCompany.mockResolvedValue(undefined);

      // Act
      await adminController.removeUserFromCompany(req, res);

      // Assert
      expect(mockCheckUserInCompany).toHaveBeenCalledWith(companyUserId, req.company.id);
      expect(mockRemoveUserFromCompany).toHaveBeenCalledWith(
        companyUserId,
        req.company.id,
        { userId: req.user.id }
      );
      expect(mockLogBusiness).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should throw BadRequestError when company context is missing', async () => {
      // Arrange
      req.company = null;
      req.params = { id: uuidv4() };

      // Act & Assert
      await expect(adminController.removeUserFromCompany(req, res)).rejects.toThrow(BadRequestError);
    });
  });

  describe('updateUserRole', () => {
    it('should update user role successfully', async () => {
      // Arrange
      const companyUserId = uuidv4();
      const roleId = uuidv4();
      req.params = { id: companyUserId };
      req.body = { roleId: roleId };

      const mockUpdatedCompanyUser = createMockCompanyUser({
        id: companyUserId,
        role: createMockRole({ id: roleId })
      });

      mockValidateUUID.mockImplementation(() => {});
      mockCheckUserInCompany.mockResolvedValue(true);
      mockUpdateUserRole.mockResolvedValue(mockUpdatedCompanyUser);

      // Act
      await adminController.updateUserRole(req, res);

      // Assert
      expect(mockCheckUserInCompany).toHaveBeenCalledWith(companyUserId, req.company.id);
      expect(mockUpdateUserRole).toHaveBeenCalledWith(
        companyUserId,
        req.company.id,
        roleId,
        { userId: req.user.id }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should throw BadRequestError when company context is missing', async () => {
      // Arrange
      req.company = null;
      req.params = { id: uuidv4() };

      // Act & Assert
      await expect(adminController.updateUserRole(req, res)).rejects.toThrow(BadRequestError);
    });
  });
});

