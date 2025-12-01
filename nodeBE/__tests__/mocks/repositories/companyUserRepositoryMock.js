/**
 * @author Bhavesh Venugopal
 * Mock CompanyUser Repository
 * Provides reusable mock companyUserRepository for service tests
 */

import { jest } from '@jest/globals';

/**
 * Create mock companyUserRepository
 * @returns {Object} Mock companyUserRepository with all methods
 */
export const createMockCompanyUserRepository = () => ({
  assignUserToCompany: jest.fn(),
  findUserCompanies: jest.fn(),
  findCompanyUsers: jest.fn(),
  findUserCompanyRole: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  checkUserInCompany: jest.fn(),
  findByIdOrFail: jest.fn(),
  create: jest.fn()
});

