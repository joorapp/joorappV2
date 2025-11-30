/**
 * @author Bhavesh Venugopal
 * Mock User Model Instances
 * Provides reusable mock User instances for service tests
 */

import { jest } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create mock User instance
 * @param {Object} overrides - Fields to override
 * @returns {Object} Mock User model instance
 */
export const createMockUser = (overrides = {}) => {
  const userId = overrides.id || uuidv4();
  return {
    id: userId,
    keycloakId: overrides.keycloakId || uuidv4(),
    email: overrides.email || `user-${Date.now()}@example.com`,
    firstName: overrides.firstName !== undefined ? overrides.firstName : 'John',
    lastName: overrides.lastName !== undefined ? overrides.lastName : 'Doe',
    keycloakGlobalRole: overrides.keycloakGlobalRole || 'COMPANY_USER',
    isActive: overrides.isActive !== undefined ? overrides.isActive : true,
    lastLoginAt: overrides.lastLoginAt || new Date(),
    update: jest.fn().mockResolvedValue(undefined),
    ...overrides
  };
};

/**
 * Create mock User with companies (for findUserWithCompanies)
 * @param {Object} overrides - Fields to override
 * @returns {Object} Mock User with companyUsers populated
 */
export const createMockUserWithCompanies = (overrides = {}) => {
  const user = createMockUser(overrides);
  return {
    ...user,
    companyUsers: overrides.companyUsers || [],
    ...overrides
  };
};

