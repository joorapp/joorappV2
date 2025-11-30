/**
 * @author Bhavesh Venugopal
 * CompanyUser Model Tests
 * Tests for CompanyUser junction table with AuditableEntity mixin
 * Tests: CRUD, audit fields, soft delete, scopes, validation, unique constraints
 */

import { CompanyUser, Company, User, CompanyRole } from '../index.js';
import { v4 as uuidv4 } from 'uuid';
import { 
  createCompanyUserData, 
  createCompanyData, 
  createUserData, 
  createRoleData,
  createAuditContext 
} from '../../../__tests__/helpers/factories.js';
import { cleanDatabase } from '../../../__tests__/helpers/database.js';

describe('CompanyUser Model', () => {
  let testContext;
  let testUser;
  let testCompany;
  let testRole;
  let regularUser;
  
  beforeEach(async () => {
    await cleanDatabase();
    
    // Create test users
    testUser = await User.create(createUserData());
    regularUser = await User.create(createUserData({ email: 'regular@example.com' }));
    testContext = createAuditContext(testUser.id);
    
    // Create test company
    testCompany = await Company.create(
      createCompanyData({ name: 'Test Corp' }),
      { context: testContext }
    );
    
    // Create test role
    testRole = await CompanyRole.create(
      createRoleData(testCompany.id, { name: 'Employee', code: 'EMPLOYEE' }),
      { context: testContext }
    );
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  describe('CRUD Operations', () => {
    it('should create a company-user assignment with audit fields', async () => {
      // Arrange
      const assignmentData = createCompanyUserData(
        regularUser.id,
        testCompany.id,
        testRole.id
      );

      // Act
      const assignment = await CompanyUser.create(assignmentData, { context: testContext });

      // Assert
      expect(assignment).toBeDefined();
      expect(assignment.id).toBeValidUUID();
      expect(assignment.userId).toBe(regularUser.id);
      expect(assignment.companyId).toBe(testCompany.id);
      expect(assignment.companyRoleId).toBe(testRole.id);
      expect(assignment.isActive).toBe(true);
      
      // Verify audit fields
      expect(assignment).toHaveAuditFields();
      expect(assignment.createdUserId).toBe(testContext.userId);
      expect(assignment.createdDate).toBeRecentDate();
      expect(assignment.version).toBe(1);
      expect(assignment.isDeleted).toBe(false);
    });

    it('should find assignment by ID', async () => {
      // Arrange
      const created = await CompanyUser.create(
        createCompanyUserData(regularUser.id, testCompany.id, testRole.id),
        { context: testContext }
      );

      // Act
      const found = await CompanyUser.findByPk(created.id);

      // Assert
      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.userId).toBe(regularUser.id);
    });

    it('should find all users in a company', async () => {
      // Arrange - create multiple assignments
      const user2 = await User.create(createUserData({ email: 'user2@example.com' }));
      
      await CompanyUser.create(
        createCompanyUserData(regularUser.id, testCompany.id, testRole.id),
        { context: testContext }
      );
      await CompanyUser.create(
        createCompanyUserData(user2.id, testCompany.id, testRole.id),
        { context: testContext }
      );

      // Act
      const assignments = await CompanyUser.findAll({
        where: { companyId: testCompany.id }
      });

      // Assert
      expect(assignments).toHaveLength(2);
      expect(assignments.every(a => a.companyId === testCompany.id)).toBe(true);
    });

    it('should find all companies for a user', async () => {
      // Arrange - assign user to multiple companies
      const company2 = await Company.create(
        createCompanyData({ name: 'Company 2' }),
        { context: testContext }
      );
      const role2 = await CompanyRole.create(
        createRoleData(company2.id, { name: 'Manager', code: 'MANAGER' }),
        { context: testContext }
      );
      
      await CompanyUser.create(
        createCompanyUserData(regularUser.id, testCompany.id, testRole.id),
        { context: testContext }
      );
      await CompanyUser.create(
        createCompanyUserData(regularUser.id, company2.id, role2.id),
        { context: testContext }
      );

      // Act
      const assignments = await CompanyUser.findAll({
        where: { userId: regularUser.id }
      });

      // Assert
      expect(assignments).toHaveLength(2);
      expect(assignments.every(a => a.userId === regularUser.id)).toBe(true);
    });

    it('should update user role in company', async () => {
      // Arrange
      const assignment = await CompanyUser.create(
        createCompanyUserData(regularUser.id, testCompany.id, testRole.id),
        { context: testContext }
      );
      
      const newRole = await CompanyRole.create(
        createRoleData(testCompany.id, { name: 'Manager', code: 'MANAGER' }),
        { context: testContext }
      );

      // Act
      await assignment.update(
        { companyRoleId: newRole.id },
        { context: testContext }
      );

      // Assert
      expect(assignment.companyRoleId).toBe(newRole.id);
      expect(assignment.version).toBe(2); // Version incremented
    });
  });

  describe('Scopes', () => {
    let activeAssignment, deletedAssignment;
    
    beforeEach(async () => {
      // Create active assignment
      activeAssignment = await CompanyUser.create(
        createCompanyUserData(regularUser.id, testCompany.id, testRole.id),
        { context: testContext }
      );
      
      // Create and delete assignment
      const user2 = await User.create(createUserData({ email: 'deleted@example.com' }));
      deletedAssignment = await CompanyUser.create(
        createCompanyUserData(user2.id, testCompany.id, testRole.id),
        { context: testContext }
      );
      await deletedAssignment.destroy({ context: testContext });
    });

    it('should exclude deleted assignments by default', async () => {
      // Act
      const assignments = await CompanyUser.findAll();

      // Assert
      expect(assignments).toHaveLength(1);
      expect(assignments[0].id).toBe(activeAssignment.id);
    });

    it('should include deleted assignments with withDeleted scope', async () => {
      // Act
      const assignments = await CompanyUser.scope('withDeleted').findAll();

      // Assert
      expect(assignments).toHaveLength(2);
    });

    it('should only get deleted assignments with onlyDeleted scope', async () => {
      // Act
      const assignments = await CompanyUser.scope('onlyDeleted').findAll();

      // Assert
      expect(assignments).toHaveLength(1);
      expect(assignments[0].id).toBe(deletedAssignment.id);
    });
  });

  describe('Validation', () => {
    it('should require userId', async () => {
      // Arrange
      const invalidData = createCompanyUserData(null, testCompany.id, testRole.id);

      // Act & Assert
      await expect(
        CompanyUser.create(invalidData, { context: testContext })
      ).rejects.toThrow();
    });

    it('should require companyId', async () => {
      // Arrange
      const invalidData = createCompanyUserData(regularUser.id, null, testRole.id);

      // Act & Assert
      await expect(
        CompanyUser.create(invalidData, { context: testContext })
      ).rejects.toThrow();
    });

    it('should require companyRoleId', async () => {
      // Arrange
      const invalidData = createCompanyUserData(regularUser.id, testCompany.id, null);

      // Act & Assert
      await expect(
        CompanyUser.create(invalidData, { context: testContext })
      ).rejects.toThrow();
    });

    it('should enforce unique constraint on userId + companyId', async () => {
      // Arrange - create first assignment
      await CompanyUser.create(
        createCompanyUserData(regularUser.id, testCompany.id, testRole.id),
        { context: testContext }
      );

      // Act & Assert - duplicate assignment should fail
      await expect(
        CompanyUser.create(
          createCompanyUserData(regularUser.id, testCompany.id, testRole.id),
          { context: testContext }
        )
      ).rejects.toThrow();
    });

    it('should allow same user in different companies', async () => {
      // Arrange
      const company2 = await Company.create(
        createCompanyData({ name: 'Company 2' }),
        { context: testContext }
      );
      const role2 = await CompanyRole.create(
        createRoleData(company2.id, { name: 'Manager', code: 'MANAGER' }),
        { context: testContext }
      );
      
      await CompanyUser.create(
        createCompanyUserData(regularUser.id, testCompany.id, testRole.id),
        { context: testContext }
      );

      // Act - same user, different company
      const assignment2 = await CompanyUser.create(
        createCompanyUserData(regularUser.id, company2.id, role2.id),
        { context: testContext }
      );

      // Assert - should succeed
      expect(assignment2).toBeDefined();
      expect(assignment2.userId).toBe(regularUser.id);
      expect(assignment2.companyId).toBe(company2.id);
    });

    it('should allow different users in same company', async () => {
      // Arrange
      const user2 = await User.create(createUserData({ email: 'user2@example.com' }));
      
      await CompanyUser.create(
        createCompanyUserData(regularUser.id, testCompany.id, testRole.id),
        { context: testContext }
      );

      // Act - different user, same company
      const assignment2 = await CompanyUser.create(
        createCompanyUserData(user2.id, testCompany.id, testRole.id),
        { context: testContext }
      );

      // Assert - should succeed
      expect(assignment2).toBeDefined();
      expect(assignment2.userId).toBe(user2.id);
      expect(assignment2.companyId).toBe(testCompany.id);
    });
  });

  describe('Default Values', () => {
    it('should have isActive=true by default', async () => {
      // Arrange
      const assignmentData = createCompanyUserData(regularUser.id, testCompany.id, testRole.id);
      delete assignmentData.isActive;

      // Act
      const assignment = await CompanyUser.create(assignmentData, { context: testContext });

      // Assert
      expect(assignment.isActive).toBe(true);
    });

    it('should have isDeleted=false by default', async () => {
      // Arrange & Act
      const assignment = await CompanyUser.create(
        createCompanyUserData(regularUser.id, testCompany.id, testRole.id),
        { context: testContext }
      );

      // Assert
      expect(assignment.isDeleted).toBe(false);
    });

    it('should have version=1 on creation', async () => {
      // Arrange & Act
      const assignment = await CompanyUser.create(
        createCompanyUserData(regularUser.id, testCompany.id, testRole.id),
        { context: testContext }
      );

      // Assert
      expect(assignment.version).toBe(1);
    });
  });

  describe('Context Requirements', () => {
    it('should require context for create operations', async () => {
      // Arrange
      const assignmentData = createCompanyUserData(regularUser.id, testCompany.id, testRole.id);

      // Act & Assert
      await expect(
        CompanyUser.create(assignmentData)
      ).rejects.toThrow(/userId/);
    });

    it('should require context for update operations', async () => {
      // Arrange
      const assignment = await CompanyUser.create(
        createCompanyUserData(regularUser.id, testCompany.id, testRole.id),
        { context: testContext }
      );

      // Act & Assert
      await expect(
        assignment.update({ isActive: false })
      ).rejects.toThrow(/userId/);
    });

    it('should require context for delete operations', async () => {
      // Arrange
      const assignment = await CompanyUser.create(
        createCompanyUserData(regularUser.id, testCompany.id, testRole.id),
        { context: testContext }
      );

      // Act & Assert
      await expect(
        assignment.destroy()
      ).rejects.toThrow(/userId/);
    });
  });
});

