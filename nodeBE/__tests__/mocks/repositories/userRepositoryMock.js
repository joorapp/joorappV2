/**
 * @author Bhavesh Venugopal
 * Mock User Repository
 * Provides reusable mock userRepository for service tests
 */

import { jest } from '@jest/globals';

/**
 * Create mock userRepository
 * @returns {Object} Mock userRepository with all methods
 */
export const createMockUserRepository = () => ({
  findByIdOrFail: jest.fn(),
  findOne: jest.fn(),
  searchUsers: jest.fn(),
  findAndCountAll: jest.fn(),
  findUserWithCompanies: jest.fn(),
  findUsersByCompany: jest.fn()
});

