/**
 * @author Bhavesh Venugopal
 * Mock Plan Model Instances
 * Provides reusable mock Plan instances for service tests
 */

import { jest } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create mock Plan instance
 * @param {Object} overrides - Fields to override
 * @returns {Object} Mock Plan model instance
 */
export const createMockPlan = (overrides = {}) => {
  const planId = overrides.id || uuidv4();
  const userId = overrides.createdUserId || uuidv4();
  return {
    id: planId,
    name: overrides.name || `Plan ${Date.now()}`,
    code: overrides.code || `PLAN-${Date.now()}`,
    description: overrides.description !== undefined ? overrides.description : 'Test plan description',
    isActive: overrides.isActive !== undefined ? overrides.isActive : true,
    price: overrides.price !== undefined ? overrides.price : 0.00,
    createdDate: overrides.createdDate || new Date(),
    createdUserId: userId,
    createdCompanyId: overrides.createdCompanyId || uuidv4(),
    updatedDate: overrides.updatedDate || new Date(),
    updatedUserId: overrides.updatedUserId || userId,
    version: overrides.version || 1,
    isDeleted: overrides.isDeleted !== undefined ? overrides.isDeleted : false,
    deletedDate: overrides.deletedDate || null,
    deletedUserId: overrides.deletedUserId || null,
    update: jest.fn().mockResolvedValue(undefined),
    ...overrides
  };
};

