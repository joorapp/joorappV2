/**
 * @author Bhavesh Venugopal
 * User Service Tests
 * Tests for userService business logic layer
 * Uses mocked repositories and Keycloak service to test business logic, error handling, and DTO transformation
 */

import { jest, describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { ConflictError, NotFoundError } from '../../utils/errors.js';
import { createMockUser } from '../../../__tests__/mocks/models/UserMock.js';
import { createMockKeycloakUser, createMockKeycloakAdminClient, createMockKeycloakRole } from '../../../__tests__/mocks/keycloakMock.js';

// Mock the repository using unstable_mockModule for ES modules
jest.unstable_mockModule('../../repositories/userRepository.js', () => ({
  userRepository: {
    findByIdOrFail: jest.fn(),
    findOne: jest.fn(),
    searchUsers: jest.fn(),
    findAndCountAll: jest.fn(),
    findUserWithCompanies: jest.fn()
  }
}));

// Mock Keycloak service
jest.unstable_mockModule('../keycloakService.js', () => ({
  getAdminClient: jest.fn()
}));

// Mock User model (used in createUserInDB and updateUserInDB)
jest.unstable_mockModule('../../models/index.js', () => ({
  User: {
    create: jest.fn(),
    update: jest.fn(),
    findAndCountAll: jest.fn()
  },
  CompanyUser: {},
  Company: {},
  CompanyRole: {},
  Plan: {}
}));

// Import after mocking (must use await import for ES modules)
let userService;
let userRepository;
let keycloakService;
let User;

beforeAll(async () => {
  userService = await import('../userService.js');
  const userRepoModule = await import('../../repositories/userRepository.js');
  userRepository = userRepoModule.userRepository;
  keycloakService = await import('../keycloakService.js');
  const modelsModule = await import('../../models/index.js');
  User = modelsModule.User;
});

describe('User Service', () => {
  let mockUser;
  let mockKeycloakUser;
  let mockKeycloakAdminClient;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Ensure services and repositories are available
    if (!userService || !userRepository || !keycloakService || !User) {
      throw new Error('Services, repositories, or User model not initialized');
    }

    // Setup test data using shared mocks
    mockUser = createMockUser({
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe'
    });
    mockKeycloakUser = createMockKeycloakUser({
      id: mockUser.keycloakId,
      email: mockUser.email,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName
    });
    mockKeycloakAdminClient = createMockKeycloakAdminClient();
    keycloakService.getAdminClient.mockResolvedValue(mockKeycloakAdminClient);
  });

  describe('getUserById', () => {
    it('should return user DTO when user exists', async () => {
      // Arrange
      const userId = uuidv4();
      userRepository.findByIdOrFail.mockResolvedValue(mockUser);

      // Act
      const result = await userService.getUserById(userId);

      // Assert
      expect(userRepository.findByIdOrFail).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        id: mockUser.id,
        keycloakId: mockUser.keycloakId,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        keycloakGlobalRole: mockUser.keycloakGlobalRole,
        isActive: mockUser.isActive,
        lastLoginAt: mockUser.lastLoginAt
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
        userService.getUserById(userId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getUserByEmail', () => {
    it('should return user DTO when user exists', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await userService.getUserByEmail('user@example.com');

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(result).toEqual({
        id: mockUser.id,
        keycloakId: mockUser.keycloakId,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        keycloakGlobalRole: mockUser.keycloakGlobalRole,
        isActive: mockUser.isActive,
        lastLoginAt: mockUser.lastLoginAt
      });
    });

    it('should return null when user does not exist', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await userService.getUserByEmail('nonexistent@example.com');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('listUsers', () => {
    it('should return paginated users with search', async () => {
      // Arrange
      const users = [mockUser, { ...mockUser, id: uuidv4(), email: 'user2@example.com' }];
      const mockResult = {
        rows: users,
        count: 2
      };
      
      userRepository.searchUsers.mockResolvedValue(mockResult);

      // Act
      const result = await userService.listUsers(
        { search: 'user' },
        { limit: 10, offset: 0 },
        [['email', 'ASC']]
      );

      // Assert
      expect(userRepository.searchUsers).toHaveBeenCalledWith(
        'user',
        { limit: 10, offset: 0 },
        [['email', 'ASC']]
      );
      
      expect(result.users).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.users[0]).toEqual({
        id: mockUser.id,
        keycloakId: mockUser.keycloakId,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        keycloakGlobalRole: mockUser.keycloakGlobalRole,
        isActive: mockUser.isActive,
        lastLoginAt: mockUser.lastLoginAt
      });
    });

    it('should use standard findAndCountAll when search is not provided', async () => {
      // Arrange
      const mockResult = { rows: [mockUser], count: 1 };
      userRepository.findAndCountAll.mockResolvedValue(mockResult);

      // Act
      const result = await userService.listUsers(
        {},
        { limit: 10, offset: 0 },
        [['email', 'ASC']]
      );

      // Assert
      expect(userRepository.findAndCountAll).toHaveBeenCalledWith(
        {},
        {
          limit: 10,
          offset: 0,
          order: [['email', 'ASC']]
        }
      );
      
      expect(result.users).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should use default sort when not provided', async () => {
      // Arrange
      const mockResult = { rows: [mockUser], count: 1 };
      userRepository.findAndCountAll.mockResolvedValue(mockResult);

      // Act
      await userService.listUsers({}, {}, []);

      // Assert
      expect(userRepository.findAndCountAll).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          order: [['email', 'ASC']]
        })
      );
    });
  });

  describe('checkUserExistsInKeycloak', () => {
    it('should return Keycloak user when user exists', async () => {
      // Arrange
      mockKeycloakAdminClient.users.find.mockResolvedValue([mockKeycloakUser]);

      // Act
      const result = await userService.checkUserExistsInKeycloak('user@example.com');

      // Assert
      expect(keycloakService.getAdminClient).toHaveBeenCalled();
      expect(mockKeycloakAdminClient.users.find).toHaveBeenCalledWith({
        email: 'user@example.com',
        exact: true
      });
      expect(result).toEqual(mockKeycloakUser);
    });

    it('should return null when user does not exist in Keycloak', async () => {
      // Arrange
      mockKeycloakAdminClient.users.find.mockResolvedValue([]);

      // Act
      const result = await userService.checkUserExistsInKeycloak('nonexistent@example.com');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('createUserInKeycloak', () => {
    it('should create user in Keycloak successfully', async () => {
      // Arrange
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        keycloakGlobalRole: 'COMPANY_USER'
      };
      
      const createdKeycloakUser = createMockKeycloakUser({ email: userData.email });
      const mockRole = createMockKeycloakRole({ name: 'COMPANY_USER' });
      
      mockKeycloakAdminClient.users.create.mockResolvedValue(createdKeycloakUser);
      mockKeycloakAdminClient.users.resetPassword.mockResolvedValue(undefined);
      mockKeycloakAdminClient.roles.findOneByName.mockResolvedValue(mockRole);
      mockKeycloakAdminClient.users.addRealmRoleMappings.mockResolvedValue(undefined);

      // Act
      const result = await userService.createUserInKeycloak(userData);

      // Assert
      expect(mockKeycloakAdminClient.users.create).toHaveBeenCalledWith({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        enabled: true,
        emailVerified: false,
        username: userData.email
      });
      expect(mockKeycloakAdminClient.users.resetPassword).toHaveBeenCalledWith({
        id: createdKeycloakUser.id,
        credential: {
          temporary: false,
          type: 'password',
          value: userData.password
        }
      });
      expect(mockKeycloakAdminClient.roles.findOneByName).toHaveBeenCalledWith({
        name: userData.keycloakGlobalRole
      });
      expect(mockKeycloakAdminClient.users.addRealmRoleMappings).toHaveBeenCalledWith({
        id: createdKeycloakUser.id,
        roles: [mockRole]
      });
      expect(result).toEqual(createdKeycloakUser);
    });

    it('should create user without role when keycloakGlobalRole is not provided', async () => {
      // Arrange
      const userData = {
        email: 'newuser@example.com',
        password: 'password123'
      };
      
      const createdKeycloakUser = createMockKeycloakUser({ email: userData.email });
      mockKeycloakAdminClient.users.create.mockResolvedValue(createdKeycloakUser);
      mockKeycloakAdminClient.users.resetPassword.mockResolvedValue(undefined);

      // Act
      const result = await userService.createUserInKeycloak(userData);

      // Assert
      expect(mockKeycloakAdminClient.roles.findOneByName).not.toHaveBeenCalled();
      expect(mockKeycloakAdminClient.users.addRealmRoleMappings).not.toHaveBeenCalled();
      expect(result).toEqual(createdKeycloakUser);
    });
  });

  describe('createUserInDB', () => {
    it('should create user in database successfully', async () => {
      // Arrange
      const { User } = await import('../../models/index.js');
      const userData = {
        keycloakId: uuidv4(),
        email: 'newuser@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        keycloakGlobalRole: 'COMPANY_USER'
      };
      
      const createdUser = { ...userData, id: uuidv4(), isActive: true };
      User.create.mockResolvedValue(createdUser);
      userRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await userService.createUserInDB(userData, { userId: uuidv4() });

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(User.create).toHaveBeenCalledWith({
        keycloakId: userData.keycloakId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        keycloakGlobalRole: userData.keycloakGlobalRole,
        isActive: true
      });
      
      expect(result).toEqual({
        id: createdUser.id,
        keycloakId: createdUser.keycloakId,
        email: createdUser.email,
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        keycloakGlobalRole: createdUser.keycloakGlobalRole,
        isActive: createdUser.isActive
      });
    });

    it('should throw ConflictError when email already exists', async () => {
      // Arrange
      const userData = {
        keycloakId: uuidv4(),
        email: 'existing@example.com'
      };
      
      userRepository.findOne.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(
        userService.createUserInDB(userData, { userId: uuidv4() })
      ).rejects.toThrow(ConflictError);
    });

    it('should use default keycloakGlobalRole when not provided', async () => {
      // Arrange
      const { User } = await import('../../models/index.js');
      const userData = {
        keycloakId: uuidv4(),
        email: 'newuser@example.com'
      };
      
      const createdUser = { ...userData, id: uuidv4(), isActive: true };
      User.create.mockResolvedValue(createdUser);
      userRepository.findOne.mockResolvedValue(null);

      // Act
      await userService.createUserInDB(userData, { userId: uuidv4() });

      // Assert
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({ keycloakGlobalRole: 'COMPANY_USER' })
      );
    });
  });

  describe('updateUserInDB', () => {
    it('should update user in database successfully', async () => {
      // Arrange
      const { User } = await import('../../models/index.js');
      const userId = uuidv4();
      const updateData = {
        email: 'updated@example.com',
        firstName: 'Updated'
      };
      
      const updatedUser = { ...mockUser, ...updateData };
      userRepository.findByIdOrFail.mockResolvedValue(mockUser);
      userRepository.findOne.mockResolvedValue(null);
      
      // Mock update to actually update the user object's properties (like Sequelize does)
      Object.defineProperty(mockUser, 'update', {
        value: jest.fn().mockImplementation(async (data) => {
          Object.assign(mockUser, data);
          return mockUser;
        }),
        writable: true
      });

      // Act
      const result = await userService.updateUserInDB(userId, updateData, { userId: uuidv4() });

      // Assert
      expect(userRepository.findByIdOrFail).toHaveBeenCalledWith(userId);
      expect(userRepository.findOne).toHaveBeenCalledWith({ email: updateData.email });
      expect(mockUser.update).toHaveBeenCalledWith({
        email: updateData.email,
        firstName: updateData.firstName
      });
      
      expect(result).toEqual({
        id: mockUser.id,
        keycloakId: mockUser.keycloakId,
        email: updateData.email,
        firstName: updateData.firstName,
        lastName: mockUser.lastName,
        keycloakGlobalRole: mockUser.keycloakGlobalRole,
        isActive: mockUser.isActive,
        lastLoginAt: mockUser.lastLoginAt
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
        userService.updateUserInDB(userId, { email: 'new@example.com' }, { userId: uuidv4() })
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ConflictError when new email already exists', async () => {
      // Arrange
      const userId = uuidv4();
      const existingUser = { ...mockUser, id: uuidv4() };
      userRepository.findByIdOrFail.mockResolvedValue(mockUser);
      userRepository.findOne.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(
        userService.updateUserInDB(userId, { email: 'existing@example.com' }, { userId: uuidv4() })
      ).rejects.toThrow(ConflictError);
    });

    it('should not check email uniqueness when email is not changed', async () => {
      // Arrange
      const userId = uuidv4();
      userRepository.findByIdOrFail.mockResolvedValue(mockUser);
      Object.defineProperty(mockUser, 'update', {
        value: jest.fn().mockResolvedValue(undefined),
        writable: true
      });

      // Act
      await userService.updateUserInDB(userId, { firstName: 'New Name' }, { userId: uuidv4() });

      // Assert
      expect(userRepository.findOne).not.toHaveBeenCalled();
      expect(mockUser.update).toHaveBeenCalled();
    });
  });

  describe('deleteUserFromKeycloak', () => {
    it('should disable user in Keycloak', async () => {
      // Arrange
      const keycloakId = uuidv4();
      mockKeycloakAdminClient.users.update.mockResolvedValue(undefined);

      // Act
      await userService.deleteUserFromKeycloak(keycloakId);

      // Assert
      expect(mockKeycloakAdminClient.users.update).toHaveBeenCalledWith(
        { id: keycloakId },
        { enabled: false }
      );
    });
  });

  describe('deleteUserFromDB', () => {
    it('should mark user as inactive in database', async () => {
      // Arrange
      const userId = uuidv4();
      userRepository.findByIdOrFail.mockResolvedValue(mockUser);
      Object.defineProperty(mockUser, 'update', {
        value: jest.fn().mockResolvedValue(undefined),
        writable: true
      });

      // Act
      await userService.deleteUserFromDB(userId, { userId: uuidv4() });

      // Assert
      expect(userRepository.findByIdOrFail).toHaveBeenCalledWith(userId);
      expect(mockUser.update).toHaveBeenCalledWith({ isActive: false });
    });

    it('should throw NotFoundError when user does not exist', async () => {
      // Arrange
      const userId = uuidv4();
      userRepository.findByIdOrFail.mockRejectedValue(
        new NotFoundError('User', userId)
      );

      // Act & Assert
      await expect(
        userService.deleteUserFromDB(userId, { userId: uuidv4() })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('enableUserInKeycloak', () => {
    it('should enable user in Keycloak', async () => {
      // Arrange
      const keycloakId = uuidv4();
      mockKeycloakAdminClient.users.update.mockResolvedValue(undefined);

      // Act
      await userService.enableUserInKeycloak(keycloakId);

      // Assert
      expect(mockKeycloakAdminClient.users.update).toHaveBeenCalledWith(
        { id: keycloakId },
        { enabled: true }
      );
    });
  });

  describe('enableUserInDB', () => {
    it('should mark user as active in database', async () => {
      // Arrange
      const userId = uuidv4();
      userRepository.findByIdOrFail.mockResolvedValue(mockUser);
      Object.defineProperty(mockUser, 'update', {
        value: jest.fn().mockResolvedValue(undefined),
        writable: true
      });

      // Act
      await userService.enableUserInDB(userId, { userId: uuidv4() });

      // Assert
      expect(userRepository.findByIdOrFail).toHaveBeenCalledWith(userId);
      expect(mockUser.update).toHaveBeenCalledWith({ isActive: true });
    });

    it('should throw NotFoundError when user does not exist', async () => {
      // Arrange
      const userId = uuidv4();
      userRepository.findByIdOrFail.mockRejectedValue(
        new NotFoundError('User', userId)
      );

      // Act & Assert
      await expect(
        userService.enableUserInDB(userId, { userId: uuidv4() })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getUserByIdWithCompanies', () => {
    it('should return user with companies array', async () => {
      // Arrange
      const userId = uuidv4();
      const mockUserWithCompanies = {
        id: mockUser.id,
        keycloakId: mockUser.keycloakId,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        keycloakGlobalRole: mockUser.keycloakGlobalRole,
        isActive: mockUser.isActive,
        createdDate: new Date(),
        companyUsers: []
      };

      // Mock the repository method
      userRepository.findUserWithCompanies.mockResolvedValue(mockUserWithCompanies);

      // Act
      const result = await userService.getUserByIdWithCompanies(userId, { includeLogo: false });

      // Assert
      expect(result).toBeDefined();
      expect(result.companies).toBeDefined();
      expect(Array.isArray(result.companies)).toBe(true);
    });

    it('should include logo when includeLogo is true', async () => {
      // Arrange
      const userId = uuidv4();
      const mockCompany = {
        id: uuidv4(),
        name: 'Test Company',
        logo: 'base64logo'
      };
      const mockUserWithCompanies = {
        id: mockUser.id,
        keycloakId: mockUser.keycloakId,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        keycloakGlobalRole: mockUser.keycloakGlobalRole,
        isActive: mockUser.isActive,
        createdDate: new Date(),
        companyUsers: [{
          id: uuidv4(),
          isActive: true,
          company: mockCompany,
          role: null
        }]
      };

      userRepository.findUserWithCompanies.mockResolvedValue(mockUserWithCompanies);

      // Act
      const result = await userService.getUserByIdWithCompanies(userId, { includeLogo: true });

      // Assert
      expect(userRepository.findUserWithCompanies).toHaveBeenCalled();
      expect(result.companies).toBeDefined();
      if (result.companies.length > 0) {
        expect(result.companies[0].logo).toBeDefined();
      }
    });
  });

  describe('listUsersWithCompanies', () => {
    it('should return users with companies array', async () => {
      // Arrange
      const mockUsers = [
        {
          id: uuidv4(),
          keycloakId: uuidv4(),
          email: 'user1@example.com',
          firstName: 'User',
          lastName: 'One',
          keycloakGlobalRole: 'COMPANY_USER',
          isActive: true,
          createdDate: new Date(),
          companyUsers: []
        },
        {
          id: uuidv4(),
          keycloakId: uuidv4(),
          email: 'user2@example.com',
          firstName: 'User',
          lastName: 'Two',
          keycloakGlobalRole: 'COMPANY_USER',
          isActive: true,
          createdDate: new Date(),
          companyUsers: []
        }
      ];

      const mockFindAndCountAll = jest.fn().mockResolvedValue({
        rows: mockUsers,
        count: 2
      });

      // Mock User model - need to set it before the function is called
      const modelsModule = await import('../../models/index.js');
      modelsModule.User.findAndCountAll = mockFindAndCountAll;

      // Act
      const result = await userService.listUsersWithCompanies({}, { limit: 10, offset: 0 }, []);

      // Assert
      expect(result.users).toBeDefined();
      expect(Array.isArray(result.users)).toBe(true);
      expect(result.total).toBe(2);
      result.users.forEach(user => {
        expect(user.companies).toBeDefined();
        expect(Array.isArray(user.companies)).toBe(true);
      });
    });
  });
});

