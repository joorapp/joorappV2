/**
 * @author Bhavesh Venugopal
 * Role Service Tests
 * Tests for roleService business logic layer
 * Uses mocked repositories to test business logic, error handling, and DTO transformation
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { ConflictError, NotFoundError } from '../../utils/errors.js';
import { createMockRole } from '../../../__tests__/mocks/models/CompanyRoleMock.js';
import { createMockContext } from '../../../__tests__/mocks/contextMock.js';

// Mock the repository using unstable_mockModule for ES modules
jest.unstable_mockModule('../../repositories/roleRepository.js', () => ({
  roleRepository: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByIdOrFail: jest.fn(),
    findRoleByCode: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAndCountAll: jest.fn()
  }
}));

// Import after mocking (must use await import for ES modules)
let roleService;
let roleRepository;

beforeAll(async () => {
  roleService = await import('../roleService.js');
  const roleRepoModule = await import('../../repositories/roleRepository.js');
  roleRepository = roleRepoModule.roleRepository;
});

describe('Role Service', () => {
  let mockContext;
  let mockRole;
  let mockCreatedRole;
  let mockUpdatedRole;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Ensure roleService and roleRepository are available
    if (!roleService || !roleRepository) {
      throw new Error('roleService or roleRepository not initialized');
    }

    // Setup test data using shared mocks
    mockContext = createMockContext();
    mockRole = createMockRole({
      name: 'Admin',
      code: 'ADMIN',
      description: 'Administrator role',
      createdUserId: mockContext.userId,
      updatedUserId: mockContext.userId
    });

    mockCreatedRole = createMockRole({
      name: 'Admin',
      code: 'ADMIN',
      description: 'Administrator role',
      createdUserId: mockContext.userId
    });

    mockUpdatedRole = createMockRole({
      ...mockRole,
      name: 'Updated Admin',
      version: 2
    });
  });

  describe('createRole', () => {
    it('should create role successfully when name and code are unique', async () => {
      // Arrange
      const roleData = {
        name: 'Manager',
        code: 'MANAGER',
        description: 'Manager role',
        isActive: true
      };
      
      roleRepository.findOne
        .mockResolvedValueOnce(null) // Name check - no existing
        .mockResolvedValueOnce(null); // Code check - no existing
      roleRepository.create.mockResolvedValue(mockCreatedRole);

      // Act
      const result = await roleService.createRole(roleData, mockContext);

      // Assert
      expect(roleRepository.findOne).toHaveBeenCalledTimes(2);
      expect(roleRepository.findOne).toHaveBeenNthCalledWith(1, { name: 'Manager' });
      expect(roleRepository.findOne).toHaveBeenNthCalledWith(2, { code: 'MANAGER' });
      expect(roleRepository.create).toHaveBeenCalledWith(
        {
          name: 'Manager',
          code: 'MANAGER',
          description: 'Manager role',
          isActive: true
        },
        mockContext
      );
      
      // Verify DTO transformation
      expect(result).toEqual({
        id: mockCreatedRole.id,
        name: mockCreatedRole.name,
        code: mockCreatedRole.code,
        description: mockCreatedRole.description,
        isActive: mockCreatedRole.isActive,
        createdDate: mockCreatedRole.createdDate,
        createdUserId: mockCreatedRole.createdUserId
      });
      expect(result).not.toHaveProperty('updatedDate');
      expect(result).not.toHaveProperty('version');
      expect(result).not.toHaveProperty('isDeleted');
    });

    it('should throw ConflictError when role name already exists', async () => {
      // Arrange
      const roleData = {
        name: 'Admin',
        code: 'NEW_CODE',
        description: 'Test role'
      };
      
      roleRepository.findOne.mockResolvedValueOnce(mockRole); // Name exists

      // Act & Assert
      await expect(
        roleService.createRole(roleData, mockContext)
      ).rejects.toThrow(ConflictError);
      
      expect(roleRepository.findOne).toHaveBeenCalledWith({ name: 'Admin' });
      expect(roleRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when role code already exists', async () => {
      // Arrange
      const roleData = {
        name: 'New Role',
        code: 'ADMIN',
        description: 'Test role'
      };
      
      roleRepository.findOne
        .mockResolvedValueOnce(null) // Name check - no existing
        .mockResolvedValueOnce(mockRole); // Code exists

      // Act & Assert
      await expect(
        roleService.createRole(roleData, mockContext)
      ).rejects.toThrow(ConflictError);
      
      expect(roleRepository.findOne).toHaveBeenCalledTimes(2);
      expect(roleRepository.create).not.toHaveBeenCalled();
    });

    it('should use default isActive=true when not provided', async () => {
      // Arrange
      const roleData = {
        name: 'Manager',
        code: 'MANAGER'
      };
      
      roleRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      roleRepository.create.mockResolvedValue(mockCreatedRole);

      // Act
      await roleService.createRole(roleData, mockContext);

      // Assert
      expect(roleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: true }),
        mockContext
      );
    });

    it('should set description to null when not provided', async () => {
      // Arrange
      const roleData = {
        name: 'Manager',
        code: 'MANAGER',
        isActive: true
      };
      
      roleRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      roleRepository.create.mockResolvedValue(mockCreatedRole);

      // Act
      await roleService.createRole(roleData, mockContext);

      // Assert
      expect(roleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ description: null }),
        mockContext
      );
    });
  });

  describe('getRoleById', () => {
    it('should return role DTO when role exists', async () => {
      // Arrange
      const roleId = uuidv4();
      roleRepository.findByIdOrFail.mockResolvedValue(mockRole);

      // Act
      const result = await roleService.getRoleById(roleId);

      // Assert
      expect(roleRepository.findByIdOrFail).toHaveBeenCalledWith(roleId);
      expect(result).toEqual({
        id: mockRole.id,
        name: mockRole.name,
        code: mockRole.code,
        description: mockRole.description,
        isActive: mockRole.isActive,
        createdDate: mockRole.createdDate,
        createdUserId: mockRole.createdUserId,
        updatedDate: mockRole.updatedDate,
        updatedUserId: mockRole.updatedUserId
      });
      expect(result).not.toHaveProperty('version');
      expect(result).not.toHaveProperty('isDeleted');
    });

    it('should throw NotFoundError when role does not exist', async () => {
      // Arrange
      const roleId = uuidv4();
      roleRepository.findByIdOrFail.mockRejectedValue(
        new NotFoundError('CompanyRole', roleId)
      );

      // Act & Assert
      await expect(
        roleService.getRoleById(roleId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getRoleByCode', () => {
    it('should return role DTO when role exists', async () => {
      // Arrange
      roleRepository.findRoleByCode.mockResolvedValue(mockRole);

      // Act
      const result = await roleService.getRoleByCode('ADMIN');

      // Assert
      expect(roleRepository.findRoleByCode).toHaveBeenCalledWith('ADMIN');
      expect(result).toEqual({
        id: mockRole.id,
        name: mockRole.name,
        code: mockRole.code,
        description: mockRole.description,
        isActive: mockRole.isActive,
        createdDate: mockRole.createdDate
      });
      expect(result).not.toHaveProperty('updatedDate');
      expect(result).not.toHaveProperty('version');
    });

    it('should return null when role does not exist', async () => {
      // Arrange
      roleRepository.findRoleByCode.mockResolvedValue(null);

      // Act
      const result = await roleService.getRoleByCode('NONEXISTENT');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('updateRole', () => {
    it('should update role successfully when name and code are unique', async () => {
      // Arrange
      const roleId = uuidv4();
      const updateData = {
        name: 'Updated Admin',
        description: 'Updated description'
      };
      
      roleRepository.findByIdOrFail.mockResolvedValue(mockRole);
      roleRepository.findOne.mockResolvedValue(null); // Name check - no existing
      roleRepository.update.mockResolvedValue(mockUpdatedRole);

      // Act
      const result = await roleService.updateRole(roleId, updateData, mockContext);

      // Assert
      expect(roleRepository.findByIdOrFail).toHaveBeenCalledWith(roleId);
      expect(roleRepository.findOne).toHaveBeenCalledWith({ name: 'Updated Admin' });
      expect(roleRepository.update).toHaveBeenCalledWith(
        roleId,
        {
          name: 'Updated Admin',
          description: 'Updated description'
        },
        mockContext
      );
      
      // Verify DTO transformation
      expect(result).toEqual({
        id: mockUpdatedRole.id,
        name: mockUpdatedRole.name,
        code: mockUpdatedRole.code,
        description: mockUpdatedRole.description,
        isActive: mockUpdatedRole.isActive,
        createdDate: mockUpdatedRole.createdDate,
        createdUserId: mockUpdatedRole.createdUserId,
        updatedDate: mockUpdatedRole.updatedDate,
        updatedUserId: mockUpdatedRole.updatedUserId
      });
    });

    it('should throw NotFoundError when role does not exist', async () => {
      // Arrange
      const roleId = uuidv4();
      roleRepository.findByIdOrFail.mockRejectedValue(
        new NotFoundError('CompanyRole', roleId)
      );

      // Act & Assert
      await expect(
        roleService.updateRole(roleId, { name: 'New Name' }, mockContext)
      ).rejects.toThrow(NotFoundError);
      
      expect(roleRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when new name already exists', async () => {
      // Arrange
      const roleId = uuidv4();
      const existingRole = { ...mockRole, id: uuidv4() };
      
      roleRepository.findByIdOrFail.mockResolvedValue(mockRole);
      roleRepository.findOne.mockResolvedValue(existingRole); // Name exists

      // Act & Assert
      await expect(
        roleService.updateRole(roleId, { name: 'Existing Name' }, mockContext)
      ).rejects.toThrow(ConflictError);
      
      expect(roleRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when new code already exists', async () => {
      // Arrange
      const roleId = uuidv4();
      const existingRole = createMockRole({ id: uuidv4(), code: 'EXISTING_CODE' });
      
      roleRepository.findByIdOrFail.mockResolvedValue(mockRole);
      // Only code check will happen since name is not in updateData
      roleRepository.findOne.mockResolvedValue(existingRole); // Code exists

      // Act & Assert
      await expect(
        roleService.updateRole(roleId, { code: 'EXISTING_CODE' }, mockContext)
      ).rejects.toThrow(ConflictError);
      
      expect(roleRepository.findOne).toHaveBeenCalledWith({ code: 'EXISTING_CODE' });
      expect(roleRepository.update).not.toHaveBeenCalled();
    });

    it('should not check uniqueness when name is not changed', async () => {
      // Arrange
      const roleId = uuidv4();
      const updateData = { description: 'New description' };
      
      roleRepository.findByIdOrFail.mockResolvedValue(mockRole);
      roleRepository.update.mockResolvedValue(mockUpdatedRole);

      // Act
      await roleService.updateRole(roleId, updateData, mockContext);

      // Assert
      expect(roleRepository.findOne).not.toHaveBeenCalled();
      expect(roleRepository.update).toHaveBeenCalled();
    });

    it('should not check uniqueness when code is not changed', async () => {
      // Arrange
      const roleId = uuidv4();
      const updateData = { name: 'New Name' };
      
      roleRepository.findByIdOrFail.mockResolvedValue(mockRole);
      roleRepository.findOne.mockResolvedValue(null);
      roleRepository.update.mockResolvedValue(mockUpdatedRole);

      // Act
      await roleService.updateRole(roleId, updateData, mockContext);

      // Assert
      expect(roleRepository.findOne).toHaveBeenCalledTimes(1); // Only name check
      expect(roleRepository.update).toHaveBeenCalled();
    });
  });

  describe('listRoles', () => {
    it('should return paginated roles with DTO transformation', async () => {
      // Arrange
      const roles = [mockRole, { ...mockRole, id: uuidv4(), name: 'Manager', code: 'MANAGER' }];
      const mockResult = {
        rows: roles,
        count: 2
      };
      
      roleRepository.findAndCountAll.mockResolvedValue(mockResult);

      // Act
      const result = await roleService.listRoles(
        { isActive: true },
        { limit: 10, offset: 0 },
        [['name', 'ASC']]
      );

      // Assert
      expect(roleRepository.findAndCountAll).toHaveBeenCalledWith(
        { isActive: true },
        {
          limit: 10,
          offset: 0,
          order: [['name', 'ASC']]
        }
      );
      
      expect(result.roles).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.roles[0]).toEqual({
        id: mockRole.id,
        name: mockRole.name,
        code: mockRole.code,
        description: mockRole.description,
        isActive: mockRole.isActive,
        createdDate: mockRole.createdDate
      });
      expect(result.roles[0]).not.toHaveProperty('updatedDate');
      expect(result.roles[0]).not.toHaveProperty('version');
    });

    it('should use default sort when not provided', async () => {
      // Arrange
      const mockResult = { rows: [mockRole], count: 1 };
      roleRepository.findAndCountAll.mockResolvedValue(mockResult);

      // Act
      await roleService.listRoles({}, {}, []);

      // Assert
      expect(roleRepository.findAndCountAll).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          order: [['name', 'ASC']]
        })
      );
    });

    it('should filter by isActive when provided', async () => {
      // Arrange
      const mockResult = { rows: [mockRole], count: 1 };
      roleRepository.findAndCountAll.mockResolvedValue(mockResult);

      // Act
      await roleService.listRoles({ isActive: false }, {}, []);

      // Assert
      expect(roleRepository.findAndCountAll).toHaveBeenCalledWith(
        { isActive: false },
        expect.any(Object)
      );
    });
  });

  describe('deleteRole', () => {
    it('should delete role successfully', async () => {
      // Arrange
      const roleId = uuidv4();
      roleRepository.delete.mockResolvedValue(undefined);

      // Act
      await roleService.deleteRole(roleId, mockContext);

      // Assert
      expect(roleRepository.delete).toHaveBeenCalledWith(roleId, mockContext);
    });

    it('should throw NotFoundError when role does not exist', async () => {
      // Arrange
      const roleId = uuidv4();
      roleRepository.delete.mockRejectedValue(
        new NotFoundError('CompanyRole', roleId)
      );

      // Act & Assert
      await expect(
        roleService.deleteRole(roleId, mockContext)
      ).rejects.toThrow(NotFoundError);
    });
  });
});

