/**
 * @author Bhavesh Venugopal
 * Mock Company Repository
 * Provides reusable mock companyRepository for service tests
 */

import { jest } from '@jest/globals';

/**
 * Create mock companyRepository
 * @returns {Object} Mock companyRepository with all methods
 */
export const createMockCompanyRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findByIdOrFail: jest.fn(),
  findByIdIncludingDeletedOrFail: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  restore: jest.fn(),
  findAndCountAll: jest.fn(),
  searchCompanies: jest.fn(),
  findCompanyWithUsers: jest.fn()
});

