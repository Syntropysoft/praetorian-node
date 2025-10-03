/**
 * Range Validator - Functional Programming
 * 
 * Single Responsibility: Validate numeric and string ranges only
 * Pure functions, no state, no side effects
 */

import { JsonSchema, SchemaValidationError } from '../../shared/types';

/**
 * Pure function to validate string length
 */
export const validateStringLength = (value: any, schema: JsonSchema, path: string): SchemaValidationError[] => {
  // Guard clause: invalid schema
  if (!schema) {
    return [];
  }

  // Guard clause: not a string
  if (typeof value !== 'string') {
    return [];
  }

  // Guard clause: no length constraints
  if (schema.minLength === undefined && schema.maxLength === undefined) {
    return [];
  }

  return [
    ...validateMinLength(value, schema, path),
    ...validateMaxLength(value, schema, path)
  ];
};

/**
 * Pure function to validate number range
 */
export const validateNumberRange = (value: any, schema: JsonSchema, path: string): SchemaValidationError[] => {
  // Guard clause: invalid schema
  if (!schema) {
    return [];
  }

  // Guard clause: not a number
  if (typeof value !== 'number') {
    return [];
  }

  // Guard clause: no range constraints
  if (schema.minimum === undefined && schema.maximum === undefined) {
    return [];
  }

  return [
    ...validateMinimum(value, schema, path),
    ...validateMaximum(value, schema, path)
  ];
};

/**
 * Pure function to validate minimum string length
 */
const validateMinLength = (value: string, schema: JsonSchema, path: string): SchemaValidationError[] => {
  return schema.minLength !== undefined && value.length < schema.minLength
    ? [createMinLengthError(path, value.length, schema.minLength)]
    : [];
};

/**
 * Pure function to validate maximum string length
 */
const validateMaxLength = (value: string, schema: JsonSchema, path: string): SchemaValidationError[] => {
  return schema.maxLength !== undefined && value.length > schema.maxLength
    ? [createMaxLengthError(path, value.length, schema.maxLength)]
    : [];
};

/**
 * Pure function to validate minimum number value
 */
const validateMinimum = (value: number, schema: JsonSchema, path: string): SchemaValidationError[] => {
  return schema.minimum !== undefined && value < schema.minimum
    ? [createMinimumError(path, value, schema.minimum)]
    : [];
};

/**
 * Pure function to validate maximum number value
 */
const validateMaximum = (value: number, schema: JsonSchema, path: string): SchemaValidationError[] => {
  return schema.maximum !== undefined && value > schema.maximum
    ? [createMaximumError(path, value, schema.maximum)]
    : [];
};

/**
 * Pure function to create min length error
 */
const createMinLengthError = (path: string, actual: number, expected: number): SchemaValidationError => ({
  path,
  message: `String length must be at least ${expected}`,
  code: 'MIN_LENGTH_ERROR',
  actual,
  expected
});

/**
 * Pure function to create max length error
 */
const createMaxLengthError = (path: string, actual: number, expected: number): SchemaValidationError => ({
  path,
  message: `String length must be at most ${expected}`,
  code: 'MAX_LENGTH_ERROR',
  actual,
  expected
});

/**
 * Pure function to create minimum error
 */
const createMinimumError = (path: string, actual: number, expected: number): SchemaValidationError => ({
  path,
  message: `Value must be at least ${expected}`,
  code: 'MINIMUM_ERROR',
  actual,
  expected
});

/**
 * Pure function to create maximum error
 */
const createMaximumError = (path: string, actual: number, expected: number): SchemaValidationError => ({
  path,
  message: `Value must be at most ${expected}`,
  code: 'MAXIMUM_ERROR',
  actual,
  expected
});

/**
 * Pure function to check if value is number
 */
export const isNumber = (value: any): boolean => typeof value === 'number';

/**
 * Pure function to check if value is string
 */
export const isStringValueRange = (value: any): boolean => typeof value === 'string';

/**
 * Pure function to get string length
 */
export const getStringLength = (value: string): number => value.length;
