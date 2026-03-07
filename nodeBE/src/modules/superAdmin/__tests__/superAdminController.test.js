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
import { COMPANY_STATUSES, COMPANY_STATUS_DEFAULT } from '../../../constants/companyStatus.js';

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
const mockValidateNumber = jest.fn();

jest.unstable_mockModule('../../../utils/validators.js', () => ({
  validateUUID: mockValidateUUID,
  validateEmail: mockValidateEmail,
  validateRequired: mockValidateRequired,
  validateString: mockValidateString,
  validateEnum: mockValidateEnum,
  validateNumber: mockValidateNumber
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
const mockGetCompanyByEmail = jest.fn();

jest.unstable_mockModule('../../../services/companyService.js', () => ({
  createCompany: mockCreateCompany,
  listCompanies: mockListCompanies,
  getCompanyById: mockGetCompanyById,
  updateCompany: mockUpdateCompany,
  deleteCompany: mockDeleteCompany,
  getCompanyByEmail: mockGetCompanyByEmail
}));

const mockCreateRole = jest.fn();
const mockListRoles = jest.fn();
const mockGetRoleById = jest.fn();
const mockUpdateRole = jest.fn();
const mockDeleteRole = jest.fn();
const mockGetRoleByCode = jest.fn();

jest.unstable_mockModule('../../../services/roleService.js', () => ({
  createRole: mockCreateRole,
  listRoles: mockListRoles,
  getRoleById: mockGetRoleById,
  updateRole: mockUpdateRole,
  deleteRole: mockDeleteRole,
  getRoleByCode: mockGetRoleByCode
}));

const mockListUsers = jest.fn();
const mockGetUserById = jest.fn();
const mockListUsersWithCompanies = jest.fn();
const mockGetUserByIdWithCompanies = jest.fn();
const mockCreateUserInDB = jest.fn();
const mockCreateUserInKeycloak = jest.fn();
const mockCheckUserExistsInKeycloak = jest.fn();
const mockGetUserByEmail = jest.fn();
const mockUpdateUserInDB = jest.fn();
const mockUpdateUserInKeycloak = jest.fn();
const mockDeleteUserFromKeycloak = jest.fn();
const mockDeleteUserFromDB = jest.fn();
const mockEnableUserInKeycloak = jest.fn();
const mockEnableUserInDB = jest.fn();

jest.unstable_mockModule('../../../services/userService.js', () => ({
  listUsers: mockListUsers,
  getUserById: mockGetUserById,
  listUsersWithCompanies: mockListUsersWithCompanies,
  getUserByIdWithCompanies: mockGetUserByIdWithCompanies,
  createUserInDB: mockCreateUserInDB,
  createUserInKeycloak: mockCreateUserInKeycloak,
  checkUserExistsInKeycloak: mockCheckUserExistsInKeycloak,
  getUserByEmail: mockGetUserByEmail,
  updateUserInDB: mockUpdateUserInDB,
  updateUserInKeycloak: mockUpdateUserInKeycloak,
  deleteUserFromKeycloak: mockDeleteUserFromKeycloak,
  deleteUserFromDB: mockDeleteUserFromDB,
  enableUserInKeycloak: mockEnableUserInKeycloak,
  enableUserInDB: mockEnableUserInDB
}));

const mockAssignUserToCompany = jest.fn();
const mockUpdateUserRole = jest.fn();

jest.unstable_mockModule('../../../services/companyUserService.js', () => ({
  assignUserToCompany: mockAssignUserToCompany,
  updateUserRole: mockUpdateUserRole
}));

const mockCreatePlan = jest.fn();
const mockListPlans = jest.fn();
const mockGetPlanById = jest.fn();
const mockUpdatePlan = jest.fn();
const mockDeletePlan = jest.fn();

jest.unstable_mockModule('../../../services/planService.js', () => ({
  createPlan: mockCreatePlan,
  listPlans: mockListPlans,
  getPlanById: mockGetPlanById,
  updatePlan: mockUpdatePlan,
  deletePlan: mockDeletePlan
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
let planService;

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
  planService = await import('../../../services/planService.js');
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
    it('should create company and admin user successfully', async () => {
      // Arrange
      req.body = {
        name: 'New Company',
        description: 'New company description',
        email: 'admin@newcompany.com'
      };

      const mockNewCompany = createMockCompany({
        name: 'New Company',
        email: 'admin@newcompany.com'
      });
      
      const mockRole = createMockRole({ code: 'COMPANY_ADMIN' });
      const mockKeycloakUser = { id: uuidv4() };
      const mockNewUser = createMockUser({ email: 'admin@newcompany.com' });

      mockValidateRequired.mockImplementation(() => {});
      mockValidateString.mockImplementation(() => {});
      mockValidateEmail.mockImplementation(() => {});
      
      mockGetCompanyByEmail.mockResolvedValue(null);
      mockCheckUserExistsInKeycloak.mockResolvedValue(null);
      mockGetUserByEmail.mockResolvedValue(null);
      mockGetRoleByCode.mockResolvedValue(mockRole);
      
      mockCreateCompany.mockResolvedValue(mockNewCompany);
      mockCreateUserInKeycloak.mockResolvedValue(mockKeycloakUser);
      mockCreateUserInDB.mockResolvedValue(mockNewUser);
      mockAssignUserToCompany.mockResolvedValue({});

      // Act
      await superAdminController.createCompany(req, res);

      // Assert
      expect(mockGetCompanyByEmail).toHaveBeenCalledWith('admin@newcompany.com');
      expect(mockCheckUserExistsInKeycloak).toHaveBeenCalledWith('admin@newcompany.com');
      expect(mockCreateCompany).toHaveBeenCalled();
      expect(mockCreateUserInKeycloak).toHaveBeenCalledWith(expect.objectContaining({
        email: 'admin@newcompany.com',
        password: 'admin',
        firstName: 'New Company',
        lastName: 'Admin',
        keycloakGlobalRole: 'COMPANY_ADMIN'
      }));
      expect(mockCreateUserInDB).toHaveBeenCalled();
      expect(mockAssignUserToCompany).toHaveBeenCalledWith(
        mockNewUser.id,
        mockNewCompany.id,
        mockRole.id,
        expect.objectContaining({ userId: req.user.id })
      );
      expect(mockLogBusiness).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should throw ConflictError if company with email already exists', async () => {
      // Arrange
      req.body = {
        name: 'New Company',
        email: 'admin@newcompany.com'
      };

      mockValidateRequired.mockImplementation(() => {});
      mockValidateString.mockImplementation(() => {});
      mockValidateEmail.mockImplementation(() => {});
      
      mockGetCompanyByEmail.mockResolvedValue({ id: uuidv4(), email: 'admin@newcompany.com' });

      // Act & Assert
      await expect(superAdminController.createCompany(req, res)).rejects.toThrow(ConflictError);
      expect(mockCreateCompany).not.toHaveBeenCalled();
    });

    it('should throw ConflictError if user with email already exists', async () => {
      // Arrange
      req.body = {
        name: 'New Company',
        email: 'admin@newcompany.com'
      };

      mockValidateRequired.mockImplementation(() => {});
      mockValidateString.mockImplementation(() => {});
      mockValidateEmail.mockImplementation(() => {});
      
      mockGetCompanyByEmail.mockResolvedValue(null);
      mockCheckUserExistsInKeycloak.mockResolvedValue(null);
      mockGetUserByEmail.mockResolvedValue({ id: uuidv4(), email: 'admin@newcompany.com' });

      // Act & Assert
      await expect(superAdminController.createCompany(req, res)).rejects.toThrow(ConflictError);
      expect(mockCreateCompany).not.toHaveBeenCalled();
    });

    it('should throw ConflictError if COMPANY_ADMIN role does not exist', async () => {
      // Arrange
      req.body = {
        name: 'New Company',
        email: 'admin@newcompany.com'
      };

      mockValidateRequired.mockImplementation(() => {});
      mockValidateString.mockImplementation(() => {});
      mockValidateEmail.mockImplementation(() => {});
      
      mockGetCompanyByEmail.mockResolvedValue(null);
      mockCheckUserExistsInKeycloak.mockResolvedValue(null);
      mockGetUserByEmail.mockResolvedValue(null);
      mockGetRoleByCode.mockResolvedValue(null); // Role not found

      // Act & Assert
      await expect(superAdminController.createCompany(req, res)).rejects.toThrow(ConflictError);
      expect(mockCreateCompany).not.toHaveBeenCalled();
    });

    it('should create company with all new fields', async () => {
      // Arrange
      req.body = {
        name: 'New Company',
        email: 'contact@example.com',
        phone: '+1 234-567-8900',
        buildingAddress: 'Suite 100',
        streetAddress: '123 Main Street',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'United States',
        logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        status: 'ACTIVE'
      };

      const mockNewCompany = createMockCompany({
        name: 'New Company',
        email: 'contact@example.com',
        phone: '+1 234-567-8900',
        status: 'ACTIVE'
      });

      mockValidateRequired.mockImplementation(() => {});
      mockValidateString.mockImplementation(() => {});
      mockValidateEmail.mockImplementation(() => {});
      mockValidateEnum.mockImplementation(() => {});
      
      mockGetCompanyByEmail.mockResolvedValue(null);
      mockCheckUserExistsInKeycloak.mockResolvedValue(null);
      mockGetUserByEmail.mockResolvedValue(null);
      mockGetRoleByCode.mockResolvedValue(createMockRole({ code: 'COMPANY_ADMIN' }));

      mockCreateCompany.mockResolvedValue(mockNewCompany);
      mockCreateUserInKeycloak.mockResolvedValue({ id: uuidv4() });
      mockCreateUserInDB.mockResolvedValue(createMockUser({ email: 'contact@example.com' }));
      mockAssignUserToCompany.mockResolvedValue({});

      // Act
      await superAdminController.createCompany(req, res);

      // Assert
      expect(mockValidateRequired).toHaveBeenCalled();
      expect(mockValidateString).toHaveBeenCalled();
      expect(mockValidateEmail).toHaveBeenCalled();
      expect(mockValidateEnum).toHaveBeenCalledWith('ACTIVE', COMPANY_STATUSES, 'status', req.id);
      expect(mockCreateCompany).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Company',
          email: 'contact@example.com',
          phone: '+1 234-567-8900',
          buildingAddress: 'Suite 100',
          streetAddress: '123 Main Street',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'United States',
          logo: expect.stringContaining('data:image/png;base64,'),
          status: 'ACTIVE'
        }),
        expect.objectContaining({ userId: req.user.id })
      );
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
      req.query = {};

      const mockCompany = createMockCompany({ id: companyId });
      mockValidateUUID.mockImplementation(() => {});
      mockGetCompanyById.mockResolvedValue(mockCompany);

      // Act
      await superAdminController.getCompanyById(req, res);

      // Assert
      expect(mockGetCompanyById).toHaveBeenCalledWith(companyId, { includeLogo: false });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should include logo when includeLogo=true', async () => {
      // Arrange
      const companyId = uuidv4();
      req.params = { id: companyId };
      req.query = { includeLogo: 'true' };

      const mockCompany = createMockCompany({
        id: companyId,
        logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      });
      mockValidateUUID.mockImplementation(() => {});
      mockGetCompanyById.mockResolvedValue(mockCompany);

      // Act
      await superAdminController.getCompanyById(req, res);

      // Assert
      expect(mockGetCompanyById).toHaveBeenCalledWith(companyId, { includeLogo: true });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should exclude logo when includeLogo=false', async () => {
      // Arrange
      const companyId = uuidv4();
      req.params = { id: companyId };
      req.query = { includeLogo: 'false' };

      const mockCompany = createMockCompany({ id: companyId });
      mockValidateUUID.mockImplementation(() => {});
      mockGetCompanyById.mockResolvedValue(mockCompany);

      // Act
      await superAdminController.getCompanyById(req, res);

      // Assert
      expect(mockGetCompanyById).toHaveBeenCalledWith(companyId, { includeLogo: false });
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

    it('should update company with all new fields', async () => {
      // Arrange
      const companyId = uuidv4();
      req.params = { id: companyId };
      req.body = {
        email: 'newemail@example.com',
        phone: '+1 555-123-4567',
        buildingAddress: 'Suite 200',
        streetAddress: '456 Oak Avenue',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90001',
        country: 'United States',
        status: 'ACTIVE'
      };

      const mockUpdatedCompany = createMockCompany({
        id: companyId,
        email: 'newemail@example.com',
        phone: '+1 555-123-4567',
        status: 'ACTIVE'
      });

      mockValidateUUID.mockImplementation(() => {});
      mockValidateString.mockImplementation(() => {});
      mockValidateEmail.mockImplementation(() => {});
      mockValidateEnum.mockImplementation(() => {});
      mockUpdateCompany.mockResolvedValue(mockUpdatedCompany);

      // Act
      await superAdminController.updateCompany(req, res);

      // Assert
      expect(mockValidateEmail).toHaveBeenCalled();
      expect(mockValidateEnum).toHaveBeenCalledWith('ACTIVE', COMPANY_STATUSES, 'status', req.id);
      expect(mockUpdateCompany).toHaveBeenCalledWith(
        companyId,
        expect.objectContaining({
          email: 'newemail@example.com',
          phone: '+1 555-123-4567',
          buildingAddress: 'Suite 200',
          streetAddress: '456 Oak Avenue',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90001',
          country: 'United States',
          status: 'ACTIVE'
        }),
        expect.objectContaining({ userId: req.user.id })
      );
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
      const mockUserWithCompanies = {
        ...mockNewUser,
        companies: []
      };

      mockValidateRequired.mockImplementation(() => {});
      mockValidateEmail.mockImplementation(() => {});
      mockValidateString.mockImplementation(() => {});
      mockValidateUUID.mockImplementation(() => {});
      mockValidateEnum.mockImplementation(() => {});
      mockCheckUserExistsInKeycloak.mockResolvedValue(null);
      mockCreateUserInKeycloak.mockResolvedValue(mockKeycloakUser);
      mockCreateUserInDB.mockResolvedValue(mockNewUser);
      mockAssignUserToCompany.mockResolvedValue(mockCompanyUser);
      mockGetUserByIdWithCompanies.mockResolvedValue(mockUserWithCompanies);

      // Act
      await superAdminController.createUserWithCompany(req, res);

      // Assert
      expect(mockCreateUserInKeycloak).toHaveBeenCalled();
      expect(mockCreateUserInDB).toHaveBeenCalled();
      expect(mockAssignUserToCompany).toHaveBeenCalled();
      expect(mockGetUserByIdWithCompanies).toHaveBeenCalledWith(mockNewUser.id, { includeLogo: false });
      expect(mockLogBusiness).toHaveBeenCalled();
      expect(mockLogSecurity).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('getUsers', () => {
    it('should return paginated list of users with companies', async () => {
      // Arrange
      req.query = { page: '1', limit: '10' };

      const mockResult = {
        users: [
          { ...createMockUser(), companies: [] },
          { ...createMockUser(), companies: [] }
        ],
        total: 2
      };

      mockBuildPaginationQuery.mockReturnValue({ page: 1, limit: 10, offset: 0 });
      mockBuildSortQuery.mockReturnValue([['email', 'ASC']]);
      mockListUsersWithCompanies.mockResolvedValue(mockResult);

      // Act
      await superAdminController.getUsers(req, res);

      // Assert
      expect(mockListUsersWithCompanies).toHaveBeenCalled();
      expect(mockPaginatedResponse).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getUserById', () => {
    it('should return user by ID with companies including logo', async () => {
      // Arrange
      const userId = uuidv4();
      req.params = { id: userId };

      const mockUser = {
        ...createMockUser({ id: userId }),
        companies: []
      };
      mockValidateUUID.mockImplementation(() => {});
      mockGetUserByIdWithCompanies.mockResolvedValue(mockUser);

      // Act
      await superAdminController.getUserById(req, res);

      // Assert
      expect(mockGetUserByIdWithCompanies).toHaveBeenCalledWith(userId, { includeLogo: true });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully and return user with companies', async () => {
      // Arrange
      const userId = uuidv4();
      req.params = { id: userId };
      req.body = {
        firstName: 'Updated',
        lastName: 'Name'
      };

      const mockCurrentUser = createMockUser({ id: userId });
      const mockUpdatedUser = {
        ...createMockUser({
          id: userId,
          firstName: 'Updated',
          lastName: 'Name'
        }),
        companies: []
      };

      mockValidateUUID.mockImplementation(() => {});
      mockValidateString.mockImplementation(() => {});
      mockGetUserById.mockResolvedValue(mockCurrentUser);
      mockUpdateUserInKeycloak.mockResolvedValue(undefined);
      mockUpdateUserInDB.mockResolvedValue(undefined);
      mockGetUserByIdWithCompanies.mockResolvedValue(mockUpdatedUser);

      // Act
      await superAdminController.updateUser(req, res);

      // Assert
      expect(mockUpdateUserInKeycloak).toHaveBeenCalled();
      expect(mockUpdateUserInDB).toHaveBeenCalled();
      expect(mockGetUserByIdWithCompanies).toHaveBeenCalledWith(userId, { includeLogo: false });
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

  describe('enableUser', () => {
    it('should enable user successfully', async () => {
      // Arrange
      const userId = uuidv4();
      req.params = { id: userId };

      const mockUser = createMockUser({ id: userId, keycloakId: uuidv4() });

      mockValidateUUID.mockImplementation(() => {});
      mockGetUserById.mockResolvedValue(mockUser);
      mockEnableUserInKeycloak.mockResolvedValue(undefined);
      mockEnableUserInDB.mockResolvedValue(undefined);

      // Act
      await superAdminController.enableUser(req, res);

      // Assert
      expect(mockGetUserById).toHaveBeenCalledWith(userId);
      expect(mockEnableUserInKeycloak).toHaveBeenCalledWith(mockUser.keycloakId);
      expect(mockEnableUserInDB).toHaveBeenCalledWith(userId, { userId: req.user.id });
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

  describe('createPlan', () => {
    it('should create plan successfully', async () => {
      // Arrange
      req.body = {
        name: 'Premium Plan',
        code: 'PREMIUM',
        description: 'Premium subscription plan',
        price: 99.99,
        isActive: true
      };

      const mockPlan = {
        id: uuidv4(),
        name: 'Premium Plan',
        code: 'PREMIUM',
        price: 99.99
      };

      mockValidateRequired.mockImplementation(() => {});
      mockValidateString.mockImplementation(() => {});
      mockValidateNumber.mockImplementation(() => {});
      mockCreatePlan.mockResolvedValue(mockPlan);

      // Act
      await superAdminController.createPlan(req, res);

      // Assert
      expect(mockValidateRequired).toHaveBeenCalled();
      expect(mockValidateString).toHaveBeenCalled();
      expect(mockValidateNumber).toHaveBeenCalled();
      expect(mockCreatePlan).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Premium Plan',
          code: 'PREMIUM',
          price: 99.99
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should validate price minimum value', async () => {
      // Arrange
      req.body = {
        name: 'Test Plan',
        code: 'TEST',
        price: -10.00
      };

      mockValidateRequired.mockImplementation(() => {});
      mockValidateString.mockImplementation(() => {});
      mockValidateNumber.mockImplementation(() => {
        throw new Error('Price must be at least 0');
      });

      // Act & Assert
      await expect(
        superAdminController.createPlan(req, res)
      ).rejects.toThrow();
    });
  });

  describe('getPlans', () => {
    it('should return paginated list of plans', async () => {
      // Arrange
      req.query = { page: '1', limit: '10' };

      const mockPlans = {
        plans: [
          { id: uuidv4(), name: 'Plan 1', price: 10.00 },
          { id: uuidv4(), name: 'Plan 2', price: 20.00 }
        ],
        total: 2
      };

      mockBuildPaginationQuery.mockReturnValue({ page: 1, limit: 10, offset: 0 });
      mockBuildSortQuery.mockReturnValue([['name', 'ASC']]);
      mockListPlans.mockResolvedValue(mockPlans);

      // Act
      await superAdminController.getPlans(req, res);

      // Assert
      expect(mockListPlans).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getPlanById', () => {
    it('should return plan by ID', async () => {
      // Arrange
      const planId = uuidv4();
      req.params = { id: planId };

      const mockPlan = {
        id: planId,
        name: 'Premium Plan',
        code: 'PREMIUM',
        price: 99.99
      };

      mockValidateUUID.mockImplementation(() => {});
      mockGetPlanById.mockResolvedValue(mockPlan);

      // Act
      await superAdminController.getPlanById(req, res);

      // Assert
      expect(mockValidateUUID).toHaveBeenCalledWith(planId, 'id', req.id);
      expect(mockGetPlanById).toHaveBeenCalledWith(planId);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('updatePlan', () => {
    it('should update plan successfully', async () => {
      // Arrange
      const planId = uuidv4();
      req.params = { id: planId };
      req.body = {
        name: 'Updated Premium Plan',
        price: 149.99
      };

      const mockUpdatedPlan = {
        id: planId,
        name: 'Updated Premium Plan',
        price: 149.99
      };

      mockValidateUUID.mockImplementation(() => {});
      mockValidateString.mockImplementation(() => {});
      mockValidateNumber.mockImplementation(() => {});
      mockUpdatePlan.mockResolvedValue(mockUpdatedPlan);

      // Act
      await superAdminController.updatePlan(req, res);

      // Assert
      expect(mockUpdatePlan).toHaveBeenCalledWith(
        planId,
        expect.objectContaining({
          name: 'Updated Premium Plan',
          price: 149.99
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deletePlan', () => {
    it('should delete plan successfully', async () => {
      // Arrange
      const planId = uuidv4();
      req.params = { id: planId };

      mockValidateUUID.mockImplementation(() => {});
      mockDeletePlan.mockResolvedValue(undefined);

      // Act
      await superAdminController.deletePlan(req, res);

      // Assert
      expect(mockDeletePlan).toHaveBeenCalledWith(planId, { deletedUserId: req.user.id });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});

