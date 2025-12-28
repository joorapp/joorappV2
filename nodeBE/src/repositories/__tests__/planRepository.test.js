/**
 * @author Bhavesh Venugopal
 * PlanRepository Tests
 * Tests for PlanRepository complex query methods and CRUD with audit context
 */

import { planRepository } from '../planRepository.js';
import { Plan, User } from '../../models/index.js';
import { createPlanData, createUserData, createAuditContext } from '../../../__tests__/helpers/factories.js';
import { cleanDatabase } from '../../../__tests__/helpers/database.js';
import { sequelize } from '../../config/database.js';

describe('PlanRepository', () => {
  let testUser;
  let auditContext;

  beforeEach(async () => {
    await cleanDatabase();
    
    testUser = await User.create(createUserData());
    auditContext = createAuditContext(testUser.id);
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  describe('MasterBaseRepository Methods', () => {
    beforeEach(async () => {
      // Clean plans table to ensure test isolation
      await sequelize.query('TRUNCATE TABLE plans CASCADE');
    });

    it('should create plan without context using create', async () => {
      // Arrange
      const planData = createPlanData({ name: 'Test Plan', price: 49.99 });

      // Act
      const plan = await planRepository.create(planData);

      // Assert
      expect(plan).toBeDefined();
      expect(plan.id).toBeValidUUID();
      expect(plan.name).toBe('Test Plan');
      expect(parseFloat(plan.price)).toBe(49.99);
      expect(plan.createdDate).toBeDefined();
      expect(plan.updatedDate).toBeDefined();
      expect(plan.version).toBe(1);
    });

    it('should update plan without context using update', async () => {
      // Arrange
      const plan = await planRepository.create(
        createPlanData({ name: 'Old Name', price: 10.00 })
      );

      // Act
      const updated = await planRepository.update(
        plan.id,
        { name: 'New Name', price: 20.00 }
      );

      // Assert
      expect(updated.name).toBe('New Name');
      expect(parseFloat(updated.price)).toBe(20.00);
      expect(updated.updatedDate).toBeDefined();
      expect(updated.version).toBe(2); // Version incremented
    });

    it('should soft delete plan using delete', async () => {
      // Arrange
      const plan = await planRepository.create(
        createPlanData()
      );

      // Act
      await planRepository.delete(plan.id, { deletedUserId: testUser.id });

      // Assert - should not be found by default
      const found = await planRepository.findById(plan.id);
      expect(found).toBeNull();

      // But should be found with includeDeleted
      const foundDeleted = await planRepository.findByIdIncludingDeleted(plan.id);
      expect(foundDeleted).toBeDefined();
      expect(foundDeleted.isDeleted).toBe(true);
    });

    it('should restore soft-deleted plan using restore', async () => {
      // Arrange
      const plan = await planRepository.create(
        createPlanData()
      );
      await planRepository.delete(plan.id, { deletedUserId: testUser.id });

      // Act
      const restored = await planRepository.restore(plan.id);

      // Assert
      expect(restored.isDeleted).toBe(false);
      expect(restored.deletedUserId).toBeNull();
      
      // Should be findable by default after restore
      const found = await planRepository.findById(plan.id);
      expect(found).toBeDefined();
    });

    it('should find plan by ID using findById', async () => {
      // Arrange
      const created = await planRepository.create(
        createPlanData()
      );

      // Act
      const found = await planRepository.findById(created.id);

      // Assert
      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.name).toBe(created.name);
    });

    it('should find all plans using findAll', async () => {
      // Arrange
      await planRepository.create(
        createPlanData({ name: 'Plan 1', code: 'PLAN1', price: 10.00 })
      );
      await planRepository.create(
        createPlanData({ name: 'Plan 2', code: 'PLAN2', price: 20.00 })
      );

      // Act
      const plans = await planRepository.findAll();

      // Assert
      expect(plans.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Custom Query: findPlanByCode', () => {
    beforeEach(async () => {
      // Clean plans table to ensure test isolation
      await sequelize.query('TRUNCATE TABLE plans CASCADE');
    });

    it('should find plan by unique code', async () => {
      // Arrange
      const plan = await planRepository.create(
        createPlanData({ name: 'Basic Plan', code: 'BASIC', price: 0.00 })
      );

      // Act
      const found = await planRepository.findPlanByCode('BASIC');

      // Assert
      expect(found).toBeDefined();
      expect(found.id).toBe(plan.id);
      expect(found.code).toBe('BASIC');
      expect(found.name).toBe('Basic Plan');
    });

    it('should return null when plan code does not exist', async () => {
      // Act
      const found = await planRepository.findPlanByCode('NONEXISTENT');

      // Assert
      expect(found).toBeNull();
    });

    it('should respect additional query options', async () => {
      // Arrange
      const plan = await planRepository.create(
        createPlanData({ name: 'Premium Plan', code: 'PREMIUM', price: 99.99, isActive: true })
      );

      // Act - find with isActive filter
      const found = await planRepository.findPlanByCode('PREMIUM', {
        where: { isActive: true }
      });

      // Assert
      expect(found).toBeDefined();
      expect(found.id).toBe(plan.id);
    });
  });
});

