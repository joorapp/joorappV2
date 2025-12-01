/**
 * @author Bhavesh Venugopal
 * CompanyUserRepository Tests
 * Tests for CompanyUserRepository complex query methods and unique constraint handling
 */

import { companyUserRepository } from '../companyUserRepository.js';
import { CompanyUser, Company, User, CompanyRole } from '../../models/index.js';
import { createCompanyUserData, createCompanyData, createUserData, createRoleData, createAuditContext } from '../../../__tests__/helpers/factories.js';
import { cleanDatabase } from '../../../__tests__/helpers/database.js';

describe('CompanyUserRepository', () => {
  let testUser, regularUser;
  let testCompany;
  let testRole;
  let auditContext;

  beforeEach(async () => {
    await cleanDatabase();
    
    testUser = await User.create(createUserData({ email: 'admin@example.com' }));
    regularUser = await User.create(createUserData({ email: 'user@example.com' }));
    auditContext = createAuditContext(testUser.id);
    
    testCompany = await Company.create(
      createCompanyData({ name: 'Test Company' }),
      { context: auditContext }
    );
    
    testRole = await CompanyRole.create(
      createRoleData(testCompany.id, { name: 'Employee', code: 'EMPLOYEE' }),
      { context: auditContext }
    );
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  describe('BaseRepository Methods with Audit', () => {
    it('should create company-user assignment', async () => {
      // Arrange
      const assignmentData = createCompanyUserData(regularUser.id, testCompany.id, testRole.id);

      // Act
      const assignment = await companyUserRepository.create(assignmentData, auditContext);

      // Assert
      expect(assignment).toBeDefined();
      expect(assignment.userId).toBe(regularUser.id);
      expect(assignment.companyId).toBe(testCompany.id);
      expect(assignment.createdUserId).toBe(testUser.id);
    });

    it('should update assignment role', async () => {
      // Arrange
      const assignment = await companyUserRepository.create(
        createCompanyUserData(regularUser.id, testCompany.id, testRole.id),
        auditContext
      );
      
      const newRole = await CompanyRole.create(
        createRoleData(testCompany.id, { name: 'Manager', code: 'MANAGER' }),
        { context: auditContext }
      );

      // Act
      const updated = await companyUserRepository.update(
        assignment.id,
        { companyRoleId: newRole.id },
        auditContext
      );

      // Assert
      expect(updated.companyRoleId).toBe(newRole.id);
    });

    it('should soft delete assignment', async () => {
      // Arrange
      const assignment = await companyUserRepository.create(
        createCompanyUserData(regularUser.id, testCompany.id, testRole.id),
        auditContext
      );

      // Act
      await companyUserRepository.delete(assignment.id, auditContext);

      // Assert
      const found = await companyUserRepository.findById(assignment.id);
      expect(found).toBeNull();
    });
  });

  describe('Complex Query: findUserCompanies', () => {
    beforeEach(async () => {
      // Assign user to multiple companies
      const company2 = await Company.create(
        createCompanyData({ name: 'Company 2' }),
        { context: auditContext }
      );
      const role2 = await CompanyRole.create(
        createRoleData(company2.id, { name: 'Manager', code: 'MANAGER' }),
        { context: auditContext }
      );

      await companyUserRepository.create(
        createCompanyUserData(regularUser.id, testCompany.id, testRole.id),
        auditContext
      );
      await companyUserRepository.create(
        createCompanyUserData(regularUser.id, company2.id, role2.id),
        auditContext
      );
    });

    it('should find all companies for a user with roles', async () => {
      // Act
      const assignments = await companyUserRepository.findUserCompanies(regularUser.id);

      // Assert
      expect(assignments).toHaveLength(2);
      expect(assignments.every(a => a.userId === regularUser.id)).toBe(true);
    });

    it('should return empty array for user with no companies', async () => {
      // Arrange
      const userWithNoCompanies = await User.create(createUserData({ email: 'nocompany@example.com' }));

      // Act
      const assignments = await companyUserRepository.findUserCompanies(userWithNoCompanies.id);

      // Assert
      expect(assignments).toHaveLength(0);
    });
  });

  describe('Complex Query: findCompanyUsers', () => {
    beforeEach(async () => {
      const user2 = await User.create(createUserData({ email: 'user2@example.com' }));
      const user3 = await User.create(createUserData({ email: 'user3@example.com' }));

      await companyUserRepository.create(
        createCompanyUserData(regularUser.id, testCompany.id, testRole.id),
        auditContext
      );
      await companyUserRepository.create(
        createCompanyUserData(user2.id, testCompany.id, testRole.id),
        auditContext
      );
    });

    it('should find all users in a company with roles', async () => {
      // Act
      const assignments = await companyUserRepository.findCompanyUsers(testCompany.id);

      // Assert
      expect(assignments).toHaveLength(2);
      expect(assignments.every(a => a.companyId === testCompany.id)).toBe(true);
    });

    it('should support pagination', async () => {
      // Act
      const result = await companyUserRepository.findCompanyUsers(
        testCompany.id,
        { limit: 1, offset: 0 }
      );

      // Assert
      expect(result.rows).toHaveLength(1);
      expect(result.count).toBe(2);
    });

    it('should return empty array for company with no users', async () => {
      // Arrange
      const emptyCompany = await Company.create(
        createCompanyData({ name: 'Empty Company' }),
        { context: auditContext }
      );

      // Act
      const assignments = await companyUserRepository.findCompanyUsers(emptyCompany.id);

      // Assert
      expect(assignments).toHaveLength(0);
    });
  });

  describe('Complex Query: findUserCompanyRole', () => {
    beforeEach(async () => {
      await companyUserRepository.create(
        createCompanyUserData(regularUser.id, testCompany.id, testRole.id),
        auditContext
      );
    });

    it('should find user-company-role relationship', async () => {
      // Act
      const assignment = await companyUserRepository.findUserCompanyRole(regularUser.id, testCompany.id);

      // Assert
      expect(assignment).toBeDefined();
      expect(assignment.userId).toBe(regularUser.id);
      expect(assignment.companyId).toBe(testCompany.id);
      expect(assignment.companyRoleId).toBe(testRole.id);
    });

    it('should return null for non-existent relationship', async () => {
      // Arrange
      const unassignedUser = await User.create(createUserData({ email: 'unassigned@example.com' }));

      // Act
      const assignment = await companyUserRepository.findUserCompanyRole(unassignedUser.id, testCompany.id);

      // Assert
      expect(assignment).toBeNull();
    });
  });

  describe('Complex Query: checkUserInCompany', () => {
    beforeEach(async () => {
      await companyUserRepository.create(
        createCompanyUserData(regularUser.id, testCompany.id, testRole.id),
        auditContext
      );
    });

    it('should return true if user is in company', async () => {
      // Act
      const isInCompany = await companyUserRepository.checkUserInCompany(regularUser.id, testCompany.id);

      // Assert
      expect(isInCompany).toBe(true);
    });

    it('should return false if user is not in company', async () => {
      // Arrange
      const outsideUser = await User.create(createUserData({ email: 'outside@example.com' }));

      // Act
      const isInCompany = await companyUserRepository.checkUserInCompany(outsideUser.id, testCompany.id);

      // Assert
      expect(isInCompany).toBe(false);
    });
  });

  describe('Complex Query: findActiveAssignments', () => {
    beforeEach(async () => {
      const user2 = await User.create(createUserData({ email: 'user2@example.com' }));

      await companyUserRepository.create(
        createCompanyUserData(regularUser.id, testCompany.id, testRole.id, { isActive: true }),
        auditContext
      );
      await companyUserRepository.create(
        createCompanyUserData(user2.id, testCompany.id, testRole.id, { isActive: false }),
        auditContext
      );
    });

    it('should find only active assignments', async () => {
      // Act
      const assignments = await companyUserRepository.findActiveAssignments();

      // Assert
      expect(assignments).toHaveLength(1);
      expect(assignments[0].userId).toBe(regularUser.id);
      expect(assignments[0].isActive).toBe(true);
    });

    it('should support filtering active assignments by company', async () => {
      // Act
      const assignments = await companyUserRepository.findActiveAssignments({ companyId: testCompany.id });

      // Assert
      expect(assignments).toHaveLength(1);
      expect(assignments[0].companyId).toBe(testCompany.id);
    });
  });

  describe('Unique Constraint: assignUserToCompany', () => {
    it('should create new assignment if none exists', async () => {
      // Act
      const assignment = await companyUserRepository.assignUserToCompany(
        regularUser.id,
        testCompany.id,
        testRole.id,
        auditContext
      );

      // Assert
      expect(assignment).toBeDefined();
      expect(assignment.userId).toBe(regularUser.id);
      expect(assignment.companyId).toBe(testCompany.id);
      expect(assignment.companyRoleId).toBe(testRole.id);
    });

    it('should update existing assignment if one exists', async () => {
      // Arrange - create initial assignment
      await companyUserRepository.create(
        createCompanyUserData(regularUser.id, testCompany.id, testRole.id),
        auditContext
      );
      
      const newRole = await CompanyRole.create(
        createRoleData(testCompany.id, { name: 'Manager', code: 'MANAGER' }),
        { context: auditContext }
      );

      // Act - assign with new role (should update, not create)
      const updated = await companyUserRepository.assignUserToCompany(
        regularUser.id,
        testCompany.id,
        newRole.id,
        auditContext
      );

      // Assert
      expect(updated.companyRoleId).toBe(newRole.id);
      
      // Verify only one record exists
      const allAssignments = await CompanyUser.scope('withDeleted').findAll({
        where: { userId: regularUser.id, companyId: testCompany.id }
      });
      expect(allAssignments).toHaveLength(1);
    });
  });
});

