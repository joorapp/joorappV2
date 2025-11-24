/**
 * @author Bhavesh Venugopal
 * Business Logic Helpers
 * Common utilities for business logic operations
 * Includes pagination, filtering, sorting, and data transformation helpers
 */

import { ValidationError } from './errors.js';
import { Op } from 'sequelize';

/**
 * Build pagination query parameters from request query
 * Validates and normalizes pagination parameters
 * @param {Object} query - Request query object
 * @param {Object} options - Pagination options
 * @param {number} options.defaultLimit - Default limit (default: 10)
 * @param {number} options.maxLimit - Maximum allowed limit (default: 100)
 * @param {string} requestId - Request ID for error context (optional)
 * @returns {Object} { page, limit, offset, skip }
 * @throws {ValidationError} If pagination parameters are invalid
 * 
 * @example
 * const { page, limit, offset } = buildPaginationQuery(req.query, { defaultLimit: 20, maxLimit: 100 }, req.id);
 */
export const buildPaginationQuery = (query, options = {}, requestId = null) => {
  const { defaultLimit = 10, maxLimit = 100 } = options;
  
  let page = query.page ? parseInt(query.page) : 1;
  let limit = query.limit ? parseInt(query.limit) : defaultLimit;
  
  // Validate page
  if (isNaN(page) || page < 1) {
    throw new ValidationError(
      'Page must be a positive integer',
      { field: 'page', value: query.page },
      { requestId }
    );
  }
  
  // Validate limit
  if (isNaN(limit) || limit < 1) {
    throw new ValidationError(
      'Limit must be a positive integer',
      { field: 'limit', value: query.limit },
      { requestId }
    );
  }
  
  if (limit > maxLimit) {
    throw new ValidationError(
      `Limit cannot exceed ${maxLimit}`,
      { field: 'limit', value: limit, max: maxLimit },
      { requestId }
    );
  }
  
  const offset = (page - 1) * limit;
  
  return { page, limit, offset, skip: offset };
};

/**
 * Validate pagination parameters
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {number} maxLimit - Maximum allowed limit
 * @param {string} requestId - Request ID for error context (optional)
 * @throws {ValidationError} If parameters are invalid
 * @returns {Object} { page, limit, offset }
 */
export const validatePaginationParams = (page, limit, maxLimit = 100, requestId = null) => {
  if (!page || page < 1) {
    throw new ValidationError(
      'Page must be greater than 0',
      { field: 'page', value: page },
      { requestId }
    );
  }
  
  if (!limit || limit < 1) {
    throw new ValidationError(
      'Limit must be greater than 0',
      { field: 'limit', value: limit },
      { requestId }
    );
  }
  
  if (limit > maxLimit) {
    throw new ValidationError(
      `Limit cannot exceed ${maxLimit}`,
      { field: 'limit', value: limit, max: maxLimit },
      { requestId }
    );
  }
  
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
};

/**
 * Build filter query for Sequelize
 * Filters allowed fields and builds where clause
 * @param {Object} filters - Filter object from request
 * @param {Array<string>} allowedFields - Array of allowed field names
 * @param {Object} options - Filter options
 * @param {boolean} options.exactMatch - Use exact match instead of LIKE (default: false)
 * @returns {Object} Sequelize where clause object
 * 
 * @example
 * const where = buildFilterQuery(req.query, ['name', 'email', 'status'], { exactMatch: false });
 */
export const buildFilterQuery = (filters, allowedFields, options = {}) => {
  const { exactMatch = false } = options;
  const where = {};
  
  for (const field of allowedFields) {
    if (filters[field] !== undefined && filters[field] !== null && filters[field] !== '') {
      if (exactMatch) {
        where[field] = filters[field];
      } else {
        // Use LIKE for string fields (case-insensitive)
        where[field] = { [require('sequelize').Op.like]: `%${filters[field]}%` };
      }
    }
  }
  
  return where;
};

/**
 * Sanitize search query string
 * Removes dangerous characters and trims whitespace
 * @param {string} search - Search query string
 * @param {Object} options - Sanitization options
 * @param {number} options.maxLength - Maximum length (default: 100)
 * @returns {string} Sanitized search string
 */
export const sanitizeSearchQuery = (search, options = {}) => {
  const { maxLength = 100 } = options;
  
  if (!search || typeof search !== 'string') {
    return '';
  }
  
  // Trim and limit length
  let sanitized = search.trim().substring(0, maxLength);
  
  // Remove potentially dangerous characters (keep alphanumeric, spaces, and common punctuation)
  sanitized = sanitized.replace(/[<>{}[\]\\]/g, '');
  
  return sanitized;
};

/**
 * Build sort query for Sequelize
 * Validates sort field and order, returns Sequelize order array
 * @param {string} sortBy - Field to sort by
 * @param {string} sortOrder - Sort order ('ASC' or 'DESC')
 * @param {Array<string>} allowedFields - Array of allowed sort fields
 * @param {Object} options - Sort options
 * @param {string} options.defaultSort - Default sort field
 * @param {string} options.defaultOrder - Default sort order (default: 'ASC')
 * @returns {Array} Sequelize order array
 * 
 * @example
 * const order = buildSortQuery(req.query.sortBy, req.query.sortOrder, ['name', 'email', 'createdAt'], { defaultSort: 'createdAt' });
 */
export const buildSortQuery = (sortBy, sortOrder, allowedFields, options = {}) => {
  const { defaultSort = null, defaultOrder = 'ASC' } = options;
  
  // Use default if sortBy not provided or not in allowed fields
  const field = (sortBy && allowedFields.includes(sortBy)) ? sortBy : defaultSort;
  
  if (!field) {
    return []; // No sorting
  }
  
  // Validate and normalize order
  const order = (sortOrder && ['ASC', 'DESC'].includes(sortOrder.toUpperCase())) 
    ? sortOrder.toUpperCase() 
    : defaultOrder;
  
  return [[field, order]];
};

/**
 * Format date for API response
 * Converts Date object to ISO string
 * @param {Date|string} date - Date to format
 * @returns {string|null} ISO date string or null
 */
export const formatDateForResponse = (date) => {
  if (!date) {
    return null;
  }
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return null;
  }
  
  return dateObj.toISOString();
};

/**
 * Format currency for API response
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @param {Object} options - Formatting options
 * @param {number} options.decimals - Decimal places (default: 2)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD', options = {}) => {
  const { decimals = 2 } = options;
  
  if (amount === null || amount === undefined || isNaN(amount)) {
    return null;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount);
};

/**
 * Build search filter for multiple fields
 * Creates OR conditions for searching across multiple fields
 * @param {string} searchTerm - Search term
 * @param {Array<string>} fields - Fields to search in
 * @returns {Object} Sequelize where clause with OR conditions
 * 
 * @example
 * const where = buildSearchFilter(req.query.search, ['name', 'email', 'description']);
 */
export const buildSearchFilter = (searchTerm, fields) => {
  if (!searchTerm || !fields || fields.length === 0) {
    return {};
  }
  
  const sanitized = sanitizeSearchQuery(searchTerm);
  
  if (!sanitized) {
    return {};
  }
  
  // Create OR conditions for each field
  const conditions = fields.map(field => ({
    [field]: { [Op.like]: `%${sanitized}%` }
  }));
  
  return {
    [Op.or]: conditions
  };
};

/**
 * Parse and validate date range
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @param {string} requestId - Request ID for error context (optional)
 * @returns {Object} { startDate: Date, endDate: Date }
 * @throws {ValidationError} If dates are invalid or startDate > endDate
 */
export const parseDateRange = (startDate, endDate, requestId = null) => {
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  
  if (start && isNaN(start.getTime())) {
    throw new ValidationError(
      'Invalid start date format',
      { field: 'startDate', value: startDate },
      { requestId }
    );
  }
  
  if (end && isNaN(end.getTime())) {
    throw new ValidationError(
      'Invalid end date format',
      { field: 'endDate', value: endDate },
      { requestId }
    );
  }
  
  if (start && end && start > end) {
    throw new ValidationError(
      'Start date must be before end date',
      { field: 'dateRange', startDate: start.toISOString(), endDate: end.toISOString() },
      { requestId }
    );
  }
  
  return { startDate: start, endDate: end };
};

