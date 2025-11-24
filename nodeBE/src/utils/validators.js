/**
 * @author Bhavesh Venugopal
 * Validation Utilities
 * Simple validation helpers that throw ValidationError
 * Use these for common validation cases (UUID, email, required fields, etc.)
 * For complex validation, use express-validator with validationMiddleware
 */

import { ValidationError } from './errors.js';

/**
 * UUID validation regex pattern
 * Matches standard UUID v4 format
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Email validation regex pattern
 * Basic email format validation
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate UUID format
 * @param {string} id - UUID to validate
 * @param {string} fieldName - Field name for error message (default: 'id')
 * @param {string} requestId - Request ID for error context (optional)
 * @throws {ValidationError} If UUID is invalid
 * @returns {boolean} true if valid
 * 
 * @example
 * validateUUID(req.params.userId, 'userId', req.id);
 */
export const validateUUID = (id, fieldName = 'id', requestId = null) => {
  if (!id) {
    throw new ValidationError(
      `${fieldName} is required`,
      { field: fieldName, value: id },
      { requestId }
    );
  }
  
  if (typeof id !== 'string' || !UUID_REGEX.test(id)) {
    throw new ValidationError(
      `Invalid ${fieldName} format`,
      { field: fieldName, value: id },
      { requestId }
    );
  }
  
  return true;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @param {string} fieldName - Field name for error message (default: 'email')
 * @param {string} requestId - Request ID for error context (optional)
 * @throws {ValidationError} If email is invalid
 * @returns {boolean} true if valid
 * 
 * @example
 * validateEmail(req.body.email, 'email', req.id);
 */
export const validateEmail = (email, fieldName = 'email', requestId = null) => {
  if (!email) {
    throw new ValidationError(
      `${fieldName} is required`,
      { field: fieldName, value: email },
      { requestId }
    );
  }
  
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    throw new ValidationError(
      `Invalid ${fieldName} format`,
      { field: fieldName, value: email },
      { requestId }
    );
  }
  
  return true;
};

/**
 * Validate required fields
 * Checks if all provided fields have non-empty values
 * @param {Object} fields - Object with field names as keys and values to validate
 * @param {string} requestId - Request ID for error context (optional)
 * @throws {ValidationError} If any required field is missing or empty
 * @returns {boolean} true if all fields are valid
 * 
 * @example
 * validateRequired({ email: req.body.email, password: req.body.password }, req.id);
 */
export const validateRequired = (fields, requestId = null) => {
  const missing = [];
  
  for (const [fieldName, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === '') {
      missing.push(fieldName);
    }
  }
  
  if (missing.length > 0) {
    const message = missing.length === 1
      ? `${missing[0]} is required`
      : `Missing required fields: ${missing.join(', ')}`;
    
    throw new ValidationError(
      message,
      { field: missing.join(',') },
      { requestId }
    );
  }
  
  return true;
};

/**
 * Validate number with optional range
 * @param {number|string} value - Number to validate
 * @param {string} fieldName - Field name for error message
 * @param {Object} options - Validation options
 * @param {number} options.min - Minimum value (optional)
 * @param {number} options.max - Maximum value (optional)
 * @param {boolean} options.required - Whether field is required (default: true)
 * @param {string} requestId - Request ID for error context (optional)
 * @throws {ValidationError} If number is invalid or out of range
 * @returns {number} Parsed number if valid
 * 
 * @example
 * const page = validateNumber(req.query.page, 'page', { min: 1 }, req.id);
 * const limit = validateNumber(req.query.limit, 'limit', { min: 1, max: 100 }, req.id);
 */
export const validateNumber = (value, fieldName, options = {}, requestId = null) => {
  const { min, max, required = true } = options;
  
  if (value === undefined || value === null || value === '') {
    if (required) {
      throw new ValidationError(
        `${fieldName} is required`,
        { field: fieldName, value },
        { requestId }
      );
    }
    return null;
  }
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num) || !isFinite(num)) {
    throw new ValidationError(
      `${fieldName} must be a valid number`,
      { field: fieldName, value },
      { requestId }
    );
  }
  
  if (min !== undefined && num < min) {
    throw new ValidationError(
      `${fieldName} must be at least ${min}`,
      { field: fieldName, value: num, min },
      { requestId }
    );
  }
  
  if (max !== undefined && num > max) {
    throw new ValidationError(
      `${fieldName} must be at most ${max}`,
      { field: fieldName, value: num, max },
      { requestId }
    );
  }
  
  return num;
};

/**
 * Validate string with optional length constraints
 * @param {string} value - String to validate
 * @param {string} fieldName - Field name for error message
 * @param {Object} options - Validation options
 * @param {number} options.minLength - Minimum length (optional)
 * @param {number} options.maxLength - Maximum length (optional)
 * @param {boolean} options.required - Whether field is required (default: true)
 * @param {string} requestId - Request ID for error context (optional)
 * @throws {ValidationError} If string is invalid or doesn't meet length requirements
 * @returns {string} Validated string
 * 
 * @example
 * validateString(req.body.name, 'name', { minLength: 2, maxLength: 100 }, req.id);
 */
export const validateString = (value, fieldName, options = {}, requestId = null) => {
  const { minLength, maxLength, required = true } = options;
  
  if (value === undefined || value === null || value === '') {
    if (required) {
      throw new ValidationError(
        `${fieldName} is required`,
        { field: fieldName, value },
        { requestId }
      );
    }
    return null;
  }
  
  if (typeof value !== 'string') {
    throw new ValidationError(
      `${fieldName} must be a string`,
      { field: fieldName, value },
      { requestId }
    );
  }
  
  if (minLength !== undefined && value.length < minLength) {
    throw new ValidationError(
      `${fieldName} must be at least ${minLength} characters`,
      { field: fieldName, value: value.length, minLength },
      { requestId }
    );
  }
  
  if (maxLength !== undefined && value.length > maxLength) {
    throw new ValidationError(
      `${fieldName} must be at most ${maxLength} characters`,
      { field: fieldName, value: value.length, maxLength },
      { requestId }
    );
  }
  
  return value;
};

/**
 * Validate enum value
 * Checks if value is one of the allowed values
 * @param {any} value - Value to validate
 * @param {Array} allowedValues - Array of allowed values
 * @param {string} fieldName - Field name for error message
 * @param {string} requestId - Request ID for error context (optional)
 * @throws {ValidationError} If value is not in allowed values
 * @returns {any} Validated value
 * 
 * @example
 * validateEnum(req.body.status, ['active', 'inactive', 'pending'], 'status', req.id);
 */
export const validateEnum = (value, allowedValues, fieldName, requestId = null) => {
  if (value === undefined || value === null || value === '') {
    throw new ValidationError(
      `${fieldName} is required`,
      { field: fieldName, value },
      { requestId }
    );
  }
  
  if (!allowedValues.includes(value)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`,
      { field: fieldName, value, allowedValues },
      { requestId }
    );
  }
  
  return value;
};

/**
 * Validate boolean value
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @param {Object} options - Validation options
 * @param {boolean} options.required - Whether field is required (default: true)
 * @param {string} requestId - Request ID for error context (optional)
 * @throws {ValidationError} If value is not a boolean
 * @returns {boolean} Validated boolean
 * 
 * @example
 * const isActive = validateBoolean(req.body.isActive, 'isActive', { required: false }, req.id);
 */
export const validateBoolean = (value, fieldName, options = {}, requestId = null) => {
  const { required = true } = options;
  
  if (value === undefined || value === null) {
    if (required) {
      throw new ValidationError(
        `${fieldName} is required`,
        { field: fieldName, value },
        { requestId }
      );
    }
    return null;
  }
  
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'true' || lowerValue === '1') {
      return true;
    }
    if (lowerValue === 'false' || lowerValue === '0') {
      return false;
    }
    throw new ValidationError(
      `${fieldName} must be a boolean`,
      { field: fieldName, value },
      { requestId }
    );
  }
  
  if (typeof value !== 'boolean') {
    throw new ValidationError(
      `${fieldName} must be a boolean`,
      { field: fieldName, value },
      { requestId }
    );
  }
  
  return value;
};

/**
 * Validate date string or Date object
 * @param {string|Date} value - Date to validate
 * @param {string} fieldName - Field name for error message
 * @param {Object} options - Validation options
 * @param {boolean} options.required - Whether field is required (default: true)
 * @param {Date} options.min - Minimum date (optional)
 * @param {Date} options.max - Maximum date (optional)
 * @param {string} requestId - Request ID for error context (optional)
 * @throws {ValidationError} If date is invalid or out of range
 * @returns {Date} Validated Date object
 * 
 * @example
 * const startDate = validateDate(req.body.startDate, 'startDate', { required: true }, req.id);
 */
export const validateDate = (value, fieldName, options = {}, requestId = null) => {
  const { required = true, min, max } = options;
  
  if (value === undefined || value === null || value === '') {
    if (required) {
      throw new ValidationError(
        `${fieldName} is required`,
        { field: fieldName, value },
        { requestId }
      );
    }
    return null;
  }
  
  const date = value instanceof Date ? value : new Date(value);
  
  if (isNaN(date.getTime())) {
    throw new ValidationError(
      `${fieldName} must be a valid date`,
      { field: fieldName, value },
      { requestId }
    );
  }
  
  if (min && date < min) {
    throw new ValidationError(
      `${fieldName} must be after ${min.toISOString()}`,
      { field: fieldName, value: date.toISOString(), min: min.toISOString() },
      { requestId }
    );
  }
  
  if (max && date > max) {
    throw new ValidationError(
      `${fieldName} must be before ${max.toISOString()}`,
      { field: fieldName, value: date.toISOString(), max: max.toISOString() },
      { requestId }
    );
  }
  
  return date;
};

