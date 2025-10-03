/**
 * Format Validator - Functional Programming
 * 
 * Single Responsibility: Validate string formats only
 * Pure functions, no state, no side effects
 */

import { JsonSchema, SchemaValidationError } from '../../shared/types';

/**
 * Pure function registry for format validators
 */
const formatValidators: Record<string, RegExp> = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  uri: /^https?:\/\/.+/,
  'date-time': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  time: /^\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  hostname: /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  ipv6: /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
};

/**
 * Pure function to validate string format
 */
export const validateFormat = (value: any, schema: JsonSchema, path: string): SchemaValidationError[] => {
  // Guard clause: invalid schema
  if (!schema) {
    return [];
  }

  // Guard clause: not a string
  if (typeof value !== 'string') {
    return [];
  }

  // Guard clause: no format specified
  if (!schema.format) {
    return [];
  }

  const validator = formatValidators[schema.format];
  if (!validator) {
    return [createUnsupportedFormatError(path, schema.format)];
  }

  return !validator.test(value) 
    ? [createInvalidFormatError(path, value, schema.format)]
    : [];
};

/**
 * Pure function to validate string pattern
 */
export const validatePattern = (value: any, schema: JsonSchema, path: string): SchemaValidationError[] => {
  // Guard clause: invalid schema
  if (!schema) {
    return [];
  }

  // Guard clause: not a string
  if (typeof value !== 'string') {
    return [];
  }

  // Guard clause: no pattern specified
  if (!schema.pattern) {
    return [];
  }

  return validatePatternWithRegex(value, schema.pattern, path);
};

/**
 * Pure function to validate pattern with regex
 */
const validatePatternWithRegex = (value: string, pattern: string, path: string): SchemaValidationError[] => {
  try {
    const regex = new RegExp(pattern);
    return !regex.test(value) 
      ? [createPatternMismatchError(path, value, pattern)]
      : [];
  } catch (error) {
    return [createInvalidPatternError(path, pattern)];
  }
};

/**
 * Pure function to create unsupported format error
 */
const createUnsupportedFormatError = (path: string, format: string): SchemaValidationError => ({
  path,
  message: `Unsupported format: ${format}`,
  code: 'UNSUPPORTED_FORMAT',
  actual: format
});

/**
 * Pure function to create invalid format error
 */
const createInvalidFormatError = (path: string, value: string, format: string): SchemaValidationError => ({
  path,
  message: `Value must be a valid ${format}`,
  code: 'INVALID_FORMAT',
  actual: value,
  expected: format
});

/**
 * Pure function to create pattern mismatch error
 */
const createPatternMismatchError = (path: string, value: string, pattern: string): SchemaValidationError => ({
  path,
  message: `Value must match pattern: ${pattern}`,
  code: 'PATTERN_MISMATCH',
  actual: value,
  expected: pattern
});

/**
 * Pure function to create invalid pattern error
 */
const createInvalidPatternError = (path: string, pattern: string): SchemaValidationError => ({
  path,
  message: `Invalid pattern: ${pattern}`,
  code: 'INVALID_PATTERN',
  actual: pattern
});

/**
 * Pure function to check if value is string
 */
export const isStringValue = (value: any): boolean => typeof value === 'string';

/**
 * Pure function to get format validator
 */
export const getFormatValidator = (format: string): RegExp | undefined => formatValidators[format];
