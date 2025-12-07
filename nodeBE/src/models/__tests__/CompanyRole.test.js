/**
 * @author Bhavesh Venugopal
 * CompanyRole Model Tests
 * Tests for CompanyRole model with AuditableEntity mixin
 * Tests: CRUD, audit fields, soft delete, scopes, validation, company association
 */

import { CompanyRole, Company, User } from '../index.js';
import { v4 as uuidv4 } from 'uuid';
import { createRoleData, createCompanyData, createUserData, createAuditContext } from '../../../__tests__/helpers/factories.js';
import { cleanDatabase } from '../../../__tests__/helpers/database.js';
import { sequelize } from '../../config/database.js';

describe('CompanyRole Model', () => {
  let testContext;
  let testUser;
  let testCompany;
  
  beforeEach(async () => {
    await cleanDatabase();
    
    // Create test user and company
    testUser = await User.create(createUserData());
    testContext = createAuditContext(testUser.id);
    
    testCompany = await Company.create(
      createCompanyData({ name: 'Test Corp' }),
      { context: testContext }
    );
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  describe('CRUD Operations', () => {
    it('should create a role with audit fields', async () => {
      // Arrange
      const roleData = createRoleData({
        name: 'Admin Role',
        code: 'ADMIN'
      });

      // Act
      const role = await CompanyRole.create(roleData, { context: testContext });

      // Assert
      expect(role).toBeDefined();
      expect(role.id).toBeValidUUID();
      expect(role.name).toBe('Admin Role');
      expect(role.code).toBe('ADMIN');
      expect(role.isActive).toBe(true);
      
      // Verify audit fields
      expect(role).toHaveAuditFields();
      expect(role.createdUserId).toBe(testContext.userId);
      expect(role.createdDate).toBeRecentDate();
      expect(role.version).toBe(1);
      expect(role.isDeleted).toBe(false);
    });

    it('should find role by ID', async () => {
      // Arrange
      const created = await CompanyRole.create(
        createRoleData(),
        { context: testContext }
      );

      // Act
      const found = await CompanyRole.findByPk(created.id);

      // Assert
      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.name).toBe(created.name);
    });

    it('should find all roles', async () => {
      // Arrange - create multiple roles (master table, no company association)
      await CompanyRole.create(
        createRoleData({ name: 'Admin Role', code: 'ADMIN' }),
        { context: testContext }
      );
      await CompanyRole.create(
        createRoleData({ name: 'User Role', code: 'USER' }),
        { context: testContext }
      );

      // Act
      const roles = await CompanyRole.findAll();

      // Assert
      expect(roles.length).toBeGreaterThanOrEqual(2);
      expect(roles.some(r => r.name === 'Admin Role')).toBe(true);
      expect(roles.some(r => r.name === 'User Role')).toBe(true);
    });
  });

  describe('Scopes', () => {
    let activeRole, deletedRole;
    
    beforeEach(async () => {
      // Clean ALL roles and companies to ensure isolation
      await sequelize.query('TRUNCATE TABLE company_roles CASCADE');
      await sequelize.query('TRUNCATE TABLE companies CASCADE');
      
      // Recreate test user, company, and context after cleanup
      testUser = await User.create(createUserData());
      testContext = createAuditContext(testUser.id);
      
      testCompany = await Company.create(
        createCompanyData({ name: 'Test Corp' }),
        { context: testContext }
      );
      
      // Create active role
      activeRole = await CompanyRole.create(
        createRoleData({ name: 'Active Role', code: 'ACTIVE' }),
        { context: testContext }
      );

      // Create and delete role
      deletedRole = await CompanyRole.create(
        createRoleData({ name: 'Deleted Role', code: 'DELETED' }),
        { context: testContext }
      );
      await deletedRole.destroy({ context: testContext });
    });

    it('should exclude deleted roles by default', async () => {
      // Act
      const roles = await CompanyRole.findAll();

      // Assert
      expect(roles).toHaveLength(1);
      expect(roles[0].id).toBe(activeRole.id);
    });

    it('should include deleted roles with withDeleted scope', async () => {
      // Act
      const roles = await CompanyRole.scope('withDeleted').findAll();

      // Assert
      expect(roles).toHaveLength(2);
    });

    it('should only get deleted roles with onlyDeleted scope', async () => {
      // Act
      const roles = await CompanyRole.scope('onlyDeleted').findAll();

      // Assert
      expect(roles).toHaveLength(1);
      expect(roles[0].id).toBe(deletedRole.id);
    });
  });

  describe('Validation', () => {
    it('should require name', async () => {
      // Arrange
      const invalidData = createRoleData({ name: null });
      delete invalidData.name;

      // Act & Assert
      await expect(
        CompanyRole.create(invalidData, { context: testContext })
      ).rejects.toThrow();
    });

    it('should require code', async () => {
      // Arrange
      const invalidData = createRoleData({ code: null });
      delete invalidData.code;

      // Act & Assert
      await expect(
        CompanyRole.create(invalidData, { context: testContext })
      ).rejects.toThrow();
    });

    it('should enforce globally unique role name', async () => {
      // Arrange - CompanyRole is a master table, names are globally unique
      const name = 'Unique Role';
      await CompanyRole.create(
        createRoleData({ name, code: 'UNIQUE1' }),
        { context: testContext }
      );

      // Act & Assert - same name should fail (globally unique)
      await expect(
        CompanyRole.create(
          createRoleData({ name, code: 'UNIQUE2' }),
          { context: testContext }
        )
      ).rejects.toThrow();
    });

    it('should enforce globally unique role code', async () => {
      // Arrange - CompanyRole is a master table, codes are globally unique
      const code = 'UNIQUE';
      await CompanyRole.create(
        createRoleData({ name: 'First Role', code }),
        { context: testContext }
      );

      // Act & Assert - same code should fail (globally unique)
      await expect(
        CompanyRole.create(
          createRoleData({ name: 'Second Role', code }),
          { context: testContext }
        )
      ).rejects.toThrow();
    });
  });

  describe('Default Values', () => {
    it('should have isActive=true by default', async () => {
      // Arrange
      const roleData = createRoleData();
      delete roleData.isActive;

      // Act
      const role = await CompanyRole.create(roleData, { context: testContext });

      // Assert
      expect(role.isActive).toBe(true);
    });

    it('should have isDeleted=false by default', async () => {
      // Arrange & Act
      const role = await CompanyRole.create(
        createRoleData(),
        { context: testContext }
      );

      // Assert
      expect(role.isDeleted).toBe(false);
    });

    it('should have version=1 on creation', async () => {
      // Arrange & Act
      const role = await CompanyRole.create(
        createRoleData(),
        { context: testContext }
      );

      // Assert
      expect(role.version).toBe(1);
    });

    it('should allow null description', async () => {
      // Arrange
      const roleData = createRoleData({ description: null });

      // Act
      const role = await CompanyRole.create(roleData, { context: testContext });

      // Assert
      expect(role).toBeDefined();
      expect(role.description).toBeNull();
    });
  });

  describe('Context Requirements', () => {
    it('should require context for create operations', async () => {
      // Arrange
      const roleData = createRoleData();

      // Act & Assert
      await expect(
        CompanyRole.create(roleData)
      ).rejects.toThrow(/userId/);
    });

    it('should require context for update operations', async () => {
      // Arrange
      const role = await CompanyRole.create(
        createRoleData(),
        { context: testContext }
      );

      // Act & Assert
      await expect(
        role.update({ name: 'New Name' })
      ).rejects.toThrow(/userId/);
    });

    it('should require context for delete operations', async () => {
      // Arrange
      const role = await CompanyRole.create(
        createRoleData(),
        { context: testContext }
      );

      // Act & Assert
      await expect(
        role.destroy()
      ).rejects.toThrow(/userId/);
    });
  });
});

