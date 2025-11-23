/**
 * @author Bhavesh Venugopal
 * Keycloak Roles Constants
 * Centralized definitions for Keycloak global roles
 */

/**
 * Keycloak Global Roles
 * These roles are synced from Keycloak and represent the user's global role in the system
 * @type {readonly string[]}
 */
export const KEYCLOAK_GLOBAL_ROLES = Object.freeze([
  'SUPER_ADMIN',
  'COMPANY_ADMIN',
  'COMPANY_USER'
]);

/**
 * Keycloak Global Role Values (for Sequelize ENUM)
 * Use this array when defining Sequelize ENUM types
 * @type {string[]}
 */
export const KEYCLOAK_GLOBAL_ROLE_VALUES = [...KEYCLOAK_GLOBAL_ROLES];

/**
 * Keycloak Global Role Default Value
 * Default role assigned to new users
 * @type {string}
 */
export const KEYCLOAK_GLOBAL_ROLE_DEFAULT = 'COMPANY_USER';

/**
 * Keycloak Global Role Type (for JSDoc/TypeScript-like documentation)
 * @typedef {'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'COMPANY_USER'} KeycloakGlobalRole
 */

/**
 * Check if a role is a valid Keycloak global role
 * @param {string} role - Role to validate
 * @returns {boolean} True if role is valid
 */
export const isValidKeycloakGlobalRole = (role) => {
  return KEYCLOAK_GLOBAL_ROLES.includes(role);
};

/**
 * Check if a role is SUPER_ADMIN
 * @param {string} role - Role to check
 * @returns {boolean} True if role is SUPER_ADMIN
 */
export const isSuperAdmin = (role) => {
  return role === 'SUPER_ADMIN';
};

/**
 * Check if a role is COMPANY_ADMIN
 * @param {string} role - Role to check
 * @returns {boolean} True if role is COMPANY_ADMIN
 */
export const isCompanyAdmin = (role) => {
  return role === 'COMPANY_ADMIN';
};

/**
 * Check if a role is COMPANY_USER
 * @param {string} role - Role to check
 * @returns {boolean} True if role is COMPANY_USER
 */
export const isCompanyUser = (role) => {
  return role === 'COMPANY_USER';
};

