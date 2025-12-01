/**
 * @author Bhavesh Venugopal
 * Mock Role Repository
 * Provides reusable mock roleRepository for service tests
 */

import { jest } from '@jest/globals';

/**
 * Create mock roleRepository
 * @returns {Object} Mock roleRepository with all methods
 */
export const createMockRoleRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findByIdOrFail: jest.fn(),
  findRoleByCode: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findAndCountAll: jest.fn(),
  findRoleWithAssignments: jest.fn(),
  getRoles: jest.fn(),
  findActiveRoles: jest.fn()
});

