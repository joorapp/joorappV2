/**
 * @author Bhavesh Venugopal
 * Mock Company Model Instances
 * Provides reusable mock Company instances for service tests
 */

import { jest } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { COMPANY_STATUS_DEFAULT } from '../../../src/constants/companyStatus.js';

/**
 * Create mock Company instance
 * @param {Object} overrides - Fields to override
 * @returns {Object} Mock Company model instance
 */
export const createMockCompany = (overrides = {}) => {
  const companyId = overrides.id || uuidv4();
  const userId = overrides.createdUserId || uuidv4();
  return {
    id: companyId,
    name: overrides.name || `Company ${Date.now()}`,
    code: overrides.code !== undefined ? overrides.code : null,
    description: overrides.description !== undefined ? overrides.description : 'Test company description',
    isActive: overrides.isActive !== undefined ? overrides.isActive : true,
    status: overrides.status !== undefined ? overrides.status : COMPANY_STATUS_DEFAULT,
    email: overrides.email !== undefined ? overrides.email : null,
    phone: overrides.phone !== undefined ? overrides.phone : null,
    buildingAddress: overrides.buildingAddress !== undefined ? overrides.buildingAddress : null,
    streetAddress: overrides.streetAddress !== undefined ? overrides.streetAddress : null,
    city: overrides.city !== undefined ? overrides.city : null,
    state: overrides.state !== undefined ? overrides.state : null,
    postalCode: overrides.postalCode !== undefined ? overrides.postalCode : null,
    country: overrides.country !== undefined ? overrides.country : null,
    logo: overrides.logo !== undefined ? overrides.logo : null,
    planId: overrides.planId !== undefined ? overrides.planId : null,
    createdDate: overrides.createdDate || new Date(),
    createdUserId: userId,
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

