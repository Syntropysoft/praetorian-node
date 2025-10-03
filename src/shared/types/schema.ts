/**
 * Schema Validation Types
 * 
 * Types for validating configuration files against schemas
 */

export interface SchemaValidationRule {
  /** Unique identifier for the rule */
  id: string;
  /** Human-readable description */
  description: string;
  /** Schema definition (JSON Schema format) */
  schema: JsonSchema;
  /** Whether this rule is required */
  required?: boolean;
  /** Custom error message */
  errorMessage?: string;
}

export interface JsonSchema {
  /** Schema version */
  $schema?: string;
  /** Schema type */
  type?: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  /** Properties for object types */
  properties?: Record<string, JsonSchema>;
  /** Required properties */
  required?: string[];
  /** Additional properties allowed */
  additionalProperties?: boolean | JsonSchema;
  /** Items schema for array types */
  items?: JsonSchema | JsonSchema[];
  /** Enum values */
  enum?: any[];
  /** Pattern for string validation */
  pattern?: string;
  /** Minimum value for numbers */
  minimum?: number;
  /** Maximum value for numbers */
  maximum?: number;
  /** Minimum length for strings */
  minLength?: number;
  /** Maximum length for strings */
  maxLength?: number;
  /** Format validation */
  format?: 'email' | 'uri' | 'date-time' | 'date' | 'time' | 'uuid' | 'hostname' | 'ipv4' | 'ipv6';
  /** Custom validation rules */
  customRules?: CustomValidationRule[];
}

export interface CustomValidationRule {
  /** Rule name */
  name: string;
  /** Validation function */
  validate: (value: any, context: ValidationContext) => ValidationResult;
  /** Error message */
  message: string;
}

export interface SchemaValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Validation errors */
  errors: SchemaValidationError[];
  /** Validation warnings */
  warnings: SchemaValidationWarning[];
  /** Validated data */
  data?: any;
}

export interface SchemaValidationError {
  /** Error path */
  path: string;
  /** Error message */
  message: string;
  /** Error code */
  code: string;
  /** Schema rule that failed */
  rule?: string;
  /** Actual value that failed */
  actual?: any;
  /** Expected value */
  expected?: any;
}

export interface SchemaValidationWarning {
  /** Warning path */
  path: string;
  /** Warning message */
  message: string;
  /** Warning code */
  code: string;
}

import { ValidationContext, ValidationResult } from './index';

export interface SchemaValidationContext extends ValidationContext {
  /** Schema being used for validation */
  schema: JsonSchema;
  /** Schema rules being applied */
  rules: SchemaValidationRule[];
  /** Validation options */
  options: SchemaValidationOptions;
}

export interface SchemaValidationOptions {
  /** Whether to stop on first error */
  stopOnFirstError?: boolean;
  /** Whether to include warnings */
  includeWarnings?: boolean;
  /** Whether to validate additional properties */
  validateAdditionalProperties?: boolean;
  /** Custom validation functions */
  customValidators?: Record<string, (value: any, context: SchemaValidationContext) => ValidationResult>;
}
