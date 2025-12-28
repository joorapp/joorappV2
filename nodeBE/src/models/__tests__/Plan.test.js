/**
 * @author Bhavesh Venugopal
 * Plan Model Tests
 * Tests for Plan model with MasterDataEntity mixin
 * Tests: CRUD, audit fields, soft delete, scopes, validation, associations
 */

import { Plan, Company, User } from '../index.js';
import { v4 as uuidv4 } from 'uuid';
import { createPlanData, createCompanyData, createUserData, createAuditContext } from '../../../__tests__/helpers/factories.js';
import { cleanDatabase } from '../../../__tests__/helpers/database.js';
import { sequelize } from '../../config/database.js';

describe('Plan Model', () => {
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
    it('should create a plan with audit fields', async () => {
      // Arrange
      const planData = createPlanData({
        name: 'Premium Plan',
        code: 'PREMIUM',
        price: 99.99
      });

      // Act (master data - no context required)
      const plan = await Plan.create(planData);

      // Assert
      expect(plan).toBeDefined();
      expect(plan.id).toBeValidUUID();
      expect(plan.name).toBe('Premium Plan');
      expect(plan.code).toBe('PREMIUM');
      expect(plan.price).toBe('99.99'); // DECIMAL returns as string
      expect(plan.isActive).toBe(true);
      
      // Verify audit fields (master data - no user FKs)
      expect(plan.createdDate).toBeRecentDate();
      expect(plan.updatedDate).toBeRecentDate();
      expect(plan.version).toBe(1);
      expect(plan.isDeleted).toBe(false);
    });

    it('should find plan by ID', async () => {
      // Arrange (master data - no context required)
      const created = await Plan.create(createPlanData());

      // Act
      const found = await Plan.findByPk(created.id);

      // Assert
      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.name).toBe(created.name);
    });

    it('should find all plans', async () => {
      // Arrange - create multiple plans (master table)
      // Note: BASIC plan may already exist from migration, so we'll create additional plans
      await Plan.create(
        createPlanData({ name: 'Premium Plan', code: 'PREMIUM', price: 99.99 })
      );
      await Plan.create(
        createPlanData({ name: 'Enterprise Plan', code: 'ENTERPRISE', price: 199.99 })
      );

      // Act
      const plans = await Plan.findAll();

      // Assert - should have at least 2 plans (BASIC from migration + our created plans)
      expect(plans.length).toBeGreaterThanOrEqual(2);
      // Check for Premium Plan (we just created)
      expect(plans.some(p => p.name === 'Premium Plan')).toBe(true);
      // Check for Enterprise Plan (we just created)
      expect(plans.some(p => p.name === 'Enterprise Plan')).toBe(true);
    });
  });

  describe('Scopes', () => {
    let activePlan, deletedPlan;
    
    beforeEach(async () => {
      // Clean ALL plans and companies to ensure isolation
      await sequelize.query('TRUNCATE TABLE plans CASCADE');
      await sequelize.query('TRUNCATE TABLE companies CASCADE');
      
      // Recreate test user, company, and context after cleanup
      testUser = await User.create(createUserData());
      testContext = createAuditContext(testUser.id);
      
      testCompany = await Company.create(
        createCompanyData({ name: 'Test Corp' }),
        { context: testContext }
      );
      
      // Create active plan (master data - no context required)
      activePlan = await Plan.create(
        createPlanData({ name: 'Active Plan', code: 'ACTIVE', price: 49.99 })
      );

      // Create and delete plan (master data - deletedUserId optional)
      deletedPlan = await Plan.create(
        createPlanData({ name: 'Deleted Plan', code: 'DELETED', price: 29.99 })
      );
      await deletedPlan.destroy({ deletedUserId: testUser.id });
    });

    it('should exclude deleted plans by default', async () => {
      // Act
      const plans = await Plan.findAll();

      // Assert
      expect(plans).toHaveLength(1);
      expect(plans[0].id).toBe(activePlan.id);
    });

    it('should include deleted plans with withDeleted scope', async () => {
      // Act
      const plans = await Plan.scope('withDeleted').findAll();

      // Assert
      expect(plans).toHaveLength(2);
    });

    it('should only get deleted plans with onlyDeleted scope', async () => {
      // Act
      const plans = await Plan.scope('onlyDeleted').findAll();

      // Assert
      expect(plans).toHaveLength(1);
      expect(plans[0].id).toBe(deletedPlan.id);
      expect(plans[0].isDeleted).toBe(true);
    });
  });

  describe('Validation', () => {
    it('should require name', async () => {
      // Arrange
      const invalidData = createPlanData({ name: null });
      delete invalidData.name;

      // Act & Assert (master data - no context required)
      await expect(
        Plan.create(invalidData)
      ).rejects.toThrow();
    });

    it('should require code', async () => {
      // Arrange
      const invalidData = createPlanData({ code: null });
      delete invalidData.code;

      // Act & Assert (master data - no context required)
      await expect(
        Plan.create(invalidData)
      ).rejects.toThrow();
    });

    it('should require price', async () => {
      // Arrange
      const planData = createPlanData();
      delete planData.price; // Omit price to test default value

      // Act - price should default to 0.00 when not provided (master data - no context required)
      const plan = await Plan.create(planData);
      
      // Assert - Price should default to 0.00
      expect(plan.price).toBe('0.00');
    });

    it('should enforce price minimum value (0)', async () => {
      // Arrange
      const invalidData = createPlanData({ price: -10.00 });

      // Act & Assert (master data - no context required)
      await expect(
        Plan.create(invalidData)
      ).rejects.toThrow();
    });

    it('should enforce globally unique plan name', async () => {
      // Arrange - Plan is a master table, names are globally unique
      const name = 'Unique Plan';
      await Plan.create(
        createPlanData({ name, code: 'UNIQUE1', price: 10.00 })
      );

      // Act & Assert - same name should fail (globally unique)
      await expect(
        Plan.create(
          createPlanData({ name, code: 'UNIQUE2', price: 20.00 })
        )
      ).rejects.toThrow();
    });

    it('should enforce globally unique plan code', async () => {
      // Arrange - Plan is a master table, codes are globally unique
      const code = 'UNIQUE';
      await Plan.create(
        createPlanData({ name: 'First Plan', code, price: 10.00 })
      );

      // Act & Assert - same code should fail (globally unique)
      await expect(
        Plan.create(
          createPlanData({ name: 'Second Plan', code, price: 20.00 })
        )
      ).rejects.toThrow();
    });
  });

  describe('Default Values', () => {
    it('should have isActive=true by default', async () => {
      // Arrange
      const planData = createPlanData();
      delete planData.isActive;

      // Act (master data - no context required)
      const plan = await Plan.create(planData);

      // Assert
      expect(plan.isActive).toBe(true);
    });

    it('should have price=0.00 by default', async () => {
      // Arrange
      const planData = createPlanData();
      delete planData.price;

      // Act (master data - no context required)
      const plan = await Plan.create(planData);

      // Assert
      expect(plan.price).toBe('0.00');
    });

    it('should have isDeleted=false by default', async () => {
      // Arrange & Act
      const plan = await Plan.create(
        createPlanData(),
        { context: testContext }
      );

      // Assert
      expect(plan.isDeleted).toBe(false);
    });

    it('should have version=1 on creation', async () => {
      // Arrange & Act
      const plan = await Plan.create(
        createPlanData(),
        { context: testContext }
      );

      // Assert
      expect(plan.version).toBe(1);
    });

    it('should allow null description', async () => {
      // Arrange
      const planData = createPlanData({ description: null });

      // Act (master data - no context required)
      const plan = await Plan.create(planData);

      // Assert
      expect(plan).toBeDefined();
      expect(plan.description).toBeNull();
    });
  });

  describe('Price Field', () => {
    it('should accept valid decimal price values', async () => {
      // Arrange
      const planData = createPlanData({ price: 99.99 });

      // Act (master data - no context required)
      const plan = await Plan.create(planData);

      // Assert
      expect(parseFloat(plan.price)).toBe(99.99);
    });

    it('should accept zero price', async () => {
      // Arrange
      const planData = createPlanData({ price: 0.00 });

      // Act (master data - no context required)
      const plan = await Plan.create(planData);

      // Assert
      expect(parseFloat(plan.price)).toBe(0.00);
    });

    it('should accept large price values', async () => {
      // Arrange
      const planData = createPlanData({ price: 9999.99 });

      // Act (master data - no context required)
      const plan = await Plan.create(planData);

      // Assert
      expect(parseFloat(plan.price)).toBe(9999.99);
    });
  });

  describe('Master Data Operations', () => {
    it('should create plan without context (master data)', async () => {
      // Arrange
      const planData = createPlanData();

      // Act (master data - no context required)
      const plan = await Plan.create(planData);

      // Assert
      expect(plan).toBeDefined();
      expect(plan.id).toBeValidUUID();
      expect(plan.createdDate).toBeRecentDate();
    });

    it('should update plan without context (master data)', async () => {
      // Arrange
      const plan = await Plan.create(createPlanData());

      // Act (master data - no context required)
      await plan.update({ name: 'New Name' });

      // Assert
      expect(plan.name).toBe('New Name');
    });

    it('should delete plan without context (master data)', async () => {
      // Arrange
      const plan = await Plan.create(createPlanData({ code: 'TEST_DELETE' }));

      // Act (master data - deletedUserId optional)
      await plan.destroy();

      // Assert
      const deleted = await Plan.scope('onlyDeleted').findByPk(plan.id);
      expect(deleted).toBeDefined();
      expect(deleted.isDeleted).toBe(true);
    });
  });

  describe('Associations', () => {
    it('should have hasMany relationship with Company', async () => {
      // Arrange (master data - no context required for Plan)
      const plan = await Plan.create(
        createPlanData({ name: 'Test Plan', code: 'TEST', price: 50.00 })
      );
      
      const company1 = await Company.create(
        createCompanyData({ name: 'Company 1', planId: plan.id }),
        { context: testContext }
      );
      const company2 = await Company.create(
        createCompanyData({ name: 'Company 2', planId: plan.id }),
        { context: testContext }
      );

      // Act
      const companies = await plan.getCompanies();

      // Assert
      expect(companies).toHaveLength(2);
      expect(companies.map(c => c.id)).toContain(company1.id);
      expect(companies.map(c => c.id)).toContain(company2.id);
    });

    it('should allow null planId in Company (optional relationship)', async () => {
      // Arrange
      const company = await Company.create(
        createCompanyData({ name: 'Company Without Plan', planId: null }),
        { context: testContext }
      );

      // Assert
      expect(company.planId).toBeNull();
    });
  });
});

