/**
 * @author Bhavesh Venugopal
 * UserCompanyContext Model Tests
 * Tests for UserCompanyContext model (NO audit fields, simple mapping table)
 * Tests: CRUD, validation, unique constraints, company relationship
 * 
 * Model Structure:
 * - id (UUID, primary key)
 * - keycloakSessionId (UUID, unique, NOT NULL)
 * - companyId (UUID, nullable, foreign key to companies)
 * - NO audit fields (createdUserId, createdDate, etc.)
 * - NO soft delete (permanent delete)
 */

import { UserCompanyContext, Company, User } from '../index.js';
import { v4 as uuidv4 } from 'uuid';
import { createContextData, createCompanyData, createUserData, createAuditContext } from '../../../__tests__/helpers/factories.js';
import { cleanDatabase } from '../../../__tests__/helpers/database.js';

describe('UserCompanyContext Model', () => {
  let testUser;
  let testCompany;
  let auditContext;
  
  beforeEach(async () => {
    await cleanDatabase();
    
    // Create test user (for audit context of company creation)
    testUser = await User.create(createUserData());
    auditContext = createAuditContext(testUser.id);
    
    // Create test company
    testCompany = await Company.create(
      createCompanyData({ name: 'Test Corp' }),
      { context: auditContext }
    );
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  describe('CRUD Operations', () => {
    it('should create a context with keycloakSessionId and companyId', async () => {
      // Arrange
      const keycloakSessionId = uuidv4();
      const contextData = createContextData(keycloakSessionId, testCompany.id);

      // Act
      const context = await UserCompanyContext.create(contextData);

      // Assert
      expect(context).toBeDefined();
      expect(context.id).toBeDefined();
      expect(context.keycloakSessionId).toBe(keycloakSessionId);
      expect(context.companyId).toBe(testCompany.id);
    });

    it('should find context by keycloakSessionId', async () => {
      // Arrange
      const keycloakSessionId = uuidv4();
      await UserCompanyContext.create(
        createContextData(keycloakSessionId, testCompany.id)
      );

      // Act
      const found = await UserCompanyContext.findOne({
        where: { keycloakSessionId }
      });

      // Assert
      expect(found).toBeDefined();
      expect(found.keycloakSessionId).toBe(keycloakSessionId);
      expect(found.companyId).toBe(testCompany.id);
    });

    it('should update companyId', async () => {
      // Arrange
      const keycloakSessionId = uuidv4();
      const context = await UserCompanyContext.create(
        createContextData(keycloakSessionId, testCompany.id)
      );
      
      const company2 = await Company.create(
        createCompanyData({ name: 'Company 2' }),
        { context: auditContext }
      );

      // Act
      await context.update({ companyId: company2.id });

      // Assert
      expect(context.companyId).toBe(company2.id);
    });

    it('should delete context permanently (no soft delete)', async () => {
      // Arrange
      const keycloakSessionId = uuidv4();
      const context = await UserCompanyContext.create(
        createContextData(keycloakSessionId, testCompany.id)
      );

      // Act
      await context.destroy();

      // Assert - should be permanently deleted (no soft delete)
      const found = await UserCompanyContext.findByPk(context.id);
      expect(found).toBeNull();
    });
  });

  describe('Validation', () => {
    it('should require keycloakSessionId', async () => {
      // Arrange - no keycloakSessionId
      const invalidData = { companyId: testCompany.id };

      // Act & Assert
      await expect(
        UserCompanyContext.create(invalidData)
      ).rejects.toThrow();
    });

    it('should enforce unique keycloakSessionId', async () => {
      // Arrange - create first context
      const keycloakSessionId = uuidv4();
      await UserCompanyContext.create(
        createContextData(keycloakSessionId, testCompany.id)
      );

      // Act & Assert - duplicate keycloakSessionId should fail
      await expect(
        UserCompanyContext.create(
          createContextData(keycloakSessionId, testCompany.id)
        )
      ).rejects.toThrow();
    });

    it('should allow null companyId', async () => {
      // Arrange
      const keycloakSessionId = uuidv4();
      const contextData = createContextData(keycloakSessionId, null);

      // Act
      const context = await UserCompanyContext.create(contextData);

      // Assert
      expect(context).toBeDefined();
      expect(context.companyId).toBeNull();
    });
  });

  describe('Model Properties', () => {
    it('should NOT have audit fields', async () => {
      // Arrange & Act
      const keycloakSessionId = uuidv4();
      const context = await UserCompanyContext.create(
        createContextData(keycloakSessionId, testCompany.id)
      );

      // Assert - should NOT have these fields
      expect(context.createdUserId).toBeUndefined();
      expect(context.createdDate).toBeUndefined();
      expect(context.updatedUserId).toBeUndefined();
      expect(context.updatedDate).toBeUndefined();
      expect(context.version).toBeUndefined();
      expect(context.isDeleted).toBeUndefined();
    });

    it('should use id as primary key (not keycloakSessionId)', async () => {
      // Arrange & Act
      const keycloakSessionId = uuidv4();
      const context = await UserCompanyContext.create(
        createContextData(keycloakSessionId, testCompany.id)
      );

      // Assert
      expect(context.id).toBeDefined();
      expect(context.id).not.toBe(keycloakSessionId);
      
      // Can find by primary key
      const foundById = await UserCompanyContext.findByPk(context.id);
      expect(foundById).toBeDefined();
      expect(foundById.id).toBe(context.id);
    });

    it('should NOT require context for operations', async () => {
      // Arrange
      const keycloakSessionId = uuidv4();
      const contextData = createContextData(keycloakSessionId, testCompany.id);

      // Act - create without audit context (should work)
      const context = await UserCompanyContext.create(contextData);

      // Assert
      expect(context).toBeDefined();
      
      // Update without context (should work)
      await expect(
        context.update({ companyId: null })
      ).resolves.toBeDefined();
      
      // Delete without context (should work)
      await expect(
        context.destroy()
      ).resolves.toBeDefined();
    });
  });

  describe('Foreign Key Relationships', () => {
    it('should link to valid company', async () => {
      // Arrange & Act
      const keycloakSessionId = uuidv4();
      const context = await UserCompanyContext.create(
        createContextData(keycloakSessionId, testCompany.id)
      );

      // Assert - can fetch related company
      const contextWithCompany = await UserCompanyContext.findByPk(context.id, {
        include: [{ model: Company, as: 'company' }]
      });
      
      expect(contextWithCompany).toBeDefined();
      expect(contextWithCompany.company).toBeDefined();
      expect(contextWithCompany.company.id).toBe(testCompany.id);
    });

    it('should allow null companyId (for SUPER_ADMIN)', async () => {
      // Arrange & Act
      const keycloakSessionId = uuidv4();
      const context = await UserCompanyContext.create(
        createContextData(keycloakSessionId, null)
      );

      // Assert
      expect(context).toBeDefined();
      expect(context.companyId).toBeNull();
    });

    it('should reject invalid companyId', async () => {
      // Arrange
      const keycloakSessionId = uuidv4();
      const fakeCompanyId = uuidv4();
      const contextData = createContextData(keycloakSessionId, fakeCompanyId);

      // Act & Assert - should fail due to foreign key constraint
      await expect(
        UserCompanyContext.create(contextData)
      ).rejects.toThrow();
    });
  });
});
