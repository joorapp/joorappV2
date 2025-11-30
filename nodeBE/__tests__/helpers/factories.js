/**
 * @author Bhavesh Venugopal
 * Test Data Factories
 * Provides factory functions to generate valid test data for models
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Generate unique email for testing
 * @returns {string} Unique email address
 */
const generateUniqueEmail = () => {
  return `test-${uuidv4()}@example.com`;
};

/**
 * Generate unique name for testing
 * @param {string} prefix - Prefix for the name
 * @returns {string} Unique name
 */
const generateUniqueName = (prefix = 'Test') => {
  return `${prefix} ${Date.now()}-${Math.random().toString(36).substring(7)}`;
};

/**
 * Generate unique code for testing
 * @param {string} prefix - Prefix for the code
 * @returns {string} Unique code
 */
const generateUniqueCode = (prefix = 'TEST') => {
  return `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};

/**
 * Create User test data
 * @param {Object} overrides - Fields to override
 * @returns {Object} User data ready for User.create()
 */
export const createUserData = (overrides = {}) => {
  return {
    email: generateUniqueEmail(),
    keycloakId: uuidv4(),
    keycloakGlobalRole: 'COMPANY_USER',
    isActive: true,
    firstName: null,
    lastName: null,
    lastLoginAt: null,
    ...overrides
  };
};

/**
 * Create Company test data
 * @param {Object} overrides - Fields to override
 * @returns {Object} Company data ready for Company.create()
 */
export const createCompanyData = (overrides = {}) => {
  return {
    name: generateUniqueName('Company'),
    code: generateUniqueCode('COMP'),
    description: 'Test company description',
    isActive: true,
    ...overrides
  };
};

/**
 * Create CompanyRole test data
 * Note: CompanyRole is a master table created by Super Admin only
 * It does NOT belong to any specific company (no companyId field)
 * @param {Object} overrides - Fields to override
 * @returns {Object} CompanyRole data ready for CompanyRole.create()
 */
export const createRoleData = (overrides = {}) => {
  return {
    name: generateUniqueName('Role'),
    code: generateUniqueCode('ROLE'),
    description: 'Test role description',
    isActive: true,
    ...overrides
  };
};

/**
 * Create CompanyUser test data
 * @param {string} userId - User UUID
 * @param {string} companyId - Company UUID
 * @param {string} companyRoleId - CompanyRole UUID
 * @param {Object} overrides - Fields to override
 * @returns {Object} CompanyUser data ready for CompanyUser.create()
 */
export const createCompanyUserData = (userId, companyId, companyRoleId, overrides = {}) => {
  return {
    userId,
    companyId,
    companyRoleId,
    isActive: true,
    ...overrides
  };
};

/**
 * Create UserCompanyContext test data
 * Note: UserCompanyContext uses keycloakSessionId as unique identifier, not userId
 * Model fields: id (PK), keycloakSessionId (unique), companyId (nullable)
 * @param {string} keycloakSessionId - Keycloak session UUID (optional, auto-generated if not provided)
 * @param {string} companyId - Company UUID (nullable)
 * @param {Object} overrides - Fields to override
 * @returns {Object} UserCompanyContext data ready for UserCompanyContext.create()
 */
export const createContextData = (keycloakSessionId = null, companyId = null, overrides = {}) => {
  return {
    keycloakSessionId: keycloakSessionId || uuidv4(), // Required unique field
    companyId, // Nullable - active company for this session
    ...overrides
  };
};

/**
 * Create DemoAuditableModel test data
 * @param {Object} overrides - Fields to override
 * @returns {Object} DemoAuditableModel data ready for DemoAuditableModel.create()
 */
export const createDemoModelData = (overrides = {}) => {
  return {
    name: generateUniqueName('Demo'),
    description: 'Test demo model description',
    ...overrides
  };
};

/**
 * Create a valid audit context for create/update/delete operations
 * @param {string} userId - User UUID (defaults to new UUID)
 * @param {string} companyId - Company UUID (optional)
 * @returns {Object} Context object { userId, companyId? }
 */
export const createAuditContext = (userId = null, companyId = null) => {
  const context = {
    userId: userId || uuidv4()
  };
  
  if (companyId) {
    context.companyId = companyId;
  }
  
  return context;
};

