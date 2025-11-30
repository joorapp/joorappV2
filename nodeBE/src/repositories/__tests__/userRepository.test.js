/**
 * @author Bhavesh Venugopal
 * UserRepository Tests
 * Tests for UserRepository complex query methods
 * Note: BaseRepository methods are tested implicitly
 */

import { userRepository } from '../userRepository.js';
import { User, Company, CompanyUser, CompanyRole } from '../../models/index.js';
import { createUserData, createCompanyData, createRoleData, createCompanyUserData, createAuditContext } from '../../../__tests__/helpers/factories.js';
import { cleanDatabase } from '../../../__tests__/helpers/database.js';
import { NotFoundError } from '../../utils/errors.js';

describe('UserRepository', () => {
  let testUser;
  let testCompany;
  let testRole;
  let auditContext;

  beforeEach(async () => {
    await cleanDatabase();
    
    // Create test data
    testUser = await User.create(createUserData({ email: 'test@example.com' }));
    auditContext = createAuditContext(testUser.id);
    
    testCompany = await Company.create(
      createCompanyData({ name: 'Test Company' }),
      { context: auditContext }
    );
    
    testRole = await CompanyRole.create(
      createRoleData(testCompany.id, { name: 'Manager', code: 'MANAGER' }),
      { context: auditContext }
    );
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  describe('BaseRepository Methods', () => {
    it('should find user by ID using findById', async () => {
      // Act
      const found = await userRepository.findById(testUser.id);

      // Assert
      expect(found).toBeDefined();
      expect(found.id).toBe(testUser.id);
      expect(found.email).toBe('test@example.com');
    });

    it('should find user by ID or fail using findByIdOrFail', async () => {
      // Act & Assert - valid ID
      const found = await userRepository.findByIdOrFail(testUser.id);
      expect(found).toBeDefined();

      // Act & Assert - invalid ID should throw
      await expect(
        userRepository.findByIdOrFail('00000000-0000-0000-0000-000000000000')
      ).rejects.toThrow('User not found');
    });

    it('should find all users using findAll', async () => {
      // Arrange
      await User.create(createUserData({ email: 'user2@example.com' }));
      await User.create(createUserData({ email: 'user3@example.com' }));

      // Act
      const users = await userRepository.findAll();

      // Assert
      expect(users).toHaveLength(3);
    });

    it('should count users using count', async () => {
      // Arrange
      await User.create(createUserData({ email: 'user2@example.com' }));

      // Act
      const count = await userRepository.count();

      // Assert
      expect(count).toBe(2);
    });

    it('should find one user using findOne', async () => {
      // Act
      const found = await userRepository.findOne({ email: 'test@example.com' });

      // Assert
      expect(found).toBeDefined();
      expect(found.email).toBe('test@example.com');
    });
  });

  describe('Complex Query: findUserWithCompanies', () => {
    beforeEach(async () => {
      // Assign user to company
      await CompanyUser.create(
        createCompanyUserData(testUser.id, testCompany.id, testRole.id),
        { context: auditContext }
      );
    });

    it('should find user with all companies and roles', async () => {
      // Act
      const result = await userRepository.findUserWithCompanies(testUser.id);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(testUser.id);
      expect(result.email).toBe('test@example.com');
    });

    it('should throw NotFoundError for non-existent user', async () => {
      // Act & Assert
      await expect(
        userRepository.findUserWithCompanies('00000000-0000-0000-0000-000000000000')
      ).rejects.toThrow(NotFoundError);
    });

    it('should include user with no companies', async () => {
      // Arrange - create user with no company assignments
      const userWithoutCompany = await User.create(createUserData({ email: 'nocompany@example.com' }));

      // Act
      const result = await userRepository.findUserWithCompanies(userWithoutCompany.id);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(userWithoutCompany.id);
    });
  });

  describe('Complex Query: searchUsers', () => {
    beforeEach(async () => {
      // Create users with different attributes
      await User.create(createUserData({ 
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe'
      }));
      await User.create(createUserData({ 
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith'
      }));
      await User.create(createUserData({ 
        email: 'bob.jones@example.com',
        firstName: 'Bob',
        lastName: 'Jones'
      }));
    });

    it('should search users by email', async () => {
      // Act
      const result = await userRepository.searchUsers('john.doe');

      // Assert
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].email).toContain('john.doe');
    });

    it('should search users by first name', async () => {
      // Act
      const result = await userRepository.searchUsers('Jane');

      // Assert
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].firstName).toBe('Jane');
    });

    it('should search users by last name', async () => {
      // Act
      const result = await userRepository.searchUsers('Smith');

      // Assert
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].lastName).toBe('Smith');
    });

    it('should support pagination', async () => {
      // Act
      const result = await userRepository.searchUsers('', { limit: 2, offset: 0 });

      // Assert
      expect(result.rows).toHaveLength(2);
      expect(result.count).toBeGreaterThanOrEqual(4); // testUser + 3 created
    });

    it('should support sorting by email', async () => {
      // Act
      const result = await userRepository.searchUsers('', {}, { sortBy: 'email', sortOrder: 'ASC' });

      // Assert
      expect(result.rows.length).toBeGreaterThan(0);
      // Verify sorted order
      const emails = result.rows.map(u => u.email);
      const sortedEmails = [...emails].sort();
      expect(emails).toEqual(sortedEmails);
    });

    it('should return empty array when no matches', async () => {
      // Act
      const result = await userRepository.searchUsers('nonexistent');

      // Assert
      expect(result.rows).toHaveLength(0);
      expect(result.count).toBe(0);
    });
  });

  describe('Complex Query: findUsersByCompany', () => {
    let user2, user3;

    beforeEach(async () => {
      // Create more users
      user2 = await User.create(createUserData({ email: 'user2@example.com' }));
      user3 = await User.create(createUserData({ email: 'user3@example.com' }));

      // Assign users to company
      await CompanyUser.create(
        createCompanyUserData(testUser.id, testCompany.id, testRole.id),
        { context: auditContext }
      );
      await CompanyUser.create(
        createCompanyUserData(user2.id, testCompany.id, testRole.id),
        { context: auditContext }
      );
    });

    it('should find all users in a company', async () => {
      // Act
      const users = await userRepository.findUsersByCompany(testCompany.id);

      // Assert
      expect(users).toHaveLength(2);
      const userIds = users.map(u => u.id);
      expect(userIds).toContain(testUser.id);
      expect(userIds).toContain(user2.id);
      expect(userIds).not.toContain(user3.id); // user3 not in company
    });

    it('should return empty array for company with no users', async () => {
      // Arrange - create empty company
      const emptyCompany = await Company.create(
        createCompanyData({ name: 'Empty Company' }),
        { context: auditContext }
      );

      // Act
      const users = await userRepository.findUsersByCompany(emptyCompany.id);

      // Assert
      expect(users).toHaveLength(0);
    });

    it('should return empty array for non-existent company', async () => {
      // Act
      const users = await userRepository.findUsersByCompany('00000000-0000-0000-0000-000000000000');

      // Assert
      expect(users).toHaveLength(0);
    });
  });
});

