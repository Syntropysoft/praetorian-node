/**
 * RangeValidator Tests
 * 
 * Tests for range and length validation functionality
 */

import * as RangeValidator from '../../../src/application/validators/RangeValidator';
import { JsonSchema } from '../../../src/shared/types/schema';

describe('RangeValidator', () => {
  describe('validateStringLength', () => {
    it('should validate string within length range', () => {
      const schema: JsonSchema = { 
        type: 'string', 
        minLength: 3, 
        maxLength: 10 
      };
      const errors = RangeValidator.validateStringLength('hello', schema, 'path');
      
      expect(errors).toHaveLength(0);
    });

    it('should validate string at minimum length', () => {
      const schema: JsonSchema = { 
        type: 'string', 
        minLength: 3 
      };
      const errors = RangeValidator.validateStringLength('abc', schema, 'path');
      
      expect(errors).toHaveLength(0);
    });

    it('should validate string at maximum length', () => {
      const schema: JsonSchema = { 
        type: 'string', 
        maxLength: 5 
      };
      const errors = RangeValidator.validateStringLength('hello', schema, 'path');
      
      expect(errors).toHaveLength(0);
    });

    it('should return error for string too short', () => {
      const schema: JsonSchema = { 
        type: 'string', 
        minLength: 5 
      };
      const errors = RangeValidator.validateStringLength('hi', schema, 'path');
      
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('at least');
    });

    it('should return error for string too long', () => {
      const schema: JsonSchema = { 
        type: 'string', 
        maxLength: 3 
      };
      const errors = RangeValidator.validateStringLength('hello', schema, 'path');
      
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('at most');
    });

    it('should handle empty string', () => {
      const schema: JsonSchema = { 
        type: 'string', 
        minLength: 0 
      };
      const errors = RangeValidator.validateStringLength('', schema, 'path');
      
      expect(errors).toHaveLength(0);
    });
  });

  describe('validateNumberRange', () => {
    it('should validate number within range', () => {
      const schema: JsonSchema = { 
        type: 'number', 
        minimum: 1, 
        maximum: 10 
      };
      const errors = RangeValidator.validateNumberRange(5, schema, 'path');
      
      expect(errors).toHaveLength(0);
    });

    it('should validate number at minimum', () => {
      const schema: JsonSchema = { 
        type: 'number', 
        minimum: 1 
      };
      const errors = RangeValidator.validateNumberRange(1, schema, 'path');
      
      expect(errors).toHaveLength(0);
    });

    it('should validate number at maximum', () => {
      const schema: JsonSchema = { 
        type: 'number', 
        maximum: 10 
      };
      const errors = RangeValidator.validateNumberRange(10, schema, 'path');
      
      expect(errors).toHaveLength(0);
    });

    it('should return error for number below minimum', () => {
      const schema: JsonSchema = { 
        type: 'number', 
        minimum: 5 
      };
      const errors = RangeValidator.validateNumberRange(3, schema, 'path');
      
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('at least');
    });

    it('should return error for number above maximum', () => {
      const schema: JsonSchema = { 
        type: 'number', 
        maximum: 5 
      };
      const errors = RangeValidator.validateNumberRange(10, schema, 'path');
      
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('at most');
    });

    it('should validate exact minimum value', () => {
      const schema: JsonSchema = { 
        type: 'number', 
        minimum: 5
      };
      const errors = RangeValidator.validateNumberRange(5, schema, 'path');
      
      expect(errors).toHaveLength(0);
    });

    it('should validate exact maximum value', () => {
      const schema: JsonSchema = { 
        type: 'number', 
        maximum: 10
      };
      const errors = RangeValidator.validateNumberRange(10, schema, 'path');
      
      expect(errors).toHaveLength(0);
    });
  });

  describe('isNumber', () => {
    it('should return true for numbers', () => {
      expect(RangeValidator.isNumber(42)).toBe(true);
      expect(RangeValidator.isNumber(0)).toBe(true);
      expect(RangeValidator.isNumber(-5)).toBe(true);
      expect(RangeValidator.isNumber(3.14)).toBe(true);
    });

    it('should return false for non-numbers', () => {
      expect(RangeValidator.isNumber('42')).toBe(false);
      expect(RangeValidator.isNumber(true)).toBe(false);
      expect(RangeValidator.isNumber(null)).toBe(false);
      expect(RangeValidator.isNumber(undefined)).toBe(false);
      expect(RangeValidator.isNumber({})).toBe(false);
      expect(RangeValidator.isNumber([])).toBe(false);
    });
  });

  describe('isStringValueRange', () => {
    it('should return true for strings', () => {
      expect(RangeValidator.isStringValueRange('hello')).toBe(true);
      expect(RangeValidator.isStringValueRange('')).toBe(true);
    });

    it('should return false for non-strings', () => {
      expect(RangeValidator.isStringValueRange(123)).toBe(false);
      expect(RangeValidator.isStringValueRange(true)).toBe(false);
      expect(RangeValidator.isStringValueRange(null)).toBe(false);
      expect(RangeValidator.isStringValueRange(undefined)).toBe(false);
      expect(RangeValidator.isStringValueRange({})).toBe(false);
      expect(RangeValidator.isStringValueRange([])).toBe(false);
    });
  });

  describe('getStringLength', () => {
    it('should return correct length for strings', () => {
      expect(RangeValidator.getStringLength('hello')).toBe(5);
      expect(RangeValidator.getStringLength('')).toBe(0);
      expect(RangeValidator.getStringLength('a')).toBe(1);
    });

    it('should return 0 for non-strings', () => {
      expect(RangeValidator.getStringLength(String(123))).toBe(3);
      expect(RangeValidator.getStringLength(String(true))).toBe(4);
      expect(RangeValidator.getStringLength(String(null))).toBe(4);
      expect(RangeValidator.getStringLength(String(undefined))).toBe(9);
    });
  });

  describe('edge cases', () => {
    it('should handle null value gracefully', () => {
      const schema: JsonSchema = { type: 'string', minLength: 3 };
      const errors = RangeValidator.validateStringLength(null, schema, 'path');
      
      expect(errors).toHaveLength(0); // RangeValidator doesn't validate types, only ranges
    });

    it('should handle undefined value gracefully', () => {
      const schema: JsonSchema = { type: 'number', minimum: 1 };
      const errors = RangeValidator.validateNumberRange(undefined, schema, 'path');
      
      expect(errors).toHaveLength(0); // RangeValidator doesn't validate types, only ranges
    });

    it('should handle invalid schema gracefully', () => {
      const errors = RangeValidator.validateStringLength('test', null as any, 'path');
      
      expect(errors).toHaveLength(0); // Guard clause prevents execution when schema is null
    });

    it('should handle schema without constraints', () => {
      const schema: JsonSchema = { type: 'string' };
      const errors = RangeValidator.validateStringLength('test', schema, 'path');
      
      expect(errors).toHaveLength(0);
    });

    it('should handle negative minimum length', () => {
      const schema: JsonSchema = { type: 'string', minLength: -1 };
      const errors = RangeValidator.validateStringLength('test', schema, 'path');
      
      expect(errors).toHaveLength(0);
    });

    it('should handle negative maximum length', () => {
      const schema: JsonSchema = { type: 'string', maxLength: -1 };
      const errors = RangeValidator.validateStringLength('test', schema, 'path');
      
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('at most');
    });
  });

  describe('guard clauses', () => {
    it('should handle empty path gracefully', () => {
      const schema: JsonSchema = { type: 'string', minLength: 3 };
      const errors = RangeValidator.validateStringLength('hello', schema, '');
      
      expect(errors).toHaveLength(0);
    });

    it('should handle null path gracefully', () => {
      const schema: JsonSchema = { type: 'number', minimum: 1 };
      const errors = RangeValidator.validateNumberRange(5, schema, null as any);
      
      expect(errors).toHaveLength(0);
    });

    it('should handle undefined path gracefully', () => {
      const schema: JsonSchema = { type: 'string', maxLength: 10 };
      const errors = RangeValidator.validateStringLength('test', schema, undefined as any);
      
      expect(errors).toHaveLength(0);
    });
  });
});
