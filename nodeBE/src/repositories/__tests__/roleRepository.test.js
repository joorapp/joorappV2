/**
 * @author Bhavesh Venugopal
 * RoleRepository Tests
 * Tests for RoleRepository (CompanyRole) complex query methods
 */

import { roleRepository } from '../roleRepository.js';
import { CompanyRole, Company, User, CompanyUser } from '../../models/index.js';
import { createRoleData, createCompanyData, createUserData, createCompanyUserData, createAuditContext } from '../../../__tests__/helpers/factories.js';
import { cleanDatabase } from '../../../__tests__/helpers/database.js';

describe('RoleRepository', () => {
  let testUser;
  let testCompany;
  let auditContext;

  beforeEach(async () => {
    await cleanDatabase();
    
    testUser = await User.create(createUserData());
    auditContext = createAuditContext(testUser.id);
    
    testCompany = await Company.create(
      createCompanyData({ name: 'Test Company' }),
      { context: auditContext }
    );
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  describe('BaseRepository Methods with Audit', () => {
    it('should create role with context', async () => {
      // Arrange
      const roleData = createRoleData({ name: 'Manager', code: 'MANAGER' });

      // Act
      const role = await roleRepository.create(roleData, auditContext);

      // Assert
      expect(role).toBeDefined();
      expect(role.id).toBeValidUUID();
      expect(role.name).toBe('Manager');
      expect(role.createdUserId).toBe(testUser.id);
    });

    it('should find role by ID', async () => {
      // Arrange
      const created = await roleRepository.create(
        createRoleData(testCompany.id, { name: 'Admin', code: 'ADMIN' }),
        auditContext
      );

      // Act
      const found = await roleRepository.findById(created.id);

      // Assert
      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
    });

    it('should soft delete role', async () => {
      // Arrange
      const role = await roleRepository.create(
        createRoleData(),
        auditContext
      );

      // Act
      await roleRepository.delete(role.id, auditContext);

      // Assert
      const found = await roleRepository.findById(role.id);
      expect(found).toBeNull();
    });
  });

  describe('Complex Query: findRoleWithAssignments', () => {
    let testRole, user2;

    beforeEach(async () => {
      testRole = await roleRepository.create(
        createRoleData({ name: 'Manager', code: 'MANAGER' }),
        auditContext
      );
      
      user2 = await User.create(createUserData({ email: 'user2@example.com' }));

      // Assign users to role
      await CompanyUser.create(
        createCompanyUserData(testUser.id, testCompany.id, testRole.id),
        { context: auditContext }
      );
      await CompanyUser.create(
        createCompanyUserData(user2.id, testCompany.id, testRole.id),
        { context: auditContext }
      );
    });

    it('should find role with all user assignments', async () => {
      // Act
      const result = await roleRepository.findRoleWithAssignments(testRole.id);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(testRole.id);
      expect(result.name).toBe('Manager');
    });

    it('should throw NotFoundError for non-existent role', async () => {
      // Act & Assert
      await expect(
        roleRepository.findRoleWithAssignments('00000000-0000-0000-0000-000000000000')
      ).rejects.toThrow('CompanyRole not found');
    });
  });

  describe('Complex Query: getRoles', () => {
    beforeEach(async () => {
      await roleRepository.create(
        createRoleData({ name: 'Admin', code: 'ADMIN' }),
        auditContext
      );
      await roleRepository.create(
        createRoleData({ name: 'Manager', code: 'MANAGER' }),
        auditContext
      );
      await roleRepository.create(
        createRoleData({ name: 'Employee', code: 'EMPLOYEE' }),
        auditContext
      );
    });

    it('should get all global roles', async () => {
      // Act
      const roles = await roleRepository.getRoles();

      // Assert
      expect(roles).toHaveLength(3);
      expect(roles.every(r => r.isActive === true)).toBe(true);
    });

    it('should return all global roles (master table)', async () => {
      // Arrange - create more global roles
      await roleRepository.create(
        createRoleData({ name: 'Auditor', code: 'AUDITOR' }),
        auditContext
      );

      // Act
      const roles = await roleRepository.getRoles();

      // Assert
      expect(roles).toHaveLength(4); // All global roles
      expect(roles.map(r => r.code)).toContain('ADMIN');
      expect(roles.map(r => r.code)).toContain('MANAGER');
      expect(roles.map(r => r.code)).toContain('EMPLOYEE');
      expect(roles.map(r => r.code)).toContain('AUDITOR');
    });
  });

  describe('Complex Query: findActiveRoles', () => {
    beforeEach(async () => {
      await roleRepository.create(
        createRoleData({ name: 'Active Role 1', code: 'ACTIVE1', isActive: true }),
        auditContext
      );
      await roleRepository.create(
        createRoleData({ name: 'Active Role 2', code: 'ACTIVE2', isActive: true }),
        auditContext
      );
      await roleRepository.create(
        createRoleData({ name: 'Inactive Role', code: 'INACTIVE', isActive: false }),
        auditContext
      );
    });

    it('should find only active roles', async () => {
      // Act
      const roles = await roleRepository.findActiveRoles();

      // Assert
      expect(roles).toHaveLength(2);
      expect(roles.every(r => r.isActive === true)).toBe(true);
    });

    it('should support filtering active roles with additional filters', async () => {
      // Arrange - create role with specific code
      await roleRepository.create(
        createRoleData({ name: 'Test Role', code: 'TEST', isActive: true }),
        auditContext
      );

      // Act - filter by code
      const roles = await roleRepository.findActiveRoles({ code: 'TEST' });

      // Assert
      expect(roles).toHaveLength(1);
      expect(roles[0].code).toBe('TEST');
      expect(roles[0].isActive).toBe(true);
    });
  });

  describe('Complex Query: findRoleByCode', () => {
    beforeEach(async () => {
      await roleRepository.create(
        createRoleData({ name: 'Manager', code: 'MANAGER' }),
        auditContext
      );
    });

    it('should find role by code', async () => {
      // Act
      const role = await roleRepository.findRoleByCode('MANAGER');

      // Assert
      expect(role).toBeDefined();
      expect(role.code).toBe('MANAGER');
      expect(role.name).toBe('Manager');
    });

    it('should return null for non-existent code', async () => {
      // Act
      const role = await roleRepository.findRoleByCode('NONEXISTENT');

      // Assert
      expect(role).toBeNull();
    });

    it('should enforce globally unique code', async () => {
      // Arrange - try to create another role with same code (should fail)
      
      // Act & Assert - duplicate code should be rejected
      await expect(
        roleRepository.create(
          createRoleData({ name: 'Another Manager', code: 'MANAGER' }),
          auditContext
        )
      ).rejects.toThrow();
    });
  });
});

