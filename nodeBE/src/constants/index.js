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

// Company Status
export {
  COMPANY_STATUSES,
  COMPANY_STATUS_VALUES,
  COMPANY_STATUS_DEFAULT,
  isValidCompanyStatus,
  isNewStatus,
  isActiveStatus,
  isLicenseExpiredStatus
} from './companyStatus.js';

// Master Data
export {
  BASIC_PLAN_MASTER_DATA,
  MASTER_DATA_TYPES,
  MASTER_DATA_CONFIG
} from './masterData.js';

// Future: Add other enum exports here
// export { ... } from './companyRoles.js';

