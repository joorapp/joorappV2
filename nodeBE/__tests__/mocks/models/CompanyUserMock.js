/**
 * @author Bhavesh Venugopal
 * Mock CompanyUser Model Instances
 * Provides reusable mock CompanyUser instances for service tests
 */

import { jest } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create mock CompanyUser instance
 * @param {Object} overrides - Fields to override
 * @returns {Object} Mock CompanyUser model instance
 */
export const createMockCompanyUser = (overrides = {}) => {
  const assignmentId = overrides.id || uuidv4();
  const userId = overrides.createdUserId || uuidv4();
  return {
    id: assignmentId,
    userId: overrides.userId || uuidv4(),
    companyId: overrides.companyId || uuidv4(),
    companyRoleId: overrides.companyRoleId || uuidv4(),
    isActive: overrides.isActive !== undefined ? overrides.isActive : true,
    createdDate: overrides.createdDate || new Date(),
    createdUserId: userId,
    updatedDate: overrides.updatedDate || new Date(),
    updatedUserId: overrides.updatedUserId || userId,
    version: overrides.version || 1,
    isDeleted: overrides.isDeleted !== undefined ? overrides.isDeleted : false,
    deletedDate: overrides.deletedDate || null,
    deletedUserId: overrides.deletedUserId || null,
    // Associated models (when included in queries)
    user: overrides.user || null,
    company: overrides.company || null,
    role: overrides.role || null,
    update: jest.fn().mockResolvedValue(undefined),
    ...overrides
  };
};


