/**
 * @author Bhavesh Venugopal
 * Super Admin Controller Tests
 * Tests for superAdminController endpoints
 */

import { jest, describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import {
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
  ConflictError
} from '../../../utils/errors.js';
import { createMockUser } from '../../../../__tests__/mocks/models/UserMock.js';
import { createMockCompany } from '../../../../__tests__/mocks/models/CompanyMock.js';
import { createMockRole } from '../../../../__tests__/mocks/models/CompanyRoleMock.js';
import { createMockCompanyUser } from '../../../../__tests__/mocks/models/CompanyUserMock.js';

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
const mockIsSuperAdmin = jest.fn();
const mockBuildPaginationQuery = jest.fn();
const mockBuildSortQuery = jest.fn();

jest.unstable_mockModule('../../../utils/businessHelpers.js', () => ({
  buildPaginationQuery: mockBuildPaginationQuery,
  buildSortQuery: mockBuildSortQuery
}));

jest.unstable_mockModule('../../../constants/keycloakRoles.js', () => ({
  isSuperAdmin: mockIsSuperAdmin,
  KEYCLOAK_GLOBAL_ROLE_VALUES: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'COMPANY_USER']
}));

// Mock services
const mockCreateCompany = jest.fn();
const mockListCompanies = jest.fn();
const mockGetCompanyById = jest.fn();
const mockUpdateCompany = jest.fn();
const mockDeleteCompany = jest.fn();

jest.unstable_mockModule('../../../services/companyService.js', () => ({
  createCompany: mockCreateCompany,
  listCompanies: mockListCompanies,
  getCompanyById: mockGetCompanyById,
  updateCompany: mockUpdateCompany,
  deleteCompany: mockDeleteCompany
}));

const mockCreateRole = jest.fn();
const mockListRoles = jest.fn();
const mockGetRoleById = jest.fn();
const mockUpdateRole = jest.fn();
const mockDeleteRole = jest.fn();

jest.unstable_mockModule('../../../services/roleService.js', () => ({
  createRole: mockCreateRole,
  listRoles: mockListRoles,
  getRoleById: mockGetRoleById,
  updateRole: mockUpdateRole,
  deleteRole: mockDeleteRole
}));

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

const mockAssignUserToCompany = jest.fn();
const mockUpdateUserRole = jest.fn();

jest.unstable_mockModule('../../../services/companyUserService.js', () => ({
  assignUserToCompany: mockAssignUserToCompany,
  updateUserRole: mockUpdateUserRole
}));

let superAdminController;
let loggerUtils;
let responseHelpers;
let validators;
let businessHelpers;
let keycloakRoles;
let companyService;
let roleService;
let userService;
let companyUserService;

beforeAll(async () => {
  superAdminController = await import('../superAdminController.js');
  loggerUtils = await import('../../../utils/logger.js');
  responseHelpers = await import('../../../utils/responseHelpers.js');
  validators = await import('../../../utils/validators.js');
  businessHelpers = await import('../../../utils/businessHelpers.js');
  keycloakRoles = await import('../../../constants/keycloakRoles.js');
  companyService = await import('../../../services/companyService.js');
  roleService = await import('../../../services/roleService.js');
  userService = await import('../../../services/userService.js');
  companyUserService = await import('../../../services/companyUserService.js');
});

describe('Super Admin Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      id: 'test-request-id',
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
      path: '/api/v2/super-admin',
      method: 'GET',
      body: {},
      params: {},
      query: {},
      user: createMockUser({ keycloakGlobalRole: 'SUPER_ADMIN' })
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

    mockIsSuperAdmin.mockReturnValue(true);
    mockBuildPaginationQuery.mockReturnValue({
      page: 1,
      limit: 10,
      offset: 0
    });
    mockBuildSortQuery.mockReturnValue([['name', 'ASC']]);
  });

  describe('getUserInfo', () => {
    it('should return user info successfully', async () => {
      // Act
      await superAdminController.getUserInfo(req, res);

      // Assert
      expect(mockSuccessResponse).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should throw UnauthorizedError when user is not authenticated', async () => {
      // Arrange
      req.user = null;

      // Act & Assert
      await expect(superAdminController.getUserInfo(req, res)).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('getDashboard', () => {
    it('should return dashboard data successfully', async () => {
      // Act
      await superAdminController.getDashboard(req, res);

      // Assert
      expect(mockSuccessResponse).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should throw ForbiddenError when user is not super admin', async () => {
      // Arrange
      mockIsSuperAdmin.mockReturnValue(false);

      // Act & Assert
      await expect(superAdminController.getDashboard(req, res)).rejects.toThrow(ForbiddenError);
    });
  });

  describe('createCompany', () => {
    it('should create company successfully', async () => {
      // Arrange
      req.body = {
        name: 'New Company',
        description: 'New company description'
      };

      const mockNewCompany = createMockCompany({
        name: 'New Company'
      });

      mockValidateRequired.mockImplementation(() => {});
      mockValidateString.mockImplementation(() => {});
      mockCreateCompany.mockResolvedValue(mockNewCompany);

      // Act
      await superAdminController.createCompany(req, res);

      // Assert
      expect(mockCreateCompany).toHaveBeenCalled();
      expect(mockLogBusiness).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should throw ForbiddenError when user is not super admin', async () => {
      // Arrange
      mockIsSuperAdmin.mockReturnValue(false);
      req.body = { name: 'New Company' };

      // Act & Assert
      await expect(superAdminController.createCompany(req, res)).rejects.toThrow(ForbiddenError);
    });
  });

  describe('getCompanies', () => {
    it('should return paginated list of companies', async () => {
      // Arrange
      req.query = { page: '1', limit: '10' };

      const mockResult = {
        companies: [createMockCompany(), createMockCompany()],
        total: 2
      };

      mockListCompanies.mockResolvedValue(mockResult);

      // Act
      await superAdminController.getCompanies(req, res);

      // Assert
      expect(mockListCompanies).toHaveBeenCalled();
      expect(mockPaginatedResponse).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getCompanyById', () => {
    it('should return company by ID', async () => {
      // Arrange
      const companyId = uuidv4();
      req.params = { id: companyId };

      const mockCompany = createMockCompany({ id: companyId });
      mockValidateUUID.mockImplementation(() => {});
      mockGetCompanyById.mockResolvedValue(mockCompany);

      // Act
      await superAdminController.getCompanyById(req, res);

      // Assert
      expect(mockGetCompanyById).toHaveBeenCalledWith(companyId);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('updateCompany', () => {
    it('should update company successfully', async () => {
      // Arrange
      const companyId = uuidv4();
      req.params = { id: companyId };
      req.body = {
        name: 'Updated Company'
      };

      const mockUpdatedCompany = createMockCompany({
        id: companyId,
        name: 'Updated Company'
      });

      mockValidateUUID.mockImplementation(() => {});
      mockValidateString.mockImplementation(() => {});
      mockUpdateCompany.mockResolvedValue(mockUpdatedCompany);

      // Act
      await superAdminController.updateCompany(req, res);

      // Assert
      expect(mockUpdateCompany).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteCompany', () => {
    it('should delete company successfully', async () => {
      // Arrange
      const companyId = uuidv4();
      req.params = { id: companyId };

      mockValidateUUID.mockImplementation(() => {});
      mockDeleteCompany.mockResolvedValue(undefined);

      // Act
      await superAdminController.deleteCompany(req, res);

      // Assert
      expect(mockDeleteCompany).toHaveBeenCalledWith(companyId, { userId: req.user.id });
      expect(mockLogBusiness).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createRole', () => {
    it('should create role successfully', async () => {
      // Arrange
      req.body = {
        name: 'New Role',
        code: 'NEW_ROLE',
        description: 'New role description'
      };

      const mockNewRole = createMockRole({
        name: 'New Role',
        code: 'NEW_ROLE'
      });

      mockValidateRequired.mockImplementation(() => {});
      mockValidateString.mockImplementation(() => {});
      mockCreateRole.mockResolvedValue(mockNewRole);

      // Act
      await superAdminController.createRole(req, res);

      // Assert
      expect(mockCreateRole).toHaveBeenCalled();
      expect(mockLogBusiness).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('getRoles', () => {
    it('should return list of roles', async () => {
      // Arrange
      const mockResult = {
        roles: [createMockRole(), createMockRole()],
        total: 2
      };
      mockListRoles.mockResolvedValue(mockResult);

      // Act
      await superAdminController.getRoles(req, res);

      // Assert
      expect(mockListRoles).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getRoleById', () => {
    it('should return role by ID', async () => {
      // Arrange
      const roleId = uuidv4();
      req.params = { id: roleId };

      const mockRole = createMockRole({ id: roleId });
      mockValidateUUID.mockImplementation(() => {});
      mockGetRoleById.mockResolvedValue(mockRole);

      // Act
      await superAdminController.getRoleById(req, res);

      // Assert
      expect(mockGetRoleById).toHaveBeenCalledWith(roleId);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('updateRole', () => {
    it('should update role successfully', async () => {
      // Arrange
      const roleId = uuidv4();
      req.params = { id: roleId };
      req.body = {
        name: 'Updated Role'
      };

      const mockUpdatedRole = createMockRole({
        id: roleId,
        name: 'Updated Role'
      });

      mockValidateUUID.mockImplementation(() => {});
      mockValidateString.mockImplementation(() => {});
      mockUpdateRole.mockResolvedValue(mockUpdatedRole);

      // Act
      await superAdminController.updateRole(req, res);

      // Assert
      expect(mockUpdateRole).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteRole', () => {
    it('should delete role successfully', async () => {
      // Arrange
      const roleId = uuidv4();
      req.params = { id: roleId };

      mockValidateUUID.mockImplementation(() => {});
      mockDeleteRole.mockResolvedValue(undefined);

      // Act
      await superAdminController.deleteRole(req, res);

      // Assert
      expect(mockDeleteRole).toHaveBeenCalledWith(roleId, { userId: req.user.id });
      expect(mockLogBusiness).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createUserWithCompany', () => {
    it('should create user with company successfully', async () => {
      // Arrange
      req.body = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        companyId: uuidv4(),
        roleId: uuidv4(),
        keycloakGlobalRole: 'COMPANY_USER'
      };

      const mockKeycloakUser = { id: uuidv4() };
      const mockNewUser = createMockUser({ email: 'newuser@example.com' });
      const mockCompanyUser = createMockCompanyUser();

      mockValidateRequired.mockImplementation(() => {});
      mockValidateEmail.mockImplementation(() => {});
      mockValidateString.mockImplementation(() => {});
      mockValidateUUID.mockImplementation(() => {});
      mockValidateEnum.mockImplementation(() => {});
      mockCheckUserExistsInKeycloak.mockResolvedValue(null);
      mockCreateUserInKeycloak.mockResolvedValue(mockKeycloakUser);
      mockCreateUserInDB.mockResolvedValue(mockNewUser);
      mockAssignUserToCompany.mockResolvedValue(mockCompanyUser);

      // Act
      await superAdminController.createUserWithCompany(req, res);

      // Assert
      expect(mockCreateUserInKeycloak).toHaveBeenCalled();
      expect(mockCreateUserInDB).toHaveBeenCalled();
      expect(mockAssignUserToCompany).toHaveBeenCalled();
      expect(mockLogBusiness).toHaveBeenCalled();
      expect(mockLogSecurity).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('getUsers', () => {
    it('should return paginated list of users', async () => {
      // Arrange
      req.query = { page: '1', limit: '10' };

      const mockResult = {
        users: [createMockUser(), createMockUser()],
        total: 2
      };

      mockListUsers.mockResolvedValue(mockResult);

      // Act
      await superAdminController.getUsers(req, res);

      // Assert
      expect(mockListUsers).toHaveBeenCalled();
      expect(mockPaginatedResponse).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      // Arrange
      const userId = uuidv4();
      req.params = { id: userId };

      const mockUser = createMockUser({ id: userId });
      mockValidateUUID.mockImplementation(() => {});
      mockGetUserById.mockResolvedValue(mockUser);

      // Act
      await superAdminController.getUserById(req, res);

      // Assert
      expect(mockGetUserById).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(200);
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

      mockValidateUUID.mockImplementation(() => {});
      mockValidateString.mockImplementation(() => {});
      mockGetUserById.mockResolvedValue(mockCurrentUser);
      mockUpdateUserInKeycloak.mockResolvedValue(undefined);
      mockUpdateUserInDB.mockResolvedValue(mockUpdatedUser);

      // Act
      await superAdminController.updateUser(req, res);

      // Assert
      expect(mockUpdateUserInKeycloak).toHaveBeenCalled();
      expect(mockUpdateUserInDB).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('disableUser', () => {
    it('should disable user successfully', async () => {
      // Arrange
      const userId = uuidv4();
      req.params = { id: userId };

      const mockUser = createMockUser({ id: userId, keycloakId: uuidv4() });

      mockValidateUUID.mockImplementation(() => {});
      mockGetUserById.mockResolvedValue(mockUser);
      mockDeleteUserFromKeycloak.mockResolvedValue(undefined);
      mockDeleteUserFromDB.mockResolvedValue(undefined);

      // Act
      await superAdminController.disableUser(req, res);

      // Assert
      expect(mockGetUserById).toHaveBeenCalledWith(userId);
      expect(mockDeleteUserFromKeycloak).toHaveBeenCalledWith(mockUser.keycloakId);
      expect(mockDeleteUserFromDB).toHaveBeenCalledWith(userId, { userId: req.user.id });
      expect(mockLogBusiness).toHaveBeenCalled();
      expect(mockLogSecurity).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('assignUserToCompany', () => {
    it('should assign user to company successfully', async () => {
      // Arrange
      req.body = {
        userId: uuidv4(),
        companyId: uuidv4(),
        roleId: uuidv4()
      };

      const mockCompanyUser = createMockCompanyUser();

      mockValidateRequired.mockImplementation(() => {});
      mockValidateUUID.mockImplementation(() => {});
      mockAssignUserToCompany.mockResolvedValue(mockCompanyUser);

      // Act
      await superAdminController.assignUserToCompany(req, res);

      // Assert
      expect(mockAssignUserToCompany).toHaveBeenCalled();
      expect(mockLogBusiness).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('updateUserCompanyRole', () => {
    it('should update user company role successfully', async () => {
      // Arrange
      req.body = {
        userId: uuidv4(),
        companyId: uuidv4(),
        roleId: uuidv4()
      };

      const mockUpdatedCompanyUser = createMockCompanyUser();

      mockValidateRequired.mockImplementation(() => {});
      mockValidateUUID.mockImplementation(() => {});
      mockUpdateUserRole.mockResolvedValue(mockUpdatedCompanyUser);

      // Act
      await superAdminController.updateUserCompanyRole(req, res);

      // Assert
      expect(mockUpdateUserRole).toHaveBeenCalled();
      expect(mockLogBusiness).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});

