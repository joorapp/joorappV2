/**
 * @author Bhavesh Venugopal
 * Validators Tests
 * Tests for validation utility functions
 */

import { describe, it, expect } from '@jest/globals';
import { ValidationError } from '../errors.js';
import {
  validateUUID,
  validateEmail,
  validateRequired,
  validateNumber,
  validateString,
  validateEnum,
  validateBoolean,
  validateDate
} from '../validators.js';

describe('Validators', () => {
  const validUUID = '550e8400-e29b-41d4-a716-446655440000';
  const invalidUUID = 'invalid-uuid';
  const validEmail = 'user@example.com';
  const invalidEmail = 'invalid-email';

  describe('validateUUID', () => {
    it('should validate correct UUID format', () => {
      // Act
      const result = validateUUID(validUUID, 'id', 'req-123');

      // Assert
      expect(result).toBe(true);
    });

    it('should throw ValidationError for missing UUID', () => {
      // Act & Assert
      expect(() => validateUUID(null, 'id', 'req-123')).toThrow(ValidationError);
      expect(() => validateUUID(undefined, 'id', 'req-123')).toThrow(ValidationError);
      expect(() => validateUUID('', 'id', 'req-123')).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid UUID format', () => {
      // Act & Assert
      expect(() => validateUUID(invalidUUID, 'id', 'req-123')).toThrow(ValidationError);
      expect(() => validateUUID('123', 'id', 'req-123')).toThrow(ValidationError);
    });

    it('should use default field name', () => {
      // Act & Assert
      expect(() => validateUUID(null)).toThrow(ValidationError);
      const error = () => {
        try {
          validateUUID(null);
        } catch (e) {
          return e;
        }
      };
      expect(error().message).toContain('id is required');
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email format', () => {
      // Act
      const result = validateEmail(validEmail, 'email', 'req-123');

      // Assert
      expect(result).toBe(true);
    });

    it('should throw ValidationError for missing email', () => {
      // Act & Assert
      expect(() => validateEmail(null, 'email', 'req-123')).toThrow(ValidationError);
      expect(() => validateEmail(undefined, 'email', 'req-123')).toThrow(ValidationError);
      expect(() => validateEmail('', 'email', 'req-123')).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid email format', () => {
      // Act & Assert
      expect(() => validateEmail(invalidEmail, 'email', 'req-123')).toThrow(ValidationError);
      expect(() => validateEmail('user@', 'email', 'req-123')).toThrow(ValidationError);
      expect(() => validateEmail('@example.com', 'email', 'req-123')).toThrow(ValidationError);
    });
  });

  describe('validateRequired', () => {
    it('should validate all required fields present', () => {
      // Act
      const result = validateRequired(
        { email: 'user@example.com', password: 'password123' },
        'req-123'
      );

      // Assert
      expect(result).toBe(true);
    });

    it('should throw ValidationError for single missing field', () => {
      // Act & Assert
      expect(() => validateRequired({ email: '', password: 'pass' }, 'req-123')).toThrow(ValidationError);
      expect(() => validateRequired({ email: null, password: 'pass' }, 'req-123')).toThrow(ValidationError);
      expect(() => validateRequired({ email: undefined, password: 'pass' }, 'req-123')).toThrow(ValidationError);
    });

    it('should throw ValidationError for multiple missing fields', () => {
      // Act & Assert
      expect(() => validateRequired({ email: '', password: '' }, 'req-123')).toThrow(ValidationError);
    });
  });

  describe('validateNumber', () => {
    it('should validate valid number', () => {
      // Act
      const result = validateNumber(42, 'age', {}, 'req-123');

      // Assert
      expect(result).toBe(42);
    });

    it('should parse string number', () => {
      // Act
      const result = validateNumber('42', 'age', {}, 'req-123');

      // Assert
      expect(result).toBe(42);
    });

    it('should throw ValidationError for missing required number', () => {
      // Act & Assert
      expect(() => validateNumber(null, 'age', {}, 'req-123')).toThrow(ValidationError);
    });

    it('should return null for missing optional number', () => {
      // Act
      const result = validateNumber(null, 'age', { required: false }, 'req-123');

      // Assert
      expect(result).toBe(null);
    });

    it('should throw ValidationError for invalid number', () => {
      // Act & Assert
      expect(() => validateNumber('not-a-number', 'age', {}, 'req-123')).toThrow(ValidationError);
    });

    it('should validate min constraint', () => {
      // Act
      const result = validateNumber(10, 'age', { min: 1 }, 'req-123');
      expect(result).toBe(10);

      // Assert
      expect(() => validateNumber(0, 'age', { min: 1 }, 'req-123')).toThrow(ValidationError);
    });

    it('should validate max constraint', () => {
      // Act
      const result = validateNumber(10, 'age', { max: 100 }, 'req-123');
      expect(result).toBe(10);

      // Assert
      expect(() => validateNumber(101, 'age', { max: 100 }, 'req-123')).toThrow(ValidationError);
    });
  });

  describe('validateString', () => {
    it('should validate valid string', () => {
      // Act
      const result = validateString('hello', 'name', {}, 'req-123');

      // Assert
      expect(result).toBe('hello');
    });

    it('should throw ValidationError for missing required string', () => {
      // Act & Assert
      expect(() => validateString(null, 'name', {}, 'req-123')).toThrow(ValidationError);
    });

    it('should return null for missing optional string', () => {
      // Act
      const result = validateString(null, 'name', { required: false }, 'req-123');

      // Assert
      expect(result).toBe(null);
    });

    it('should throw ValidationError for non-string value', () => {
      // Act & Assert
      expect(() => validateString(123, 'name', {}, 'req-123')).toThrow(ValidationError);
    });

    it('should validate minLength constraint', () => {
      // Act
      const result = validateString('hello', 'name', { minLength: 3 }, 'req-123');
      expect(result).toBe('hello');

      // Assert
      expect(() => validateString('hi', 'name', { minLength: 3 }, 'req-123')).toThrow(ValidationError);
    });

    it('should validate maxLength constraint', () => {
      // Act
      const result = validateString('hello', 'name', { maxLength: 10 }, 'req-123');
      expect(result).toBe('hello');

      // Assert
      expect(() => validateString('this is too long', 'name', { maxLength: 10 }, 'req-123')).toThrow(ValidationError);
    });
  });

  describe('validateEnum', () => {
    it('should validate value in allowed values', () => {
      // Act
      const result = validateEnum('active', ['active', 'inactive'], 'status', 'req-123');

      // Assert
      expect(result).toBe('active');
    });

    it('should throw ValidationError for missing value', () => {
      // Act & Assert
      expect(() => validateEnum(null, ['active', 'inactive'], 'status', 'req-123')).toThrow(ValidationError);
    });

    it('should throw ValidationError for value not in allowed values', () => {
      // Act & Assert
      expect(() => validateEnum('pending', ['active', 'inactive'], 'status', 'req-123')).toThrow(ValidationError);
    });
  });

  describe('validateBoolean', () => {
    it('should validate boolean true', () => {
      // Act
      const result = validateBoolean(true, 'isActive', {}, 'req-123');

      // Assert
      expect(result).toBe(true);
    });

    it('should validate boolean false', () => {
      // Act
      const result = validateBoolean(false, 'isActive', {}, 'req-123');

      // Assert
      expect(result).toBe(false);
    });

    it('should parse string "true" to boolean', () => {
      // Act
      const result = validateBoolean('true', 'isActive', {}, 'req-123');

      // Assert
      expect(result).toBe(true);
    });

    it('should parse string "false" to boolean', () => {
      // Act
      const result = validateBoolean('false', 'isActive', {}, 'req-123');

      // Assert
      expect(result).toBe(false);
    });

    it('should throw ValidationError for missing required boolean', () => {
      // Act & Assert
      expect(() => validateBoolean(null, 'isActive', {}, 'req-123')).toThrow(ValidationError);
    });

    it('should return null for missing optional boolean', () => {
      // Act
      const result = validateBoolean(null, 'isActive', { required: false }, 'req-123');

      // Assert
      expect(result).toBe(null);
    });

    it('should throw ValidationError for invalid boolean string', () => {
      // Act & Assert
      expect(() => validateBoolean('maybe', 'isActive', {}, 'req-123')).toThrow(ValidationError);
    });
  });

  describe('validateDate', () => {
    it('should validate valid date string', () => {
      // Act
      const result = validateDate('2024-01-01', 'startDate', {}, 'req-123');

      // Assert
      expect(result).toBeInstanceOf(Date);
    });

    it('should validate Date object', () => {
      // Arrange
      const date = new Date('2024-01-01');

      // Act
      const result = validateDate(date, 'startDate', {}, 'req-123');

      // Assert
      expect(result).toBeInstanceOf(Date);
    });

    it('should throw ValidationError for missing required date', () => {
      // Act & Assert
      expect(() => validateDate(null, 'startDate', {}, 'req-123')).toThrow(ValidationError);
    });

    it('should return null for missing optional date', () => {
      // Act
      const result = validateDate(null, 'startDate', { required: false }, 'req-123');

      // Assert
      expect(result).toBe(null);
    });

    it('should throw ValidationError for invalid date', () => {
      // Act & Assert
      expect(() => validateDate('invalid-date', 'startDate', {}, 'req-123')).toThrow(ValidationError);
    });

    it('should validate min date constraint', () => {
      // Arrange
      const minDate = new Date('2024-01-01');
      const validDate = new Date('2024-01-02');

      // Act
      const result = validateDate(validDate, 'startDate', { min: minDate }, 'req-123');
      expect(result).toBeInstanceOf(Date);

      // Assert
      const invalidDate = new Date('2023-12-31');
      expect(() => validateDate(invalidDate, 'startDate', { min: minDate }, 'req-123')).toThrow(ValidationError);
    });

    it('should validate max date constraint', () => {
      // Arrange
      const maxDate = new Date('2024-12-31');
      const validDate = new Date('2024-12-30');

      // Act
      const result = validateDate(validDate, 'startDate', { max: maxDate }, 'req-123');
      expect(result).toBeInstanceOf(Date);

      // Assert
      const invalidDate = new Date('2025-01-01');
      expect(() => validateDate(invalidDate, 'startDate', { max: maxDate }, 'req-123')).toThrow(ValidationError);
    });
  });
});

