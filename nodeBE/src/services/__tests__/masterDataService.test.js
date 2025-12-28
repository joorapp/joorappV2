/**
 * @author Bhavesh Venugopal
 * Master Data Service Tests
 * Tests for master data seeding functionality
 */

import { jest, describe, it, expect, beforeAll, beforeEach } from '@jest/globals';
import { checkAndSeedBasicPlan, checkAndSeedMasterData } from '../masterDataService.js';
import { planRepository } from '../../repositories/planRepository.js';
import { Plan, User } from '../../models/index.js';
import { BASIC_PLAN_MASTER_DATA } from '../../constants/masterData.js';
import { createUserData, createPlanData, createAuditContext } from '../../../__tests__/helpers/factories.js';
import { cleanDatabase } from '../../../__tests__/helpers/database.js';
import { sequelize } from '../../config/database.js';
import { KEYCLOAK_GLOBAL_ROLE_VALUES } from '../../constants/keycloakRoles.js';

describe('Master Data Service', () => {
  let testUser;
  let auditContext;
  
  beforeEach(async () => {
    await cleanDatabase();
    testUser = await User.create(createUserData({ 
      keycloakGlobalRole: KEYCLOAK_GLOBAL_ROLE_VALUES.SUPER_ADMIN 
    }));
    auditContext = createAuditContext(testUser.id);
  });
  
  describe('checkAndSeedBasicPlan', () => {
    beforeEach(async () => {
      // Clean plans table for each test
      await sequelize.query('TRUNCATE TABLE plans CASCADE');
    });
    
    it('should create BASIC plan when it does not exist', async () => {
      // Arrange - no plans exist
      
      // Act
      const result = await checkAndSeedBasicPlan();
      
      // Assert
      expect(result.seeded).toBe(true);
      expect(result.action).toBe('created');
      expect(result.plan).toBeDefined();
      expect(result.plan.code).toBe('BASIC');
      expect(result.plan.name).toBe(BASIC_PLAN_MASTER_DATA.name);
      expect(result.plan.description).toBe(BASIC_PLAN_MASTER_DATA.description);
      expect(parseFloat(result.plan.price)).toBe(BASIC_PLAN_MASTER_DATA.price);
      expect(result.plan.isActive).toBe(BASIC_PLAN_MASTER_DATA.isActive);
      expect(result.plan.isDeleted).toBe(false);
    });
    
    it('should restore soft-deleted BASIC plan', async () => {
      // Arrange - create BASIC plan
      const deletedPlan = await Plan.create(
        createPlanData({
          name: BASIC_PLAN_MASTER_DATA.name,
          code: BASIC_PLAN_MASTER_DATA.code,
          description: BASIC_PLAN_MASTER_DATA.description,
          price: BASIC_PLAN_MASTER_DATA.price,
          isActive: BASIC_PLAN_MASTER_DATA.isActive
        })
      );
      
      // Manually soft delete the plan (since destroy() now prevents BASIC plan deletion)
      // This simulates a scenario where the plan was soft-deleted before the protection was added
      await sequelize.query(`
        UPDATE plans 
        SET is_deleted = true,
            deleted_user_id = :userId,
            updated_date = CURRENT_TIMESTAMP
        WHERE id = :planId
      `, {
        replacements: { 
          userId: testUser.id,
          planId: deletedPlan.id 
        },
        type: sequelize.QueryTypes.UPDATE
      });
      
      // Verify it's soft-deleted (use unscoped query since default scope excludes deleted)
      const reloadedPlan = await Plan.unscoped().findByPk(deletedPlan.id);
      expect(reloadedPlan).toBeDefined();
      expect(reloadedPlan.isDeleted).toBe(true);
      
      // Act
      const result = await checkAndSeedBasicPlan();
      
      // Assert
      expect(result.seeded).toBe(true);
      expect(result.action).toBe('restored');
      expect(result.plan.id).toBe(deletedPlan.id);
      expect(result.plan.isDeleted).toBe(false);
      expect(result.plan.deletedUserId).toBeNull();
    });
    
    it('should update existing BASIC plan if data differs', async () => {
      // Arrange - create BASIC plan with different data
      const existingPlan = await Plan.create(
        createPlanData({
          name: 'Old Basic',
          code: 'BASIC',
          description: 'Old description',
          price: 10.00,
          isActive: false
        })
      );
      
      // Act
      const result = await checkAndSeedBasicPlan();
      
      // Assert
      expect(result.seeded).toBe(true);
      expect(result.action).toBe('updated');
      expect(result.plan.id).toBe(existingPlan.id);
      
      // Reload from database to verify updates
      await existingPlan.reload();
      expect(existingPlan.name).toBe(BASIC_PLAN_MASTER_DATA.name);
      expect(existingPlan.description).toBe(BASIC_PLAN_MASTER_DATA.description);
      expect(parseFloat(existingPlan.price)).toBe(BASIC_PLAN_MASTER_DATA.price);
      expect(existingPlan.isActive).toBe(BASIC_PLAN_MASTER_DATA.isActive);
    });
    
    it('should not update BASIC plan if data matches', async () => {
      // Arrange - create BASIC plan matching master data
      const existingPlan = await Plan.create(
        createPlanData({
          name: BASIC_PLAN_MASTER_DATA.name,
          code: BASIC_PLAN_MASTER_DATA.code,
          description: BASIC_PLAN_MASTER_DATA.description,
          price: BASIC_PLAN_MASTER_DATA.price,
          isActive: BASIC_PLAN_MASTER_DATA.isActive
        })
      );
      
      const originalVersion = existingPlan.version;
      
      // Act
      const result = await checkAndSeedBasicPlan();
      
      // Assert
      expect(result.seeded).toBe(false);
      expect(result.action).toBe('exists');
      expect(result.plan.id).toBe(existingPlan.id);
      
      // Reload and verify version wasn't incremented (no update occurred)
      await existingPlan.reload();
      expect(existingPlan.version).toBe(originalVersion);
    });
    
    it('should create BASIC plan even when no users exist', async () => {
      // Arrange - delete test user (no users exist)
      await User.destroy({ where: {} });
      
      // Act - Plan uses MasterDataEntity, so it doesn't require users
      const result = await checkAndSeedBasicPlan();
      
      // Assert - should succeed because Plan doesn't need user context
      expect(result.seeded).toBe(true);
      expect(result.action).toBe('created');
      expect(result.plan.code).toBe('BASIC');
    });
  });
  
  describe('checkAndSeedMasterData', () => {
    beforeEach(async () => {
      // Clean plans table for each test
      await sequelize.query('TRUNCATE TABLE plans CASCADE');
    });
    
    it('should seed all master data types', async () => {
      // Act
      const results = await checkAndSeedMasterData();
      
      // Assert
      expect(results.BASIC_PLAN).toBeDefined();
      expect(results.BASIC_PLAN.seeded).toBe(true);
      expect(results.errors).toHaveLength(0);
    });
    
    it('should handle errors gracefully and continue', async () => {
      // Arrange - mock planRepository to throw error
      const originalCreate = planRepository.create;
      planRepository.create = jest.fn().mockRejectedValue(new Error('Database error'));
      
      try {
        // Act
        const results = await checkAndSeedMasterData();
        
        // Assert
        expect(results.errors).toHaveLength(1);
        expect(results.errors[0].type).toBe('BASIC_PLAN');
        expect(results.errors[0].error).toBe('Database error');
      } finally {
        // Restore original method
        planRepository.create = originalCreate;
      }
    });
  });
});


