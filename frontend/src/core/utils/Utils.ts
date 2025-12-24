/**
 * @author Ananthapadmanabhan V K
 * Validation utility functions for form fields
 * These functions return error messages (translation keys) that should be used with the t() function
 * @returns ValidationResult with isValid and optional errorMessage
 * @param value - The value to validate
 * @param fieldName - The name of the field (for error message translation key)
 * @returns ValidationResult with isValid and optional errorMessage
 * @param value - The value to validate
 * @param fieldName - The name of the field (for error message translation key)
 * @returns ValidationResult with isValid and optional errorMessage
 */

/**
 * Validation utility functions for form fields
 * These functions return error messages (translation keys) that should be used with the t() function
 */

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Validates if a field is required (not empty)
 * @param value - The value to validate
 * @param fieldName - The name of the field (for error message translation key)
 * @returns ValidationResult with isValid and optional errorMessage
 */
export const validateRequired = (value: string | null | undefined, fieldName: string = 'field'): ValidationResult => {
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      errorMessage: `Validation.${fieldName}Required`
    };
  }
  return { isValid: true };
};

/**
 * Validates email format
 * @param email - The email address to validate
 * @returns ValidationResult with isValid and optional errorMessage
 */
export const validateEmail = (email: string | null | undefined): ValidationResult => {
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      errorMessage: 'Validation.emailRequired'
    };
  }

  // Email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email.trim())) {
    return {
      isValid: false,
      errorMessage: 'Validation.emailInvalid'
    };
  }

  return { isValid: true };
};

/**
 * Validates phone number format
 * Supports international formats with optional country codes, spaces, dashes, and parentheses
 * @param phone - The phone number to validate
 * @returns ValidationResult with isValid and optional errorMessage
 */
export const validatePhone = (phone: string | null | undefined): ValidationResult => {
  if (!phone || phone.trim() === '') {
    return {
      isValid: false,
      errorMessage: 'Validation.phoneRequired'
    };
  }

  // Phone regex pattern - allows digits, spaces, dashes, parentheses, and plus sign for country code
  // Minimum 7 digits, maximum 15 digits (international standard)
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return {
      isValid: false,
      errorMessage: 'Validation.phoneInvalid'
    };
  }

  if (!phoneRegex.test(phone.trim())) {
    return {
      isValid: false,
      errorMessage: 'Validation.phoneInvalid'
    };
  }

  return { isValid: true };
};

/**
 * Validates minimum length
 * @param value - The value to validate
 * @param minLength - Minimum required length
 * @param fieldName - The name of the field (for error message translation key)
 * @returns ValidationResult with isValid and optional errorMessage
 */
export const validateMinLength = (
  value: string | null | undefined,
  minLength: number,
  fieldName: string = 'field'
): ValidationResult => {
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      errorMessage: `Validation.${fieldName}Required`
    };
  }

  if (value.trim().length < minLength) {
    return {
      isValid: false,
      errorMessage: `Validation.${fieldName}MinLength`
    };
  }

  return { isValid: true };
};

/**
 * Validates maximum length
 * @param value - The value to validate
 * @param maxLength - Maximum allowed length
 * @param fieldName - The name of the field (for error message translation key)
 * @returns ValidationResult with isValid and optional errorMessage
 */
export const validateMaxLength = (
  value: string | null | undefined,
  maxLength: number,
  fieldName: string = 'field'
): ValidationResult => {
  if (value && value.length > maxLength) {
    return {
      isValid: false,
      errorMessage: `Validation.${fieldName}MaxLength`
    };
  }

  return { isValid: true };
};
