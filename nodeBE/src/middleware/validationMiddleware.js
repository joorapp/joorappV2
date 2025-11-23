/**
 * @author Bhavesh Venugopal
 * Validation Middleware
 * Wraps express-validator and converts validation errors to ValidationError
 * Use this for complex validation scenarios that require express-validator
 * For simple validation, use validators from src/utils/validators.js
 */

import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors.js';

/**
 * Middleware to check validation results and throw ValidationError
 * Converts express-validator errors to our custom ValidationError format
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @throws {ValidationError} If validation fails
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Get first error for primary message
    const firstError = errors.array()[0];
    
    // Collect all field errors
    const fieldErrors = errors.array().map(err => ({
      field: err.param || err.path || err.location,
      value: err.value,
      message: err.msg
    }));
    
    // Create detailed error message
    const messages = errors.array().map(err => err.msg);
    const message = messages.length === 1 
      ? messages[0] 
      : `Validation failed: ${messages.join('; ')}`;
    
    throw new ValidationError(
      message,
      { 
        field: firstError.param || firstError.path || 'unknown',
        value: firstError.value,
        errors: fieldErrors
      },
      { requestId: req.id }
    );
  }
  
  next();
};

/**
 * Helper to create validation middleware chain
 * Combines express-validator chains with error handler
 * @param {...Array} validations - Express-validator validation chains
 * @returns {Array} Middleware array with validations and error handler
 * 
 * @example
 * router.post('/users',
 *   createValidationChain(
 *     body('email').isEmail().withMessage('Invalid email format'),
 *     body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
 *   ),
 *   asyncHandler(createUser)
 * );
 */
export const createValidationChain = (...validations) => {
  return [...validations, validateRequest];
};

