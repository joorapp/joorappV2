/**
 * @author Bhavesh Venugopal
 * Company Model Tests
 * Tests for Company model with AuditableEntity mixin
 * Tests: CRUD, audit fields, soft delete, scopes, optimistic locking, validation
 */

import { Company, User } from '../index.js';
import { v4 as uuidv4 } from 'uuid';
import { createCompanyData, createUserData, createAuditContext } from '../../../__tests__/helpers/factories.js';
import { cleanCompanies, cleanUsers, cleanDatabase } from '../../../__tests__/helpers/database.js';

describe('Company Model', () => {
  let testContext;
  let testUser;
  
  beforeEach(async () => {
    await cleanDatabase();
    
    // Create a test user for audit operations
    testUser = await User.create(createUserData());
    
    // Create context with the real user ID
    testContext = createAuditContext(testUser.id);
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  describe('CRUD Operations', () => {
    it('should create a company with audit fields', async () => {
      // Arrange
      const companyData = createCompanyData({
        name: 'Test Corporation',
        code: 'TESTCORP'
      });

      // Act
      const company = await Company.create(companyData, { context: testContext });

      // Assert
      expect(company).toBeDefined();
      expect(company.id).toBeValidUUID();
      expect(company.name).toBe('Test Corporation');
      expect(company.code).toBe('TESTCORP');
      expect(company.isActive).toBe(true);
      
      // Verify audit fields
      expect(company).toHaveAuditFields();
      expect(company.createdUserId).toBe(testContext.userId);
      expect(company.createdDate).toBeRecentDate();
      expect(company.version).toBe(1); // Hooks set version=1 on creation
      expect(company.isDeleted).toBe(false);
    });

    it('should find created company by ID', async () => {
      // Arrange
      const companyData = createCompanyData();
      const created = await Company.create(companyData, { context: testContext });

      // Act
      const found = await Company.findByPk(created.id);

      // Assert
      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.name).toBe(created.name);
    });

    it('should update company and increment version', async () => {
      // Arrange
      const company = await Company.create(
        createCompanyData({ name: 'Old Name' }),
        { context: testContext }
      );
      const originalVersion = company.version;

      // Act
      await company.update(
        { name: 'New Name' },
        { context: testContext }  // Use same context with real user
      );

      // Assert
      expect(company.name).toBe('New Name');
      expect(company.version).toBe(originalVersion + 1);
      expect(company.updatedUserId).toBe(testContext.userId);
      expect(company.updatedDate).toBeRecentDate();
    });

    it('should soft delete company', async () => {
      // Arrange
      const company = await Company.create(
        createCompanyData(),
        { context: testContext }
      );

      // Act
      await company.destroy({ context: testContext });  // Use same context with real user

      // Assert - should be marked as deleted
      expect(company.isDeleted).toBe(true);
      expect(company.deletedUserId).toBe(testContext.userId);
      
      // Should not be found by default scope
      const notFound = await Company.findByPk(company.id);
      expect(notFound).toBeNull();
    });

    it('should restore soft-deleted company', async () => {
      // Arrange - create and soft delete
      const company = await Company.create(
        createCompanyData(),
        { context: testContext }
      );
      await company.destroy({ context: testContext });
      
      // Act - restore
      company.isDeleted = false;
      company.deletedUserId = null;
      await company.save({ context: testContext });  // Use same context with real user

      // Assert
      expect(company.isDeleted).toBe(false);
      expect(company.deletedUserId).toBeNull();
      
      // Should be found by default scope now
      const found = await Company.findByPk(company.id);
      expect(found).toBeDefined();
    });
  });

  describe('Scopes', () => {
    let activeCompany, deletedCompany;
    
    beforeEach(async () => {
      // Create active company
      activeCompany = await Company.create(
        createCompanyData({ name: 'Active Company' }),
        { context: testContext }
      );
      
      // Create and delete company
      deletedCompany = await Company.create(
        createCompanyData({ name: 'Deleted Company' }),
        { context: testContext }
      );
      await deletedCompany.destroy({ context: testContext });
    });

    it('should exclude deleted companies by default (default scope)', async () => {
      // Act
      const companies = await Company.findAll();

      // Assert
      expect(companies).toHaveLength(1);
      expect(companies[0].id).toBe(activeCompany.id);
    });

    it('should include deleted companies with withDeleted scope', async () => {
      // Act
      const companies = await Company.scope('withDeleted').findAll();

      // Assert
      expect(companies).toHaveLength(2);
      const ids = companies.map(c => c.id);
      expect(ids).toContain(activeCompany.id);
      expect(ids).toContain(deletedCompany.id);
    });

    it('should only get deleted companies with onlyDeleted scope', async () => {
      // Act
      const companies = await Company.scope('onlyDeleted').findAll();

      // Assert
      expect(companies).toHaveLength(1);
      expect(companies[0].id).toBe(deletedCompany.id);
      expect(companies[0].isDeleted).toBe(true);
    });

    it('should count only non-deleted companies by default', async () => {
      // Act
      const count = await Company.count();

      // Assert
      expect(count).toBe(1);
    });

    it('should count all companies with withDeleted scope', async () => {
      // Act
      const count = await Company.scope('withDeleted').count();

      // Assert
      expect(count).toBe(2);
    });
  });

  describe('Validation', () => {
    it('should require name', async () => {
      // Arrange
      const invalidData = createCompanyData({ name: null });
      delete invalidData.name;

      // Act & Assert
      await expect(
        Company.create(invalidData, { context: testContext })
      ).rejects.toThrow();
    });

    it('should enforce unique company name', async () => {
      // Arrange
      const name = 'Unique Company Name';
      await Company.create(
        createCompanyData({ name }),
        { context: testContext }
      );

      // Act & Assert
      await expect(
        Company.create(
          createCompanyData({ name, code: 'DIFFERENT' }),
          { context: testContext }
        )
      ).rejects.toThrow();
    });

    it('should enforce unique company code', async () => {
      // Arrange
      const code = 'UNIQUE';
      await Company.create(
        createCompanyData({ code }),
        { context: testContext }
      );

      // Act & Assert
      await expect(
        Company.create(
          createCompanyData({ name: 'Different Name', code }),
          { context: testContext }
        )
      ).rejects.toThrow();
    });

    it('should allow null code', async () => {
      // Arrange
      const companyData = createCompanyData({ code: null });

      // Act
      const company = await Company.create(companyData, { context: testContext });

      // Assert
      expect(company).toBeDefined();
      expect(company.code).toBeNull();
    });

    it('should allow null description', async () => {
      // Arrange
      const companyData = createCompanyData({ description: null });

      // Act
      const company = await Company.create(companyData, { context: testContext });

      // Assert
      expect(company).toBeDefined();
      expect(company.description).toBeNull();
    });
  });

  describe('Default Values', () => {
    it('should have isActive=true by default', async () => {
      // Arrange
      const companyData = createCompanyData();
      delete companyData.isActive;

      // Act
      const company = await Company.create(companyData, { context: testContext });

      // Assert
      expect(company.isActive).toBe(true);
    });

    it('should have isDeleted=false by default', async () => {
      // Arrange & Act
      const company = await Company.create(
        createCompanyData(),
        { context: testContext }
      );

      // Assert
      expect(company.isDeleted).toBe(false);
    });

    it('should have version=1 on creation', async () => {
      // Arrange & Act
      const company = await Company.create(
        createCompanyData(),
        { context: testContext }
      );

      // Assert
      expect(company.version).toBe(1);
    });
  });

  describe('Optimistic Locking', () => {
    it('should increment version on each update', async () => {
      // Arrange
      const company = await Company.create(
        createCompanyData(),
        { context: testContext }
      );

      // Act - update twice
      await company.update({ description: 'Update 1' }, { context: testContext });
      const versionAfterFirst = company.version;
      
      await company.update({ description: 'Update 2' }, { context: testContext });

      // Assert
      expect(versionAfterFirst).toBe(2); // Initial version is 1, after first update it's 2
      expect(company.version).toBe(3); // After second update it's 3
    });

    it('should throw error on version conflict', async () => {
      // Arrange - create company
      const company = await Company.create(
        createCompanyData(),
        { context: testContext }
      );
      
      // Simulate another process updating the record (realistic: load -> modify -> save)
      const anotherInstance = await Company.findByPk(company.id);
      anotherInstance.description = 'Updated by another process';
      await anotherInstance.save({ context: testContext });
      
      // Original instance still has old version (stale)
      expect(company.version).toBe(1);
      expect(anotherInstance.version).toBe(2);

      // Make a change to the stale instance
      company.name = 'New Name From Stale Instance';

      // Act & Assert - save with stale version should throw OptimisticLockError
      await expect(
        company.save({ context: testContext })
      ).rejects.toThrow(/OptimisticLockError|version/i);
    });

    it('should detect conflict when soft deleting while another process updates', async () => {
      // Arrange - create company
      const companyA = await Company.create(
        createCompanyData(),
        { context: testContext }
      );
      
      // User A loads the company
      const companyB = await Company.findByPk(companyA.id);
      
      // Both have version 1
      expect(companyA.version).toBe(1);
      expect(companyB.version).toBe(1);

      // User A updates the name
      companyA.name = 'Updated Name';
      await companyA.save({ context: testContext });
      
      // Company A now has version 2
      expect(companyA.version).toBe(2);

      // User B tries to soft delete (with stale version 1)
      // This should throw OptimisticLockError
      await expect(
        companyB.destroy({ context: testContext })
      ).rejects.toThrow(/OptimisticLockError|version/i);
      
      // Company should still exist (not deleted)
      const stillExists = await Company.findByPk(companyA.id);
      expect(stillExists).toBeDefined();
      expect(stillExists.isDeleted).toBe(false);
    });

    it('should detect conflict when updating while another process soft deletes', async () => {
      // Arrange - create company
      const companyA = await Company.create(
        createCompanyData(),
        { context: testContext }
      );
      
      // User A loads the company
      const companyB = await Company.findByPk(companyA.id);
      
      // Both have version 1
      expect(companyA.version).toBe(1);
      expect(companyB.version).toBe(1);

      // User A soft deletes
      await companyA.destroy({ context: testContext });
      
      // Company A now has version 2 and is deleted
      expect(companyA.version).toBe(2);
      expect(companyA.isDeleted).toBe(true);

      // User B tries to update (with stale version 1)
      // This should throw OptimisticLockError
      companyB.name = 'New Name';
      await expect(
        companyB.save({ context: testContext })
      ).rejects.toThrow(/OptimisticLockError|version/i);
    });
  });

  describe('Context Requirements', () => {
    it('should require context for create operations', async () => {
      // Arrange
      const companyData = createCompanyData();

      // Act & Assert - create without context should fail
      await expect(
        Company.create(companyData)
      ).rejects.toThrow(/userId/);
    });

    it('should require context for update operations', async () => {
      // Arrange
      const company = await Company.create(
        createCompanyData(),
        { context: testContext }
      );

      // Act & Assert - update without context should fail
      await expect(
        company.update({ name: 'New Name' })
      ).rejects.toThrow(/userId/);
    });

    it('should require context for delete operations', async () => {
      // Arrange
      const company = await Company.create(
        createCompanyData(),
        { context: testContext }
      );

      // Act & Assert - delete without context should fail
      await expect(
        company.destroy()
      ).rejects.toThrow(/userId/);
    });
  });
});

