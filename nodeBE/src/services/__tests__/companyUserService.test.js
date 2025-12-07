/**
 * @author Bhavesh Venugopal
 * CompanyUser Service Tests
 * Tests for companyUserService business logic layer
 * Uses mocked repositories to test business logic, error handling, and DTO transformation
 */

import { jest, describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { NotFoundError, BadRequestError } from '../../utils/errors.js';
import { createMockUser } from '../../../__tests__/mocks/models/UserMock.js';
import { createMockCompany } from '../../../__tests__/mocks/models/CompanyMock.js';
import { createMockRole } from '../../../__tests__/mocks/models/CompanyRoleMock.js';
import { createMockCompanyUser } from '../../../__tests__/mocks/models/CompanyUserMock.js';
import { createMockContext } from '../../../__tests__/mocks/contextMock.js';

// Mock all repositories using unstable_mockModule for ES modules
jest.unstable_mockModule('../../repositories/companyUserRepository.js', () => ({
  companyUserRepository: {
    assignUserToCompany: jest.fn(),
    findUserCompanies: jest.fn(),
    findCompanyUsers: jest.fn(),
    findUserCompanyRole: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    checkUserInCompany: jest.fn()
  }
}));

jest.unstable_mockModule('../../repositories/userRepository.js', () => ({
  userRepository: {
    findByIdOrFail: jest.fn()
  }
}));

jest.unstable_mockModule('../../repositories/companyRepository.js', () => ({
  companyRepository: {
    findByIdOrFail: jest.fn()
  }
}));

jest.unstable_mockModule('../../repositories/roleRepository.js', () => ({
  roleRepository: {
    findByIdOrFail: jest.fn()
  }
}));

// Import after mocking (must use await import for ES modules)
let companyUserService;
let companyUserRepository;
let userRepository;
let companyRepository;
let roleRepository;

beforeAll(async () => {
  companyUserService = await import('../companyUserService.js');
  const companyUserRepoModule = await import('../../repositories/companyUserRepository.js');
  companyUserRepository = companyUserRepoModule.companyUserRepository;
  const userRepoModule = await import('../../repositories/userRepository.js');
  userRepository = userRepoModule.userRepository;
  const companyRepoModule = await import('../../repositories/companyRepository.js');
  companyRepository = companyRepoModule.companyRepository;
  const roleRepoModule = await import('../../repositories/roleRepository.js');
  roleRepository = roleRepoModule.roleRepository;
});

describe('CompanyUser Service', () => {
  let mockContext;
  let mockUser;
  let mockCompany;
  let mockRole;
  let mockCompanyUser;
  let mockAssignment;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Ensure services and repositories are available
    if (!companyUserService || !companyUserRepository || !userRepository || !companyRepository || !roleRepository) {
      throw new Error('Services or repositories not initialized');
    }

    // Setup test data using shared mocks
    mockContext = createMockContext();
    mockUser = createMockUser({
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe'
    });
    mockCompany = createMockCompany({
      name: 'Acme Corp',
      description: 'Test company'
    });
    mockRole = createMockRole({
      name: 'Admin',
      code: 'ADMIN'
    });
    mockCompanyUser = createMockCompanyUser({
      userId: mockUser.id,
      companyId: mockCompany.id,
      companyRoleId: mockRole.id,
      createdUserId: mockContext.userId,
      updatedUserId: mockContext.userId
    });
    mockAssignment = createMockCompanyUser({
      ...mockCompanyUser,
      user: mockUser,
      company: mockCompany,
      role: mockRole
    });
  });

  describe('assignUserToCompany', () => {
    it('should assign user to company successfully when all validations pass', async () => {
      // Arrange
      userRepository.findByIdOrFail.mockResolvedValue(mockUser);
      companyRepository.findByIdOrFail.mockResolvedValue(mockCompany);
      roleRepository.findByIdOrFail.mockResolvedValue(mockRole);
      companyUserRepository.assignUserToCompany.mockResolvedValue(mockCompanyUser);

      // Act
      const result = await companyUserService.assignUserToCompany(
        mockUser.id,
        mockCompany.id,
        mockRole.id,
        mockContext
      );

      // Assert
      expect(userRepository.findByIdOrFail).toHaveBeenCalledWith(mockUser.id);
      expect(companyRepository.findByIdOrFail).toHaveBeenCalledWith(mockCompany.id);
      expect(roleRepository.findByIdOrFail).toHaveBeenCalledWith(mockRole.id);
      expect(companyUserRepository.assignUserToCompany).toHaveBeenCalledWith(
        mockUser.id,
        mockCompany.id,
        mockRole.id,
        mockContext
      );
      
      // Verify DTO transformation
      expect(result).toEqual({
        id: mockCompanyUser.id,
        userId: mockCompanyUser.userId,
        companyId: mockCompanyUser.companyId,
        roleId: mockCompanyUser.companyRoleId,
        isActive: mockCompanyUser.isActive,
        createdDate: mockCompanyUser.createdDate,
        createdUserId: mockCompanyUser.createdUserId
      });
    });

    it('should throw NotFoundError when user does not exist', async () => {
      // Arrange
      const userId = uuidv4();
      userRepository.findByIdOrFail.mockRejectedValue(
        new NotFoundError('User', userId)
      );

      // Act & Assert
      await expect(
        companyUserService.assignUserToCompany(userId, mockCompany.id, mockRole.id, mockContext)
      ).rejects.toThrow(NotFoundError);
      
      expect(companyUserRepository.assignUserToCompany).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when company does not exist', async () => {
      // Arrange
      const companyId = uuidv4();
      userRepository.findByIdOrFail.mockResolvedValue(mockUser);
      companyRepository.findByIdOrFail.mockRejectedValue(
        new NotFoundError('Company', companyId)
      );

      // Act & Assert
      await expect(
        companyUserService.assignUserToCompany(mockUser.id, companyId, mockRole.id, mockContext)
      ).rejects.toThrow(NotFoundError);
      
      expect(companyUserRepository.assignUserToCompany).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when role does not exist', async () => {
      // Arrange
      const roleId = uuidv4();
      userRepository.findByIdOrFail.mockResolvedValue(mockUser);
      companyRepository.findByIdOrFail.mockResolvedValue(mockCompany);
      roleRepository.findByIdOrFail.mockRejectedValue(
        new NotFoundError('CompanyRole', roleId)
      );

      // Act & Assert
      await expect(
        companyUserService.assignUserToCompany(mockUser.id, mockCompany.id, roleId, mockContext)
      ).rejects.toThrow(NotFoundError);
      
      expect(companyUserRepository.assignUserToCompany).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError when role is not active', async () => {
      // Arrange
      const inactiveRole = { ...mockRole, isActive: false };
      userRepository.findByIdOrFail.mockResolvedValue(mockUser);
      companyRepository.findByIdOrFail.mockResolvedValue(mockCompany);
      roleRepository.findByIdOrFail.mockResolvedValue(inactiveRole);

      // Act & Assert
      await expect(
        companyUserService.assignUserToCompany(
          mockUser.id,
          mockCompany.id,
          inactiveRole.id,
          mockContext
        )
      ).rejects.toThrow(BadRequestError);
      
      expect(companyUserRepository.assignUserToCompany).not.toHaveBeenCalled();
    });
  });

  describe('getUserCompanies', () => {
    it('should return user companies with DTO transformation', async () => {
      // Arrange
      const companies = [mockAssignment];
      companyUserRepository.findUserCompanies.mockResolvedValue(companies);

      // Act
      const result = await companyUserService.getUserCompanies(mockUser.id);

      // Assert
      expect(companyUserRepository.findUserCompanies).toHaveBeenCalledWith(mockUser.id);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockAssignment.id,
        userId: mockAssignment.userId,
        companyId: mockAssignment.companyId,
        roleId: mockAssignment.companyRoleId,
        isActive: mockAssignment.isActive,
        company: {
          id: mockCompany.id,
          name: mockCompany.name,
          description: mockCompany.description,
          isActive: mockCompany.isActive
        },
        role: {
          id: mockRole.id,
          name: mockRole.name,
          code: mockRole.code,
          isActive: mockRole.isActive
        }
      });
    });

    it('should filter by activeOnly when provided', async () => {
      // Arrange
      const activeAssignment = { ...mockAssignment, isActive: true };
      const inactiveAssignment = { ...mockAssignment, id: uuidv4(), isActive: false };
      companyUserRepository.findUserCompanies.mockResolvedValue([
        activeAssignment,
        inactiveAssignment
      ]);

      // Act
      const result = await companyUserService.getUserCompanies(mockUser.id, { activeOnly: true });

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].isActive).toBe(true);
    });

    it('should return all companies when activeOnly is false', async () => {
      // Arrange
      const activeAssignment = { ...mockAssignment, isActive: true };
      const inactiveAssignment = { ...mockAssignment, id: uuidv4(), isActive: false };
      companyUserRepository.findUserCompanies.mockResolvedValue([
        activeAssignment,
        inactiveAssignment
      ]);

      // Act
      const result = await companyUserService.getUserCompanies(mockUser.id, { activeOnly: false });

      // Assert
      expect(result).toHaveLength(2);
    });
  });

  describe('getCompanyUsers', () => {
    it('should return company users with DTO transformation', async () => {
      // Arrange
      const users = [mockAssignment];
      // When pagination is provided, repository returns {rows, count}
      companyUserRepository.findCompanyUsers.mockResolvedValue({ rows: users, count: 1 });

      // Act
      const result = await companyUserService.getCompanyUsers(
        mockCompany.id,
        {},
        { limit: 10, offset: 0 }
      );

      // Assert
      expect(companyUserRepository.findCompanyUsers).toHaveBeenCalledWith(mockCompany.id, {
        limit: 10,
        offset: 0
      });
      expect(result).toHaveProperty('users');
      expect(result).toHaveProperty('total');
      expect(result.users).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.users[0]).toEqual({
        id: mockAssignment.id,
        userId: mockAssignment.userId,
        companyId: mockAssignment.companyId,
        roleId: mockAssignment.companyRoleId,
        isActive: mockAssignment.isActive,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          isActive: mockUser.isActive
        },
        role: {
          id: mockRole.id,
          name: mockRole.name,
          code: mockRole.code,
          isActive: mockRole.isActive
        }
      });
    });

    it('should filter by isActive when provided', async () => {
      // Arrange
      const activeUser = { ...mockAssignment, isActive: true };
      const inactiveUser = { ...mockAssignment, id: uuidv4(), isActive: false };
      // When no pagination, repository returns array
      companyUserRepository.findCompanyUsers.mockResolvedValue([activeUser, inactiveUser]);

      // Act
      const result = await companyUserService.getCompanyUsers(
        mockCompany.id,
        { isActive: true },
        {}
      );

      // Assert
      expect(result).toHaveProperty('users');
      expect(result).toHaveProperty('total');
      expect(result.users).toHaveLength(1);
      expect(result.users[0].isActive).toBe(true);
      expect(result.total).toBe(1);
    });

    it('should handle paginated results', async () => {
      // Arrange
      // When pagination is provided, repository returns {rows, count}
      companyUserRepository.findCompanyUsers.mockResolvedValue({ rows: [mockAssignment], count: 1 });

      // Act
      const result = await companyUserService.getCompanyUsers(
        mockCompany.id,
        {},
        { limit: 1, offset: 0 }
      );

      // Assert
      expect(companyUserRepository.findCompanyUsers).toHaveBeenCalledWith(mockCompany.id, {
        limit: 1,
        offset: 0
      });
      expect(result).toHaveProperty('users');
      expect(result).toHaveProperty('total');
      expect(result.users).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.users[0]).toEqual({
        id: mockAssignment.id,
        userId: mockAssignment.userId,
        companyId: mockAssignment.companyId,
        roleId: mockAssignment.companyRoleId,
        isActive: mockAssignment.isActive,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          isActive: mockUser.isActive
        },
        role: {
          id: mockRole.id,
          name: mockRole.name,
          code: mockRole.code,
          isActive: mockRole.isActive
        }
      });
    });
  });

  describe('updateUserRole', () => {
    it('should update user role successfully when all validations pass', async () => {
      // Arrange
      const newRoleId = uuidv4();
      const newRole = { ...mockRole, id: newRoleId };
      const updatedAssignment = { ...mockCompanyUser, companyRoleId: newRoleId };
      
      companyUserRepository.findUserCompanyRole.mockResolvedValue(mockCompanyUser);
      roleRepository.findByIdOrFail.mockResolvedValue(newRole);
      companyUserRepository.update.mockResolvedValue(updatedAssignment);

      // Act
      const result = await companyUserService.updateUserRole(
        mockUser.id,
        mockCompany.id,
        newRoleId,
        mockContext
      );

      // Assert
      expect(companyUserRepository.findUserCompanyRole).toHaveBeenCalledWith(
        mockUser.id,
        mockCompany.id
      );
      expect(roleRepository.findByIdOrFail).toHaveBeenCalledWith(newRoleId);
      expect(companyUserRepository.update).toHaveBeenCalledWith(
        mockCompanyUser.id,
        { companyRoleId: newRoleId },
        mockContext
      );
      
      expect(result).toEqual({
        id: updatedAssignment.id,
        userId: updatedAssignment.userId,
        companyId: updatedAssignment.companyId,
        roleId: updatedAssignment.companyRoleId,
        isActive: updatedAssignment.isActive,
        updatedDate: updatedAssignment.updatedDate,
        updatedUserId: updatedAssignment.updatedUserId
      });
    });

    it('should throw NotFoundError when assignment does not exist', async () => {
      // Arrange
      companyUserRepository.findUserCompanyRole.mockResolvedValue(null);

      // Act & Assert
      await expect(
        companyUserService.updateUserRole(
          mockUser.id,
          mockCompany.id,
          mockRole.id,
          mockContext
        )
      ).rejects.toThrow(NotFoundError);
      
      expect(roleRepository.findByIdOrFail).not.toHaveBeenCalled();
      expect(companyUserRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when role does not exist', async () => {
      // Arrange
      const roleId = uuidv4();
      companyUserRepository.findUserCompanyRole.mockResolvedValue(mockCompanyUser);
      roleRepository.findByIdOrFail.mockRejectedValue(
        new NotFoundError('CompanyRole', roleId)
      );

      // Act & Assert
      await expect(
        companyUserService.updateUserRole(mockUser.id, mockCompany.id, roleId, mockContext)
      ).rejects.toThrow(NotFoundError);
      
      expect(companyUserRepository.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError when role is not active', async () => {
      // Arrange
      const inactiveRole = { ...mockRole, isActive: false };
      companyUserRepository.findUserCompanyRole.mockResolvedValue(mockCompanyUser);
      roleRepository.findByIdOrFail.mockResolvedValue(inactiveRole);

      // Act & Assert
      await expect(
        companyUserService.updateUserRole(
          mockUser.id,
          mockCompany.id,
          inactiveRole.id,
          mockContext
        )
      ).rejects.toThrow(BadRequestError);
      
      expect(companyUserRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('removeUserFromCompany', () => {
    it('should remove user from company successfully', async () => {
      // Arrange
      companyUserRepository.findUserCompanyRole.mockResolvedValue(mockCompanyUser);
      companyUserRepository.delete.mockResolvedValue(undefined);

      // Act
      await companyUserService.removeUserFromCompany(
        mockUser.id,
        mockCompany.id,
        mockContext
      );

      // Assert
      expect(companyUserRepository.findUserCompanyRole).toHaveBeenCalledWith(
        mockUser.id,
        mockCompany.id
      );
      expect(companyUserRepository.delete).toHaveBeenCalledWith(
        mockCompanyUser.id,
        mockContext
      );
    });

    it('should throw NotFoundError when assignment does not exist', async () => {
      // Arrange
      companyUserRepository.findUserCompanyRole.mockResolvedValue(null);

      // Act & Assert
      await expect(
        companyUserService.removeUserFromCompany(mockUser.id, mockCompany.id, mockContext)
      ).rejects.toThrow(NotFoundError);
      
      expect(companyUserRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getUserCompanyRole', () => {
    it('should return user company role with DTO transformation', async () => {
      // Arrange
      companyUserRepository.findUserCompanyRole.mockResolvedValue(mockAssignment);

      // Act
      const result = await companyUserService.getUserCompanyRole(mockUser.id, mockCompany.id);

      // Assert
      expect(companyUserRepository.findUserCompanyRole).toHaveBeenCalledWith(
        mockUser.id,
        mockCompany.id
      );
      expect(result).toEqual({
        id: mockAssignment.id,
        userId: mockAssignment.userId,
        companyId: mockAssignment.companyId,
        roleId: mockAssignment.companyRoleId,
        isActive: mockAssignment.isActive,
        role: {
          id: mockRole.id,
          name: mockRole.name,
          code: mockRole.code,
          isActive: mockRole.isActive
        }
      });
    });

    it('should return null when assignment does not exist', async () => {
      // Arrange
      companyUserRepository.findUserCompanyRole.mockResolvedValue(null);

      // Act
      const result = await companyUserService.getUserCompanyRole(mockUser.id, mockCompany.id);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('checkUserInCompany', () => {
    it('should return true when user is in company', async () => {
      // Arrange
      companyUserRepository.checkUserInCompany.mockResolvedValue(true);

      // Act
      const result = await companyUserService.checkUserInCompany(mockUser.id, mockCompany.id);

      // Assert
      expect(companyUserRepository.checkUserInCompany).toHaveBeenCalledWith(
        mockUser.id,
        mockCompany.id
      );
      expect(result).toBe(true);
    });

    it('should return false when user is not in company', async () => {
      // Arrange
      companyUserRepository.checkUserInCompany.mockResolvedValue(false);

      // Act
      const result = await companyUserService.checkUserInCompany(mockUser.id, mockCompany.id);

      // Assert
      expect(result).toBe(false);
    });
  });
});

