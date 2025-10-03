/**
 * Type Validator - Functional Programming
 * 
 * Single Responsibility: Validate data types only
 * Pure functions, no state, no side effects
 */

import { JsonSchema, SchemaValidationError } from '../../shared/types';

/**
 * Pure function to validate data type against schema
 */
export const validateType = (value: any, schema: JsonSchema, path: string): SchemaValidationError[] => {
  // Guard clause: invalid schema
  if (!schema) {
    return [];
  }

  // Guard clause: no type specified
  if (!schema.type) {
    return [];
  }

  // Guard clause: null values
  if (value === null) {
    return schema.type !== 'null' 
      ? [createTypeError(path, 'null', schema.type)]
      : [];
  }

  // Guard clause: undefined values
  if (value === undefined) {
    return [];
  }

  const expectedType = schema.type;
  const actualType = Array.isArray(value) ? 'array' : typeof value;

  return actualType !== expectedType 
    ? [createTypeError(path, actualType, expectedType)]
    : [];
};

/**
 * Pure function to create type error
 */
const createTypeError = (path: string, actual: string, expected: string): SchemaValidationError => ({
  path,
  message: `Expected ${expected}, got ${actual}`,
  code: 'INVALID_TYPE',
  actual,
  expected
});

/**
 * Pure function to check if value is null
 */
export const isNull = (value: any): boolean => value === null;

/**
 * Pure function to check if value is undefined
 */
export const isUndefined = (value: any): boolean => value === undefined;

/**
 * Pure function to get actual type
 */
export const getActualType = (value: any): string => 
  Array.isArray(value) ? 'array' : typeof value;
