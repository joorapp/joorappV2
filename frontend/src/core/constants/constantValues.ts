/**
 * @author Ananthapadmanabhan V K
 * General constants for the application
 * This file contains reusable constants that can be used throughout the project
 * @returns Various constant objects organized by category
 */

// ============================================
// DATE & TIME FORMATS
// ============================================
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DDTHH:mm:ss',
  MONTH_YEAR: 'MM/YYYY',
  YEAR: 'YYYY',
  TIME_ONLY: 'HH:mm',
  DATETIME_LOCAL: 'YYYY-MM-DDTHH:mm',
} as const;

// ============================================
// PAGINATION CONSTANTS
// ============================================
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_PAGE_NUMBER: 1,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 5,
} as const;

// ============================================
// VALIDATION LIMITS
// ============================================
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 50,
  MAX_EMAIL_LENGTH: 255,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_COMMENT_LENGTH: 500,
  MIN_PHONE_LENGTH: 10,
  MAX_PHONE_LENGTH: 15,
} as const;

// ============================================
// REGEX PATTERNS
// ============================================
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHANUMERIC_WITH_SPACES: /^[a-zA-Z0-9\s]+$/,
  NUMERIC: /^\d+$/,
  URL: /^https?:\/\/.+/,
} as const;

// ============================================
// HTTP STATUS CODES
// ============================================
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ============================================
// COMMON STATUS VALUES
// ============================================
export const STATUS = {
  NEW: 'NEW',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  DELETED: 'DELETED',
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
} as const;

// ============================================
// UI CONSTANTS
// ============================================
export const UI = {
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  MODAL_ANIMATION_DURATION: 300,
  SIDEBAR_WIDTH: 260,
  HEADER_HEIGHT: 64,
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1280,
} as const;

// ============================================
// STORAGE KEYS
// ============================================
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PROFILE: 'user_profile',
  SELECTED_COMPANY: 'selected_company',
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
} as const;

// ============================================
// FILE UPLOAD CONSTANTS
// ============================================
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB in bytes
  MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB in bytes
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  MAX_FILES_COUNT: 10,
} as const;

// ============================================
// SORT ORDER CONSTANTS
// ============================================
export const SORT_ORDER = {
  ASC: 'ASC',
  DESC: 'DESC',
} as const;

// ============================================
// KEYCLOAK GLOBAL ROLES
// ============================================
export const KEYCLOAK_GLOBAL_ROLES = [
  'COMPANY_USER',
  'COMPANY_ADMIN',
] as const;

// ============================================
// EXPORT ALL CONSTANTS AS A SINGLE OBJECT
// ============================================
export const CONSTANTS = {
  DATE_FORMATS,
  PAGINATION,
  VALIDATION,
  REGEX_PATTERNS,
  HTTP_STATUS,
  STATUS,
  UI,
  STORAGE_KEYS,
  FILE_UPLOAD,
  SORT_ORDER,
  KEYCLOAK_GLOBAL_ROLES,
} as const;

export default CONSTANTS;

