/**
 * FormatValidator Tests
 * 
 * Tests for format and pattern validation functionality
 */

import * as FormatValidator from '../../../src/application/validators/FormatValidator';
import { JsonSchema } from '../../../src/shared/types/schema';

describe('FormatValidator', () => {
  describe('validateFormat', () => {
    it('should validate email format', () => {
      const schema: JsonSchema = { type: 'string', format: 'email' };
      const errors = FormatValidator.validateFormat('test@example.com', schema, 'path');
      
      expect(errors).toHaveLength(0);
    });

    it('should validate URL format', () => {
      const schema: JsonSchema = { type: 'string', format: 'uri' };
      const errors = FormatValidator.validateFormat('https://example.com', schema, 'path');
      
      expect(errors).toHaveLength(0);
    });

    it('should validate date format', () => {
      const schema: JsonSchema = { type: 'string', format: 'date' };
      const errors = FormatValidator.validateFormat('2023-12-25', schema, 'path');
      
      expect(errors).toHaveLength(0);
    });

    it('should validate date-time format', () => {
      const schema: JsonSchema = { type: 'string', format: 'date-time' };
      const errors = FormatValidator.validateFormat('2023-12-25T10:30:00Z', schema, 'path');
      
      expect(errors).toHaveLength(0);
    });

    it('should validate IPv4 format', () => {
      const schema: JsonSchema = { type: 'string', format: 'ipv4' };
      const errors = FormatValidator.validateFormat('192.168.1.1', schema, 'path');
      
      expect(errors).toHaveLength(0);
    });

    it('should validate IPv6 format', () => {
      const schema: JsonSchema = { type: 'string', format: 'ipv6' };
      const errors = FormatValidator.validateFormat('2001:0db8:85a3:0000:0000:8a2e:0370:7334', schema, 'path');
      
      expect(errors).toHaveLength(0);
    });

    it('should validate UUID format', () => {
      const schema: JsonSchema = { type: 'string', format: 'uuid' };
      const errors = FormatValidator.validateFormat('550e8400-e29b-41d4-a716-446655440000', schema, 'path');
      
      expect(errors).toHaveLength(0);
    });

    it('should return error for invalid email format', () => {
      const schema: JsonSchema = { type: 'string', format: 'email' };
      const errors = FormatValidator.validateFormat('invalid-email', schema, 'path');
      
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('valid email');
    });

    it('should return error for invalid URL format', () => {
      const schema: JsonSchema = { type: 'string', format: 'uri' };
      const errors = FormatValidator.validateFormat('not-a-url', schema, 'path');
      
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('valid uri');
    });

    it('should return error for invalid date format', () => {
      const schema: JsonSchema = { type: 'string', format: 'date' };
      const errors = FormatValidator.validateFormat('invalid-date', schema, 'path');
      
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('valid date');
    });

    it('should return error for invalid IPv4 format', () => {
      const schema: JsonSchema = { type: 'string', format: 'ipv4' };
      const errors = FormatValidator.validateFormat('999.999.999.999', schema, 'path');
      
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('valid ipv4');
    });

    it('should return error for invalid UUID format', () => {
      const schema: JsonSchema = { type: 'string', format: 'uuid' };
      const errors = FormatValidator.validateFormat('not-a-uuid', schema, 'path');
      
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('valid uuid');
    });
  });

  describe('validatePattern', () => {
    it('should validate regex pattern', () => {
      const schema: JsonSchema = { type: 'string', pattern: '^[A-Z][a-z]+$' };
      const errors = FormatValidator.validatePattern('John', schema, 'path');
      
      expect(errors).toHaveLength(0);
    });

    it('should return error for invalid regex pattern', () => {
      const schema: JsonSchema = { type: 'string', pattern: '^[A-Z][a-z]+$' };
      const errors = FormatValidator.validatePattern('john', schema, 'path');
      
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('match pattern');
    });

    it('should validate complex regex pattern', () => {
      const schema: JsonSchema = { type: 'string', pattern: '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$' };
      const errors = FormatValidator.validatePattern('user@example.com', schema, 'path');
      
      expect(errors).toHaveLength(0);
    });

    it('should handle empty pattern', () => {
      const schema: JsonSchema = { type: 'string', pattern: '' };
      const errors = FormatValidator.validatePattern('any string', schema, 'path');
      
      expect(errors).toHaveLength(0);
    });
  });

  describe('isStringValue', () => {
    it('should return true for string values', () => {
      expect(FormatValidator.isStringValue('hello')).toBe(true);
      expect(FormatValidator.isStringValue('')).toBe(true);
    });

    it('should return false for non-string values', () => {
      expect(FormatValidator.isStringValue(123)).toBe(false);
      expect(FormatValidator.isStringValue(true)).toBe(false);
      expect(FormatValidator.isStringValue(null)).toBe(false);
      expect(FormatValidator.isStringValue(undefined)).toBe(false);
      expect(FormatValidator.isStringValue({})).toBe(false);
      expect(FormatValidator.isStringValue([])).toBe(false);
    });
  });

  describe('getFormatValidator', () => {
    it('should return validator for known formats', () => {
      expect(FormatValidator.getFormatValidator('email')).toBeDefined();
      expect(FormatValidator.getFormatValidator('uri')).toBeDefined();
      expect(FormatValidator.getFormatValidator('date')).toBeDefined();
      expect(FormatValidator.getFormatValidator('date-time')).toBeDefined();
      expect(FormatValidator.getFormatValidator('ipv4')).toBeDefined();
      expect(FormatValidator.getFormatValidator('ipv6')).toBeDefined();
      expect(FormatValidator.getFormatValidator('uuid')).toBeDefined();
    });

    it('should return undefined for unknown formats', () => {
      expect(FormatValidator.getFormatValidator('unknown')).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle null value gracefully', () => {
      const schema: JsonSchema = { type: 'string', format: 'email' };
      const errors = FormatValidator.validateFormat(null, schema, 'path');
      
      expect(errors).toHaveLength(0); // FormatValidator may not validate null/undefined by design
    });

    it('should handle undefined value gracefully', () => {
      const schema: JsonSchema = { type: 'string', format: 'email' };
      const errors = FormatValidator.validateFormat(undefined, schema, 'path');
      
      expect(errors).toHaveLength(0); // FormatValidator may not validate null/undefined by design
    });

    it('should handle invalid schema gracefully', () => {
      const errors = FormatValidator.validateFormat('test', null as any, 'path');
      
      expect(errors).toHaveLength(0); // Guard clause prevents execution when schema is null
    });

    it('should handle schema without format', () => {
      const schema: JsonSchema = { type: 'string' };
      const errors = FormatValidator.validateFormat('test', schema, 'path');
      
      expect(errors).toHaveLength(0);
    });

    it('should handle invalid regex pattern gracefully', () => {
      const schema: JsonSchema = { type: 'string', pattern: '[invalid-regex' };
      const errors = FormatValidator.validatePattern('test', schema, 'path');
      
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Invalid pattern');
    });
  });

  describe('guard clauses', () => {
    it('should handle empty path gracefully', () => {
      const schema: JsonSchema = { type: 'string', format: 'email' };
      const errors = FormatValidator.validateFormat('test@example.com', schema, '');
      
      expect(errors).toHaveLength(0);
    });

    it('should handle null path gracefully', () => {
      const schema: JsonSchema = { type: 'string', format: 'email' };
      const errors = FormatValidator.validateFormat('test@example.com', schema, null as any);
      
      expect(errors).toHaveLength(0);
    });

    it('should handle undefined path gracefully', () => {
      const schema: JsonSchema = { type: 'string', format: 'email' };
      const errors = FormatValidator.validateFormat('test@example.com', schema, undefined as any);
      
      expect(errors).toHaveLength(0);
    });
  });

  describe('additional format validations', () => {
    it('should validate date format', () => {
      const schema: JsonSchema = { type: 'string', format: 'date' };
      
      const validResult = FormatValidator.validateFormat('2023-12-25', schema, 'date');
      expect(validResult).toHaveLength(0);
      
      const invalidResult = FormatValidator.validateFormat('invalid-date', schema, 'date');
      expect(invalidResult.length).toBeGreaterThan(0);
    });

    it('should validate time format', () => {
      const schema: JsonSchema = { type: 'string', format: 'time' };
      
      const validResult = FormatValidator.validateFormat('14:30:00', schema, 'time');
      expect(validResult).toHaveLength(0);
      
      const invalidResult = FormatValidator.validateFormat('invalid-time', schema, 'time');
      expect(invalidResult.length).toBeGreaterThan(0);
    });

    it('should validate date-time format', () => {
      const schema: JsonSchema = { type: 'string', format: 'date-time' };
      
      const validResult = FormatValidator.validateFormat('2023-12-25T14:30:00Z', schema, 'datetime');
      expect(validResult).toHaveLength(0);
      
      const invalidResult = FormatValidator.validateFormat('invalid-datetime', schema, 'datetime');
      expect(invalidResult.length).toBeGreaterThan(0);
    });

    it('should validate hostname format', () => {
      const schema: JsonSchema = { type: 'string', format: 'hostname' };
      
      const validResult = FormatValidator.validateFormat('example.com', schema, 'hostname');
      expect(validResult).toHaveLength(0);
      
      const invalidResult = FormatValidator.validateFormat('invalid hostname', schema, 'hostname');
      expect(invalidResult.length).toBeGreaterThan(0);
    });

    it('should validate ipv4 format', () => {
      const schema: JsonSchema = { type: 'string', format: 'ipv4' };
      
      const validResult = FormatValidator.validateFormat('192.168.1.1', schema, 'ipv4');
      expect(validResult).toHaveLength(0);
      
      const invalidResult = FormatValidator.validateFormat('999.999.999.999', schema, 'ipv4');
      expect(invalidResult.length).toBeGreaterThan(0);
    });

    it('should validate ipv6 format', () => {
      const schema: JsonSchema = { type: 'string', format: 'ipv6' };
      
      const validResult = FormatValidator.validateFormat('2001:0db8:85a3:0000:0000:8a2e:0370:7334', schema, 'ipv6');
      expect(validResult).toHaveLength(0);
      
      const invalidResult = FormatValidator.validateFormat('invalid-ipv6', schema, 'ipv6');
      expect(invalidResult.length).toBeGreaterThan(0);
    });

    it('should validate uri format', () => {
      const schema: JsonSchema = { type: 'string', format: 'uri' };
      
      const validResult = FormatValidator.validateFormat('https://example.com', schema, 'uri');
      expect(validResult).toHaveLength(0);
      
      const invalidResult = FormatValidator.validateFormat('not-a-uri', schema, 'uri');
      expect(invalidResult.length).toBeGreaterThan(0);
    });

    it('should validate uuid format', () => {
      const schema: JsonSchema = { type: 'string', format: 'uuid' };
      
      const validResult = FormatValidator.validateFormat('550e8400-e29b-41d4-a716-446655440000', schema, 'uuid');
      expect(validResult).toHaveLength(0);
      
      const invalidResult = FormatValidator.validateFormat('not-a-uuid', schema, 'uuid');
      expect(invalidResult.length).toBeGreaterThan(0);
    });
  });

  describe('pattern validation edge cases', () => {
    it('should handle empty pattern', () => {
      const schema: JsonSchema = { type: 'string', pattern: '' };
      const errors = FormatValidator.validatePattern('any string', schema, 'pattern');
      
      expect(errors).toHaveLength(0);
    });

    it('should handle invalid regex pattern gracefully', () => {
      const schema: JsonSchema = { type: 'string', pattern: '[invalid-regex' };
      
      expect(() => {
        FormatValidator.validatePattern('test', schema, 'pattern');
      }).not.toThrow();
    });

    it('should handle null values in pattern validation', () => {
      const schema: JsonSchema = { type: 'string', pattern: '^test$' };
      const errors = FormatValidator.validatePattern(null, schema, 'pattern');
      
      expect(errors).toHaveLength(0);
    });

    it('should handle undefined values in pattern validation', () => {
      const schema: JsonSchema = { type: 'string', pattern: '^test$' };
      const errors = FormatValidator.validatePattern(undefined, schema, 'pattern');
      
      expect(errors).toHaveLength(0);
    });
  });

  describe('utility functions', () => {
    it('should correctly identify string values', () => {
      expect(FormatValidator.isStringValue('test')).toBe(true);
      expect(FormatValidator.isStringValue(123)).toBe(false);
      expect(FormatValidator.isStringValue(null)).toBe(false);
      expect(FormatValidator.isStringValue(undefined)).toBe(false);
      expect(FormatValidator.isStringValue(true)).toBe(false);
      expect(FormatValidator.isStringValue({})).toBe(false);
      expect(FormatValidator.isStringValue([])).toBe(false);
    });

    it('should handle format validation with no format specified', () => {
      const schema: JsonSchema = { type: 'string' };
      const errors = FormatValidator.validateFormat('any string', schema, 'value');
      
      expect(errors).toHaveLength(0);
    });

    it('should handle pattern validation with no pattern specified', () => {
      const schema: JsonSchema = { type: 'string' };
      const errors = FormatValidator.validatePattern('any string', schema, 'value');
      
      expect(errors).toHaveLength(0);
    });
  });
});
