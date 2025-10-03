/**
 * Structure Validator - Functional Programming
 * 
 * Single Responsibility: Validate object and array structures only
 * Pure functions, no state, no side effects
 */

import { JsonSchema, SchemaValidationError, SchemaValidationWarning, SchemaValidationContext } from '../../shared/types';
import { validateType } from './TypeValidator';
import { validateFormat, validatePattern } from './FormatValidator';
import { validateStringLength, validateNumberRange } from './RangeValidator';

/**
 * Pure function to validate object structure
 */
export const validateObject = (
  value: any,
  schema: JsonSchema,
  path: string,
  errors: SchemaValidationError[],
  warnings: SchemaValidationWarning[],
  context?: Partial<SchemaValidationContext>
): void => {
  // Guard clause: not an object
  if (!isObject(value)) {
    return;
  }

  // Guard clause: no properties defined
  if (!schema.properties) {
    return;
  }

  // Validate required properties first
  const requiredErrors = validateRequiredProperties(value, schema, path);
  errors.push(...requiredErrors);

  // Validate known properties
  Object.entries(schema.properties).forEach(([key, propSchema]) => {
    const propPath = buildPath(path, key);
    const propErrors = validateValue(value[key], propSchema, propPath, context);
    errors.push(...propErrors);
  });

  // Check for additional properties
  const additionalErrors = validateAdditionalProperties(value, schema, path);
  errors.push(...additionalErrors);
};

/**
 * Pure function to validate array structure
 */
export const validateArray = (
  value: any[],
  schema: JsonSchema,
  path: string,
  errors: SchemaValidationError[],
  warnings: SchemaValidationWarning[],
  context?: Partial<SchemaValidationContext>
): void => {
  // Guard clause: not an array
  if (!Array.isArray(value)) {
    return;
  }

  // Guard clause: no items schema
  if (!schema.items) {
    return;
  }

  const arrayErrors = Array.isArray(schema.items)
    ? validateTuple(value, schema.items, path, context)
    : validateArrayItems(value, schema.items, path, context);

  errors.push(...arrayErrors);
};

/**
 * Pure function to validate tuple array
 */
const validateTuple = (
  value: any[],
  itemSchemas: JsonSchema[],
  path: string,
  context?: Partial<SchemaValidationContext>
): SchemaValidationError[] => {
  return value.flatMap((item, i) => {
    const itemSchema = itemSchemas[i] || itemSchemas[itemSchemas.length - 1];
    const itemPath = buildArrayPath(path, i);
    return validateValue(item, itemSchema, itemPath, context);
  });
};

/**
 * Pure function to validate array items
 */
const validateArrayItems = (
  value: any[],
  itemSchema: JsonSchema,
  path: string,
  context?: Partial<SchemaValidationContext>
): SchemaValidationError[] => {
  return value.flatMap((item, i) => {
    const itemPath = buildArrayPath(path, i);
    return validateValue(item, itemSchema, itemPath, context);
  });
};

/**
 * Pure function to validate additional properties
 */
const validateAdditionalProperties = (
  value: Record<string, any>,
  schema: JsonSchema,
  path: string
): SchemaValidationError[] => {
  // Guard clause: additional properties allowed
  if (schema.additionalProperties !== false) {
    return [];
  }

  const knownProps = new Set(Object.keys(schema.properties || {}));
  return Object.keys(value)
    .filter(key => !knownProps.has(key))
    .map(key => createAdditionalPropertyError(buildPath(path, key), key));
};

/**
 * Pure function to validate a value against schema (delegates to specialized validators)
 */
export const validateValue = (
  value: any,
  schema: JsonSchema,
  path: string,
  context?: Partial<SchemaValidationContext>
): SchemaValidationError[] => {
  return [
    // Type validation
    ...validateType(value, schema, path),
    
    // Format validation
    ...validateFormat(value, schema, path),
    ...validatePattern(value, schema, path),
    
    // Range validation
    ...validateStringLength(value, schema, path),
    ...validateNumberRange(value, schema, path),
    
    // Enum validation
    ...validateEnum(value, schema, path),
    
    // Structure validation
    ...validateObjectStructure(value, schema, path, context),
    ...validateArrayStructure(value, schema, path, context)
  ];
};

/**
 * Pure function to validate object structure
 */
const validateObjectStructure = (
  value: any,
  schema: JsonSchema,
  path: string,
  context?: Partial<SchemaValidationContext>
): SchemaValidationError[] => {
  if (schema.type === 'object' && isObject(value)) {
    const errors: SchemaValidationError[] = [];
    const warnings: SchemaValidationWarning[] = [];
    validateObject(value, schema, path, errors, warnings, context);
    return errors;
  }
  return [];
};

/**
 * Pure function to validate array structure
 */
const validateArrayStructure = (
  value: any,
  schema: JsonSchema,
  path: string,
  context?: Partial<SchemaValidationContext>
): SchemaValidationError[] => {
  if (schema.type === 'array' && Array.isArray(value)) {
    const errors: SchemaValidationError[] = [];
    const warnings: SchemaValidationWarning[] = [];
    validateArray(value, schema, path, errors, warnings, context);
    return errors;
  }
  return [];
};

/**
 * Pure function to validate enum values
 */
const validateEnum = (value: any, schema: JsonSchema, path: string): SchemaValidationError[] => {
  // Guard clause: no enum defined
  if (!schema.enum) {
    return [];
  }

  return !schema.enum.includes(value)
    ? [createEnumError(path, value, schema.enum)]
    : [];
};

/**
 * Pure function to check if value is object
 */
const isObject = (value: any): boolean => 
  typeof value === 'object' && !Array.isArray(value) && value !== null;

/**
 * Pure function to build property path
 */
const buildPath = (basePath: string, key: string): string => 
  basePath ? `${basePath}.${key}` : key;

/**
 * Pure function to build array path
 */
const buildArrayPath = (basePath: string, index: number): string => 
  `${basePath}[${index}]`;

/**
 * Pure function to create additional property error
 */
const createAdditionalPropertyError = (path: string, key: string): SchemaValidationError => ({
  path,
  message: `Additional property '${key}' is not allowed`,
  code: 'ADDITIONAL_PROPERTY_NOT_ALLOWED',
  actual: key
});

/**
 * Pure function to create enum error
 */
const createEnumError = (path: string, value: any, enumValues: any[]): SchemaValidationError => ({
  path,
  message: `Value must be one of: ${enumValues.join(', ')}`,
  code: 'INVALID_ENUM',
  actual: value,
  expected: enumValues
});

/**
 * Pure function to validate required properties
 */
export const validateRequiredProperties = (
  value: any,
  schema: JsonSchema,
  path: string
): SchemaValidationError[] => {
  // Guard clause: no required properties
  if (!schema.required || !Array.isArray(schema.required)) {
    return [];
  }

  // Guard clause: not an object
  if (!isObject(value)) {
    return [];
  }

  const errors: SchemaValidationError[] = [];

  // Check each required property
  schema.required.forEach(propName => {
    if (!(propName in value) || value[propName] === undefined || value[propName] === null) {
      errors.push(createRequiredPropertyError(buildPath(path, propName), propName));
    }
  });

  return errors;
};

/**
 * Pure function to create required property error
 */
const createRequiredPropertyError = (path: string, propName: string): SchemaValidationError => ({
  path,
  message: `Required property '${propName}' is missing`,
  code: 'REQUIRED_PROPERTY_MISSING',
  actual: undefined,
  expected: propName
});
