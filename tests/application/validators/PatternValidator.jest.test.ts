/**
 * PatternValidator Tests
 * 
 * Tests for pattern matching validation functionality
 */

import * as PatternValidator from '../../../src/application/validators/PatternValidator';
import { PatternRule, PatternMatchingContext } from '../../../src/shared/types/pattern';

describe('PatternValidator', () => {
  describe('validatePatterns', () => {
    it('should validate email pattern', () => {
      const rules: PatternRule[] = [{
        id: 'email',
        name: 'Email Pattern',
        description: 'Validate email format',
        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
        required: true,
        severity: 'error'
      }];

      const context: PatternMatchingContext = { filePath: 'test.yaml', options: {} };
      const result = PatternValidator.validatePatterns('test@example.com', rules, context);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return error for invalid email pattern', () => {
      const rules: PatternRule[] = [{
        id: 'email',
        name: 'Email Pattern',
        description: 'Validate email format',
        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
        required: true,
        severity: 'error'
      }];

      const context: PatternMatchingContext = { filePath: 'test.yaml', options: {} };
      const result = PatternValidator.validatePatterns('invalid-email', rules, context);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate URL pattern', () => {
      const rules: PatternRule[] = [{
        id: 'url',
        name: 'URL Pattern',
        description: 'Validate URL format',
        pattern: '^https?:\\/\\/.+',
        required: true,
        severity: 'error'
      }];

      const context: PatternMatchingContext = { filePath: 'test.yaml', options: {} };
      const result = PatternValidator.validatePatterns('https://example.com', rules, context);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate UUID pattern', () => {
      const rules: PatternRule[] = [{
        id: 'uuid',
        name: 'UUID Pattern',
        description: 'Validate UUID format',
        pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
        flags: 'i',
        required: true,
        severity: 'error'
      }];

      const context: PatternMatchingContext = { filePath: 'test.yaml', options: {} };
      const result = PatternValidator.validatePatterns('550e8400-e29b-41d4-a716-446655440000', rules, context);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate multiple patterns', () => {
      const rules: PatternRule[] = [
        {
          id: 'email',
          name: 'Email Pattern',
          description: 'Validate email format',
          pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
          required: true,
          severity: 'error'
        },
        {
          id: 'url',
          name: 'URL Pattern',
          description: 'Validate URL format',
          pattern: '^https?:\\/\\/.+',
          required: true,
          severity: 'error'
        }
      ];

      const context: PatternMatchingContext = { filePath: 'test.yaml', options: {} };
      const result = PatternValidator.validatePatterns('test@example.com', rules, context);

      expect(result.valid).toBe(false); // Should fail because it doesn't match URL pattern
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate required rules', () => {
      const rules: PatternRule[] = [{
        id: 'email',
        name: 'Email Pattern',
        description: 'Validate email format',
        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
        required: true,
        severity: 'error'
      }];

      const context: PatternMatchingContext = { filePath: 'test.yaml', options: {} };
      const result = PatternValidator.validatePatterns('invalid-email', rules, context);

      expect(result.valid).toBe(false); // Should fail because email is invalid
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle empty rules array', () => {
      const context: PatternMatchingContext = { filePath: 'test.yaml', options: {} };
      const result = PatternValidator.validatePatterns('test@example.com', [], context);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle null value gracefully', () => {
      const rules: PatternRule[] = [{
        id: 'email',
        name: 'Email Pattern',
        description: 'Validate email format',
        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
        required: true,
        severity: 'error'
      }];

      const context: PatternMatchingContext = { filePath: 'test.yaml', options: {} };
      const result = PatternValidator.validatePatterns(null, rules, context);

      expect(result.valid).toBe(true); // null data returns empty result (valid by default)
      expect(result.errors).toHaveLength(0);
    });

    it('should handle undefined value gracefully', () => {
      const rules: PatternRule[] = [{
        id: 'email',
        name: 'Email Pattern',
        description: 'Validate email format',
        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
        required: true,
        severity: 'error'
      }];

      const context: PatternMatchingContext = { filePath: 'test.yaml', options: {} };
      const result = PatternValidator.validatePatterns(undefined, rules, context);

      expect(result.valid).toBe(true); // undefined data returns empty result (valid by default)
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('isString', () => {
    it('should return true for strings', () => {
      expect(PatternValidator.isString('hello')).toBe(true);
      expect(PatternValidator.isString('')).toBe(true);
    });

    it('should return false for non-strings', () => {
      expect(PatternValidator.isString(123)).toBe(false);
      expect(PatternValidator.isString(true)).toBe(false);
      expect(PatternValidator.isString(null)).toBe(false);
      expect(PatternValidator.isString(undefined)).toBe(false);
      expect(PatternValidator.isString({})).toBe(false);
      expect(PatternValidator.isString([])).toBe(false);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty values', () => {
      expect(PatternValidator.isEmpty('')).toBe(true);
      expect(PatternValidator.isEmpty(null)).toBe(true);
      expect(PatternValidator.isEmpty(undefined)).toBe(true);
    });

    it('should return false for non-empty values', () => {
      expect(PatternValidator.isEmpty('hello')).toBe(false);
      expect(PatternValidator.isEmpty(123)).toBe(false);
      expect(PatternValidator.isEmpty(true)).toBe(false);
    });
  });

  describe('getStringValue', () => {
    it('should return string value for strings', () => {
      expect(PatternValidator.getStringValue('hello')).toBe('hello');
      expect(PatternValidator.getStringValue('')).toBe('');
    });

    it('should convert non-strings to strings', () => {
      expect(PatternValidator.getStringValue(123)).toBe('123');
      expect(PatternValidator.getStringValue(null)).toBe('');
      expect(PatternValidator.getStringValue(undefined)).toBe('');
    });
  });

  describe('edge cases', () => {
    it('should handle empty string', () => {
      const rules: PatternRule[] = [{
        id: 'email',
        name: 'Email Pattern',
        description: 'Validate email format',
        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
        required: true,
        severity: 'error'
      }];

      const context: PatternMatchingContext = { filePath: 'test.yaml', options: {} };
      const result = PatternValidator.validatePatterns('', rules, context);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle invalid regex pattern', () => {
      const rules: PatternRule[] = [{
        id: 'invalid',
        name: 'Invalid Pattern',
        description: 'Invalid regex',
        pattern: '\\[invalid-regex',
        required: true,
        severity: 'error'
      }];

      const context: PatternMatchingContext = { filePath: 'test.yaml', options: {} };
      const result = PatternValidator.validatePatterns('test', rules, context);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('guard clauses', () => {
    it('should handle null rules gracefully', () => {
      const context: PatternMatchingContext = { filePath: 'test.yaml', options: {} };
      const result = PatternValidator.validatePatterns('test@example.com', null as any, context);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle undefined rules gracefully', () => {
      const context: PatternMatchingContext = { filePath: 'test.yaml', options: {} };
      const result = PatternValidator.validatePatterns('test@example.com', undefined as any, context);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
