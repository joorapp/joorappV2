/**
 * @author Bhavesh Venugopal
 * Constants Index
 * Centralized export point for all application constants and enums
 */

// Keycloak Roles
export {
  KEYCLOAK_GLOBAL_ROLES,
  KEYCLOAK_GLOBAL_ROLE_VALUES,
  KEYCLOAK_GLOBAL_ROLE_DEFAULT,
  isValidKeycloakGlobalRole,
  isSuperAdmin,
  isCompanyAdmin,
  isCompanyUser
} from './keycloakRoles.js';

// Super Admin Constants
export {
  SUPER_ADMIN_COMPANY_NAME,
  SUPER_ADMIN_DEFAULT_ROLE_NAME,
  SUPER_ADMIN_DEFAULT_ROLE_CODE
} from './superAdmin.js';

// Error Codes
export { ERROR_CODES } from './errorCodes.js';

// Future: Add other enum exports here
// export { ... } from './companyRoles.js';
// export { ... } from './statusEnums.js';

