/**
 * TypeValidator Tests
 * 
 * Tests for type validation functionality
 */

import * as TypeValidator from '../../../src/application/validators/TypeValidator';
import { JsonSchema } from '../../../src/shared/types/schema';

describe('TypeValidator', () => {
  describe('validateType', () => {
    it('should validate string type', () => {
      const schema: JsonSchema = { type: 'string' };
      const errors = TypeValidator.validateType('hello', schema, 'path');
      
      expect(errors).toHaveLength(0);
    });

    it('should validate number type', () => {
      const schema: JsonSchema = { type: 'number' };
      const errors = TypeValidator.validateType(42, schema, 'path');
      
      expect(errors).toHaveLength(0);
    });

    it('should validate boolean type', () => {
      const schema: JsonSchema = { type: 'boolean' };
      const errors = TypeValidator.validateType(true, schema, 'path');
      
      expect(errors).toHaveLength(0);
    });

    it('should validate array type', () => {
      const schema: JsonSchema = { type: 'array' };
      const errors = TypeValidator.validateType([1, 2, 3], schema, 'path');
      
      expect(errors).toHaveLength(0);
    });

    it('should validate object type', () => {
      const schema: JsonSchema = { type: 'object' };
      const errors = TypeValidator.validateType({ key: 'value' }, schema, 'path');
      
      expect(errors).toHaveLength(0);
    });

    it('should return error for invalid string type', () => {
      const schema: JsonSchema = { type: 'string' };
      const errors = TypeValidator.validateType(123, schema, 'path');
      
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Expected string');
    });

    it('should return error for invalid number type', () => {
      const schema: JsonSchema = { type: 'number' };
      const errors = TypeValidator.validateType('not a number', schema, 'path');
      
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Expected number');
    });

    it('should return error for invalid boolean type', () => {
      const schema: JsonSchema = { type: 'boolean' };
      const errors = TypeValidator.validateType('true', schema, 'path');
      
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Expected boolean');
    });

    it('should return error for invalid array type', () => {
      const schema: JsonSchema = { type: 'array' };
      const errors = TypeValidator.validateType('not an array', schema, 'path');
      
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Expected array');
    });

    it('should return error for invalid object type', () => {
      const schema: JsonSchema = { type: 'object' };
      const errors = TypeValidator.validateType('not an object', schema, 'path');
      
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Expected object');
    });
  });

  describe('isNull', () => {
    it('should return true for null value', () => {
      expect(TypeValidator.isNull(null)).toBe(true);
    });

    it('should return false for non-null values', () => {
      expect(TypeValidator.isNull(undefined)).toBe(false);
      expect(TypeValidator.isNull('string')).toBe(false);
      expect(TypeValidator.isNull(0)).toBe(false);
      expect(TypeValidator.isNull(false)).toBe(false);
    });
  });

  describe('isUndefined', () => {
    it('should return true for undefined value', () => {
      expect(TypeValidator.isUndefined(undefined)).toBe(true);
    });

    it('should return false for defined values', () => {
      expect(TypeValidator.isUndefined(null)).toBe(false);
      expect(TypeValidator.isUndefined('string')).toBe(false);
      expect(TypeValidator.isUndefined(0)).toBe(false);
      expect(TypeValidator.isUndefined(false)).toBe(false);
    });
  });

  describe('getActualType', () => {
    it('should return correct type for string', () => {
      expect(TypeValidator.getActualType('hello')).toBe('string');
    });

    it('should return correct type for number', () => {
      expect(TypeValidator.getActualType(42)).toBe('number');
    });

    it('should return correct type for boolean', () => {
      expect(TypeValidator.getActualType(true)).toBe('boolean');
    });

    it('should return correct type for array', () => {
      expect(TypeValidator.getActualType([1, 2, 3])).toBe('array');
    });

    it('should return correct type for object', () => {
      expect(TypeValidator.getActualType({ key: 'value' })).toBe('object');
    });

    it('should return correct type for null', () => {
      expect(TypeValidator.getActualType(null)).toBe('object'); // typeof null === 'object' in JavaScript
    });

    it('should return correct type for undefined', () => {
      expect(TypeValidator.getActualType(undefined)).toBe('undefined');
    });
  });

  describe('edge cases', () => {
    it('should handle empty string', () => {
      const schema: JsonSchema = { type: 'string' };
      const errors = TypeValidator.validateType('', schema, 'path');
      
      expect(errors).toHaveLength(0);
    });

    it('should handle zero number', () => {
      const schema: JsonSchema = { type: 'number' };
      const errors = TypeValidator.validateType(0, schema, 'path');
      
      expect(errors).toHaveLength(0);
    });

    it('should handle false boolean', () => {
      const schema: JsonSchema = { type: 'boolean' };
      const errors = TypeValidator.validateType(false, schema, 'path');
      
      expect(errors).toHaveLength(0);
    });

    it('should handle empty array', () => {
      const schema: JsonSchema = { type: 'array' };
      const errors = TypeValidator.validateType([], schema, 'path');
      
      expect(errors).toHaveLength(0);
    });

    it('should handle empty object', () => {
      const schema: JsonSchema = { type: 'object' };
      const errors = TypeValidator.validateType({}, schema, 'path');
      
      expect(errors).toHaveLength(0);
    });
  });

  describe('guard clauses', () => {
    it('should handle null value gracefully', () => {
      const schema: JsonSchema = { type: 'string' };
      const errors = TypeValidator.validateType(null, schema, 'path');
      
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Expected string');
    });

    it('should handle undefined value gracefully', () => {
      const schema: JsonSchema = { type: 'string' };
      const errors = TypeValidator.validateType(undefined, schema, 'path');
      
      expect(errors).toHaveLength(0); // TypeValidator may not validate null/undefined by design
    });

    it('should handle invalid schema gracefully', () => {
      const errors = TypeValidator.validateType('test', null as any, 'path');
      
      expect(errors).toHaveLength(0); // Guard clause prevents execution when schema is null
    });
  });
});
