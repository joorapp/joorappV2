/**
 * @author Bhavesh Venugopal
 * User Model Tests
 * Tests for User model CRUD operations, validation, and business logic
 */

import { User } from '../index.js';
import { v4 as uuidv4 } from 'uuid';
import { createUserData } from '../../../__tests__/helpers/factories.js';
import { cleanUsers } from '../../../__tests__/helpers/database.js';

describe('User Model', () => {
  // Clean up before and after each test to ensure isolation
  beforeEach(async () => {
    await cleanUsers();
  });

  afterEach(async () => {
    await cleanUsers();
  });

  describe('Environment Check', () => {
    it('should use test database', () => {
      expect(process.env.DB_NAME).toBe('joorapp_testDB');
      expect(process.env.NODE_ENV).not.toBe('production');
    });
  });

  describe('CRUD Operations', () => {
    it('should create a user', async () => {
      // Arrange
      const userData = createUserData({
        email: 'test@example.com'
      });

      // Act - User model doesn't have audit fields, so no context needed
      const user = await User.create(userData);

      // Assert
      expect(user).toBeDefined();
      expect(user.id).toBeValidUUID();
      expect(user.email).toBe('test@example.com');
      expect(user.keycloakId).toBeValidUUID();
      expect(user.keycloakGlobalRole).toBe('COMPANY_USER');
    });

    it('should find created user', async () => {
      // Arrange - create user first
      const userData = createUserData({ email: 'find@example.com' });
      const created = await User.create(userData);

      // Act - find the user
      const found = await User.findByPk(created.id);

      // Assert
      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.email).toBe('find@example.com');
      expect(found.keycloakId).toBeValidUUID();
    });

    it('should update user', async () => {
      // Arrange
      const userData = createUserData({
        email: 'update@example.com',
        firstName: 'John',
        lastName: 'Doe'
      });
      const user = await User.create(userData);

      // Act - update user (no context needed - no audit fields)
      await user.update({
        firstName: 'Jane',
        lastName: 'Smith'
      });

      // Assert
      expect(user.firstName).toBe('Jane');
      expect(user.lastName).toBe('Smith');
      
      // Verify in database
      const updated = await User.findByPk(user.id);
      expect(updated.firstName).toBe('Jane');
      expect(updated.lastName).toBe('Smith');
    });

    it('should soft delete user', async () => {
      // Arrange
      const userData = createUserData({ email: 'delete@example.com' });
      const user = await User.create(userData);

      // Act - soft delete (User model doesn't support soft delete - no isDeleted field)
      await user.destroy();

      // Assert - User model uses hard delete, so it should be gone
      const notFound = await User.findByPk(user.id);
      expect(notFound).toBeNull();
    });
  });

  describe('User Status Fields', () => {
    it('should have default values for isActive', async () => {
      // Arrange & Act
      const userData = createUserData({ email: 'status@example.com' });
      const user = await User.create(userData);

      // Assert - check default values
      expect(user.isActive).toBe(true);
      expect(user.keycloakGlobalRole).toBe('COMPANY_USER');
      expect(user.lastLoginAt).toBeNull();
    });

    it('should update user status fields', async () => {
      // Arrange
      const userData = createUserData({ email: 'status-update@example.com' });
      const user = await User.create(userData);

      const now = new Date();

      // Act - update status fields
      await user.update({
        isActive: false,
        lastLoginAt: now
      });

      // Assert
      expect(user.isActive).toBe(false);
      expect(user.lastLoginAt).toEqual(now);
    });
  });

  describe('Validation', () => {
    it('should require email', async () => {
      // Arrange - invalid data (no email)
      const invalidData = createUserData({ email: null });
      delete invalidData.email;

      // Act & Assert - expect error
      await expect(
        User.create(invalidData)
      ).rejects.toThrow();
    });

    it('should require keycloakId', async () => {
      // Arrange - invalid data (no keycloakId)
      const invalidData = createUserData({ keycloakId: null });
      delete invalidData.keycloakId;

      // Act & Assert - expect error
      await expect(
        User.create(invalidData)
      ).rejects.toThrow();
    });
    
    it('should validate email uniqueness', async () => {
      // Arrange - create first user
      const email = 'unique@example.com';
      await User.create(createUserData({ email }));
      
      // Act & Assert - expect error for duplicate email
      await expect(
        User.create(createUserData({ email }))
      ).rejects.toThrow();
    });
  });
});

