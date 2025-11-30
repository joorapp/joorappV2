/**
 * @author Bhavesh Venugopal
 * Mock Keycloak Service
 * Provides reusable mock Keycloak admin client and responses for service tests
 */

import { jest } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create mock Keycloak user response
 * @param {Object} overrides - Fields to override
 * @returns {Object} Mock Keycloak user object
 */
export const createMockKeycloakUser = (overrides = {}) => {
  return {
    id: overrides.id || uuidv4(),
    email: overrides.email || `user-${Date.now()}@example.com`,
    firstName: overrides.firstName || 'John',
    lastName: overrides.lastName || 'Doe',
    enabled: overrides.enabled !== undefined ? overrides.enabled : true,
    emailVerified: overrides.emailVerified !== undefined ? overrides.emailVerified : false,
    username: overrides.username || overrides.email || `user-${Date.now()}@example.com`,
    ...overrides
  };
};

/**
 * Create mock Keycloak role response
 * @param {Object} overrides - Fields to override
 * @returns {Object} Mock Keycloak role object
 */
export const createMockKeycloakRole = (overrides = {}) => {
  return {
    id: overrides.id || uuidv4(),
    name: overrides.name || 'COMPANY_USER',
    description: overrides.description || null,
    ...overrides
  };
};

/**
 * Create mock Keycloak admin client
 * @returns {Object} Mock Keycloak admin client with all methods
 */
export const createMockKeycloakAdminClient = () => ({
  users: {
    find: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    resetPassword: jest.fn(),
    listRealmRoleMappings: jest.fn(),
    addRealmRoleMappings: jest.fn(),
    delRealmRoleMappings: jest.fn()
  },
  roles: {
    findOneByName: jest.fn()
  }
});

