/**
 * @author Bhavesh Venugopal
 * Mock CompanyRole Model Instances
 * Provides reusable mock CompanyRole instances for service tests
 */

import { jest } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create mock CompanyRole instance
 * @param {Object} overrides - Fields to override
 * @returns {Object} Mock CompanyRole model instance
 */
export const createMockRole = (overrides = {}) => {
  const roleId = overrides.id || uuidv4();
  const userId = overrides.createdUserId || uuidv4();
  return {
    id: roleId,
    name: overrides.name || `Role ${Date.now()}`,
    code: overrides.code || `ROLE-${Date.now()}`,
    description: overrides.description !== undefined ? overrides.description : 'Test role description',
    isActive: overrides.isActive !== undefined ? overrides.isActive : true,
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

